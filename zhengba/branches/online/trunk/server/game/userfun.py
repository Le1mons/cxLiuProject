#!/usr/bin/python
# coding:utf-8

'''
用户相关方法
'''
import g, math

#api逻辑中判断是否登陆的装饰器
def apiCheckLogin(func):
    def _deco(*args, **kwargs):
        _conn = args[0]
        if not hasattr(_conn,"uid") or _conn.uid=="":
            return {"s":-102,"errmsg":g.L('global_unlogin')}
        ret = func(*args, **kwargs)
        return ret
    return _deco


# 获取英雄格子信息
def getGeziNum(uid):
    _userInfo = g.getGud(uid)
    _buynum = _userInfo.get('buynum')
    # 获取到vip增加的格子
    _vipNum = g.m.vipfun.getTeQuanNumByAct(uid,'HeroBagMaxAdd')
    if not _buynum:
        _buynum = 0
        _num = 60
        return {'maxnum': _num+_vipNum,'buynum':_buynum}

    _addnum = g.m.herofun.getHeroComCon()['herocell']['addnum']
    _num = 60 + _buynum * _addnum
    _num += _vipNum
    return {'maxnum': _num,'buynum':_buynum}

# 重置玩家信息
def reSetBuff(uid, data):
    _w = {'uid': uid}
    g.mdb.update('userinfo', _w , data)
    g.gud.setGud(uid,data)
    return g.getGud(uid)


# 判断玩家是否存在
def hasUser(val, key='binduid',serverid=0):
    '''
    判断binduid玩家是否存在
    返回 {id:x} 或 False
    '''
    _where = {key: val}
    if key in ('binduid', 'legubinduid'):
        #_tmp = g.C.STR("^{1}_",str(serverid))
        #_where.update({'uid': {"$regex": _tmp}})
        _where.update({'sid': int(serverid) })

    _res = g.mdb.find1('userinfo', where=_where, fields={"uid":1,"_id": 0})
    #print '_res',_res
    return _res


# 特殊更新用户,登陆创建新用户时使用
def updateUser(where, data):
    _res = g.mdb.update('userinfo', where, data)
    return _res

#检测玩家属性是否为负数并且修正
def chkUserAttrIsZero(uid,attr):
    _userData = g.mdb.find1('userinfo',{'uid':uid})
    if _userData == None:
        return {}

    _setAttr = {}
    _chkList = attr
    for k in _chkList:
        if k not in _userData:
            continue
        if _userData[k] >= 0:
            continue
        _setAttr[k] = 0

    if len(_setAttr) > 0:
        g.mdb.update('userinfo',{'uid':uid},_setAttr)
        gud = g.getGud(uid)
        gud.update(_setAttr)
        g.m.gud.setGud(uid,gud)

    return _setAttr



# 创建玩家信息
def creatPlayer(serverid,binduid, name, sex, **args):
    '''
    创建一个玩家
    '''
    _nt = g.C.NOW()
    userTableData = {
        'binduid': binduid,
        'name': name,
        'sex': sex,
        'ctime': _nt,
        'lasttime': _nt,
        'mapid':1,
        'maxmapid':1,
        'lv': 1,
        'exp':0,
        'sid': serverid,
        'uid':g.C.getUniqCode(),
        'lastpassmaptime':_nt,
        'maxzhanli':0,
        'jifen': 3000
    }

    # 如果是乐谷的用户则赋值该字段
    _chkbinduid = binduid.split('_')
    if _chkbinduid[0] == 'legu':
        userTableData['legubinduid'] = binduid

    userTableData.update(args)
    _oid = g.mdb.insert('userinfo', userTableData)
    _sidx = str(g.getSvrIndex())
    uid = _sidx + '_' + str(_oid)
    uuid = _sidx + g.C.getUUIDByDBID(str(_oid))
    _uinfo = {
        'uid': uid,
        'uuid':uuid
    }
    _res = g.mdb.update('userinfo', {'_id': _oid}, _uinfo)
    return uid


# 获取当前等级的经验上限
def getMaxExp(lv):
    # 玩家经验=MROUND((玩家等级^2+玩家等级*5+25),5)
    # _maxLv = pow(lv,2) + lv * 5 + 25
    # _maxLv = int(_maxLv * 0.2) * 5
    # return _maxLv
    _con = g.GC['playerlv']
    # 默认最大200级
    lv = str(lv) if lv <= 200 else '200'
    _maxExp = _con[lv]['maxexp']
    return _maxExp


# 修改玩家经验
def altExp(uid, exp):
    #2017-12-14 增加世界等级带来的经验加成
    # _wlv2Pro = g.getWorldLvExtPro(uid)
    # _exp = exp
    # if 'hostexppro' in _wlv2Pro:
    #     _exp = int((1.0+_wlv2Pro['hostexppro']) * exp)
    _exp = exp
    gud = g.m.gud.get(uid)
    _baselv = _lv = int(gud['lv'])
    _myexp = gud['exp'] + int(_exp)
    _res = {}
    _maxExp = getMaxExp(_lv)
    _userCon = g.GC.userinfo
    _con = g.GC['playerlv']
    _prizeList = []
    while (1):
        _maxExp = getMaxExp(_lv)
        # if _myexp >= _maxExp and _lv < _userCon['maxlv']:
        if _myexp >= _maxExp:
            _maxLv = getMaxUserLv()
            # 校准最大等级
            if _lv >= _maxLv:
                break
            _lv =_lv + 1

            _myexp = _myexp - _maxExp
            _prizeList += _con[str(_lv)]['prize']
            # 监听等级礼包
            g.event.emit("dengjilibao",uid,_lv)
        else:
            break
    if _prizeList:
        _prizeList = g.fmtPrizeList(_prizeList)
        _sendData = g.getPrizeRes(uid, _prizeList, act={'act':'altexp','prize':_prizeList})
        g.sendUidChangeInfo(uid, _sendData)
    _isUp = 0
    _res['exp'] = _myexp
    _res["addnexp"] = _exp
    if _lv != int(gud['lv']): _isUp = 1
    if _isUp:
        # print 'lvup ========== '
        _res['lv'] = _lv
        # _res['lvup'] = 1
        _res['maxexp'] = _maxExp
        # 监听开服狂欢
        g.event.emit("kfkh", uid, 24, 7, _lv)
        # 神器任务
        g.event.emit('artifact', uid, 'wanjialv', val=_lv, isinc=0)
        # 监听玩家等级 监听开服冲级
        g.event.emit("PlayDegree", uid, _lv)

    return _res

