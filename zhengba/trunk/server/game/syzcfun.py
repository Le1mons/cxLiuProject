# !/usr/bin/python
# coding:utf-8


'''
噬渊战场相关方法
'''
import g, random

def getWeek():
    _nt = g.C.NOW()
    return g.C.getWeekNumByTime(_nt)



# 初始数据
def initData(uid, heroinfo, rollbacklayer=0):

    data = g.mdb.find1("syzc", {"uid": uid},fields=["_id"]) or {}
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    # 获取当前层数
    _oldLayer = data.get("layer", 1)
    _layer = _oldLayer + rollbacklayer if _oldLayer + rollbacklayer > 0 else 1

    _generateEvent = generateEvent(uid, _layer)
    _setData = {}
    _setData["ctime"] = _nt
    _setData["lasttime"] = _nt
    _setData["herodata"] = heroinfo["herolist"]
    _setData["zhanli"] = heroinfo["zhanli"]
    # 开启的格子数
    _setData["opengzid"] = []
    # 已经完成的event
    _setData["finishgzid"] = []

    # 本层已经生成的事件
    _setData["eventdata"] = _generateEvent["eventdata"]
    # 对应事件所在个格子
    _setData["eventgzid"] = _generateEvent["eventgzid"]

    _setData["nowgzid"] = _generateEvent["nowgzid"]
    # 获取最大层数
    _setData["toplayer"] = data.get("toplayer", 0)
    # 下次刷新事件
    _setData["week"] = getWeek()
    _setData["layer"] = _layer if _layer > 0 else 1

    #  topleayer领奖数据
    _setData["toplayerrec"] = data.get("toplayerrec", [])
    # 每轮领奖数据
    _setData["layerrec"] = []
    # 本轮完成的层数
    _setData["layernum"] = 0
    # 是否去驱散迷雾
    _setData["miwu"] = 0
    # 队伍下标
    _setData["teamidx"] = 0
    # 噬渊石任务
    _setData["shiyuanshi"] = {"jiequ": {}, "finish": 0}
    # 瞭望塔任务
    _setData["liaowangta"] = 0
    # 运输任务
    _setData["yunshu"] = {"jiequ": "", "finish": 0}

    # 插入数据
    g.mdb.update("syzc", {"uid": uid}, _setData, upsert=True)

    return _setData


# 设置玩家的数据
def setData(uid, data):
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt

    g.mdb.update("syzc", {"uid": uid, "week": getWeek()}, _setData)


# 获取玩家的数据
def getData(uid, keys='_id', where=None):
    _res = {"layer":1}
    _w = {"uid": uid}
    _options = {}
    if keys != '':
        _options["fields"] = keys.split(",")

    if where != None:
        _w.update(where)

    _data = g.mdb.find1("syzc", _w, **_options)
    if _data:
        _data["maxlayernum"] = getMaxLayerNum(_data["ctime"])
        _res = _data

    return _res

# 获取当前能通关的最大关卡数
def getMaxLayerNum(ctime):
    _con = dict(g.GC["syzccom"])
    _layerlimit = _con["meiluncengshu"]
    _nt = g.C.NOW()
    _openDay = g.C.getDateDiff(g.C.ZERO(ctime), _nt) + 1
    _maxLayer = _openDay * 5
    _week = g.C.getWeek()
    # 如果是周六周日
    if _week in (0, 6,):
        _maxLayer = _layerlimit
    return min(_maxLayer, _layerlimit)


