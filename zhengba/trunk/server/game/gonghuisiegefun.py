#!/usr/bin/python
# coding:utf-8

'''
工会——攻城掠地相关方法
'''
import g, random
# 公会attr属性表
GHATTR = g.BASEDB(g.mdb, 'gonghuiattr', 'gonghuiattr')

def getWeekKey():
    _nt = g.C.NOW()
    return g.C.getWeekNumByTime(_nt)

# 初始化玩家数据
def initUserData(uid):
    _dkey = getWeekKey()
    _nt = g.C.NOW()
    gud = g.getGud(uid)
    _con = g.GC["gonghuisiege"]
    _initData = {
        "uid": uid,
        "ghid":gud["ghid"],
        "dkey":_dkey,
        "sid": g.getHostSid(),
        "ttltime":g.C.getTTLTime(),
        "ctime": _nt,
        "alljifen":0,    # 总积分
        "fightnum":0, # 战斗次数
        "winnum":0, #胜场次数
        "fightnuminfo": {},
        "lasttime":_nt,
        "jifeninfo":{},  # 不同城池的积分数据
        "zhanli":gud["maxzhanli"],
        "groupid":g.m.crosscomfun.getServerGroupId(uid) # 分组id
    }
    # 初始化挑战次数
    getChallengeNum(uid)
    # 设置工会数据
    g.crossDB.insert("gonghui_siege", _initData)
    if "_id" in _initData:
        del _initData["_id"]
    return _initData


# 获取玩家数据
def getUserData(uid, init=0, keys=None):
    _dkey = getWeekKey()
    _options = {}
    if keys != None:
        _options['fields'] = keys.split(",")
    _data = g.crossDB.find1("gonghui_siege", {"uid": uid, "dkey": _dkey}, **_options)
    if not _data and init:
        _data = initUserData(uid)
    return _data


# 设置玩家数据
def setUserData(uid, data):
    _setData = {"$set": {}}
    _dkey = getWeekKey()
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    g.crossDB.update("gonghui_siege", {"uid": uid, "dkey": _dkey}, _setData)


# 获取挑战次数
def getRevertNum(uid):
    userdata = getChallengeNum(uid)
    # 获取许可证相应配置
    _con = g.GC["gonghuisiege"]
    _maxNum = _con["fight_num"]['maxnum']
    _refreshcd = _con["fight_num"]['refreshtime']

    # 获取玩家的活动信息

    _recoverTime = userdata["recovertime"]
    # 获取当前许可证的数量
    _num = userdata["num"]
    # 如果少于最大拥有数量就刷成最大的拥有数量
    if _num >= _maxNum:
        _num = _maxNum
        _recoverTime = -1
        userdata["num"] = _num
        userdata["recovertime"] = _recoverTime
        return userdata

    _nt = g.C.NOW()
    _chk = 0
    if _recoverTime <= _nt and _num < _maxNum and _recoverTime != -1:
        _num += 1
        _chk = 1
        if _num >= _maxNum:
            # 下次刷新时间
            _recoverTime = -1
        else:
            # 判断超出的时间可以获得几个许可证
            _difftime = _nt - _recoverTime
            # 剩余时间
            _surplustime = 0
            while 1:
                _difftime -= _refreshcd
                if _difftime < 0:
                    _surplustime = _difftime
                    break
                # # 获取当前剩余时间
                # _surplustime += _difftime
                _num += 1
                if _num >= _maxNum:
                    _recoverTime = -1
                    break
            _recoverTime = _nt - _surplustime

    # 修复异常数据
    if _num >= _maxNum and _recoverTime != -1:
        _recoverTime = -1
    userdata["recovertime"] = _recoverTime
    userdata["num"] = _num
    if _chk:
        # 设置
        _ctype = "siege_challengenum"
        _dkey = getWeekKey()
        _w = {"ctype": _ctype}
        g.setAttr(uid, _w, {"recovertime": _recoverTime, "v": _num, "k": _dkey})

    return userdata


# 获取玩家今天挑战胜利次数
def getWinNum(uid):
    _res = 0
    _ctype = "siege_winnum"
    _w = {"ctype": _ctype}
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _res = _data[0]["v"]
    return _res