# 获取玩家最高等级
def getMaxUserLv():
    _con = g.GC['playerlv']
    _max = max([int(i) for i in _con])
    return _max

# 玩家等级升级
# lv:升级前lv
# tolv:升级后lv
def userLvUp(uid, *arg, **karg):
    # print 'userLvUp==========',uid,lv,tolv
    _dd = 1
    return _dd



# 修改数值类型属性
# 数值类型:['huangjin','rmbmoney','yinbi','liangcao','jingtie','gongxian','payexp','yueli',"gongxun","jingjidian","xiyubi","daobi"]
def altNum(uid, data):
    gud = g.gud.get(uid)
    for k, v in data.items():
        _tmpNum = gud[k] + v
        if _tmpNum < 0:
            _res = [False, k]
            return _res

    _res = [True, data]
    return _res


# 获取累加型的属性
def getIncAttr():
    # jinbi-金币，rmbmoney-钻石，useexp-使用经验,gongxian-贡献,destiny 天命，success 成就
    _attr = ['jinbi', 'rmbmoney', 'useexp','jifen','gongxian','payexp','destiny','success']
    return _attr

# 获取写入playattr的属性
def getPlayAttr():
    _attr = {
        'huoyuezhi':{
            'inctype':'daily'
        }
    }
    return _attr

# 检查payexp属性，看是否可以提升VIP等级
def chkPayExp(uid):
    gud = g.getGud(uid)
    _vipCon = g.m.vipfun.getVipCon()
    _nowVipLv = gud['vip']
    _nowPayExp = gud['payexp']
    while True:
        if str(_nowVipLv + 1) in _vipCon and _nowPayExp >= _vipCon[str(_nowVipLv + 1)]['payexp']:
            _nowVipLv += 1
        else:
            break

    if _nowVipLv != gud['vip']:
        updateUserInfo(uid, {'vip': _nowVipLv}, {'act':'recalc_vip_lv'})
        g.event.emit("viplvchange",uid,gud["vip"],_nowVipLv)

    g.sendUidChangeInfo(uid, {'attr':{'vip': _nowVipLv}})
    return 1

# 修改玩家信息
def updateUserInfo(uid, data, logdata=None):
    # rmbmoney敏感操作未记录日志
    if str(data).find("rmbmoney") != -1 and data['rmbmoney'] < 0 and logdata == None:
        raise TypeError("[rmbmoney exists , please add logdata!!!]")

    gud = g.m.gud.get(uid)
    # 特殊更新值
    _intArr = getIncAttr()
    # 会写入playattr的值
    _playArr = getPlayAttr()
    _passArr = ['maxexp']
    dbData = {'$set': {}, '$inc': {}}
    _oldAttr = {}
    _newAttr = {}
    _diffAttr = {}
    for k, v in data.items():
        if k in _passArr:
            gud[k] = v
            continue

        _oldAttr[k] = gud[k]
        # 特殊处理几个更新值
        if k in _intArr:
            v = int(v)
            _newAttr[k] = gud[k] + v
            gud[k] += v
            dbData['$set'][k] = gud[k]
            _diffAttr[k] = _newAttr[k] - _oldAttr[k]
            '''
            不要在此循环里添加费时的同步事件，移到下方去广播，让gud能最快速的更新
            # 累计消费事件
            g.event.emit('leijixiaofei', uid, k, v)
            if k == 'rmbmoney' and v < 0:
                # 日常任务监听
                g.event.emit('dailytask', uid, 19, abs(v))
                # 公会团队任务消耗钻石
                g.m.teamtaskfun.setTeamTaskVal(uid, '4', abs(v))
            '''
        else:
            dbData['$set'][k] = v
            _newAttr[k] = v
            gud[k] = v

    # 设置数据更新时间
    _nt = g.C.NOW()
    gud['updatetime'] = _nt
    dbData['$set']["updatetime"] = _nt
    if len(dbData['$inc']) == 0: dbData = dbData['$set']
    # 写入gud缓存
    g.gud.setGud(uid, gud)
    # 写入数据
    _res = g.mdb.update("userinfo", {'uid': uid}, dbData)
    
    #广播事件====
    for k, v in data.items():
        if k in _intArr:
            v = int(v)
            # 累计消费事件
            g.event.emit('leijixiaofei', uid, k, v)
            if k == 'rmbmoney' and v < 0:
                # 日常任务监听
                g.event.emit('dailytask', uid, 19, abs(v))
                # 公会团队任务消耗钻石
                g.m.teamtaskfun.setTeamTaskVal(uid, '4', abs(v))
    #==============
    
    g.event.emit("altattr", uid, _oldAttr, _newAttr)

    # 添加日志记录
    
    _act = None
    if logdata:
        _act = 'altAttr'
        _logData = {}
        if isinstance(logdata, basestring):
            _act = logdata
            _logData['act'] = logdata

        if isinstance(logdata, dict):
            _act = logdata['act']
            _logData.update(logdata)

        _logData["oldattr"] = _oldAttr
        _logData["newattr"] = _newAttr
        if len(_diffAttr) > 0:
            _logData['diffattr'] = _diffAttr

        _r = g.m.dball.writeLog(uid, _act, _logData)
    
    #按天记录元宝的产出和消耗方便监控
    if 'rmbmoney' in _newAttr:
        __changeNum = abs(_oldAttr['rmbmoney'] - _newAttr['rmbmoney'])
        if _oldAttr['rmbmoney'] > _newAttr['rmbmoney']:
            #消耗
            g.m.dball.setStat(uid, "YUANBAO_USED_"+ str(g.C.DATE()), {"$inc": {"v": __changeNum}})
        else:
            #产出
            g.m.dball.setStat(uid, "YUANBAO_GETED_"+ str(g.C.DATE()), {"$inc": {"v": __changeNum}})
            
    
    # 如果元宝发生变化，则记录消耗总值
    if "rmbmoney" in _newAttr and _oldAttr['rmbmoney'] > _newAttr['rmbmoney']:
        _rmbmoney = _oldAttr['rmbmoney'] - _newAttr['rmbmoney']
        # 设置消耗元宝
        setDailyYBNum(uid, _rmbmoney)
        # 检查每日元宝
        #chkDailyYBPMD(uid)
        g.m.dball.setStat(uid, g.L("TOTAL_USED_YUANBAO"), {"$inc": {"v": _rmbmoney}})
        # 挥金如土任务
        g.event.emit("taskcondchange", uid, "HJRT", _rmbmoney)
        
        if _act != None and _act != "":
            #增加rmb日志统计
            g.m.dball.addRmbmoneyLog(uid, _rmbmoney, _act, _logData)
            
        # 增加活动元宝消耗
        #g.m.huodongfun.onYuanbaoChange(uid, _rmbmoney)

    # 如果金币发生变化，记录金币消耗
    if 'yinbi' in _newAttr and _oldAttr['yinbi'] > _newAttr['yinbi']:
        # 消耗的金币
        _jinbi = _oldAttr['yinbi'] - _newAttr['yinbi']
        # 记录消耗
        g.m.dball.setStat(uid, 'TOTAL_USED_JINBI', {"$inc": {"v": _jinbi}})
        # 触发金币任务
        g.event.emit("onusejinbi", uid, _jinbi)

    # 如果payexp发生变化，则检查VIP等级是否发生变化
    if 'payexp' in _newAttr and _newAttr['payexp'] > _oldAttr['payexp']:
        chkPayExp(uid)

    return _res


