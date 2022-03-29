#!/usr/bin/python
# coding:utf-8

'''
公会相关方法
'''

import g

# 公会attr属性表
GHATTR = g.BASEDB(g.mdb, 'gonghuiattr', 'gonghuiattr')


# 获取公会配置
def getCon():
    return g.GC['gonghui']['base']


# 格式化公会初始数据
def fntGongHuiData():
    _data = {}
    _nt = g.C.NOW()
    _con = getCon()
    # 公会级别
    _data["lv"] = 1
    # 公会当前人数
    _data["usernum"] = 0
    # 公会最大人数
    _data["maxusernum"] = _con['lv2conf']['1']['member']
    # 公会资金
    _data["gmoney"] = 0
    # 加入等级限制
    _data["joinlv"] = 1
    # 公会经验
    _data['exp'] = 0
    # 公告
    _data["notice"] = ""
    _data["ctime"] = _nt
    _data["lasttime"] = _nt
    return _data


# 格式化公会人员信息
'''
power:0会长，1官员，3会员
'''


def fmtGonghuiUserData(uid, ghid, power=3):
    _data = {}
    _nt = g.C.NOW()
    # 用户id
    _data["uid"] = uid
    # 公会id
    _data["ghid"] = str(ghid)
    # 公会权限
    _data["power"] = int(power)
    # 累加贡献
    _data["sungongxian"] = 0
    _data["ctime"] = _nt
    _data["lasttime"] = _nt
    return _data


# 创建公会
'''
name:公会名
flag:旗帜
notice:公会公告
'''


def createGonghui(uid, name, flag, notice):
    _data = fntGongHuiData()
    _data['name'] = name
    _data['flag'] = flag
    _data['notice'] = notice
    _ghid = g.mdb.insert("gonghui", _data)
    _codeid = uid.split('_')[0] + g.C.getUUIDByDBID(str(_ghid))
    g.mdb.update('gonghui', {'_id': _ghid}, {'codeid': _codeid})

    # 测试服需要特殊操作
    if g.config['OWNER'] in ('wwceshi',):
        GHATTR.setAttr(str(_ghid), {'ctype': 'teamtask_supply'}, {'v': 100000})
        GHATTR.setAttr(str(_ghid), {'ctype': 'fuben_data'}, {'k':60,'ispass':1,'ctime':g.C.NOW()-2*24*3600})


    return str(_ghid)


# 获取工会会长
def getGuildName(ghid):
    _info = g.mdb.find1('gonghuiuser', {'ghid': ghid, 'power': 0})
    if not _info:
        return
    gud = g.getGud(_info['uid'])
    return gud['name']


# 加入公会
def joinGonghui(uid, ghid, power=3):
    power = int(power)
    ghid = str(ghid)
    _data = fmtGonghuiUserData(uid, ghid, power)
    _oid = g.mdb.insert("gonghuiuser", _data)
    g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(ghid)}, {"$inc": {"usernum": 1}})
    return str(_oid)


# 获取公会id
def getGongHuiInfo(ghid):
    return g.mdb.find1('gonghui', {'_id': g.mdb.toObjectId(ghid)}, fields=['_id'])


# 获取玩家公会信息
def getGongHuiByUid(uid):
    gud = g.getGud(uid)
    _ghid = gud.get('ghid')
    if not _ghid: return
    _ghData = g.mdb.find1('gonghui', {'_id': g.mdb.toObjectId(_ghid)})
    if _ghData == None:
        return

    del _ghData['_id']
    return _ghData


# 设置加入公会的限制时间
def setChkJoinCD(uid, cd):
    _ctype = 'gonghui_joincd'
    g.setAttr(uid, {'ctype': _ctype}, {'v': cd})


# 是否在加入CD的限制中
def canJoin(uid):
    _ctype = 'gonghui_joincd'
    _data = g.getAttrOne(uid, {'ctype': _ctype})
    if _data == None:
        return 1

    _cd = _data['v']
    _nt = g.C.NOW()
    if _nt < _cd:
        return 0

    return 1