# 设置玩家今天挑战胜利次数
def setWinNum(uid):
    _winNum = getWinNum(uid)
    _ctype = "siege_winnum"
    _w = {"ctype": _ctype}
    _winNum += 1
    g.setAttr(uid, _w, {"v": _winNum})


# 设置今天领取的奖励下标
def getWinPrize(uid):
    _res = []
    _ctype = "siege_winprize"
    _w = {"ctype": _ctype}
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _res = _data[0]["v"]
    return _res


def setWinPrize(uid, idxlist):
    _ctype = "siege_winprize"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": idxlist})


# 设置玩家当前可以的挑战次数
def useChallengeNum(uid, challengeInfo):
    _ctype = "siege_challengenum"
    _w = {"ctype": _ctype}
    _dkey = getWeekKey()
    _con = g.GC["gonghuisiege"]
    _maxNum = _con["fight_num"]['maxnum']
    _refreshcd = _con["fight_num"]['refreshtime']
    # 扣除次数
    challengeInfo["num"] -= 1
    _setData = {}
    _setData["v"] = challengeInfo["num"]

    _nt = g.C.NOW()
    # 判断是否需要开始恢复时间
    if challengeInfo["num"] < _maxNum and challengeInfo["recovertime"] == -1:
        challengeInfo["recovertime"] = _nt + _refreshcd
        _setData["recovertime"] = challengeInfo["recovertime"]

    # 设置日期
    _setData["k"] = _dkey
    g.setAttr(uid, _w, _setData)
    return challengeInfo

# 获取玩家的每天的挑战次数
def getChallengeNum(uid):
    _res = {}
    _ctype = "siege_challengenum"
    _dkey = getWeekKey()
    _w = {"ctype": _ctype, "k": _dkey}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res["num"] = _data["v"]
        _res["recovertime"] = _data["recovertime"]
    else:
        _con = g.GC["gonghuisiege"]
        _initNum = _con["fight_num"]['initnum']
        _nt = g.C.NOW()
        _setData = {}
        _setData["v"] = _res["num"] = _initNum
        _setData["recovertime"] = _res["recovertime"] = _nt + _con["fight_num"]['refreshtime']
        _setData["k"] = _dkey
        g.setAttr(uid, {"ctype": _ctype}, _setData)

    return _res

# # 生成每周城市的特产道具
# def time_citySpecialPrize():
#     _dkey = getWeekKey()
#     _ctype = 'TIMER_CITYSPECIALPRIZE'
#     _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _dkey})
#     if len(_chkData) > 0:
#         # 数据已上传
#         return
#
#     _cityInfo = g.GC["gonghuisiege"]["cityinfo"]
#     _nt = g.C.NOW()
#     _cityData = {}
#     for cityid, info in _cityInfo.items():
#         _cityData[cityid] = g.C.getRandArrNum(info["randomprize"], 1)
#
#     # 设置分组状态
#     g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': _cityData, 'k': _dkey})


# 获取城市的特产道具
def getCityInfo():
    _dkey = getWeekKey()
    _mcKey = "SIEGE_CITYINFO_{0}".format(_dkey)
    _cityData = g.crossMC.get(_mcKey)
    if not _cityData:
        _ctype = 'TIMER_CITYSPECIALPRIZE'
        _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _dkey})
        if not _chkData:
            _cityInfo = g.GC["gonghuisiege"]["cityinfo"]
            _nt = g.C.NOW()
            _cityData = {}
            for cityid, info in _cityInfo.items():
                _cityData[cityid] = g.C.getRandArrNum(info["randomprize"], 1)[0]
                # _cityData[cityid] = {}
                # _cityData[cityid]["speciaprize"] = _speciaPrize
                # # 获取rankprize
                # _baseRankPrize = list(g.C.dcopy(_cityInfo[cityid]["baserankprize"]))
                # _rank = 1
                # for ele in _baseRankPrize:
                #     ele = list(ele)
                #     _key = "n" + str(_rank)
                #     ele.append(_speciaPrize[_key])
                #     _rank += 1
                # _luckyprize = list(g.C.dcopy(_cityInfo[cityid]["luckyprize"]))
                # _luckyprize.append(_speciaPrize["lucky"])
                # # 返回前端配置rank排行奖励，一开始配置不符合需求，避免前端改动过大
                # _cityData[cityid]["baserankprize"] = _baseRankPrize
                # _cityData[cityid]["luckyprize"] = _luckyprize
                # if "p" in _cityData[cityid]:
                #     del _cityData[cityid]["p"]

            # 设置分组状态
            g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': _cityData, 'k': _dkey})
        else:
            _cityData = _chkData[0]["v"]
        g.crossMC.set(_mcKey, _cityData, 3600)
    return _cityData

