#!/usr/bin/python
#coding:utf-8


'''
团队任务方法
'''

import g
GHATTR = g.BASEDB(g.mdb, 'gonghuiattr', 'gonghuiattr')

# 查看公会前60关副本是否打完
def chkGuildCopy(ghid):
    _cache = g.mc.get('teamtask_open_{}'.format(ghid))
    if _cache:
        return 1

    _fbid = int(g.m.gonghuifun.getMaxGongHuiFuBen(ghid))
    _con = g.GC['gonghui_teamtask']['base']['opencond']
    if _fbid > _con:
        g.mc.set('teamtask_open_{}'.format(ghid), 1)
        return 1
    else:
        return 0

# 获取当前最新的挑战公会信息
def getMaxGongHuiFuBen(ghid):
    _ctype = 'teamtask_leader'
    _data = g.mdb.find1('gonghuiattr', {'ghid': ghid, 'ctype': _ctype}, sort=[['k', -1]])
    _res = 1
    if _data:
        _res = int(_data['k'])
        if 'ispass' in _data:
            # 已经通关，返回下一关
            _res += 1

    return str(_res)

# 增加贡献值
def addContribution(uid, ghid, num):
    _contriInfo = g.getAttrOne(uid, {'ctype':'teamtask_contri','k':ghid}, fields=['_id','v','lasttime','daynum']) or {}
    # 如果还是在一天之内
    if g.C.DATE(_contriInfo.get('lasttime', 0)) == g.C.DATE(g.C.NOW()):
        _dayNum = _contriInfo.get('daynum', 0) + num
    else:
        _dayNum = num

    # 增加总数  设置今天的数量
    g.setAttr(uid,{'ctype':'teamtask_contri','k':ghid},{"$inc":{'v':num},'$set':{'daynum':_dayNum}})

# 团队任务监听
def setTeamTaskVal(uid, ttype, val=1):
    gud = g.getGud(uid)
    if int(g.m.gonghuifun.getMaxGongHuiFuBen(gud['ghid'])) <= 60:
        # 必须打通关60关副本
        return

    _nt = g.C.NOW()
    _ghid = gud['ghid']
    _con = g.GC['gonghui_teamtask']['base']
    if not _ghid or gud['lv'] < _con['taskcond']['lv']:
        return

    _user = g.mdb.find1('gonghuiuser',{'uid': uid}, fields=['_id','ctime','ghid'])
    if g.C.ZERO(_user['ctime'])+3*24*3600 > _nt and g.config['OWNER'] not in ('wwceshi',):
        # 没有超过三天
        return

    GHATTR.setAttr(_ghid, {'ctype': 'teamtask_taskinfo'}, {'$inc': {'v.{}'.format(ttype): val}})

    num = _con['task'][ttype]['contri']
    # 如果是消费钻石
    if ttype == '4':
        num = val*_con['task'][ttype]['contri']
    # 增加贡献值
    addContribution(uid, _ghid, num)

# 获取每天得挑战次数
def getFightNum(uid):
    _max = g.GC['gonghui_teamtask']['base']['fight_num']
    _used = g.getPlayAttrDataNum(uid, 'teamtask_usenum')
    return _max - _used

# 设置副本信息
def setFuBenData(ghid, fbid, data):
    _where = {'ctype': 'teamtask_leader', 'k': int(fbid)}
    GHATTR.setAttr(ghid, _where, data)

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

# 公会副本结算
@g.event.on('teamtask_fubenoverchk')
def onGongHuiFuBenChk(ghid, fbid, uid):
    # 设置一个一秒的缓存
    _cacheUid = g.mc.get(g.C.STR('teamtask_{1}_{2}', ghid, fbid))
    if _cacheUid and _cacheUid != uid:
        return

    _fbid = str(fbid)
    # 副本信息
    _fubenData = g.mdb.find1('gonghuiattr', {'ghid': ghid, 'ctype': 'teamtask_leader'}, sort=[['k', -1]], fields=['_id','pos2hp','sendemail','uid2dps','ispass','v'])
    if 'sendemail' in _fubenData:
        # 已发送过邮件信息
        return

    _nt = g.C.NOW()
    _ttl = g.C.TTL()
    _con = g.GC['gonghui_teamtask']['base']
    _prizeid = _con['boss'][_fbid]['prizeid']
    _prizeCon = _con['fubenprize']['pmprize']
    # 增加公会日志--击杀boss
    g.m.gonghuifun.addGHLog(ghid, 7, [fbid])
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
        # delPkNum(_tmpUid)
        # 玩家已经发送过的副本奖励
        _sendEmailID = getFuBenSendEmail(_tmpUid)
        _emailData = {
            "etype": 1,
            "ctime": _nt,
            "uid": _tmpUid,
            "passtime": _nt + 15 * 24 * 3600,
            "isread": 0,
            'ttltime': _ttl,
            'prize':getRankPrize(_prizeCon, _rank)
        }

        if _fbid in _sendEmailID:
            # 已经发送过奖励邮件的用户 奖励减半
            _emailData['title'] = _emailCon_noprize['title']
            _emailData['content'] = g.C.STR(_emailCon_noprize['content'], _rank)
            _emailData['prize'] = [{'a':i['a'],'t':i['t'],'n':i['n']/2} for i in _emailData['prize']]
        else:
            setFuBenSendEmail(_tmpUid, _fbid)
            # 设置发过奖励的副本
            _emailData['title'] = _emailCon_prize['title']
            _emailData['content'] = g.C.STR(_emailCon_prize['content'], _rank)

        _emailData['getprize'] = 0
        _addEmailData.append(_emailData)
        _rank += 1

    # 设置公会信息
    setFuBenData(ghid, fbid, _setData)
    # 添加邮件
    g.mdb.insert('email', _addEmailData)

# 删除玩家挑战次数-通关后重置
def delPkNum(uid):
    _ctype = 'teamtask_usenum'
    g.delAttr(uid, {'ctype': _ctype})

# 获取已经被发送过的副本邮件奖励
def getFuBenSendEmail(uid):
    _ctype = 'teamtask_fubenemail'
    _res = []
    _data = g.getAttrOne(uid, {'ctype': _ctype})
    if _data != None:
        _res = _data['v']

    return _res

# 设置已经被发送过的副本邮件奖励
def setFuBenSendEmail(uid, fbid):
    _ctype = 'teamtask_fubenemail'
    g.setAttr(uid, {'ctype': _ctype}, {'$push': {'v': str(fbid)}})

# 删除该玩家的排名
def unsetUserDps(uid):
    _ghid = g.getGud(uid)['ghid']
    # 删除副本的伤害
    GHATTR.setAttr(_ghid, {'ctype':'teamtask_leader'},{'$unset': {'uid2dps.{}'.format(uid): 1}})
    # 删除贡献
    g.mdb.delete('playattr', {'ctype':'teamtask_contri','uid':uid})


if __name__ == '__main__':
    gud = g.getGud(g.buid('lsq666'))
    unsetUserDps(g.buid('lsq222'))