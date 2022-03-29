#!/usr/bin/python
# coding:utf-8


'''
跨服公共方法
'''

import g


# 跨服attr表
def CATTR():
    return g.BASEDB(g.crossDB, 'playattr', 'crossplayattr')


# 获得区服列表
def getServerData(iscache=1):
    _nt = g.C.NOW()
    _key = "CROSS_SERVERDATALIST"
    _cData = g.crossMC.get(_key)
    # 如果有缓存，且未过期，则直接返回缓存值
    if iscache and _cData != None and _nt < _cData['reftime']: return _cData
    # 刷新缓存数据
    _serverlist = g.crossDB.find("serverdata", {}, fields=["_id"], sort=[['opentime', 1]])
    _sidlist = []
    _serverdatalist = {}
    for _server in _serverlist:
        _sid = str(_server['serverid'])
        _sidlist.append(_sid)
        _serverdatalist[_sid] = _server

    if len(_sidlist) > 0:
        # 下次刷新时间
        _reftime = _nt + 1800
        _ncData = {"list": _sidlist, "data": _serverdatalist, "reftime": _reftime}
        # 写入缓存
        g.crossMC.set(_key, _ncData)
        g.m.gameconfigfun.setGameConfig({'ctype': 'SERVERDATA'}, _ncData)
    else:
        # 如果没数据取本地临时数据
        _ncData = g.m.gameconfigfun.getGameConfig({'ctype': 'SERVERDATA'})

    return _ncData


# 删除区服缓存
def delServerListCache():
    _cacheKey = 'CROSS_SERVERDATALIST'
    g.crossMC.delete(_cacheKey)


# 根据sid获取区服名称
def getSNameBySid(sid):
    _data = getServerData()
    if 'data' not in _data:
        return 'unknown'

    _data = _data['data']
    sid = str(sid)
    if sid in _data:
        return _data[sid]['servername']
    else:
        return "unknown"


# 设置crossconfig
def setGameConfig(w, data):
    _where = w
    _nt = g.C.NOW()
    _gameConfig = getGameConfig(_where, keys={"_id": 1})
    _data = data
    _data['lasttime'] = _nt
    if len(_gameConfig) == 0:
        _data.update(_where)
        _data['ctime'] = _nt

    _newData = {"$set": {}}
    _ispreix = "".join(_data.keys()).find("$")
    if _ispreix >= 0:
        for k, v in _data.items():
            if not str(k).startswith("$"):
                _newData["$set"].update({k: v})
            else:
                _newData.update({k: v})
    else:
        _newData = _data

    if "$set" in _newData and len(_newData["$set"]) == 0:
        del _newData["$set"]

    _res = g.crossDB.update('crossconfig', _where, _newData, upsert=True)
    return _res


# 获取crossconfig
def getGameConfig(where, keys='_id', *arg, **kwargs):
    if keys != '' and isinstance(keys, basestring) or isinstance(keys, unicode):
        kwargs['fields'] = keys.split(",")

    if isinstance(keys, dict):
        kwargs['fields'] = keys

    _w = where
    _res = g.crossDB.find("crossconfig", _w, *arg, **kwargs)
    return _res


# 格式化玩家的跨服数据
def fmtCrossUserData(uid, fightdata, stype=2):
    gud = g.getGud(uid)
    if gud == None:
        return
    _userData = {}
    _userData['uid'] = uid
    _userData['sid'] = int(gud['sid'])
    _userData['name'] = gud['name']
    _userData['lv'] = int(gud['lv'])
    _userData['head'] = g.m.userfun.getShowHead(uid)
    _userData["headdata"] = _userData['head']
    _userData["headdata"]['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid'])
    _userData['maxzhanli'] = int(gud['maxzhanli'])
    _userData['fightdata'] = fightdata
    _userData['lasttime'] = g.C.NOW()
    return _userData


def getCrosschatCache(uid):
    _cache = g.mc.get('crosscache_{}'.format(uid))
    if _cache:
        return _cache

    _res = []
    _defHero = g.m.zypkjjcfun.getDefendHero(uid)
    _sq = _defHero.pop('sqid', None)
    if 'pet' in _defHero:
        _res += g.m.petfun.gtPetFight(uid, 0, _defHero.pop('pet'))
    _pets = []
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': map(g.mdb.toObjectId, _defHero.values())}})
    for i in _heroList:
        for pos in _defHero:
            if str(i['_id']) == _defHero[pos]:
                del i['_id']
                i['pos'] = pos
                _res.append(i)
                break
    if _sq:
        _res.append({'sqid': _sq})

    g.mc.set('crosscache_{}'.format(uid), _res, 60 * 5)
    return _res


# 判断是否本服
def chkIsThisService(uid):
    _sids = g.getSvrList()
    _uidSid = uid.split('_')[0]
    return int(_uidSid) in _sids