# 修改属性
def chkAttr(uid, oldattr, newattr, *arg, **karg):
    # 升级操作
    if 'lv' in oldattr and oldattr['lv'] != newattr['lv']:
        # g.event.emit("lvup", uid, oldattr['lv'], newattr['lv'])
        pass

# 增加改名次数
def addChangNameNum(uid):
    _res = g.setAttr(uid, {"ctype": g.L("CHANGENAME_FREENUM")}, {"$inc": {"v": 1}})
    return _res


# 保存队伍阵型信息
def saveFormation(uid, ftype, heros, data=None):
    _w = {"uid": uid, "ftype": ftype}
    _data = {}
    _data["lasttime"] = g.C.NOW()
    if data != None:
        _data.update(data)

    _saveInfo = {}
    for k, v in heros.items():
        _saveInfo[k] = {}
        _saveInfo[k]["x"] = v["x"]
        _saveInfo[k]["y"] = v["y"]
        _saveInfo[k]["hid"] = v["hid"]
        if "master" in v:
            _saveInfo[k]["master"] = v["master"]

    _data.update({"heros": _saveInfo})
    _w = {"uid": uid, "ftype": ftype}
    _res = g.mdb.update("formation", _w, _data, upsert=True)
    return _res


# 获取我的自定义编队信息
def getCustomTeamInfo(uid, where=None):
    _w = {"uid": uid, "ftype": "CUSTOM_TEAM"}
    if where != None:
        _w.update(where)

    _res = g.mdb.find("formation", _w)
    for ele in _res:
        del ele["uid"]
        del ele["ftype"]
        del ele["lasttime"]
        ele["tid"] = str(ele["_id"])
        del ele["_id"]

    return _res


# 添加自定义分队
def addCustomeTeamInfo(uid, idx, heros):
    _data = {"uid": uid, "ftype": "CUSTOM_TEAM", "heros": heros, "idx": idx}
    _data["ctime"] = g.C.NOW()
    _data["lasttime"] = _data["ctime"]
    _data['autoreborn'] = 0  # 自动重生
    _data['autodispatch'] = 0  # 自动派兵
    # 获取已有编队数量
    _num = g.mdb.count("formation", {"uid": uid, "ftype": "CUSTOM_TEAM"}) + 1
    _list = ['', '一队', '二队', '三队', '四队']
    _data['name'] = _list[_num]
    _fid = str(g.mdb.insert("formation", _data))

    return ({"idx": idx, "heros": heros, "name": _list[_num], "tid": _fid, "autoreborn": 0, "autodispatch": 0})


# 设置自定义分队
def setCustomeTeamInfo(uid, idx, heros, reset=0):
    _w = {"uid": uid, "ftype": "CUSTOM_TEAM", "idx": idx}
    _data = {"heros": heros}
    if reset:
        _data.update({'autoreborn': 0, 'autodispatch': 0})

    _res = g.mdb.update("formation", _w, _data)
    _r = g.mdb.find("formation", _w)
    tid = str(_r[0]['_id'])
    return ({"idx": idx, "heros": heros, "tid": tid, "name": _r[0]['name'], "autoreborn": _r[0]['autoreborn'],
             "autodispatch": _r[0]['autodispatch']})