# 获取战力下限
def getMinZhanli(gid):
    _key = getWeekKey()
    _res = g.mc.get('siege_minzhanli_{0}_{1}'.format(gid, _key))
    if _res is None:
        _data = g.crossDB.find1('servergroup', {'dkey':_key,'serverid':str(g.getHostSid())},fields=['_id','idx']) or {'idx':0}
        _res = g.GC['crossgroup']['opendaygroup'][_data.get('idx', 0)]['zhanli']
        g.mc.set('siege_minzhanli_{0}_{1}'.format(gid, _key), _res, 24*3600)

    return _res

# 获取刷新对手的方法-本方法只根据规则刷新出对手
def refPkUser(uid, cityid, issys=1, blacklist=[], ref=False):
    # 需要刷新出来的玩家数量
    # 获取赛季
    _nt = g.C.NOW()
    _dkey = getWeekKey()
    _con = g.GC["gonghuisiege"]
    _refrival = _con["refrival"]
    _resList = []
    _pkuidlist = []
    _black = [uid] + blacklist
    _npcNum = 0
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    _maxzhanli = gud["maxzhanli"]
    # 获取分组id
    _groupid = g.m.crosscomfun.getServerGroupId(uid)
    # 获取战力
    _zhanli = getMinZhanli(_groupid)
    _w = {"dkey": _dkey, "uid": {"$nin": _black}, "jifeninfo.{0}".format(cityid):{"$exists": 1}, "groupid": _groupid, "ghid":{"$ne":_ghid}, "zhanli":{'$gte':_zhanli}}
    # 循环生成对手
    for idx, val in enumerate(_refrival):
        _where = val["where"]
        _uidsArr = []

        if issys:
            _where = val["syswhere"]
        _cacheKey = 'gonghuisiegefun_' + str(issys) + "_" + str(idx) + "_" + str(cityid) + "_" + str(uid) + "_" + str(_dkey)
        if not ref:
            _uidsArr = g.mc.get(_cacheKey)
        else:
            _uidsArr = []
        if not _uidsArr:
            # _w.update({'zhanli': {'$lte': eval(_where[0]), '$gte': eval(_where[1])}})
            _uidNeedLen = 100  # 一次筛出100个uid
            _count = g.crossDB.count("gonghui_siege", _w)
            _skip = 0  # 在合法范围内skip
            if _count > _uidNeedLen:
                _skip = random.randint(1, _count - _uidNeedLen) - 1
            _uidsArr = g.crossDB.find("gonghui_siege", _w, fields=['_id'], limit=_uidNeedLen,skip=_skip)  # [{uid:1},{uid:2}]
            g.mc.set(_cacheKey, _uidsArr, 20 * 60)  # 缓存uid指定时长

        # 如果有玩家报名
        if _uidsArr and len(_uidsArr) > 0:

            #  如果比较小
            if len(_uidsArr) < val["num"]:
                _randomEnemyUid = _uidsArr
                _npcNum += val["num"] - len(_uidsArr)
            else:
                _randomEnemyUid = random.sample(_uidsArr, val["num"])
            for enemy in _randomEnemyUid:
                _enemyUid = enemy["uid"]
                _player = None
                _fightinfo = None
                if _enemyUid not in _pkuidlist:
                    _player = enemy
                    _fightinfo =  g.crossDB.find1("jjcdefhero", {"uid": _enemyUid}, fields=['_id'])
                 # 根据刷新类型，获得对手的战力范围
                if not _player or not _fightinfo:
                    _npcNum += 1
                    continue

                _player['zhanli'] = _fightinfo['maxzhanli'] if _fightinfo else 0
                _player["herolist"] = _fightinfo['fightdata']
                _player["headdata"] = _fightinfo['headdata']
                _pkuidlist.append(_player['uid'])
                _resList.append(_player)
        else:
            _npcNum += val["num"]

    # 需要生成NPC则填充NPC
    if _npcNum > 0:
        _npclist = []
        for i in xrange(_npcNum):
            _npcData = _con['npcdata']
            _lv = gud['lv']
            # 生成NPC
            for d in _npcData:
                _lv1 = d[0][0]
                _lv2 = d[0][1]
                if _lv1 <= _lv <= _lv2:
                    # 如果需要生成的NPC数量，超过了配置的数量，则报错
                    if _npcNum > len(d[1]):
                        raise ValueError

                    # 确保取出的npcid不重复
                    while True:
                        _npcid = g.C.RANDLIST(d[1])[0]
                        if _npcid not in _npclist:
                            break

                    _npclist.append(_npcid)
                    _npcinfo = g.m.fightfun.getNpcFightData(_npcid)
                    _npcinfo['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getSvrIndex())
                    _npcinfo['headdata']['name'] = g.L('siege_name')
                    _npcinfo['headdata']['ghname'] = g.L('siege_ghname')
                    _npcinfo['uid'] = "NPC"
                    _npcinfo["alljifen"] = 0
                    _npcinfo['zhanli'] = g.m.npcfun.getNpcZhanli(_npcinfo['herolist'])
                    _resList.append(_npcinfo)
    return _resList


# 添加攻城略地日志
def addLog(uid, loginfo):
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    dkey = getWeekKey()
    _ctype = "siege_log"
    _where = {'ctype': _ctype}
    _setData = {"$set": {}}

    _nt = g.C.NOW()
    GHATTR.setAttr(_ghid, _where, {"$push": {"v": {"$slice": -50, "$each": [loginfo]}}, "$set": {"k": dkey}})

# 获取攻城掠地日志
def getLog(uid):
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    dkey = getWeekKey()
    _res = g.crossDB.find("gonghui_siege_fightlog", {"ghid":_ghid, "dkey": dkey}, limit=50, sort=[["ctime", -1]], fields=["ghid", "win", "log", "jifeninfo"])
    for i in _res:
        i["tid"] = str(i["_id"])
        del i["_id"]

    return _res


# 添加攻城略地转盘日志
def addZhuanPanLog(uid, loginfo):
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    dkey = getWeekKey()
    _ctype = "siege_zhuanpanlog"
    _where = {'ctype': _ctype}
    _setData = {"$set": {}}
    _logList = getZhuanPanLog(uid)
    _logList.append(loginfo)
    _nt = g.C.NOW()
    GHATTR.setAttr(_ghid, _where, {"v": _logList, "k": dkey})


# 获取攻城掠地转盘日志
def getZhuanPanLog(uid):
    _res = []
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    dkey = getWeekKey()
    _ctype = "siege_zhuanpanlog"
    _where = {'ctype': _ctype, "k": dkey}
    _logInfo = GHATTR.getAttrOne(_ghid, _where)
    if _logInfo:
        _res = _logInfo["v"]
        _res = _logInfo["v"][-30:]
    return _res



# 设置玩家的pk对象
def setPkUserList(uid,cityid, _setData):
    dkey = getWeekKey()
    _ctype = "siege_pkuserlist_{0}".format(cityid)
    _w = {"ctype": _ctype}
    _setData.update({"k": dkey})
    g.setAttr(uid, _w, _setData)

# 获取玩家的pk对象
def getPkUserList(uid, cityid):
    _res = {}
    dkey = getWeekKey()
    _ctype = "siege_pkuserlist_{0}".format(cityid)
    _w = {"ctype": _ctype, "k": dkey}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res["pklist"] = _data["v"]
        _res["passlist"] = _data.get("passlist", [])
    else:
        _resList = refPkUser(uid, cityid)
        _res["pklist"] = _resList
        _res["passlist"] = []
        # 设置pk对象列表
        setPkUserList(uid, cityid, {"v": _resList, "passlist": []})
    return _res



# 设置集火城市
def setAssistedCity(uid, cityid):
    dkey = getWeekKey()
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    _ctype = "siege_city"
    _w = {"ctype": _ctype}
    GHATTR.setAttr(_ghid, _w, {"v": cityid, "k": dkey})


# 获取当前集火的城市
def getAssistedCity(uid):
    _cityid = ""
    dkey = getWeekKey()
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    _ctype = "siege_city"
    _w = {"ctype": _ctype, "k": dkey}
    _data = GHATTR.getAttrOne(_ghid, _w)
    if _data:
        _cityid = _data["v"]
    return _cityid

# 判断当前时间是否开启
def chkOpen(type="opentime"):
    _res = False
    _nt = g.C.NOW()
    _weekFirstTime = g.C.getWeekFirstDay(_nt)
    _openTime = g.GC["gonghuisiege"][type]
    if _weekFirstTime + _openTime[0] <= _nt <= _weekFirstTime + _openTime[1]:
        _res = True
    return _res

# 设置工会城池总积分
def setGongHhuiCityJiFen(uid, cityid, ghid, jifen, ghname="", setsid=False):
    # gud = g.getGud(uid)
    # _ghid = gud["ghid"]
    # _ghname = gud["ghname"]
    dkey = getWeekKey()
    _groupid = g.m.crosscomfun.getServerGroupId(uid)
    # 设置排行数据
    _data = g.crossDB.find1("gonghui_siege_rank", {"ghid": ghid, "dkey": dkey, "cityid":cityid})
    _newJifen = 0
    if _data:
        _newJifen = _data["jifen"] +jifen
        if _newJifen < 0:
            _newJifen = 0

    _setData = {"jifen": _newJifen}
    if (_data["groupid"] != _groupid or _data["sid"] != g.getHostSid()) and setsid == True:
        _setData["sid"] = g.getHostSid()
        _setData["groupid"] = _groupid
    if ghname:
        _setData.update({"ghname": ghname})
    g.crossDB.update("gonghui_siege_rank", {"ghid": ghid, "dkey": dkey, "cityid":cityid},_setData)

def getGongHhuiCityJiFen(uid, cityid):
    _res = 0
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    dkey = getWeekKey()
    _nt = g.C.NOW()

    # 开战期
    if _nt - g.C.getWeekFirstDay(_nt) >= g.GC['gonghuisiege']['opentime'][0]:
        _groupid = g.m.crosscomfun.getServerGroupId(uid)
        # 设置排行数据
        _rankInfo = g.crossDB.find1("gonghui_siege_rank", {"ghid": _ghid, "dkey": dkey, "cityid": cityid}, fields=["_id", "jifen"])
        if not _rankInfo:
            _initData = {
                "ghid":_ghid,
                "dkey":dkey,
                "cityid":cityid,
                "jifen":0,
                "groupid":_groupid,
                "ctime":_nt,
                "ttltime":g.C.getTTLTime(),
                "ghname": gud["ghname"],
                "servername": gud["ext_servername"],
                "fightnum":0,
                "sid": g.getHostSid(),
            }
            g.crossDB.insert("gonghui_siege_rank",_initData)
        else:
            _res = _rankInfo["jifen"]

    return _res

# 获取城市排行
def getCityRank(uid, cityid, limit=5, iscache=True):
    dkey = getWeekKey()
    _groupid = g.m.crosscomfun.getServerGroupId(uid)
    _nt = g.C.NOW()
    # 排名计数sun
    _rankList = []
    _uid2rank = {}

    _cacheKey = "gonghuisiege_{0}_{1}".format(cityid, _groupid)
    _cacheRank = g.crossMC.get(_cacheKey)
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _tmpRank = 1
        # 获取列表
        _rInfo = g.crossDB.find("gonghui_siege_rank", {"dkey": dkey, "cityid": cityid, "groupid": _groupid, "jifen": {"$gt": 0}},
                                    fields=["_id", "jifen", "ghid", "ghname","fightnum"], limit=limit,sort=[["jifen", -1]])
        for ele in _rInfo:
            _tmpData = {}
            _uid2rank[ele['ghid']] = _tmpRank
            _tmpData['rank'] = _tmpRank
            _tmpData['jifen'] = ele["jifen"]
            _tmpData["ghname"] = ele["ghname"]
            _tmpData["fightnum"] = ele["fightnum"]
            _rankList.append(_tmpData)
            _tmpRank += 1

        if len(_rankList) > 0:
            g.crossMC.set(_cacheKey, {"list": _rankList, 'uid2rank': _uid2rank}, 5)
    _myRank = -1  # 默认排名未上榜
    # # 获取工会id
    gud = g.getGud(uid)
    _ghid = gud["ghid"]
    _myVal = getGongHhuiCityJiFen(uid, cityid)
    if _ghid in _uid2rank:
        _myRank = _uid2rank[_ghid]
    _rData = {"ranklist": _rankList, "myrank": _myRank, 'myval': _myVal}
    return _rData


# 设置免费刷新次数
def setFreeRefNum(uid,  _refnum):
    _ctype = "siege_freenum"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": _refnum + 1})


# 设置免费刷新次数
def getFreeRefNum(uid):
    # 免费刷新次数
    _freenum = g.GC["gonghuisiege"]["freenum"]
    _fightNum = 0
    _ctype = "siege_freenum"
    _w = {"ctype": _ctype}
    _data = g.getAttrByDate(uid, _w)
    if _data:
        _fightNum = _data[0]["v"]
    return _fightNum


# 获取城池总积分排行
def getAllJiFenRank(uid ,limit=50, iscache=True, ghid=""):
    dkey = getWeekKey()
    _groupid = g.m.crosscomfun.getServerGroupId(uid)
    _nt = g.C.NOW()
    # 排名计数
    _rankList = []
    _uid2rank = {}
    _w = {"dkey": dkey,  "groupid": _groupid, "alljifen": {"$gt": 0}}
    if ghid:
        _w.update({"ghid":ghid})
    # # 获取工会id
    # gud = g.getGud(uid)
    # _ghid = gud["ghid"]
    _cacheKey = "gonghuisiege_jifenrank"
    if ghid:
        _cacheKey = "gonghuisiege_jifenrank_{0}".format(ghid)
    _cacheRank = g.mc.get(_cacheKey)
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _tmpRank = 1
        # 获取列表
        _rInfo = g.crossDB.find("gonghui_siege", _w, fields=["_id", "alljifen", "ghid", "uid", "fightnum"], limit=limit, sort=[["alljifen", -1], ["winnum", -1]])
        for ele in _rInfo:
            _tmpData = {}
            _uid2rank[ele['uid']] = _tmpRank
            # if ghid:
            #     _uid2rank[ele['ghid']] = _tmpRank
            _tmpData['rank'] = _tmpRank
            _tmpData['val'] = ele["alljifen"]
            _tmpData["fightnum"] = ele["fightnum"]
            if not ghid:
                try:
                    _tmpData["headdata"] = g.crossDB.find1("cross_friend", {"uid": ele["uid"]}, fields={'_id':0,'head.defhero':0})["head"]
                except:
                    print ele["uid"]
            else:
                _tmpData["headdata"] = g.m.userfun.getShowHead(ele["uid"])
            _rankList.append(_tmpData)
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set(_cacheKey, {"list": _rankList, 'uid2rank': _uid2rank}, 300)
    _myRank = -1  # 默认排名未上榜
    _myVal = 0
    _myInfo = getUserData(uid)
    if _myInfo:
        _myVal = _myInfo["alljifen"]
    _key = uid
    # if ghid:
    #     _key = ghid
    if _key in _uid2rank:
        _myRank = _uid2rank[_key]
    _rData = {"ranklist": _rankList, "myrank": _myRank, 'myval': _myVal}
    return _rData

# 定时器发奖
def timer_sendCityPrize():
    _dkey = getWeekKey()
    _ctype = 'TIMER_SENDCITYPRIZE'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _dkey})
    if len(_chkData) > 0:
        # 数据已上传
        return
    # 判断是否到发奖时间
    if not g.m.gonghuisiegefun.chkOpen("closetime"):
        return
    _con = g.GC["gonghuisiege"]
    _email = _con["email"]
    _cityInfo = _con["cityinfo"]
    # 获取每个城市的特权奖励
    _cityPrizeInfo = getCityInfo()
    _nt = g.C.NOW()
    _cityData = {}
    # 获取当前最大的分组
    _maxGroupId = 0
    _maxServerGroup = g.crossDB.find("servergroup", {"dkey": _dkey},fields=['_id','gid'])
    if _maxServerGroup:
        _maxGroupId = int(max(_maxServerGroup, key=lambda x:int(x['gid']))['gid'])
    # 分发不同组的奖励
    for _groupid in xrange(_maxGroupId + 1):
        _groupid = str(_groupid)
        for cityid, info in _cityInfo.items():
            if not info["isopen"]:
                continue
            _rankList = g.crossDB.find("gonghui_siege_rank", {"dkey": _dkey, "cityid": cityid, "groupid": _groupid, "jifen":{"$gt":0}},
                                    fields=["_id", "jifen", "ghid", "sid"], limit=3, sort=[["jifen", -1]])
            _randomprize = _cityPrizeInfo[cityid]
            _backlist = []
            for idx, data in enumerate(_rankList):
                _rank = idx + 1
                _prize = []
                # 发奖
                _i = 1
                for ele in info["baserankprize"]:
                    if ele[0][0] <= _rank <= ele[0][1]:
                        _prize += ele[1]
                        _key = "n" + str(_i)
                        _randomprize["n"] = _cityPrizeInfo[cityid][_key]
                        _prize += [_randomprize]
                        break
                    _i += 1
                _backlist.append(data["ghid"])
                # 发奖
                if _prize:
                    # 发送跨服工会邮件
                    _content = g.C.STR(_email["content"], info["name"], _rank)
                    g.m.emailfun.sendGongHuiCrossEmail(data["ghid"], data["sid"], _email["title"], _content, prize=_prize)


            # 随机一个幸运势力
            _count = g.crossDB.count("gonghui_siege_rank", {"dkey": _dkey, "cityid": cityid, "groupid": _groupid,
                                                       "ghid":{"$nin": _backlist},"jifen": {"$gte": info["luckneedjifen"]}})
            if not _count:
                continue
            skip = g.C.RANDINT(0, _count - 1)
            luckInfo = g.crossDB.find1("gonghui_siege_rank", {"dkey": _dkey, "cityid": cityid, "groupid": _groupid, "ghid": {"$nin": _backlist},"jifen": {"$gte": info["luckneedjifen"]}}, skip=skip)
            if luckInfo:
                _prize = []
                _prize += info["luckyprize"]
                # 加上特产奖励
                _randomprize["n"] = _cityPrizeInfo[cityid]["lucky"]
                _prize += [_randomprize]
                if _prize:
                    # 发送跨服工会邮件
                    _content = g.C.STR(_email["luckcontent"], info["name"])
                    g.crossDB.update("gonghui_siege_rank",{"dkey": _dkey, "cityid": cityid, "groupid": _groupid, "ghid":luckInfo["ghid"]}, {"lucky": 1})
                    g.m.emailfun.sendGongHuiCrossEmail(luckInfo["ghid"], luckInfo["sid"], _email["title"], _content, prize=_prize)

    # 设置分组状态
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': _cityData, 'k': _dkey})


