#!/usr/bin/python
# coding:utf-8

'''
排行榜相关功能
'''
import g

# 获取指定排名的积分
def getRankJifen(collection, num):
    _jifen = g.mc.get('rankjifen_{}'.format(collection))
    if not _jifen:
        _info = g.mdb.find1(collection,sort=[['jifen',-1]],skip=num,fields=['_id','jifen'])
        if _info:
            _jifen = _info['jifen']
        else:
            _jifen = -1
        g.mc.set('rankjifen_{}'.format(collection), _jifen, 300)

    return _jifen


# 获取整十分钟
def getEveryTenMinute():
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    # 缓存时间
    _cacheTime = 600
    tenMin, _ = divmod(_nt - _zt, _cacheTime)
    return str(tenMin)

# 获取下一个整点小时的字符串
def getNextHourTime():
    every_ten_minute = getEveryTenMinute()
    _ht = g.C.DATE(fmtStr="%Y-%m-%d") + '_' + every_ten_minute
    return _ht


# 获取玩家最大挂机地图排行
def getMaxMapidRank(iscache=1, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("MaxMapIdRank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        # 排名计数
        _uid2rank = {}
        _tmpRank = 1
        _rInfo = g.mdb.find('userinfo', {'maxmapid': {'$gte': 0}}, sort=[['maxmapid', -1], ['lastpassmaptime', 1]],
                            fields=['_id', 'uid', 'maxmapid'], limit=50)
        for ele in _rInfo:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            _tmpData['maxmapid'] = ele['maxmapid']
            _rankList.append(_tmpData)
            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set("MaxMapIdRank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    if uid != None:
        gud = g.getGud(uid)
        if gud['maxmapid'] >= 0:
            if uid in _uid2rank:
                _myRank = _uid2rank[uid]
            else:
                _myRank = g.mdb.count('userinfo', {'maxmapid': {'$gte': gud['maxmapid']}})
                if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank}
    return _rData


# 获取英雄总战力排行榜
def getSumZhanliRank(uid):
    '''    #最大1000个文档,聚合1000个文档用于寻找我的位置
        _pipeLine = [{"$project":{"zhanli":1,"uid":1,"_id":0}},
                     {"$group":{"_id":"$uid","zhanli":{"$sum":"$zhanli"}}},
                     {"$limit":1000},
                     {"$sort":{"zhanli":-1}}]
        
        _res = g.mdb.aggregate("hero",_pipeLine)
    '''

    # 处理数据
    def processData(rlist):
        _retVal = []
        for ele in rlist:
            _tmpData = {}
            gud = g.getGud(ele["uid"])
            if gud == None:
                continue
            _tmpData["name"] = gud["name"]
            _tmpData["slname"] = gud["slname"]
            _tmpData["flag"] = gud["flag"]
            _tmpData["lv"] = gud["lv"]
            _tmpData["vip"] = gud["vip"]
            _tmpData["sumzhanli"] = ele["v"]
            _tmpData["uid"] = ele["uid"]
            _tmpData['head'] = gud['head']
            _retVal.append(_tmpData)

        return (_retVal)

    _rData = getStatRankInfo(uid, "SUMZHANLIRANK", "HERO_SUMZHANLI", processData)
    return (_rData)


# 获取我的统计信息排名
def getMyStatRankInfo(uid, cacheKey, statKey):
    _nextTime = getNextHourTime()
    _myRank = 0
    _myZhanli = 0
    _myK = None
    # 我的缓存信息
    _myCacheInfo = g.m.sess.get(uid, cacheKey)
    # 优先读缓存战力
    if _myCacheInfo != None and _myCacheInfo["t"] == _nextTime:
        _myRank = _myCacheInfo["rank"]
        _myZhanli = _myCacheInfo["zhanli"]
        if "k" in _myCacheInfo:
            _myK = _myCacheInfo["k"]
    else:
        # 排行信息,前1000人
        _rlist = g.m.statfun.getStatInfo(where={"ctype": g.L(statKey)}, keys='_id,k,v,uid', sort=[["v", -1]], limit=50)
        # 计算出我的排行
        for idx, ele in enumerate(_rlist):
            if ele["uid"] == uid:
                _myZhanli = ele["v"]
                _myRank = idx + 1
                if "k" in ele:
                    _myK = int(ele["k"])
                break

            # 不在1000名内,获取我的总战力
            if _myZhanli == 0:
                _r = g.m.statfun.getStatByUid(uid, g.L(statKey), keys="v")
                if len(_r) > 0:
                    _myZhanli = _r[0]["v"]

    if _myCacheInfo == None or _myCacheInfo["t"] != _nextTime:
        _setInfo = {"rank": _myRank, "zhanli": _myZhanli, "t": _nextTime}
        if _myK != None:
            _setInfo["k"] = _myK

        # _ret = g.m.sess.set(uid,cacheKey,_setInfo)

    _retVal = {"myrank": _myRank, "myzhanli": _myZhanli}
    if _myK != None:
        _retVal["k"] = _myK

    return (_retVal)


# 获取统计的rank信息
def getStatRankInfo(uid, cacheKey, statKey, pcall):
    _nextTime = getNextHourTime()
    _zhanliRank = []
    # TOP 50 的缓存
    _cacheRank = g.mc.get(cacheKey)
    # 默认读取缓存
    if _cacheRank != None and _cacheRank["t"] == _nextTime:
        _zhanliRank = _cacheRank["list"]
    else:
        # 数据列表
        _rlist = g.m.statfun.getStatInfo(where={"ctype": g.L(statKey)}, keys='_id,lv,k,v,uid,ismingjiang,mjlv',
                                         sort=[["v", -1]], limit=50)
        # 处理数据
        _zhanliRank = pcall(_rlist)
        # 存入缓存
        if len(_zhanliRank) > 0:
            g.mc.set(cacheKey, {"list": _zhanliRank, "t": _nextTime})

    # 个人统计信息
    _myRankInfo = getMyStatRankInfo(uid, cacheKey, statKey)
    _rData = {"ranklist": _zhanliRank}
    _rData.update(_myRankInfo)
    return _rData


# 获取英雄榜的数据
def getHeroRank(uid):
    # 处理数据
    def processData(rlist):
        _retVal = []
        for ele in rlist:
            _tmpData = {}
            gud = g.getGud(ele["uid"])
            if gud == None:
                continue
            _tmpData["uid"] = ele["uid"]
            _tmpData["name"] = gud["name"]
            _tmpData["hid"] = ele["k"]
            _tmpData["lv"] = ele["lv"]
            _tmpData["vip"] = gud["vip"]
            _tmpData["zhanli"] = ele["v"]
            _tmpData['head'] = gud['head']
            if 'ismingjiang' in ele:
                _tmpData['ismingjiang'] = ele['ismingjiang']
                _tmpData['mjlv'] = ele['mjlv']

            _retVal.append(_tmpData)

        return _retVal

    _rData = getStatRankInfo(uid, "HERORANK", "HERO_MAXZHANLI", processData)
    return _rData


# 获取势力排行榜
def getShiliRank(uid):
    _slRank = []
    _nextTime = getNextHourTime()
    _cacheRank = g.mc.get("SHILIRANK")
    # 默认读取缓存
    if _cacheRank != None and _cacheRank["t"] == _nextTime:
        _slRank = _cacheRank["list"]
    else:
        _rInfo = g.m.shilifun.getAllShiliInfo("mzname,slattr.lingdinum,name,flag,pnum,maxnum,lv",
                                              "slattr.lingdinum,lv,pnum")
        for ele in _rInfo:
            _tmpData = {}
            _tmpData["lv"] = ele["lv"]
            _tmpData["name"] = ele["name"]
            _tmpData["flag"] = ele["flag"]
            _tmpData["lingdinum"] = g.m.fightteamfun.getMyShiliLDNumBySid(str(ele['_id']))  # ele["slattr"]["lingdinum"]
            _tmpData["num"] = g.C.STR("{1}/{2}", ele["pnum"], ele["maxnum"])
            _tmpData['pnum'] = ele['pnum']
            _tmpData["slid"] = str(ele["_id"])
            _tmpData['mzname'] = ele['mzname']
            _slRank.append(_tmpData)

        if len(_slRank) > 0:
            _slRank.sort(key=lambda x: (-x['lingdinum'], -x['lv'], -x['pnum']))
            g.mc.set("SHILIRANK", {"list": _slRank, "t": _nextTime})

    _myRank = 0
    gud = g.getGud(uid)
    for idx, ele in enumerate(_slRank):
        if ele["slid"] == gud["slid"]:
            _myRank = idx + 1
            break

    _rData = {"ranklist": _slRank, "myrank": _myRank}
    return (_rData)

# 获取膜拜奖励
def getWorshipPrize():
    _res = []
    _dlzList = g.GC['rankcom']['base']['worshipprize']
    for dlzID in _dlzList:
        _prize = g.m.diaoluofun.getGroupPrize(dlzID)
        _res.extend(_prize)
    return _res


# 获取最强战力榜
def getTopHeroZhanli(uid):
    # TODO 非常耗性能，需要优化
    # TODO MAPREDUCE 耗时过长 3W5 大概耗时500ms左右
    _nextTime = getNextHourTime()
    _cacheRank = g.mc.get("TOP5RANK")
    # 默认读取缓存
    _retVal = []
    if _cacheRank != None and _cacheRank["t"] == _nextTime:
        _retVal = _cacheRank["list"]
    else:
        ''' 
             MapReduce在执行时先指定一个Map(映射）函数，把输入<key,value>对映射成一组新的<key,value>对，经过一定处理后交给 Reduce，Reduce对相同key下的所有value处理后再输出<key,value>对作为最终的结果。
            MapReduce计算模型非常适合在大量计算机组成的大规模集群上并行运行。在采用Map/Reduce模式的分布式系统上，每一个Map任务和每一个Reduce任务均可以同时运行于一个单独的计算节点上，可想而知其处理效率是很高的。
        '''
        _map = '''function Map() {emit(this.uid,this.zhanli);}'''
        _reduce = '''function Reduce(key, values) {values.sort(function(a,b){return b-a});return Array.sum(values.slice(0,5));}'''
        # _r = g.mdb.map_reduce("hero",_map,_reduce,out="tmprank",sort={"uid":-1},jsMode=True)
        # _r = g.mdb.find("tmprank",{},sort=[["value",-1]],limit=1000)
        _r = g.mdb.find('userinfo', {}, sort=[['zhanli', -1]], fields=['_id', 'uid', 'zhanli'], limit=1000)
        _newr = []
        for ele in _r:
            if 'zhanli' not in ele: ele['zhanli'] = 0
            _newr.append(ele)

        _r = _newr

        # 查询出来就记录缓存
        if len(_r) > 0:
            g.mc.set("TOP5RANK_1000", _r)

        for ele in _r[0:50]:
            _tmpData = {}
            gud = g.getGud(str(ele["uid"]))

            _tmpData["zhanli"] = int(ele["zhanli"])
            _tmpData["name"] = gud["name"]
            _tmpData["flag"] = gud["flag"]
            _tmpData["slname"] = gud["slname"]
            _tmpData["lv"] = gud["lv"]
            _tmpData["vip"] = gud["vip"]
            _tmpData["uid"] = gud["uid"]
            _tmpData['head'] = gud['head']
            _retVal.append(_tmpData)

        # 记录缓存
        if len(_retVal) > 0:
            g.mc.set("TOP5RANK", {"list": _retVal, "t": _nextTime})

    _rData = {"ranklist": _retVal}
    _myRanks = getMyTopHeroZhanli(uid)
    _rData.update(_myRanks)
    g.event.emit("showRank", 'topArmyRank', uid, _rData)
    return (_rData)


# 获取我的最强战力榜排名
def getMyTopHeroZhanli(uid):
    # 获取原始1000个信息用于排名,没有缓存则不获取
    _cacheInfo = g.mc.get("TOP5RANK_1000")
    _rData = {"myrank": 0, "myzhanli": 0}
    if _cacheInfo == None:
        return _rData

    gud = g.getGud(uid)
    # 查询是否在1000名之内
    for idx, ele in enumerate(_cacheInfo):
        if str(ele["uid"]) == uid:
            _rData["myrank"] = idx + 1
            _rData["myzhanli"] = int(gud['zhanli'])
            break

    return _rData


# 获取城战排行榜
def getChenzhanRank(uid):
    _r = {"ranklist": [], "myrank": 0, "myzhanli": 0}
    return (_r)


# 获取天下比武排行
def getTxbwRank(uid):
    _rankList = []
    _myRankInfo = {"myrank": 0, "myzhanli": 0}
    # 我的排行信息
    _rInfo = g.m.txbwfun.getTxbwInfo(uid, keys='_id,rank,zhanli')
    if _rInfo != None:
        _myRankInfo["myrank"] = _rInfo["rank"]
        _myRankInfo["myzhanli"] = _rInfo["zhanli"]

    # 获取前50排行
    _keys = "_id,uid,rank,zhanli,info.lv,info.name,info.head".split(",")
    _rInfo = g.m.txbwfun.getTxbwInfoRaw(fields=_keys, sort=[["rank", 1]], limit=50)
    for ele in _rInfo:
        _tmpData = {}
        _uid = str(ele["uid"])
        _tmpData["uid"] = _uid
        _tmpData["zhanli"] = ele["zhanli"]
        if _uid.find("ROBOT_") == -1:
            _tmpGud = g.getGud(ele["uid"])
            _tmpData["lv"] = _tmpGud["lv"]
            _tmpData["vip"] = _tmpGud["vip"]
            _tmpData["flag"] = _tmpGud["flag"]
            _tmpData["name"] = _tmpGud["name"]
            _tmpData['head'] = _tmpGud['head']
            _tmpData["slname"] = _tmpGud["slname"]
        else:
            _tmpData["lv"] = ele["info"]["lv"]
            _tmpData["flag"] = ["", 1, 1, 1]
            _tmpData["slname"] = ''
            _tmpData['head'] = ele['info']['head']
            _tmpData['name'] = ele["info"]["name"]

        _rankList.append(_tmpData)

    _rData = {}
    _rData["ranklist"] = _rankList
    _rData.update(_myRankInfo)
    return (_rData)


def getSjywRank(uid):
    _rankList = []
    _myRankInfo = {"myrank": 0, "myzhanli": 0}
    # 我的排行信息
    _rInfo = g.m.sjywfun.getSjywInfo(uid, keys='_id,rank,info.sumzhanli')
    if _rInfo != None:
        _myRankInfo["myrank"] = _rInfo["rank"]
        _myRankInfo["myzhanli"] = _rInfo["info"]["sumzhanli"]

    # 获取前50排行
    _keys = "_id,uid,rank,info.sumzhanli,info.lv,info.name,info.head".split(",")
    _rInfo = g.m.sjywfun.getSjywInfoRaw(fields=_keys, sort=[["rank", 1]], limit=50)
    for ele in _rInfo:
        _tmpData = {}
        _uid = str(ele["uid"])
        _tmpData["uid"] = _uid
        _tmpData["zhanli"] = ele["info"]["sumzhanli"]
        if _uid.find("ROBOT_") == -1:
            _tmpGud = g.getGud(ele["uid"])
            _tmpData["lv"] = _tmpGud["lv"]
            _tmpData["vip"] = _tmpGud["vip"]
            _tmpData["flag"] = _tmpGud["flag"]
            _tmpData["name"] = _tmpGud["name"]
            _tmpData['head'] = _tmpGud['head']
            _tmpData["slname"] = _tmpGud["slname"]
        else:
            _tmpData["lv"] = ele["info"]["lv"]
            _tmpData["vip"] = 0
            _tmpData["flag"] = ["", 1, 1, 1]
            _tmpData["slname"] = ''
            _tmpData['head'] = ele['info']['head']
            _tmpData['name'] = ele["info"]["name"]

        _rankList.append(_tmpData)

    _rData = {}
    _rData["ranklist"] = _rankList
    _rData.update(_myRankInfo)
    return (_rData)


# 获取我的英雄总战力
# 聚合求出战力
def getMySumZhanli(uid):
    _pipeLine = [{"$match": {"uid": uid}},
                 {"$project": {"zhanli": 1, "uid": 1, "_id": 0}},
                 {"$group": {"_id": "$uid", "zhanli": {"$sum": "$zhanli"}}}]

    _res = g.mdb.aggregate("hero", _pipeLine)
    _rData = 0
    if len(_res) > 0:
        _rData = int(_res[0]["zhanli"])

    return (_rData)


# 获取城战总杀敌数
def getCityKillRank(uid):
    _rankList = []
    _key = 'cityfight_killnum'
    _data = g.m.statfun.getStatInfo(where={"ctype": _key}, keys='_id,v,uid', sort=[["v", -1]], limit=50)
    _myRankInfo = {"myrank": 0, "killnum": 0}
    _idx = 1
    for d in _data:
        _tmpUid = d['uid']
        _tmpGud = g.getGud(_tmpUid)
        if _tmpGud == None:
            continue
        # 杀敌数
        _killNum = int(d['v'])
        _tmpData = {}
        _tmpData['uid'] = _tmpUid
        _tmpData["lv"] = _tmpGud["lv"]
        _tmpData["vip"] = _tmpGud["vip"]
        _tmpData["flag"] = _tmpGud["flag"]
        _tmpData["name"] = _tmpGud["name"]
        _tmpData["slname"] = _tmpGud["slname"]
        _tmpData["killnum"] = _killNum
        _tmpData['head'] = _tmpGud['head']
        _rankList.append(_tmpData)
        if _tmpUid == uid:
            _myRankInfo['myrank'] = _idx
            _myRankInfo['killnum'] = _killNum

        _idx += 1

    _rData = {}
    _rData["ranklist"] = _rankList
    _rData.update(_myRankInfo)
    return _rData


# 获取奇道探险排行
def getQDTXRank(uid, num=20):
    _rankList = []
    _data = g.mdb.find('qidaotanxian', {}, sort=[["mapid", -1], ["uid", -1]], fields=["uid", "_id", "mapid"], limit=num)
    _myRankInfo = {"myrank": 0, "mapid": 0}
    _myData = g.mdb.find1('qidaotanxian', {'uid': uid}, fields=["uid", "_id", "mapid"])
    if _myData != None:
        _myRankInfo['mapid'] = int(_myData['mapid'])

    _idx = 1
    for d in _data:
        _tmpUid = d['uid']
        _tmpGud = g.getGud(_tmpUid)
        if _tmpGud == None:
            continue
        _tmpData = {}
        _tmpData['uid'] = _tmpUid
        _tmpData["lv"] = _tmpGud["lv"]
        _tmpData["vip"] = _tmpGud["vip"]
        _tmpData["flag"] = _tmpGud["flag"]
        _tmpData["name"] = _tmpGud["name"]
        _tmpData['sumzhanli'] = _tmpGud["sumzhanli"]
        _tmpData['mapid'] = int(d["mapid"])
        # _tmpData["slname"] = _tmpGud["slname"]
        _tmpData['head'] = _tmpGud['head']
        _rankList.append(_tmpData)
        if uid == _tmpUid:
            _myRankInfo['myrank'] = _idx

        _idx += 1

    _rData = {}
    _rData["ranklist"] = _rankList
    _rData.update(_myRankInfo)
    return _rData


# 根据排行id获取当日膜拜次数
def getMoBaiByRid(uid, rid):
    _ctype = 'rank_mobai'
    _rid = str(rid)
    return g.getPlayAttrDataNum(uid, _ctype, {'k': _rid})


# 根据排行id设置排行榜膜拜次数
def setMoBaiByRid(uid, rid):
    _ctype = 'rank_mobai'
    _rid = str(rid)
    return g.setPlayAttrDataNum(uid, _ctype, 1, {'k': _rid})


# 获取法师塔排行信息
def getFashitaRank(iscache=1, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("FashitaRank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _uid2rank = {}
        _info = g.mdb.find('fashita', sort=[['layernum', -1], ['lasttime', 1]], limit=50)
        _tmpRank = 1
        for i in _info:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _tmpData['layernum'] = i['layernum']
            _rankList.append(_tmpData)
            _uid2rank[i['uid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set("FashitaRank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    _info = g.m.fashitafun.getFashitaInfo(uid)
    _layernum = 0
    if uid != None and _info:
        _layernum = _info['layernum']
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _myRank = g.mdb.count('fashita', {'layernum': {'$gte': _layernum}})
            if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank, 'val':_layernum}
    return _rData


# 获取玩家竞技场排行
def getArenaRank(iscache=0, uid=None, iszhanli=False):
    _rankList = []
    _cacheRank = g.mc.get("ZypkjjcRank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        # 排名计数
        _uid2rank = {}
        _tmpRank = 1
        _sort = [['jifen', -1], ['zhanli', -1], ['lasttime', 1]]
        if iszhanli: _sort = [['zhanli', -1], ['lasttime', 1]]
        _maxNum = g.GC['zypkjjccom']['base']['rankmaxnum']
        _rInfo = g.mdb.find('zypkjjc', sort=_sort,limit=_maxNum)
        for ele in _rInfo:
            del ele['_id']
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            _tmpData['jifen'] = ele['jifen']
            _tmpData['zhanli'] = ele['zhanli']
            _rankList.append(_tmpData)
            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1

            if len(_rankList) > 0:
                g.mc.set("ZypkjjcRank", {"list": _rankList, 'uid2rank': _uid2rank}, 5)

    _myRank = -1  # 默认排名未上榜
    _arenaJifen = 0
    _arenaInfo = g.mdb.find1('zypkjjc', {'uid': uid})
    if uid != None and _arenaInfo:
        _arenaJifen = _arenaInfo.get('jifen', 1000)
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _markJifen = getRankJifen('zypkjjc', 100)
            if _arenaJifen > _markJifen:
                _myRank = g.mdb.count('zypkjjc', {'jifen': {'$gte': _arenaJifen}})
                if _myRank >= 1000: _myRank = -1
            else:
                _myRank = 100
                _arenaJifen = _markJifen

    _rData = {"ranklist": _rankList, "myrank": _myRank, 'jifen': _arenaJifen}
    return _rData


# 获取玩家冠军试练排行
def getChampionTrialRank(iscache=0, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("ChampionTrialRank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        # 排名计数
        _uid2rank = {}
        _tmpRank = 1
        _sort = [['jifen', -1], ['zhanli', -1], ['lattime', 1]]
        _maxNum = g.GC['championtrial']['base']['rankmaxnum']
        _rInfo = g.mdb.find('championtrial', sort=_sort,limit=_maxNum)
        for ele in _rInfo:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            _tmpData['jifen'] = ele['jifen']
            _tmpData['zhanli'] = ele['zhanli'] if 'zhanli' in ele else 0
            _rankList.append(_tmpData)
            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1

            if len(_rankList) > 0:
                g.mc.set("ChampionTrialRank", {"list": _rankList, 'uid2rank': _uid2rank}, 5)

    _myRank = -1  # 默认排名未上榜
    _arenaInfo = g.m.championfun.getUserJJC(uid)
    _jifen = 0
    if uid != None and _arenaInfo:
        _jifen = _arenaInfo.get('jifen', 1000)
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _markJifen = getRankJifen('championtrial', 100)
            if _jifen > _markJifen:
                _myRank = g.mdb.count('zypkjjc', {'jifen': {'$gte': _jifen}})
                if _myRank >= 1000: _myRank = -1
            else:
                _myRank = 100
                _arenaJifen = _markJifen

    _rData = {"ranklist": _rankList, "myrank": _myRank, 'val': _jifen}
    return _rData


# 获取玩家好友探宝积分排行
def getFriendJifenRank(iscache=0, uid=None):
    # 排名计数
    _rankList = []
    _uid2rank = {}
    _jifen = 0
    _cacheRank = g.mc.get("friend_jifen")
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _tmpRank = 1
        _rInfo = g.mdb.find('playattr', {'ctype': 'friend_jifen', 'k': _dKey}, sort=[['v', -1]],limit=50)
        for ele in _rInfo:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            _tmpData['jifen'] = ele['v']
            _rankList.append(_tmpData)
            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1
            if ele['uid'] == uid:
                _jifen = ele['v']

        if len(_rankList) > 0:
            g.mc.set("friend_jifen", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    _info = g.getAttrOne(uid,{'ctype': 'friend_jifen', 'k': _dKey})
    if uid != None and _info:
        _jifen = _info['v']
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _myRank = g.mdb.count('playattr', {'ctype': 'friend_jifen', 'k': _dKey, 'v': {'$gte': _jifen}})
            if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": {'rank':_myRank,'jifen':_jifen}}
    return _rData


# 好友伤害排行
def getFriendDpsRank(iscache=0, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("friend_dps")
    _myRank = -1
    _uid2rank = {}
    _myDps = 0
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        if uid and uid in _uid2rank:
            _myRank = _uid2rank[uid]['ranking']
            _myDps = _uid2rank[uid]['dps']
    else:
        _info = g.mdb.find1('friend', {'uid': uid, 'treasure.boss.dps': {'$exists': 1}})
        _dps = _info['treasure']['boss']['dps'] if _info else {}
        _allDPS = sorted(_dps.items(), key=lambda x: x[1], reverse=True)
        _uidList = map(lambda x: x[0], _allDPS)

        _ranking = 1
        for i in _uidList:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i)
            _temp['dps'] = _dps[i]
            _rankList.append(_temp)
            _uid2rank[i] = {'ranking':_ranking,'dps':_dps[i]}
            _ranking += 1

        if len(_rankList) > 0:
            g.mc.set("friend_dps", {"list": _rankList,'uid2rank':_uid2rank}, 20)

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'dps': _myDps}
    return _rData

# 获取点金达人排行
def getDJDRRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}
    htype = 14
    _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'rtime': {'$gte': g.C.NOW()}, 'data.mark': 'dianjin',
                                     'stime': {'$lte': g.C.NOW()}})
    # 活动未开启
    if not _hdInfo:
        return {'ranklist': [], 'myrank': -1,'myval':0}

    hdid = _hdInfo['hdid']
    _cacheRank = g.mc.get("djdr_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid,'val':{'$gt': 0}},sort=[['val',-1],['settime',1]],limit=50,fields=['_id','uid','val'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['val']
            _temp['zhanli'] = g.getGud(i['uid'])['maxzhanli']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['val']

        if len(_rankList) > 0:
            g.mc.set("djdr_rank", {"list": _rankList,'uid2rank':_uid2rank,'uid2val':_uid2val}, 20)

    _myinfo = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _myRank = -1
    _myVal = 0
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]
        elif _myinfo and _myinfo['val'] != 0:
            hdid = _myinfo['hdid']
            _myVal = _myinfo['val']
            _myRank = g.mdb.count('hddata', {'hdid': hdid, 'val': {'$gte': _myVal}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank,'myval':_myVal}
    return _rData

# 获取远征统帅排行
def getYZTSRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}
    htype = 14
    _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'rtime': {'$gte': g.C.NOW()}, 'data.mark': 'shizijun',
                                     'stime': {'$lte': g.C.NOW()}})
    # 活动未开启
    if not _hdInfo:
        return {'ranklist': [], 'myrank': -1,'myval':0}

    hdid = _hdInfo['hdid']
    _cacheRank = g.mc.get("yzts_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid,'val':{'$gt': 0}}, sort=[['val', -1], ['settime', 1]], limit=50,fields=['_id','uid','val'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        _myRank = -1
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['val']
            _temp['zhanli'] = g.getGud(i['uid'])['maxzhanli']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['val']

        if len(_rankList) > 0:
            g.mc.set("yzts_rank", {"list": _rankList, 'uid2rank': _uid2rank,'uid2val':_uid2val}, 20)

    _myinfo = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _myVal = 0
    _myRank = -1
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]
        elif _myinfo and _myinfo['val'] != 0:
            _myVal = _myinfo['val']
            hdid = _myinfo['hdid']
            _myRank = g.mdb.count('hddata', {'hdid': hdid, 'val': {'$gte': _myVal}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank,'myval':_myVal}
    return _rData

# 获取赏金奇兵排行
def getSJQBRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}
    _hdInfo = g.mdb.find1('hdinfo', {'htype': 14, 'rtime': {'$gte': g.C.NOW()}, 'data.mark': 'xstask',
                                     'stime': {'$lte': g.C.NOW()}})
    # 活动未开启
    if not _hdInfo:
        return {'ranklist': [], 'myrank': -1,'myval':0}

    hdid = _hdInfo['hdid']
    _cacheRank = g.mc.get("sjqb_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid,'val':{'$gt': 0}}, sort=[['val', -1],['settime', 1]], limit=50,fields=['_id','uid','val'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        _myRank = -1
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['val']
            _temp['zhanli'] = g.getGud(i['uid'])['maxzhanli']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['val']

        if len(_rankList) > 0:
            g.mc.set("sjqb_rank", {"list": _rankList, 'uid2rank': _uid2rank,'uid2val':_uid2val}, 20)

    _myinfo = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _myVal = 0
    _myRank = -1
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]
        elif _myinfo and _myinfo['val'] != 0:
            _myVal = _myinfo['val']
            hdid = _myinfo['hdid']
            _myRank = g.mdb.count('hddata', {'hdid': hdid, 'val': {'$gte': _myVal}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _myVal}
    return _rData

# 获取公会榜排名
def getGuildRank(iscache=1, uid=None):
    _rankList = []
    _name2rank = {}
    _cacheRank = g.mc.get("guild_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _name2rank = _cacheRank['name2rank']
    else:
        _rankList = g.mdb.find('gonghui', sort=[["lv", -1], ["exp", -1], ["usernum", -1]],fields=['lv','name','usernum','flag','ghid'],limit=50)
        for rank,ele in enumerate(_rankList):
            _name2rank[ele['name']] = rank + 1
            ele['boss'] = g.m.gonghuifun.getGuildName(str(ele['_id']))
            del ele['_id']
        if len(_rankList) > 0:
            g.mc.set("guild_rank", {"list": _rankList, 'name2rank': _name2rank}, 20)

    _myRank = -1
    _lv = 0
    _myGuild = g.m.gonghuifun.getGongHuiByUid(uid)
    if uid != None and _myGuild:
        _lv = _myGuild['lv']
        if _myGuild['name'] in _name2rank:
            _guildName = _myGuild['name']
            _myRank = _name2rank[_guildName]
        else:
            _myRank = g.mdb.count('gonghui', {'lv': {'$gte': _lv}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank,'lv': _lv}
    return _rData

# 获取战力排名
def getPowerRank(iscache=0, uid=None):
    _rankList = []
    _myRank = -1
    _uid2rank = {}
    _cacheRank = g.mc.get("power_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _List = g.mdb.find('userinfo', sort=[["maxzhanli", -1],['lv',-1]],fields=['_id','lv','name','maxzhanli','uid'],limit=50)

        for rank,ele in enumerate(_List):
            temp = {}
            temp['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            temp['maxzhanli'] = ele['maxzhanli']
            _rankList.append(temp)
            _uid2rank[ele['uid']]= rank + 1

        if len(_rankList) > 0:
            g.mc.set("power_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _gud = g.getGud(uid)
    _maxZhanli = _gud.get('maxzhanli', 0)
    if uid != None and _maxZhanli >= 0:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _myRank = g.mdb.count('userinfo', {'maxzhanli': {'$gte': _maxZhanli}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank}
    return _rData

# 开服狂欢
def getKfkhRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _cacheRank = g.mc.get("kfkh_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        if uid and uid in _uid2rank: _myRank = _uid2rank[uid]
    else:
        _List = g.mdb.find('stat', {'ctype':'kfkh_count'},sort=[["v", -1],['lasttime',1]],fields=['_id','uid','v'],limit=50)

        for rank,ele in enumerate(_List):
            temp = {}
            temp['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            temp['count'] = ele['v']
            _rankList.append(temp)
            _uid2rank[ele['uid']]= rank + 1

        if len(_rankList) > 0:
            g.mc.set("kfkh_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _val = 0
    _statInfo = g.mdb.find1('stat', {'uid': uid, 'ctype': 'kfkh_count'})
    if uid != None and _statInfo:
        _val = _statInfo['v']
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _val = _statInfo['v']
            _myRank = g.mdb.count('stat', {'v': {'$gte': _val},'ctype':'kfkh_count'})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank,'val':_val}
    return _rData

# 跨服争霸
def getKFZBRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _dkey = g.m.crosszbfun.dkey_Now()
    _cacheRank = g.mc.get("kfzb_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _sdata = g.m.crosscomfun.getServerData() or {}
        _List = g.crossDB.find('crosszb_jifen',{"dkey":_dkey, 'jifen': {'$gt': 0}},sort=[["jifen", -1],['zhanli', -1], ['lasttime',1]],fields=['_id'],limit=50)
        for rank,ele in enumerate(_List):
            temp = {}
            temp['headdata'] = ele['headdata']
            temp['headdata']['svrname'] = _sdata.get("data", {}).get(str(ele["sid"]), {}).get("servername", "unknown")
            temp['jifen'] = ele.get('jifen', 0)
            _rankList.append(temp)
            _uid2rank[ele['uid']]= rank + 1

        if len(_rankList) > 0:
            g.mc.set("kfzb_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _val = 0
    _statInfo = g.crossDB.find1('crosszb_jifen', {'uid': uid,"dkey":_dkey})
    if uid != None and _statInfo:
        _val = _statInfo.get('jifen', 0)
        if _val > 0:
            if uid in _uid2rank:
                _myRank = _uid2rank[uid]
            else:
                _myRank = g.crossDB.count("crosszb_jifen",
                                          {'$or': [{"jifen": {"$gt": _val}},
                                                   {'jifen': _val, 'zhanli': {'$gt': _statInfo.get('zhanli',0)}}],
                                           "dkey": _dkey}) + 1
                if _myRank >= 1000: _myRank = -1
    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'val': _val}
    return _rData

# 玩家图鉴榜
def getAvaterRank(iscache=0, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("user_avater")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        # 排名计数
        _uid2rank = {}
        _tmpRank = 1
        _rInfo = g.mdb.find('playattr',{'ctype':'user_headlist'},fields=['_id','uid','num'],sort=[['num',-1]],limit=50)
        for ele in _rInfo:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])
            _tmpData['val'] = ele['num']
            _rankList.append(_tmpData)
            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1

            if len(_rankList) > 0:
                g.mc.set("user_avater", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    _myData = g.getAttrOne(uid,{'ctype':'user_headlist'})
    _myVal = len(_myData['v']) if _myData else 0
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        elif _myVal > 0:
            _myRank = g.mdb.count('playattr', {'ctype':'user_headlist','num':{'$gte':_myVal}})
            if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank, 'val': _myVal}
    return _rData

# 探险先锋排行榜
def getTXXFRank(iscache=0, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}
    _hdInfo = g.mdb.find1('hdinfo', {'htype': 14, 'rtime': {'$gte': g.C.NOW()}, 'data.mark': 'tanxian',
                                     'stime': {'$lte': g.C.NOW()}})
    # 活动未开启
    if not _hdInfo:
        return {'ranklist': [], 'myrank': -1,'myval':0}

    hdid = _hdInfo['hdid']
    _cacheRank = g.mc.get("txxf_rank")
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid}, sort=[['val', -1],['settime', 1]], limit=50,fields=['_id','uid','val'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        _myRank = -1
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['val']
            _temp['zhanli'] = g.getGud(i['uid'])['maxzhanli']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['val']

        if len(_rankList) > 0:
            g.mc.set("txxf_rank", {"list": _rankList, 'uid2rank': _uid2rank,'uid2val':_uid2val}, 20)

    _myinfo = g.m.huodongfun.getMyHuodongData(uid, hdid)
    _myVal = 0
    _myRank = -1
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]
        elif _myinfo:
            _myVal = _myinfo['val']
            hdid = _myinfo['hdid']
            _myRank = g.mdb.count('hddata', {'hdid': hdid, 'val': {'$gte': _myVal}})
            if _myRank >= 1000: _myRank = -1

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _myVal}
    return _rData

# 获取守望者秘境排行
def getWatcherRank(iscache=0, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("watcher_mystery")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _uid2rank = {}
        _info = g.mdb.find('watcher', {'layer':{'$gt':1}},sort=[['toplayer', -1],['zhanli', -1]], limit=50)
        _tmpRank = 1
        for i in _info:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _tmpData['layer'] = i['toplayer'] - 1
            _tmpData['zhanli'] = i['zhanli']
            _rankList.append(_tmpData)
            _uid2rank[i['uid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set("watcher_mystery", {"list": _rankList, 'uid2rank': _uid2rank}, 5)

    _myRank = -1  # 默认排名未上榜
    _layer = 0
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _myRank = g.mdb.count('watcher', {'toplayer': {'$gte': _layer}})
            if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank}
    return _rData

# 成就点排行
def getSuccessRank(iscache=0, uid=None):
    _rankList = []
    _cacheRank = g.mc.get("success_rank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _uid2rank = {}
        _info = g.mdb.find('userinfo',sort=[['success', -1],['lv', -1]], limit=50, fields=['_id','uid','success'])
        _tmpRank = 1
        for i in _info:
            _tmpData = {}
            _tmpData['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _tmpData['val'] = i.get('success', 0)
            _rankList.append(_tmpData)
            _uid2rank[i['uid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set("success_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    _layer = 0
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
        else:
            _myRank = g.mdb.count('userinfo', {'success': {'$gte': g.getGud(uid).get('success', 0)}})
            if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank}
    return _rData

# 公会争锋王者排行
def getGuildCompetingRank(iscache=0, uid=None):
    _rankList = []
    _season = g.m.competingfun.getSeasonNum()
    if g.C.WEEK() == 0 and _season > 1:
        _season -= 1
    _cacheRank = g.crossMC.get("ghcompeting_king_rank")
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _uid2rank = {}
        _info = g.crossDB.find('competing_main',{'segment':4,'season':_season},sort=[['alljifen', -1],['zhanli', -1]], limit=50, fields=['_id','guildinfo','alljifen','zhanli','ghid'])
        _tmpRank = 1
        for i in _info:
            _tmpData = {}
            _tmpData['name'] = i['guildinfo']['name']
            _tmpData['flag'] = i['guildinfo']['flag']
            _tmpData['jifen'] = i['alljifen']
            _tmpData['zhanli'] = i['zhanli']
            _rankList.append(_tmpData)
            _uid2rank[i['ghid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.crossMC.set('ghcompeting_king_rank', {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    gud = g.getGud(uid)
    if gud['ghid'] in _uid2rank:
        _myRank = _uid2rank[gud['ghid']]
    else:
        _competingInfo = g.crossDB.find1('competing_main', {'season': _season, 'ghid': gud['ghid'], 'segment': 4},
                                         fields=['_id', 'alljifen'])
        # 在王者段位里面
        if _competingInfo:
            _myRank = g.crossDB.count('competing_main', {'alljifen': {'$gte': _competingInfo['alljifen']}}) + 1

    _rData = {"ranklist": _rankList, "myrank": _myRank}
    return _rData

# 公会争锋赛区排行
def getGuildCompetingDivisionRank(iscache=0, uid=None):
    _rankList = []
    _gh = g.mdb.find1('gonghuiuser',{'uid':uid},fields=['_id','ghid'])
    # 查找公会以及公会争锋数据
    if not _gh:
        return
    _ghid = _gh['ghid']
    _season = g.m.competingfun.getSeasonNum()
    if g.C.WEEK() == 0 and _season > 1:
        _season -= 1

    _competingInfo = g.crossDB.find1('competing_main',{'season':_season,'ghid':_ghid},fields=['_id','jifen','division','segment','group','season','pre_seg','pre_group','pre_div'])
    if not _competingInfo:
        return

    # 处于开战期
    if 6 <= g.C.HOUR() < 22:
        _segment = _competingInfo['segment']
        _key = g.C.STR('competing_s{1}_d{2}_g{3}', _competingInfo['segment'], _competingInfo['division'], _competingInfo['group'])
    else:
        _segment = _competingInfo.get('pre_seg', 1)
        _key = g.C.STR('competing_s{1}_d{2}_g{3}', _competingInfo['pre_seg'], _competingInfo['pre_div'],
                       _competingInfo['pre_group'])

    _cacheRank = g.crossMC.get(_key)
    # 默认读取缓存
    if iscache and _cacheRank != None:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _uid2rank = {}
        _w = {'season':_season,'division':_competingInfo['division'],'segment':_competingInfo['segment'],'group':_competingInfo['group']}
        _sort = [['jifen', -1],['zhanli', -1]]
        # 如果处于结算期
        if g.C.HOUR() >= 22 or g.C.HOUR() < 6:
            _w = {'season':_season,'pre_seg': _competingInfo.get('pre_seg', 1),'pre_group':_competingInfo['pre_group'],'pre_div':_competingInfo['pre_div']}
            _sort = [['pre_jifen', -1],['zhanli', -1]]

        _info = g.crossDB.find('competing_main',_w,sort=_sort, limit=50, fields=['_id','name','guildinfo','zhanli','ghid','jifen','pre_jifen'])
        _tmpRank = 1
        for i in _info:
            _tmpData = {}
            _tmpData['name'] = i['guildinfo']['name']
            _tmpData['flag'] = i['guildinfo']['flag']
            _tmpData['jifen'] = i['jifen'] if 6<=g.C.HOUR()<22 else i.get('pre_jifen', i['jifen'])
            _tmpData['zhanli'] = i['zhanli']
            _rankList.append(_tmpData)
            _uid2rank[i['ghid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.crossMC.set(_key, {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1  # 默认排名未上榜
    if _ghid in _uid2rank:
        _myRank = _uid2rank[_ghid]
    else:
        _myRank = g.mdb.count('competing_main', {'jifen': {'$gte': _competingInfo['jifen']},'division':_competingInfo['division'],'season':_season,'segment':_competingInfo['segment']})
        if _myRank >= 1000: _myRank = -1

    _rData = {"ranklist": _rankList, "myrank": _myRank,'division':_competingInfo['division'],'segment':_segment}
    return _rData

# 获取神殿魔王排行
def getTempleDevilRank(iscache=0, uid=None):
    _myRank = -1
    # 十点前限时上一轮的排行数据
    _zt = g.C.ZERO(g.C.NOW()) if g.C.HOUR() >= 10 else g.C.ZERO(g.C.NOW()-24*3600)
    # _cacheRank = g.mc.get("temple_devil_rank")
    # if _cacheRank and iscache:
    #     _rankList = _cacheRank["list"]
    #     _uid2rank = _cacheRank['uid2rank']
    # else:
    _rankList = []
    _uid2rank = {}
    _list = g.mdb.find('gameattr',{'ctype':'temple_devil_dps','lasttime':{'$gte':_zt}},fields=['_id','uid','v','recording'],sort=[['v', -1]],limit=50)
    _rank = 1
    for i in _list:
        _temp = {}
        _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
        _temp['headdata']['maxzhanli'] = g.getGud(i['uid'])['maxzhanli']
        _temp['rank'] = _rank
        _temp['val'] = i['v']
        _uid2rank[i['uid']] = _rank
        _rankList.append(_temp)
        _rank += 1


        # if len(_rankList) > 0:
        #     g.mc.set("temple_devil_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 1)

    _myDps = g.mdb.find1('gameattr',{"uid":uid,'ctype':'temple_devil_dps','lasttime':{'$gte':_zt}},fields=['_id','uid','v']) or {'v':0}
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _myDps['v'] > 0:
        _myRank = g.mdb.count('gameattr',{'ctype':'temple_devil_dps', 'v': {'$gt': _myDps['v']},'lasttime':{'$gte':_zt}}) + 1

    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_myDps['v']}

# 获取团队副本积分排行
def getCopyJifenRank(iscache=0, uid=None):
    _cacheRank = g.crossMC.get("team_copy")
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('crossplayattr',{'ctype':'qyjj_leadnum'},fields=['_id','uid','v','num'],sort=[['v', -1]],limit=100)
        _rank = 1
        for i in _list:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['rank'] = _rank
            _temp['val'] = i['v']
            _temp['num'] = i['num']
            _uid2rank[i['uid']] = _rank
            _rankList.append(_temp)
            _rank += 1


        if len(_rankList) > 0:
            g.crossMC.set("team_copy", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _myData = g.m.qyjjfun.CATTR().getAttrOne(uid, {'ctype':'qyjj_leadnum'},fields=['_id','v','num']) or {'num':{},'v':0}
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]

    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_myData['v']}

# 获取公会团队任务贡献排行
def getTeamTaskContriRank(iscache=0, uid=None):
    _cacheRank = g.mc.get("teamtask_contri")
    _ghid = g.getGud(uid)['ghid']
    # if _cacheRank and iscache:
    #     _rankList = _cacheRank["list"]
    #     _uid2rank = _cacheRank['uid2rank']
    # else:
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _rankList = []
    _uid2rank = {}
    _list = g.mdb.find('playattr',{'ctype':'teamtask_contri','k':_ghid},fields=['_id','uid','v','daynum','lasttime'],sort=[['daynum',-1],['v', -1]],limit=50)
    for i in _list:
        if i['v'] == 0:
            break
        i['daynum'] = int(i['daynum']) if _zt<=i['lasttime'] else 0
    _list.sort(key=lambda x:(x['daynum'], x['v']), reverse=True)
    _rank = 1
    for i in _list:
        i['v'] = int(i['v'])
        if i['v'] == 0:
            break
        _temp = {}
        _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
        _temp['rank'] = _rank
        _temp['val'] = i['v']
        _temp['daynum'] = int(i['daynum']) if _zt<=i['lasttime'] else 0
        _uid2rank[i['uid']] = _rank
        _rankList.append(_temp)
        _rank += 1


        # if len(_rankList) > 0:
        #     g.mc.set("teamtask_contri", {"list": _rankList, 'uid2rank': _uid2rank}, 5)

    _myRank = -1
    _myData = g.getAttrOne(uid, {'ctype':'teamtask_contri'},fields=['_id','v','daynum']) or {'daynum':0,'v':0}
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif int(_myData['daynum']) > 0:
        _myRank = g.mdb.count('playattr', {'ctype':'teamtask_contri', 'daynum':{'$gte':_myData['daynum']},'k':_ghid}) + 1

    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':int(_myData['v'])}

# 获取神殿地牢的排行
def getDungeonRank(iscache=0, uid=None):
    _cacheRank = g.mc.get("temple_dungeon")
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.mdb.find('dungeon',{},fields=['_id','uid','v','num'],sort=[['v', -1]],limit=100)
        _rank = 1
        for i in _list:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['rank'] = _rank
            _temp['val'] = i['v']
            _temp['num'] = i['num']
            _uid2rank[i['uid']] = _rank
            _rankList.append(_temp)
            _rank += 1


        if len(_rankList) > 0:
            g.crossMC.set("team_copy", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _myData = g.m.qyjjfun.CATTR().getAttrOne(uid, {'ctype':'qyjj_leadnum'},fields=['_id','v','num']) or {'num':{},'v':0}
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]

    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_myData['v']}

# 神殿地牢排行
def DungeonRank(uid, dtype):
    _cacheRank = g.mc.get("templedungeon_rank_{}".format(dtype))
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.mdb.find('dungeon', {'layer.{}'.format(dtype):{'$exists':1}},fields=['_id', 'layer', 'uid'], sort=[['layer.{}'.format(dtype), -1],['lasttime',1]], limit=50)
        _rank = 1
        for i in _list:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['rank'] = _rank
            _temp['val'] = i['layer'][dtype]
            _uid2rank[i['uid']] = _rank
            _rankList.append(_temp)
            _rank += 1


        if len(_rankList) > 0:
            g.mc.set("templedungeon_rank_{}".format(dtype), {"list": _rankList, 'uid2rank': _uid2rank}, 5)

    _myRank = -1
    _data = g.mdb.find1('dungeon', {'uid': uid}, fields=['_id', 'layer']) or {'layer': {}}
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _data['layer'].get(dtype, 0) > 0:
        _myRank = g.mdb.count('dungeon',{'layer.{}'.format(dtype): {'$gt': _data['layer'].get(dtype, 0)}})
    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_data['layer'].get(dtype, 0)}

# 试炼之塔
def getSlztRank(iscache=0, uid=None):
    # 排名计数
    _rankList = []
    _uid2rank = {}
    _ctype = "shilianzt_rank"
    _cacheRank = g.mc.get(_ctype)
    if iscache and _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _tmpRank = 1
        _rInfo = g.mdb.find('shilianzhita', {}, sort=[['layer', -1]], limit=50,fields=['_id',"uid", "layer"])
        for ele in _rInfo:
            _tmpData = {}

            _tmpData['headdata'] = g.m.userfun.getShowHead(ele['uid'])

            _tmpData['val'] = ele['layer']
            _tmpData['rank'] = _tmpRank
            _rankList.append(_tmpData)

            _uid2rank[ele['uid']] = _tmpRank
            _tmpRank += 1

        if len(_rankList) > 0:
            g.mc.set(_ctype, {"list": _rankList, 'uid2rank': _uid2rank}, 30)

    _myRank = -1  # 默认排名未上榜
    _myData = g.m.shilianztfun.getData(uid)
    _myVal = _myData.get('layer', 0)
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]

    _rData = {"ranklist": _rankList, "myrank": _myRank, 'myval': _myVal}
    return _rData


# 获取神殿地牢暴风之路排行
def getDungeon_1_Rank(iscache=0, uid=None):
    return DungeonRank(uid, '1')
# 获取神殿地牢炽焰之路排行
def getDungeon_2_Rank(iscache=0, uid=None):
    return DungeonRank(uid, '2')
# 获取神殿地牢冰封之路排行
def getDungeon_3_Rank(iscache=0, uid=None):
    return DungeonRank(uid, '3')

def getCrosszbJifenRank(iscache=0, uid=None):
    _cacheRank = g.mc.get("crosszbjifen_rank")
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.mdb.find('crosszbjifen',{'dkey':g.C.getWeekNumByTime(g.C.NOW()),'jifen':{'$gt':0}},fields=['_id','uid','jifen','zhanli'],sort=[['jifen', -1]],limit=50)
        _rank = 1
        for i in _list:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['rank'] = _rank
            _temp['val'] = i['jifen']
            _temp['zhanli'] = i['zhanli']
            _uid2rank[i['uid']] = _rank
            _rankList.append(_temp)
            _rank += 1


        if len(_rankList) > 0:
            g.mc.set("crosszbjifen_rank", {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _myData = g.mdb.find1('crosszbjifen',{'uid':uid,'dkey':g.C.getWeekNumByTime(g.C.NOW())},fields=['_id','jifen']) or {'jifen':0}
    _jifen = _myData['jifen']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _jifen > 0:
        _myRank = g.mdb.count('crosszbjifen',{'dkey':g.C.getWeekNumByTime(g.C.NOW()),'jifen':{'$gt':_jifen}}) + 1
        if _myRank > 1000:
            _myRank = -1


    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_jifen}

# 获取五军之战连击排行
def getWjzzNumRank(iscache=0, uid=None):
    _own = g.m.wjzzfun.getUserData(uid)
    _key = g.m.wjzzfun.getSeasonNum()
    _cacheRank = g.crossMC.get("wjzznum_rank_{}".format(_own['group']))
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('wjzz_data',{'key':_key,'num':{'$gt':0},'group':_own['group']},fields=['_id','headdata','num','sid','uid'],sort=[['num', -1],['lasttime',1]],limit=50)
        _rank = 1

        _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _list:
            _temp = {}
            _temp['headdata'] = i['headdata']
            _temp['rank'] = _rank
            _temp['val'] = i['num']
            _temp['name'] = _QUdata['data'].get(i['uid'].split('_')[0], {}).get('servername','unknown')
            _uid2rank[i['headdata']['uid']] = _rank
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set("wjzznum_rank_{}".format(_own['group']), {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _myData = g.crossDB.find1('wjzz_data',{'uid':uid,'key':_key,'group':_own['group']},fields=['_id','num'])
    _jifen = _myData['num']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _jifen > 0:
        _myRank = g.crossDB.count('wjzz_data',{'key':_key,'num':{'$gt':_jifen},'group':_own['group']}) + 1

    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_jifen}

# 获取五军之战今日排行
def getWjzzTodayRank(iscache=0, uid=None):
    _own = g.m.wjzzfun.getUserData(uid)
    _list = g.crossDB.find('wjzz_crystal',{'key':g.m.wjzzfun.getSeasonNum(),'group':_own['group']},fields=['_id','faction','team','live','num'],sort=[['live',-1],['num',1],['lasttime',-1]],limit=50)
    _rankList = []
    _rank = 1
    for i in _list:
        _temp = {}
        _temp['faction'] = i['faction']
        _temp['rank'] = _rank
        _temp['live'] = i['live']
        _temp['num'] = i['num']
        _temp['team'] = i['team']
        _rankList.append(_temp)
        _rank += 1

    return {'ranklist': _rankList}

# 获取五军之战赛季排行
def getWjzzSeasonRank(iscache=0, uid=None):
    _own = g.m.wjzzfun.getUserData(uid)
    _list = g.crossDB.find('wjzz_crystal',{'key':g.m.wjzzfun.getSeasonNum(),'group':_own['group']},fields=['_id','faction','team','integral','sumlive','sumdps'],sort=[['integral',-1],['sumlive',-1],['sumdps',1],['lasttime',-1]],limit=50)
    _rankList = []
    _rank = 1
    for i in _list:
        _temp = {}
        _temp['faction'] = i['faction']
        _temp['rank'] = _rank
        _temp['integral'] = i.get('integral', 0)
        _temp['sumlive'] = i.get('sumlive', 0)
        _temp['num'] = i['sumdps']
        _temp['team'] = i['team']
        _rankList.append(_temp)
        _rank += 1

    return {'ranklist': _rankList}

# 获取天梯赛季排行
def getLadderRank(iscache=0, uid=None):
    if g.C.WEEK() in (1,2,3):
        return {'ranklist': [], 'myrank': -1, 'myval':0}

    _division = g.m.ladderfun.getDivision(uid)
    _key = g.C.getWeekNumByTime(g.C.NOW())
    _cacheRank = g.crossMC.get("ladder_rank_{}".format(_division))
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('ladder',{'key':_key,'star':{'$gte':60},'division':_division},fields=['_id','headdata','star','maxzhanli',"uid"],sort=[['star', -1],['maxzhanli',-1]],limit=50)
        _rank = 1
        for i in _list:
            _temp = {}
            _temp['headdata'] = i['headdata']
            _temp['rank'] = _rank
            _temp['val'] = i['star']
            _temp['headdata'] = i['headdata']
            _temp['maxzhanli'] = i['maxzhanli']
            _uid2rank[i['uid']] = _rank
            # _temp['headdata'] = g.m.crosscomfun.getSNameBySid(i['sid'])
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set("ladder_rank_{}".format(_division), {"list": _rankList, 'uid2rank': _uid2rank}, 20)

    _myRank = -1
    _myval = 0
    _myData = g.crossDB.find1('ladder',{'uid':uid,'key':_key},fields=['_id', 'star', 'maxzhanli'])
    _myval = _myData['star'] if _myData else 0
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _myData and _myData['star'] >= 60:
        _myRank = g.crossDB.count('ladder',{'key':_key,
                                            "$or": [{'star':{'$gt':_myData['star']}}, {'star':{_myData['star']}, "maxzhanli":{"$gt":_myData["maxzhanli"]}}],'division':_division}) + 1
    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_myval}



# 获取五军之战连击排行
def getGpjjcRank(iscache=0, uid=None, limit=50):
    _season = g.m.gongpingjjcfun.getSeason()
    _cacheRank = g.crossMC.get("gongpingjjc_rank_{}".format(_season))
    if _cacheRank and iscache:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('gpjjc_rank',{'season':_season},fields=['_id','jifen','winnum','sid','uid',"fightnum"],sort=[['jifen', -1],['lasttime',1]],limit=50)
        _rank = 1

        _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _list:
            _temp = {}
            try:
                _temp['headdata'] = g.crossDB.find1("cross_friend", {"uid": i["uid"]}, fields={'_id': 0, 'head.defhero': 0})["head"]
            except:
                print i["uid"], "getGpjjcRank"

            _temp['rank'] = _rank
            _temp['val'] = i['jifen']
            _temp['name'] = _QUdata['data'].get(i['uid'].split('_')[0], {}).get('servername','unknown')
            _uid2rank[i["uid"]] = _rank
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set("gongpingjjc_rank_{}".format(_season), {"list": _rankList, 'uid2rank': _uid2rank}, 60)

    _myRank = -1
    _myData = g.crossDB.find1('gpjjc_rank',{'season':_season, "uid": uid},fields=['_id','jifen','winnum','sid','uid',"fightnum", "lasttime"])
    _jifen = _myData['jifen']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]
    elif _jifen > 0:
        _myRank = g.crossDB.count('gpjjc_rank',{'season': _season, '$or': [{'jifen': {'$gt': _jifen}}, {'jifen': _jifen, "lasttime": {"$lt": _myData["lasttime"]}}]}) + 1
    _rankList = _rankList[:limit]
    return {'ranklist': _rankList, 'myrank': _myRank, 'myval':_jifen}



if __name__ == "__main__":
    # uid = g.buid("ciniao")
    # gud = g.getGud(uid)
    a = g.m.userfun.getShowHead('0_61c3d94a02affb22275fe1d3')
    print a