# 修改自定义分队属性
def setCustomTeamData(uid, idx, key, value):
    _w = {"uid": uid, "ftype": "CUSTOM_TEAM", "idx": idx}
    _data = {str(key): int(value)}
    _r = g.mdb.update("formation", _w, _data, upsert=True)
    return int(value)


# 获取队伍阵型信息
def getFormation(uid, ftype):
    _w = {"uid": uid, "ftype": ftype}
    _res = g.mdb.find1("formation", _w)
    _data = None
    if _res != None:
        _data = _res["heros"]

    return _data


# 将消耗转成altNum的参数
def convertATNtoAttr(data):
    _retVal = {}
    for ele in data:
        if ele['t'] not in _retVal.keys():
            _retVal[ele['t']] = 0

        _retVal[ele['t']] -= ele['n']

    return _retVal


# 获取显示信息
def getShowHead(uid):
    gud = g.getGud(uid)
    _rData = {
        'uid':uid,
        'head': gud['head'],
        'lv': gud['lv'],
        'name': gud['name'],
        'guildname':gud.get('ghname'),
        'vip': gud['vip'],
        'model': gud.get('model',''),
        'uuid':gud['uuid'],
        'headborder':gud['headborder'],
        'chatborder':gud['chatborder'],
        'lasttime':gud['lasttime']
    }
    return _rData


# 根绝类型获取最大值
def getHeroPinFen(uid, ptype, herolist, con):
    _curr = 0
    gud = g.getGud(uid)
    _lv = gud['lv']
    _maxValue = {
        "lv": _lv,
        "pinzhi": 15,
        "star": 5
    }
    _rate = 3
    def getHeroMaxPinzhi(uid, hero):
        gud = g.getGud(uid)
        _tmplv = max(hero['lv'], gud['lv'])
        _bztype = str(hero['bztype'])
        _con = g.GC['bzitem'][_bztype]
        _tmp = []
        _max = 0
        for k,v in _con.items():
            i = 0
            for ele in v:
                if _tmplv >= int(ele[1]): i += 1

            if i >=4: _tmp.append(int(k))

        _max = max(_tmp) + 1
        return _max

    # 等级、星级评分
    if ptype in ('lv', 'star'):
        _sum = sum([h[ptype] for h in herolist])
        _curr = _sum * 1.0 / (len(herolist) * _maxValue[ptype])

    # 可以达到的最大品质
    elif ptype in ('pinzhi'):
        _sum = sum([h[ptype] for h in herolist])
        _max = 0
        for hero in herolist:
            _max += getHeroMaxPinzhi(uid, hero)

        if _max: _curr = _sum * 1.0 / _max

    # 兵种特性等级
    elif ptype == 'bzskill':
        _sum = sum(map(lambda x: sum(x['bzskill'][0:g.m.herofun.getBzSkillNum(x['pinzhi'])]), herolist))
        _max = 0
        for hero in herolist:
            _maxpz = getHeroMaxPinzhi(uid, hero)
            _max += max(hero['lv'],gud['lv']) * g.m.herofun.getBzSkillNum(_maxpz)

        if _max: _curr = _sum * 1.0 / _max

    # 宝物数量
    elif ptype == 'fblist':
        _max = 0
        for hero in herolist:
            _max += g.m.herofun.getCanEquipFbNum(uid, hero)

        _sum = sum([len(x['fblist']) for x in herolist])
        if _max != 0: _curr = _sum * 1.0 / _max

    # 将领数量
    elif ptype == 'shangzhengjiangling':
        _maxsznum = 5
        _myheronum = g.mdb.count('hero', {'uid': uid})
        if _myheronum < 5: _maxsznum = _myheronum
        if len(herolist) >= _maxsznum: _curr = 1

    _curr += con['ratio']
    _curr = math.pow(_curr, _rate) * 100
    if _curr > 100: _curr = 100
    if _curr < 1: _curr = 0
    _curr = round(_curr, 2)
    return _curr


# 某个玩家当天花了多少钱
def getDailyYBNum(uid):
    _num = 0
    _r = g.getAttrByDate(uid, {'ctype': 'dailyybuse'})
    if _r:
        _num = int(_r[0]['v'])

    return _num


# 设置玩家消费金额
def setDailyYBNum(uid, num):
    _num = getDailyYBNum(uid)
    _r = g.setAttr(uid, {'ctype': 'dailyybuse'}, {'v': _num + int(num)})
    return _r


# 检查是否需要发跑马灯 --暂时未使用
def chkDailyYBPMD(uid):
    gud = g.getGud(uid)
    _num = getDailyYBNum(uid)
    _con = g.GC['message']
    _alreadysend = getSentPWD(uid)
    _canSend = []
    for k, v in _con['samedaypay'].items():
        k = int(k)
        if k <= _num and k > _alreadysend:
            _canSend.append(k)

    if not _canSend: return
    _min = str(min(_canSend))
    g.m.chatfun.sendPMD(uid, 'samedaypay' + '.' + _min, *[gud['name']])
    setSendPMD(uid, _min)


# 获取已发送的消息
def getSentPWD(uid):
    _retVal = 0
    _r = g.getAttrByDate(uid, {'ctype': 'dailyybsend'})
    if _r:
        _retVal = int(_r[0]['v'])

    return _retVal


# 设置已发送的消息
def setSendPMD(uid, value):
    _r = g.setAttr(uid, {'ctype': 'dailyybsend'}, {'v': int(value)})
    return _r


# vip等级变化跑马灯
def onVipChangePMD(uid, oldvip, newvip):
    gud = g.getGud(uid)
    g.m.chatfun.sendPMD(uid, 'viplv' + '.' + str(newvip), *[gud['name']])