def getSiegeHongDian(uid):
    _res = 0
    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        return _res
    _con = g.GC["gonghuisiege"]
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        return _res

    # 判断是否在活动持续时间段内
    if not chkOpen():
        return _res
    _openCond = _con['openCond']
    _openDay = g.getOpenDay()
    _needLv = _openCond[-1][1]
    for cond in _openCond:
        # 判断是否在这个条件下
        if cond[0][0] <= _openDay < cond[0][1]:
            _needLv = cond[1]
    if gud["lv"] < _needLv:
        return _res
    # 获取恢复类道具是否有次数
    _recoverInfo = g.m.gonghuisiegefun.getChallengeNum(uid)
    if _recoverInfo["num"] > 0:
        return 1

    # 判断是否有每日奖励可以领取
    _task = _con["task"]
    _winnum = g.m.gonghuisiegefun.getWinNum(uid)
    # 今天领取的奖励下标
    _winprize = g.m.gonghuisiegefun.getWinPrize(uid)

    for idx, info in enumerate(_task):
        if idx not in _winprize and _winnum >= info["pval"]:
            return 1
    return _res



if __name__ == '__main__':
    uid = g.buid("8887")
    from pprint import pprint

    _nt = g.C.NOW()
    _nowDkey = g.C.getWeekNumByTime(_nt)
    g.mc.delete('king_statue_{}'.format(_nowDkey))