# 退出公会
# exittype:退出公会方式，0自己退出，1被踢出
def exitGonghui(uid, ghid, exittype=0):
    _ghid = str(ghid)
    _nt = g.C.NOW()
    # 主动退出公会，扣除贡献；被踢不扣贡献
    _myghInfo = g.mdb.find1('gonghuiuser', {'uid': uid, 'ghid': _ghid})
    _w = {"uid": uid, "ghid": _ghid}
    _oid = g.mdb.delete("gonghuiuser", _w)
    _ghUserNum = g.mdb.count('gonghuiuser', {"ghid": _ghid})
    g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(ghid)}, {"usernum": _ghUserNum})
    # 判断是否增加限制加入的时间戳
    if g.getOpenDay() > 1:
        # 开区一天后增加12小时的时间限制
        setChkJoinCD(uid, _nt + 12 * 3600)

    # 获取近三天的公会经验
    _delExp = getDelExp(uid)
    # 删除近三天的经验
    delExpLog(uid)
    if _delExp > 0:
        setGongHuiExp(_ghid, -_delExp)
        # 检测等级
        onGongHuiExpChange(ghid)

    return _oid


# 检测玩家是否是公会会长
def chkGongHuiHZ(uid):
    _ghUser = g.mdb.find1('gonghuiuser', {'uid': uid})
    if _ghUser == None:
        return 0

    if _ghUser['power'] == 0:
        # 是公会会长
        return 1

    return 0


# 获取当日贡献记录
def getJuanXianData(uid):
    _ctype = 'gonghui_juanxian'
    _data = g.getAttrByDate(uid, {'ctype': _ctype})
    if len(_data) == 0:
        return

    return _data[0]['v']


# 设置选线记录
def setJuanXianData(uid, jxtype):
    _ctype = 'gonghui_juanxian'
    g.setAttr(uid, {'ctype': _ctype}, {'v': str(jxtype)})


# 设置公会经验
def setGongHuiExp(ghid, exp):
    g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(ghid)}, {'$inc': {'exp': exp}})
    if exp < 0:
        # 检测是否为负数
        g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(ghid), 'exp': {'$lt': 0}}, {'exp': 0})


# 获取玩家排名奖励
def getRankPrize(con, rank):
    _res = list(con[-1][1])
    if rank > con[-2][0][1]:
        return _res

    for d in con:
        if rank >= d[0][0] and rank <= d[0][1]:
            _res = list(d[1])
            break

    return _res


# 公会经验改变
@g.event.on('gonghui_expchange')
def onGongHuiExpChange(ghid):
    _ghData = g.mdb.find1('gonghui', {'_id': g.mdb.toObjectId(ghid)})
    if _ghData == None:
        return

    # 公会等级
    _ghlv = baseLv = _ghData['lv']
    _maxUserNum = _ghData['maxusernum']
    # 公会当前经验
    _ghexp = _ghData['exp']
    _gcon = getCon()
    _maxExp = _gcon['lv2conf'][str(_ghlv)]['exp']
    # 检测升级还是降级
    _loopNum = len(_gcon['lv2conf']) + 1
    for i in xrange(1, _loopNum):
        _tmpCon = _gcon['lv2conf'][str(i)]
        _chkExp = _tmpCon['exp']
        if _ghexp < _chkExp:
            _ghlv = i
            _maxUserNum = _tmpCon['member']
            break

    if _ghlv == baseLv:
        return

    _setData = {}
    _setData['lv'] = _ghlv
    _setData['maxusernum'] = _maxUserNum
    g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(ghid)}, _setData)