# 检查登录提示
def chkLoginPMD(uid,*arg,**kwargs):
    return
    import thread
    gud = g.getGud(uid)
    #35级以下不检测排行榜牌排名
    if not g.chkOpenCond(uid,'paihangbang'): return
    _lastpmd = getLastPmd(uid)
    _nt = g.C.NOW()
    if _lastpmd + 900 > _nt: return
    setLastPmd(uid,_nt)
    def chk(uid):
        import time
        time.sleep(5)
        showTopSumZl(uid)
        showTop5Zl(uid)
        showTopHeroZl(uid)
        showTopShiliHz(uid)
        showTopCityFightHz(uid)
        showTopTxbw(uid)
        showTopSjyw(uid)
        showTopGonghui(uid)
        showGuoJun(uid)

    thread.start_new_thread(chk,(uid,))


#获取上次跑马灯时间
def getLastPmd(uid):
    _retVal = 0
    _r = g.getAttr(uid,{'ctype':'last_sendpmd_time'})
    if _r:
        _retVal = int(_r[0]['v'])

    return _retVal

#设置上次登录跑马灯时间
def setLastPmd(uid,logintime):
    _r = g.setAttr(uid,{'ctype':'last_sendpmd_time'},{'v':int(logintime)})
    return _r

# 国君上线提醒
def showGuoJun(uid):
    _gjuid = g.m.guojunfun.getGuoJunUid()
    if uid != _gjuid: return
    gud = g.getGud(uid)
    g.m.chatfun.sendPMD(uid, 'guojun.login', *[gud['name']])

# 总战力榜第一玩家上线提醒
def showTopSumZl(uid):
    gud = g.getGud(uid)
    _r = g.m.rankfun.getSumZhanliRank(uid)
    _myrank = _r['myrank']
    if _myrank > 10: return
    g.m.chatfun.sendPMD(uid, 'sumzhanlirank.{0}'.format(_myrank), *[gud['name']])

# 公会排行榜上线提醒
def showTopGonghui(uid):
    gud = g.getGud(uid)
    if not gud['slid'] or gud['slpower']!=5:return
    _r = g.m.rankfun.getShiliRank(uid)
    _myrank = _r['myrank']
    if _myrank > 5: return
    g.m.chatfun.sendPMD(uid, 'gonghuirank.{0}'.format(_myrank), *[gud['name']])


# 最强战力榜第一玩家上线提醒
def showTop5Zl(uid):
    gud = g.getGud(uid)
    if not g.chkOpenCond(uid, 'paihangbang'): return
    _r = g.m.rankfun.getTopHeroZhanli(uid)
    if not _r['myrank'] > 10: return
    g.m.chatfun.sendPMD(uid, 'maxzhanlirank.{0}'.format(_r['myrank']), *[gud['name']])


# 英雄榜第一玩家上线提醒
def showTopHeroZl(uid):
    gud = g.getGud(uid)
    _r = g.m.rankfun.getHeroRank(uid)
    _myrank = _r['myrank']
    if _myrank > 10: return
    g.m.chatfun.sendPMD(uid, 'herorank.{0}'.format(_myrank), *[gud['name']])


# 势力榜第一会长上线提醒
def showTopShiliHz(uid):
    gud = g.getGud(uid)
    _r = g.m.rankfun.getShiliRank(uid)
    if _r['myrank'] != 1 or gud['slpower'] != 0: return
    g.m.chatfun.sendPMD(uid, 'slrankfirstol', *[gud['name']])


# 城战榜第一势力会长上线提醒
def showTopCityFightHz(uid):
    gud = g.getGud(uid)
    _r = g.m.rankfun.getCityKillRank(uid)
    if _r['myrank'] > 10 or gud['slpower'] != 0: return
    g.m.chatfun.sendPMD(uid, 'cityfightrank.{0}'.format(_r['myrank']), *[gud['name']])


# 天下比武第一名上线提醒
def showTopTxbw(uid):
    gud = g.getGud(uid)
    _r = g.mdb.find('pkdata', {'uid': uid})
    if not _r: return
    _myrank = _r[0]['rank']
    if _myrank > 10: return
    g.m.chatfun.sendPMD(uid, 'txbwrank.{0}'.format(_myrank), *[gud['name']])


# 三军演武第一名上线
def showTopSjyw(uid):
    gud = g.getGud(uid)
    _r = g.mdb.find('sjywpkdata', {'uid': uid})
    if not _r: return
    _myrank = _r[0]['rank']
    if _myrank > 10: return
    g.m.chatfun.sendPMD(uid, 'sjywrank.{0}'.format(_myrank), *[gud['name']])


# 玩家已推送的最强战力
def getAlreadyPushTop5Zl(uid):
    _retVal = 0
    _r = g.getAttr(uid, {'ctype': 'alreadypushtop5zl'})
    if _r:
        _retVal = int(_r[0]['v'])

    return _retVal


# 设置玩家已推送的最强战力
def setAlreadyPushTop5Zl(uid, zl):
    _r = g.setAttr(uid, {'ctype': 'alreadypushtop5zl'}, {'v': int(zl)})
    return _r


# 玩家已推送的总战力
def getAlreadyPushSumZl(uid):
    _retVal = 0
    _r = g.getAttr(uid, {'ctype': 'alreadypushsumzl'})
    if _r:
        _retVal = int(_r[0]['v'])

    return _retVal


# 设置玩家已推送的总战力
def setAlreadyPushSumZl(uid, zl):
    _r = g.setAttr(uid, {'ctype': 'alreadypushsumzl'}, {'v': int(zl)})
    return _r


'''
    玩家在以下排行榜的排名上升到前10时给出跑马灯消息
    ＊ 最强战力榜
    ＊ 总战力榜
    ＊ 城站杀敌榜
    ＊ 英雄榜
'''