# 获取年周标识（返回格式2019-12）
def getWeekKey():
    _nt = g.C.NOW()
    return g.C.getWeekNumByTime(_nt)


# 创建分组id（跨服服务器执行）
def timer_createOpenDayGroupID():
    _dkey = getWeekKey()
    _ctype = 'TIMER_SERVERGROUP_CREATEGROUP'
    _chkData = getGameConfig({'ctype': _ctype, 'k': _dkey})
    if len(_chkData) > 0:
        # 数据已上传
        return

    _con = g.GC["crossgroup"]["opendaygroup"]
    _nt = g.C.NOW()

    gruopType = {}
    # 获取所有区服数据
    # 排除测试数据

    _w = {"cross": g.getCrosssever(),'singleserver':'1'}
    _serverData = g.crossDB.find('serverdata', _w)
    for server in _serverData:
        _openDay = g.C.getDateDiff(server["opentime"], _nt)
        for idx, info in enumerate(_con):
            # 如果满足范围条件
            if info["cond"][0] <= _openDay <= info["cond"][1]:
                # 如果不存在分组先生成

                if str(idx) not in gruopType: gruopType[str(idx)] = []
                gruopType[str(idx)].append(server["serverid"])
                break
            # else:
            #     if str(0) not in gruopType: gruopType[str(0)] = []
            #     gruopType[str(0)].append(server["serverid"])
            #     break

    _gid = 0
    gruopData = {"1":[]}
    _typeData = {}
    # 生成不同区的分组
    for idx, serverList in gruopType.items():
        _groupCon = _con[int(idx)]
        _gid += 1
        _typeData[int(idx)] = [_gid]
        gruopData[str(_gid)] = []
        for sid in serverList:
            # 如果人数已满就加入就生成下一个组
            if len(gruopData[str(_gid)]) >= _groupCon["servernum"]:
                _gid += 1
                gruopData[str(_gid)] = []
                _typeData[int(idx)].append(_gid)
            # 加入对应分组
            gruopData[str(_gid)].append({'sid':sid,'idx':int(idx)})

        # 如果分组不满足最小条件，合并到上一分组
        if _groupCon["minservernum"] > len(gruopData[str(_gid)]):
            # 合并到上一分组
            if str(_gid - 1) in _typeData[int(idx)]:
                gruopData[str(_gid - 1)] += gruopData[str(_gid)]
                # 把本组的数据设置为空
                gruopData[str(_gid)] = []

        # 如果满足生成新的分组
        else:
            _gid += 1
            gruopData[str(_gid)] = []


    for gid, serverlist in gruopData.items():
        # 设置本周的分组
        for sid in serverlist:
            g.crossDB.update("servergroup", {"serverid":  sid['sid']}, {"dkey": _dkey, "gid": gid, "ctime": _nt, "idx":sid['idx']}, upsert=True)

    # 设置分组状态
    setGameConfig({'ctype': _ctype}, {'v': 1, 'k': _dkey})


# 获取当前区服跨服分组数据
def getServerGroupId(uid):
    # 设置本周的分组# 防止合区
    _ctype = "corss_servergroup"
    _dkey = getWeekKey()
    _mcKey = "SERVERGROUPID_{0}_{1}".format(_dkey, uid)
    _gid = g.mc.get(_mcKey)

    if not _gid:
        _gid = "0"
        _sid = g.getHostSid()
        _w = {"ctype": _ctype, "k": _dkey}
        _data = g.getAttrOne(uid, _w)
        if _data:
            _gid = _data["v"]
        else:
            _groupInfo = g.crossDB.find1("servergroup", {"serverid": str(_sid), "dkey": _dkey})
            if _groupInfo:
                _gid = _groupInfo["gid"]
                g.mc.set(_mcKey, _gid, 7200)
                g.setAttr(uid, {"ctype": _ctype}, {"v": _gid, "k": _dkey})
            else:
                _sidList = g.getHostSidKeys()
                _groupInfo = g.crossDB.find1("servergroup", {"serverid": {"$in":[str(sid) for sid in _sidList]}, "dkey": _dkey})
                if _groupInfo:
                    _gid = _groupInfo["gid"]
                    g.mc.set(_mcKey, _gid, 7200)
                    g.setAttr(uid, {"ctype": _ctype}, {"v": _gid, "k": _dkey})
    return _gid
# 获取外网玩家数据
def getCrossGud(uid):
    pass




if __name__ == '__main__':
    _dd = [1, 2, 3, 4, 5, 6]
    g.mc.flush_all()
    uid = "1_617a98556702fd9a8db24cc1"
    print getServerGroupId(uid)
    # uid = '0_5760ed8c6a5d091544ac8fd6'
    # _prizeCon = g.m.crosszbfun.getCon()['jifen']['dateprize']
    # print _prizeCon
    # print getServerData(0)