# 公会副本结算
@g.event.on('gonghui_fubenoverchk')
def onGongHuiFuBenChk(ghid, fbid, uid):
    # 设置一个一秒的缓存
    _cacheUid = g.mc.get(g.C.STR('ghfuben_{1}_{2}', ghid, fbid))
    if _cacheUid and _cacheUid != uid:
        return

    _fbid = str(fbid)
    # 副本信息
    _fubenData = g.m.gonghuifun.getFuBenData(ghid, _fbid)
    if 'ispass' not in _fubenData:
        # 未通关
        return

    if 'sendemail' in _fubenData:
        # 已发送过邮件信息
        return

    _nt = g.C.NOW()
    _ttl = g.C.TTL()
    _con = g.GC['gonghui_fuben']['base']
    _prizeid = _con['fuben'][_fbid]['prizeid']
    _prizeCon = _con['fubenprize'][_prizeid]['pmprize']
    # 增加公会日志--击杀boss
    addGHLog(ghid, 7, [fbid])
    _dpsData = _fubenData['uid2dps']
    _rankData = g.C.dicSortByVal(_dpsData)
    _setData = {}
    _setData['sendemail'] = 1
    _setData['dpsrank'] = []

    _rank = 1
    _emailCon_prize = _con['email']['prize']
    _emailCon_noprize = _con['email']['noprize']
    _addEmailData = []
    for d in _rankData:
        _tmp = {}
        _tmpUid = d[0]
        _tmp['showhead'] = g.m.userfun.getShowHead(_tmpUid)
        _tmp['dps'] = d[1]
        _setData['dpsrank'].append(_tmp)
        # 重置所有玩家挑战次数
        delPkNum(_tmpUid)
        # 玩家已经发送过的副本奖励
        _sendEmailID = getFuBenSendEmail(_tmpUid)
        _emailData = {
            "etype": 1,
            "ctime": _nt,
            "uid": _tmpUid,
            "passtime": _nt + 15 * 24 * 3600,
            "isread": 0,
            'ttltime': _ttl
        }
        if _fbid in _sendEmailID:
            # 已经发送过奖励邮件的用户
            _emailData['title'] = _emailCon_noprize['title']
            _emailData['content'] = g.C.STR(_emailCon_noprize['content'], _fbid)
        else:
            setFuBenSendEmail(_tmpUid, _fbid)
            # 设置发过奖励的副本
            _emailData['title'] = _emailCon_prize['title']
            _emailData['content'] = g.C.STR(_emailCon_prize['content'], _fbid, _rank)
            _emailData['getprize'] = 0
            _emailData['prize'] = getRankPrize(_prizeCon, _rank)

        _addEmailData.append(_emailData)
        _rank += 1

    # 设置公会信息
    g.m.gonghuifun.setFuBenData(ghid, fbid, _setData)
    # 添加邮件
    g.mdb.insert('email', _addEmailData)
    # 删除副本信息的缓存
    g.mc.delete('fuben_data_{}'.format(ghid))


# 获取已挑战的次数
def getPkNum(uid):
    _ctype = 'gonghui_pkbossnum'
    return g.getPlayAttrDataNum(uid, _ctype)


# 设置已挑战的次数
def setPkNum(uid, num=1):
    _ctype = 'gonghui_pkbossnum'
    return g.setPlayAttrDataNum(uid, _ctype, num)


# 删除玩家挑战次数-通关后重置
def delPkNum(uid):
    _ctype = 'gonghui_pkbossnum'
    g.delAttr(uid, {'ctype': _ctype})


# 获取当前最新的挑战公会信息
def getMaxGongHuiFuBen(ghid):
    _res = g.mc.get('fuben_data_{}'.format(ghid))
    if _res:
        return _res

    _ctype = 'fuben_data'
    _data = g.mdb.find1('gonghuiattr', {'ghid': ghid, 'ctype': _ctype}, sort=[['k', -1]])
    _res = 1
    if _data:
        _res = int(_data['k'])
        if 'ispass' in _data:
            # 已经通关，返回下一关
            _res += 1

    g.mc.set('fuben_data_{}'.format(ghid), str(_res))
    return str(_res)


# 获取副本信息
def getFuBenData(ghid, fbid):
    _ctype = 'fuben_data'
    _k = int(fbid)
    _data = g.mdb.find1('gonghuiattr', {'ghid': ghid, 'ctype': _ctype, 'k': _k})
    if _data == None:
        return {}
    return _data


# 设置副本信息
def setFuBenData(ghid, fbid, data):
    _ctype = 'fuben_data'
    _k = int(fbid)
    _where = {'ctype': _ctype, 'k': _k}
    GHATTR.setAttr(ghid, _where, data)


# 获取每个职业科技重置过的次数
def getResetNum(uid):
    _ctype = 'fuben_resetnum'
    _where = {'ctype': _ctype}
    _data = g.getAttrOne(uid, _where)
    if _data == None:
        return {}
    return _data['v']


# 设置每个职业科技重置过的次数
def setResetNum(uid, job):
    _ctype = 'fuben_resetnum'
    _where = {'ctype': _ctype}
    _key = g.C.STR('v.{1}', job)
    g.setAttr(uid, _where, {'$inc': {_key: 1}})


# 添加公会日志
def addGHLog(ghid, ctype, data):
    _addLog = {}
    _addLog['ghid'] = ghid
    _addLog['ctype'] = ctype
    _addLog['args'] = data
    _addLog['ctime'] = g.C.NOW()
    _addLog['ttltime'] = g.C.TTL()
    g.mdb.insert('gonghuilog', _addLog)


# 获取公会日志
def getGhLog(ghid):
    _data = g.mdb.find('gonghuilog', {'ghid': ghid}, sort=[['ctime', -1]], fields=['_id', 'ctype', 'args', 'ctime'],
                       limit=50)
    return _data