def chk_rank_top10(uid, rtype, value):
    gud = g.getGud(uid)
    #35级一下不检查，还未开放排行榜
    if gud['lv'] < 35: return
    rtype = str(rtype)
    _10th,_ranklist = get_rank_top10(rtype)
    _newrank = 0
    _oldrank = 0
    _rtype2pmd = {
        'top5zhanli':'bestfightrank',
        'sumzhanli':'zzlrank',
        'citykillrank':'cityfightrank',
        'herozlrank':'herozlrank'
    }
    # 不足10人直接重算前十
    if len(_ranklist)<10:
        _10th,_ranklist = get_rank_top10(rtype,ifcache=0)
        for ele in _ranklist:
            if ele['uid'] == uid:
                _newrank = _ranklist.index(ele)+1

        if _newrank == 0: return
        g.m.chatfun.sendPMD(uid,_rtype2pmd[rtype],*[gud['name'],_newrank])

    else:
        if int(value) < _10th['value']: return

        for ele in _ranklist:
            if ele['uid'] == uid:
                _oldrank = _ranklist.index(ele) + 1
                break

        _10th,_ranklist = get_rank_top10(rtype,0)
        for ele in _ranklist:
            if ele['uid'] == uid:
                _newrank = _ranklist.index(ele) + 1
                break

        if _newrank >= _oldrank: return
        if _newrank == 0: return
        g.m.chatfun.sendPMD(uid,_rtype2pmd[rtype],*[gud['name'],_newrank])

# 获取排行前十
'''
    统一格式：
    uid，value
'''
def get_rank_top10(rtype, ifcache=1):
    _10th = []
    _nt = g.C.NOW()
    _cacheKey = 'rank' + '_' + rtype
    _cacheInfo = g.mc.get(_cacheKey)
    _cacheTime = 60
    if _cacheInfo and _cacheInfo['t'] > _nt and ifcache:
        return _cacheInfo['data']

    # 最强战力榜
    if rtype == 'top5zhanli':
        _ranklist = g.mdb.find('tmprank',{},sort=[['value',-1]],limit=10)
        _newranklist = []
        for ele in _ranklist:
            _tmp = {
                'uid':ele['_id'],
                'value':ele['value']
            }
            _newranklist.append(_tmp)

        _ranklist = _newranklist
        if _ranklist: _10th = _ranklist[-1]
        g.mc.set(_cacheKey, {'t': _nt + _cacheTime, 'data': (_10th, _ranklist)})
        return _10th, _ranklist

    # 总战力榜
    elif rtype == 'sumzhanli':
        _ranklist = g.mdb.find('stat', {'ctype': g.L('HERO_MAXZHANLI')}, sort=[['v', -1]], limit=10)
        _newranklist = []
        for ele in _ranklist:
            _tmp = {
                'uid':ele['uid'],
                'value':ele['v']
            }
            _newranklist.append(_tmp)

        _ranklist = _newranklist
        if _ranklist: _10th = _ranklist[-1]
        g.mc.set(_cacheKey, {'t': _nt + _cacheTime, 'data': (_10th, _ranklist)})
        return _10th, _ranklist

    # 城站杀敌排行榜
    elif rtype == 'citykillrank':
        _ranklist = g.m.statfun.getStatInfo(where={"ctype": 'cityfight_killnum'}, keys='_id,v,uid', sort=[["v", -1]],
                                            limit=10)
        _newranklist = []
        for ele in _ranklist:
            _tmp = {
                'uid':ele['uid'],
                'value':ele['v']
            }
            _newranklist.append(_tmp)

        _ranklist = _newranklist
        if _ranklist: _10th = _ranklist[-1]
        g.mc.set(_cacheKey, {'t': _nt + _cacheTime, 'data': (_10th, _ranklist)})
        return _10th, _ranklist

    # 英雄最大战力
    elif rtype == 'herozlrank':
        _ranklist = g.mdb.find('stat', {'ctype': g.L('HERO_MAXZHANLI')}, sort=[['v', -1]], limit=10)
        _newranklist = []
        for ele in _ranklist:
            _tmp = {
                'uid':ele['uid'],
                'value':ele['v']
            }
            _newranklist.append(_tmp)

        _ranklist = _newranklist
        if _ranklist: _10th = _ranklist[-1]
        g.mc.set(_cacheKey, {'t': _nt + _cacheTime, 'data': (_10th, _ranklist)})
        return _10th, _ranklist

    else:
        return [], []