def generateEvent(uid, layer):
    _res = {}
    _res["eventdata"] = {}
    _res["eventgzid"] = {}
    _res["nowgzid"] = ""
    _con = dict(g.GC["syzccom"])

    _mapInfo = dict(g.GC["syzcmapinfo"])[str(layer)]
    _eventInfo = _con["eventinfo"]
    _mapConName = _mapInfo["map"]
    _randomGroup = _mapInfo["randomevent"]
    _mapCon = g.GC[_mapConName]

    _eventdata = {}
    _eventgzid = {}
    _chkGroupData = {}
    _mapCon = g.GC[_mapConName]
    _weituo = 0
    for _gzid, info in _mapCon.items():
        if not info["eventgroup"]:
            continue

        # 判断是否已经超过限定数量
        if _chkGroupData.get(str(info["eventgroup"]), 0) >= _randomGroup.get(str(info["eventgroup"]), 9999):
            continue
        _chkGroupData[str(info["eventgroup"])] = _chkGroupData.get(str(info["eventgroup"]), 0) + 1

        # 随机一个事件
        _randomEvent = g.C.getRandArrNum(_con["eventgroup"][str(info["eventgroup"])]["event"], 1)[0]
        _eid = str(_randomEvent["eid"])
        if _weituo and _eid in ("7", "8", "9", "10",):
            n = 0
            while n < 20:
                n += 1
                _randomEvent = g.C.getRandArrNum(_con["eventgroup"][str(info["eventgroup"])]["event"], 1)[0]
                _eid = str(_randomEvent["eid"])
                if _eid not in ("7", "8", "9", "10",):
                    break
        if _eid in ("7", "8", "9", "10",):
            _weituo = 1

        _eventgzid[_gzid] = _eid

        if _eid not in _eventdata:
            _eventdata[_eid] = {}
        _eventdata[_eid][_gzid] = {}
        # 如果是是出生点
        if _eid in ("1",):
            _res["nowgzid"] = _gzid
        # 如果是小怪
        elif _eid in ("2", "3", ):
            if _eid == "2":

                _npcId = g.C.getRandList(_mapInfo["npcid"])[0]
            else:
                _npcId = _mapInfo["bossid"]

            # boss战斗信息
            _fightData = g.m.fightfun.getNpcFightData(_npcId)
            _eventdata[_eid][_gzid] = _fightData
        # 如果是指挥官
        elif _eid in ("5", ):
            # 获取随机出来的idx
            _idx = g.C.RANDLIST(range(len(_con["questions"])))[0]
            _eventdata[_eid][_gzid] = _idx
        # 如果是商店
        elif _eid in ("15", ):
            _shopItem = []
            # 获取本次随机的商品
            _shopCon = g.m.shopfun.getShopItemCon()
            _nt = g.C.NOW()
            _zt = g.C.ZERO(_nt)
            for _idx, i in enumerate(_con["eventinfo"][_eid]["itemid"]):
                _itemCon = _shopCon[str(i)]
                _prize = g.C.RANDARR(_itemCon['items'], _itemCon['base'])
                # 加入商品唯一的标识
                _prize['idx'] = _idx
                _shopItem.append(_prize)
            _eventdata[_eid][_gzid] = _shopItem
        # 奖励事件
        elif _eid in ("19", "20", ):
            _dlz = _con["eventinfo"][_eid]["dlz"]
            _eventdata[_eid][_gzid] = g.m.diaoluofun.getGroupPrize(_dlz)

        # 情报传输点的数据
        elif _eid in ("26", ):
            _eventdata[_eid][_gzid] = {}

    # 需要设置情报传输点的数据
    if "26" in _eventdata:
        # 获取情传输点的数量
        _num = len(_eventdata["26"])
        _numList = list(xrange(1, _num + 1))
        # 打乱顺序
        g.C.SHUFFLE(_numList)
        # 图标顺序
        _graphlist = _con["eventinfo"]["26"]["graph"].keys()
        g.C.SHUFFLE(_graphlist)
        _idx = 0
        for gzid in _eventdata["26"]:
            _eventdata["26"][gzid] = {"graph": _graphlist[_idx], "order": _numList[_idx]}
            _idx += 1
        _idx = 0
        for gzid in _eventdata["24"]:
            if _idx >= _num:
                continue
            _eventdata["24"][gzid] = {"graph": _graphlist[_idx], "order": _numList[_idx]}
            _idx += 1

    # 需要设置情报传输点的数据
    if "27" in _eventdata:
        # 获取情传输点的数量
        _num = len(_eventdata["27"])

        # 图标顺序
        _graphlist = _con["eventinfo"]["27"]["graph"].keys()
        g.C.SHUFFLE(_graphlist)
        _idx = 0
        for gzid in _eventdata["27"]:
            _eventdata["27"][gzid] = {"graph": _graphlist[_idx]}
            _idx += 1
        _idx = 0
        for gzid in _eventdata["28"]:
            _eventdata["28"][gzid] = {"graph": _graphlist[_idx]}
            _idx += 1


    _res["eventgzid"] = _eventgzid
    _res["eventdata"] = _eventdata
    # 噬渊石任务
    _res["shiyuanshi"] = {"jiequ": {}, "finish": 0}
    # 瞭望塔任务
    _res["liaowangta"] = 0
    _res["finishgzid"] = []
    # 开启的格子数
    _res["opengzid"] = []
    # 运输任务
    _res["yunshu"] = {"jiequ": "", "finish": 0}
    # 是否去驱散迷雾
    _res["miwu"] = 0
    return _res


# 获取红点
def getHongDian(uid):
    _res = {"syzc": 0}

    _data = g.m.syzcfun.getData(uid)
    # 请先去重置
    _week = g.m.syzcfun.getWeek()
    _con = dict(g.GC["syzccom"])
    if "week" in _data and _data["week"] == _week:
        _layerPrize = _con["layerprize"]
        for idx, info in enumerate(_layerPrize):

            # 判断是否达到领奖条件
            if _data["layernum"] >_layerPrize[idx]["pval"] and idx not in _data["layerrec"]:
                _res["syzc"] = 1
                return _res

        _topLayerPrize = _con["toplayerprize"]
        for idx, info in enumerate(_topLayerPrize):

            # 判断是否达到领奖条件
            if _data["toplayer"] > _topLayerPrize[idx]["pval"] and idx not in _data["toplayerrec"]:
                _res["syzc"] = 1
                return _res


    return _res


# 获取备战英雄信息
def getHeroInfo(uid, tidlists):
    _res = {'chk':True, 'herolist':[], 'zhanli': 0}
    for tidlist in tidlists:
        # 默认站在后排
        _chkFightData = g.m.fightfun.chkFightData(uid, tidlist, pet=False)
        if _chkFightData['chkres'] < 1:
            _res['chk'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res
        _res['zhanli'] += _chkFightData['zhanli']
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0)
        # _userFightData[0].update({'enlargepro':1.5})
        _res['herolist'].append(_userFightData)

    return _res

# 获取阵亡英雄个数
def getDeadHeroNum(herodata):
    _maxNum = 0
    _dead = 0
    for i in herodata:
        if "hid" not in i:
            continue
        _maxNum += 1
        if 'hp' in i and i['hp'] <= 0:
            _dead += 1
    _res = False
    if _dead >= _maxNum:
        _res = True
    return _res

# 增加录像数据
def addVideo(uid, layer,fightres, winside, week, eid):
    _nt = g.C.NOW()
    _insertData = {
        "ctime": _nt,
        "week": week,
        "fightres": fightres,
        "uid": uid,
        "layer": layer,
        "ttltime": g.C.TTL(),
        "winside": winside,
        "headdata": fightres["headdata"][0],
        "rivalheaddata": fightres["headdata"][1],
        "eid": eid

    }
    g.mdb.insert("syzc_fightlog", _insertData)



if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    # getHongDian(uid)
    _nt = g.C.NOW()
    getMaxLayerNum(_nt)
    print getWeek(_nt)