# 添加经验日志
def addExpLog(uid, ghid, exp):
    # 添加经验
    _addLog = {}
    _addLog['uid'] = uid
    _addLog['ghid'] = ghid
    _addLog['exp'] = exp
    _addLog['ctime'] = g.C.NOW()
    _addLog['ttltime'] = g.C.TTL()
    g.mdb.insert('gonghuiexp', _addLog)


# 获取玩家三日内的贡献经验
def getDelExp(uid):
    _exp = 0
    _data = g.mdb.find('gonghuiexp', {'uid': uid}, fields=['_id', 'exp'])
    for d in _data:
        _exp += d['exp']

    return _exp


# 删除近三天的经验日志
def delExpLog(uid):
    g.mdb.delete('gonghuiexp', {'uid': uid})


# 设置已经被发送过的副本邮件奖励
def setFuBenSendEmail(uid, fbid):
    _ctype = 'gonghui_fubenemail'
    g.setAttr(uid, {'ctype': _ctype}, {'$push': {'v': str(fbid)}})


# 获取已经被发送过的副本邮件奖励
def getFuBenSendEmail(uid):
    _ctype = 'gonghui_fubenemail'
    _res = []
    _data = g.getAttrOne(uid, {'ctype': _ctype})
    if _data != None:
        _res = _data['v']

    return _res


# 推送公会change信息
def gonghuiChangeSend(uid, conn=None):
    g.m.gud.reGud(uid)
    # 更新缓存ghid
    gud = g.getGud(uid)
    _attrMap = {}
    _attrMap.update({"ghid": gud['ghid'], 'ghname': gud['ghname'], 'ghpower': gud['ghpower']})
    if conn:
        g.sendChangeInfo(conn, {"attr": _attrMap})
    else:
        g.sendUidChangeInfo(uid, {"attr": _attrMap})


# 监听申请加入工会
@g.event.on('guild_apply')
def onGuildApply(ghid):
    _powerUser = g.mdb.find('gonghuiuser', {'power': {'$in': [0, 1]}, 'ghid': ghid}, fields=['_id', 'uid'])
    _uidList = map(lambda x: x['uid'], _powerUser)
    for i in _uidList:
        g.m.mymq.sendAPI(i, 'guild_redpoint', '1')


# 获取宝箱最大购买次数
def getBoxMaxBuyNum():
    return g.GC['gonghui']['base']['boxmaxnum']


# 获取每天已经购买的次数
def getBuyNumByDate(ghid):
    return GHATTR.getPlayAttrDataNum(ghid, 'box_buynum')


# 获取每天可以购买宝箱的次数
def getBoxCanBuyNum(ghid):
    _maxNum = getBoxMaxBuyNum()
    _buyNum = getBuyNumByDate(ghid)
    return _maxNum - _buyNum


# 获取最多6个宝箱信息
def getGonghuiBoxData(ghid):
    _res = g.mdb.find('gonghuibox', {'ghid': ghid}, sort=[['ctime', -1]])
    _con = g.GC['gonghui']['base']
    _maxBoxNum = _con['boxmaxsavenum']
    _cd = _con['boxcd']
    # 2018.10.23 改成只要过期的超过6个就删除
    _expireList, _noExpire = [], []
    for i in _res:
        if i['ctime'] + _cd < g.C.NOW():
            _expireList.append(i)
        else:
            _noExpire.append(i)

    _TidList = [i['_id'] for i in _expireList[_maxBoxNum:]]
    if _TidList:
        # 删除未开启的
        g.mdb.delete('gonghuibox', {'ghid': ghid, '_id': {'$in': _TidList}})

    _noExpire += _expireList[:_maxBoxNum]
    _resList = []
    for i in _noExpire:
        _temp = {}
        _temp['_id'] = str(i['_id'])
        _temp['ctime'] = i['ctime']
        _temp['prizelist'] = i['prizelist']
        _temp['timelist'] = map(lambda x: x['time'], i.get('reclist', []))
        _temp['reclist'] = map(lambda x: x['uid'], i.get('reclist', []))
        _temp['buyer'] = g.m.userfun.getShowHead(i['buyer'])
        _recList = []
        for _uid in _temp['reclist']:
            _recList.append(g.m.userfun.getShowHead(_uid))
        _temp['reclist'] = _recList
        _resList.append(_temp)
    return _resList