#获取某个玩家的成就
def getBadges(uid):
    _rData = {}
    return _rData
    '''
    #最强战力榜排名
    gud = g.getGud(uid)
    if g.chkOpenCond(uid, 'paihangbang'):
        _topzlrank = g.m.rankfun.getTopHeroZhanli(uid)['myrank']
        if _topzlrank <= 3 and _topzlrank!=0:
            _rData['topzlrank'] = _topzlrank

    #总战力排行
    _sumzlrank = g.m.rankfun.getSumZhanliRank(uid)['myrank']
    if _sumzlrank <= 3 and _sumzlrank!=0:
        _rData['sumzlrank'] = _sumzlrank

    #英雄榜名次
    _herozlrank = g.m.rankfun.getHeroRank(uid)['myrank']
    if _herozlrank <=3 and _herozlrank!=0:
        _rData['herozlrank'] = _herozlrank

    #天下比武名次
    _txbwrank = g.m.rankfun.getTxbwRank(uid)['myrank']
    if _txbwrank <=3 and _txbwrank!=0:
        _rData['txbwrank'] = _txbwrank

    #三军演武名次
    # _sjywrank = g.m.rankfun.getSjywRank(uid)['myrank']
    # if _sjywrank<=3 and _sjywrank!=0:
    #     _rData['sjywrank'] = _sjywrank

    _userinfo = g.getGud(uid)

    #土豪
    _tuhao = _userinfo['payexp']
    if _tuhao >= 50000:
        _rData['tuhao'] = 1

    # 我就是爷
    if _userinfo['shouchong'] and _userinfo['payexp'] != 0:
        _rData['wojiushiye'] = 1

    # 五星达人
    _notwuxin = g.mdb.find1('hero', {'uid': uid, 'star': {'$lt': 5}})
    if not _notwuxin:
        _rData['wuxingdaren'] = 1

    # 出将入相
    if _userinfo['guanzhi'] >= 14:
        _rData['chujiangruxiang'] = 1

    #烧钱能手
    _shaoqiannengshou=g.mdb.find1('stat',{'uid':uid,'ctype':g.L("TOTAL_USED_YUANBAO")})
    if _shaoqiannengshou is not None and int(_shaoqiannengshou['v'])>=30000:
        _rData['shaoqiannengshou'] = 1

    #爆肝达人 - 保持连续登录三天
    _lxdlNum = getLxdlNum(uid)
    if _lxdlNum >= 3:
        _rData['baogandaren'] = 1

    #金嗓子喉宝
    _jinsangzi = g.mdb.find1('stat',{'uid':uid,'ctype':g.L('TOTAL_USED_SPEAKER')})
    if _jinsangzi and int(_jinsangzi['v']) >= 5000:
        _rData['jinsangzi'] = 1

    #全阵容
    _allhero = len(g.GC['hero'])
    _heronum = g.mdb.count('hero',{'uid':uid})
    if _allhero == _heronum:
        _rData['quanzhenrong'] = 1

    gud = g.getGud(uid)
    if gud['xfhlweizhang']:
        _rData['xfhlweizhang'] = 1

    if gud['xfhlweizhang1']:
        _rData['xfhlweizhang1'] = 1

    if gud['xfhlweizhang2']:
        _rData['xfhlweizhang2'] = 1

    if gud['xfhlweizhang3']:
        _rData['xfhlweizhang3'] = 1

    #国君标识
    _gjtype = g.m.guojunfun.getGuoJunType(uid)
    if _gjtype:
        _rData['guojun'] = _gjtype

    #称号相关
    _titleData = g.m.titlefun.getTitleList(uid)
    if len(_titleData) > 0:
        for t in _titleData:
            _con = g.m.titlefun.getTitleCon(t['ttid'])
            if 'hzid' not in _con:
                continue
            _rData[_con['hzid']] = 1

    return _rData
    '''

#检查是否连续登录
def chkLianxudenglu(uid,lastlogintime):
    _value = getLastLoginData(uid)
    _zt = g.C.NOW(g.C.DATE())
    _nt = g.C.NOW()
    if _value['chkdate']:
        _chkzt = g.C.NOW(g.C.DATE(_value['chkdate']))
        #今天已经检查过了
        if _chkzt == _zt:
            return

    _lastzt = g.C.NOW(g.C.DATE(lastlogintime))
    _difftime = _zt - _lastzt
    _value['chkdate'] = _nt
    if _difftime == 24*3600:
        _value['lxdlnum'] += 1

    else:
        _value['lxdlnum'] = 1

    setLastLoginData(uid,_value)

    return

#获取上次登录时间
def getLastLoginData(uid):
    _retVal = {
        'chkdate':0,
        'lxdlnum':0
    }
    _r = g.getAttr(uid,{'ctype':'user_last_logindata'})
    if _r:
        _retVal = _r[0]['v']

    return _retVal

#设置上次登录时间
def setLastLoginData(uid,value):
    _r = g.setAttr(uid,{'ctype':'user_last_logindata'},{'v':value})
    return _r

#获取连续登录的天数
def getLxdlNum(uid):
    _num = 0
    _r = g.getAttr(uid,{'ctype':'user_last_logindata'})
    if _r:
        _num = int(_r[0]['v']['lxdlnum'])

    return _num

#设置玩家最大战力
def setMaxZhanli(uid,maxzhanli):
    if maxzhanli == 0:
        return
    gud = g.getGud(uid)
    if gud['maxzhanli'] > maxzhanli:
        return
    g.m.userfun.updateUserInfo(uid,{'maxzhanli':maxzhanli})


#发送按钮变化
def sendBtnChange(uid, *args, **kwargs):
    _sendData = {'s':1}

    g.m.mymq.sendAPI(uid,'btnchange',_sendData)

'''
    统一登录时操作方法
    
'''
def checkLoginAct(uid, *args, **kwargs):
    gud = g.getGud(uid)
    # 增加登录操作命令
    if 'loginset' in gud and gud['loginset']:
        for _act in gud['loginset']:
            if _act == 'resetbuff':
                g.m.herofun.reSetAllHeroBuff(uid)

        g.m.userfun.updateUserInfo(uid,{"loginset":[]})
        gud['loginset'] = []

# 监听等级上升事件
# def onLvUp(uid, oldlv, newlv):
#     # 2017-09-04 升级到23级时，赠送夺宝券
#     _prize = []
#     if newlv == 23:
#         _prize.append({'a':'item','t':'235', 'n': 1})
#
#     if _prize:
#         _prizeRes = g.getPrizeRes(uid, _prize, {'act':'lvup_extra_prize'})
#         g.sendUidChangeInfo(uid, _prizeRes)

# 获取玩家防守阵容数据
def getDefHeroInfo(uid, _type):
    if _type == 'zypkjjc':
        _defHero = g.m.zypkjjcfun.getDefendHero(uid)
        _defHero = [_defHero]
    elif _type == 'championtrial':
        _defHero = g.m.championfun.getDefendHero(uid)
    _tidList = []
    for i in _defHero:
        _tidList += [i[x] for x in i if x != 'sqid']
    _tidList = map(g.mdb.toObjectId, _tidList)
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _tidList}})
    # 调整站位信息
    _res = []
    for x in _defHero:
        _resHero = {}
        for _pos in x:
            if _pos == 'sqid':
                _resHero['sqid'] = x[_pos]
                continue
            for _hero in _heroList:
                if g.mdb.toObjectId(x[_pos]) == _hero['_id']:
                    _hero['_id'] = str(_hero['_id'])
                    _resHero[_pos] = _hero
        _res.append(_resHero)
    return _res


#获取所有公用的功能buff
def getCommonBuff(uid):
    _buff = {}
    _commonBuff = g.mdb.find1('buff',{'uid':uid,'ctype':'common'})
    if _commonBuff != None:
        _buff = _commonBuff['buff']

    return _buff

#设置所有公用的功能buff
def setCommonBuff(uid,data):
    g.mdb.update('buff',{'uid':uid,'ctype':'common'},data,upsert=True)

#设置玩家的新头像列表
def setNewHead(uid,hidlist):
    _list = getHeadList(uid)
    _chkNum = len(_list)
    #默认会显示的head
    # _headCon = g.GC['pre_defshowhead']
    for hid in hidlist:
        # if hid in _headCon:
            #默认头像不加入hidlist
            # continue

        if hid in _list:
            #头像已经在列表中
            continue

        _list.append(hid)

    if len(_list) == _chkNum:
        #头像列表没有变化
        return

    _ctype = 'user_headlist'
    #设置头像列表
    _num = len(_list)
    g.setAttr(uid,{'ctype':_ctype},{'v':_list,'num':_num})
    return _list

#获取玩家激活的头像列表
def getHeadList(uid):
    _res = []
    _ctype = 'user_headlist'
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    if _data != None:
        _res = _data['v']

    return _res


# 判断玩家用户名是否存在
def isCheckUname(where):
    _check = 0
    _w = where
    _res = g.mdb.find1('userinfo',where=_w)
    if _res != None:
        _check = 1
    return _check

# 检查头像聊天框是否过期
def chkBorderExpire(uid):
    gud = g.getGud(uid)
    _data = g.getAttr(uid,{'ctype': {'$in': ['headborder_list','chatborder_list']}},keys='_id,v,time,ctype')
    if not _data:
        return

    _type = {'headborder_list':'headborder','chatborder_list':'chatborder'}
    _nt = g.C.NOW()
    for i in _data:
        _time = i.get('time', {}).copy()
        _list = i['v']
        for bid in _time:
            if _time[bid] < _nt:
                del i['time'][bid]
                _list.remove(bid)

                # 如果正在使用 设置成默认值
                if gud[_type[i['ctype']]] == bid:
                    g.m.userfun.updateUserInfo(uid, {_type[i['ctype']]: '1'})
                    g.sendUidChangeInfo(uid, {'attr':{_type[i['ctype']]:'1'}})

        if len(i.get('time', {})) != len(_time):
            g.setAttr(uid,{'ctype':i['ctype']},{'v':_list,'time':i.get('time',{})})

# 特殊渠道奖励
def OnSpecialPrize(uid, lv):
    if lv != 10 or g.config['OWNER'] not in ('niuke', 'wwceshi'):
        return

    if g.getAttrOne(uid,{'ctype':'special_prize'}):
        return

    g.setAttr(uid, {'ctype': 'special_prize'},{'v':1})

    _data = {'star':10,'dengjielv':10,'dengjie':6,'lv':255}
    for hid in ('11086','23036','31096','43066','55016','65016','14046', '45046', '34026', '14036', '25076', '24036'):
        g.m.herofun.addHero(uid, hid, _data)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid, {'star': 10})
    for i in _heroData:
        _heroData[i].update(_data)
    g.sendUidChangeInfo(uid, {'hero': _heroData})

    prize = [{'a':'attr','t':'useexp','n':500000000},{'a':'equip','t':'3053','n':6},{'a':'equip','t':'1053','n':6},{'a':'equip','t':'2053','n':6},{'a':'equip','t':'4053','n':6},
             {'a':'item','t':'2003','n':500000},{'a':'attr','t':'useexp','n':500000000},{'a':'item','t':'2005','n':700000},{'a':'attr','t':'jinbi','n':1000000000},{'a':'attr','t':'rmbmoney','n':20000},
             {'a':'item','t':'2017','n':150000},{'a':'item','t':'2018','n':23000},{'a':'item','t':'3003','n':300},{'a':'item','t':'2004','n':50000},{'a':'item','t':'2022','n':10000},
             {'a': 'item', 't': '2021', 'n': 5000},{'a':'attr','t':'payexp','n':50000}]
    for k,v in g.GC['hero'].items():
        if v['star'] == 5:
            prize.append({'a':'hero','t':k,'n':5})

    _sendData = g.getPrizeRes(uid, prize, {'act':'specialprize'})
    g.sendUidChangeInfo(uid, _sendData)

#用户添加新头像
g.event.on("adduserhead",setNewHead)
# 特殊渠道赠送奖励
g.event.on('dengjilibao', OnSpecialPrize)

# 监听等级上升事件
# g.event.on("lvup",onLvUp)
#监听按钮变化事件
g.event.on("btnchange",sendBtnChange)

g.event.on("altattr", chkAttr)
# 监听viplvchange事件，重新计算英雄属性
g.event.on("viplvchange", onVipChangePMD)
# 监听rankchaneg事件
g.event.on("rankchange", chk_rank_top10)
# 监听用户登录事件
g.event.on("userLogin",chkLoginPMD)
# 检查登录操作
g.event.on("userLogin",checkLoginAct)

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    print g.mdb.update('blacklist',{'uid':uid},{'$pullAll':{'friend':[1,2]}})