def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    if act != 'ghbx648':
        return

    _con = g.GC['gonghui']['base']
    _prize = _con['boxbuyprize']
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'gonghui_buybox', 'prize': _prize})
    g.sendUidChangeInfo(uid, _sendData)

    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        return

    _resNum = GHATTR.setPlayAttrDataNum(_ghid, 'box_buynum')
    _dlz = _con['boxrecdlz']
    _boxrecnum = _con['boxrecnum']
    _prizeList = g.m.diaoluofun.getGroupPrizeNum(_dlz, _boxrecnum)
    _setData = {
        'reclist': [],
        'prizelist': _prizeList,
        'ghid': _ghid,
        'ctime': g.C.NOW(),
        'buyer': uid
    }
    g.mdb.insert('gonghuibox', _setData)
    # 团队任务
    g.m.teamtaskfun.setTeamTaskVal(uid, '6')
    g.m.chatfun.sendPMD(uid, 'guildbox', gud['ghname'], gud['name'])


# 获取弹劾列表
def getImpeachInfo(gid):
    # _data = GHATTR.getAttr(gid, {'ctype':'gonghui_impeach'})
    _data = g.mc.get(g.C.STR('ghimpeach_{1}', gid))
    # # mei超过24小时
    # if _data and _data['ctime'] + 3600 * 24 > g.C.NOW():
    #     return _data
    if not _data:
        _data = GHATTR.getAttrOne(gid, {'ctype':'gonghui_impeach'},fields=['_id','v','ctime']) or {'ctime':0,'v':[]}
        g.mc.set(g.C.STR('ghimpeach_{1}', gid), _data, 600)
    return _data


# 设置弹劾列表
def setImpeachInfo(gid, data):
    GHATTR.setAttr(gid, {'ctype': 'gonghui_impeach'}, {'v':data})
    # 更新缓存
    _data = GHATTR.getAttrOne(gid, {'ctype': 'gonghui_impeach'}, fields=['_id','v','ctime'])
    g.mc.set(g.C.STR('ghimpeach_{1}', gid), _data, 600)


# 检查弹劾
def chkImpeach(ghid):
    _data = getImpeachInfo(ghid)

    # 超过24小时 有人弹劾  ctime不为0
    if _data and _data['ctime'] + 24 * 3600 < g.C.NOW() and _data['v'] and _data['ctime'] != 0:
        _prehz = g.mdb.find1('gonghuiuser', {'ghid': ghid, 'power': 0}, fields=['_id', 'uid'])
        _tmpGud = g.getGud(_prehz["uid"])
        _con = getCon()
        if g.C.NOW() < _tmpGud["logintime"] + _con['impeach_time']:
            g.mdb.delete('gonghuiattr', {'ghid': ghid, 'ctype': 'gonghui_impeach'})
            return

        _data['v'].sort(key=lambda x: x['maxzhanli'], reverse=True)
        _ghhz = _data['v'][0]

        g.mdb.update('gonghuiuser', {'ghid': ghid, 'uid': _ghhz['uid']}, {'power': 0})
        g.gud.reGud(_ghhz['uid'])
        g.mdb.update('gonghuiuser', {'ghid': ghid, 'uid': _prehz['uid']}, {'power': 3})
        g.gud.reGud(_prehz['uid'])

        _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': ghid}, fields=['_id', 'uid'])
        _allGhUser = [x['uid'] for x in _allGonghuiUser]
        _msg = g.C.STR(_con['takeoffice_email']['content'], g.getGud(_ghhz['uid'])['name'])
        g.m.emailfun.sendEmails(_allGhUser, 1, _con['takeoffice_email']['title'], _msg)

        # 记录 方便以后查询
        g.m.dball.writeLog(ghid, 'guild_impeach', _data['v'])
        # 删除弹劾记录和缓存
        g.mdb.delete('gonghuiattr',{'ghid':ghid,'ctype':'gonghui_impeach'})
        g.mc.delete(g.C.STR('ghimpeach_{1}', ghid))
        # 增加公会日志--弹劾成功
        addGHLog(ghid, 9, [_tmpGud['name'], _ghhz['name']])


# 监听公会宝箱购买
g.event.on('chongzhi', OnChongzhiSuccess)

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    gud = g.getGud(uid)
    # print getImpeachInfo(gud['ghid'])
    g.mdb.delete('gonghuiattr', {'ghid': gud['ghid'], 'ctype': 'gonghui_impeach'})
    g.mc.flush_all()