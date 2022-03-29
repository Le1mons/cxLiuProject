# !/usr/bin/python
# coding:utf-8


'''
王者招募相关方法
'''
import g
htype = 63


# 获取任务数据
def getTaskInfo(uid,_hdinfo):
    _res = {}
    _taskCon = _hdinfo["data"]["openinfo"]["task"]["tasklist"]
    _ctype = "wangzhezhaomu_task"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    # 每日登陆奖励初始就给他加上
    _FinishInfo = {}
    # 判断是否有每日登陆类型的任务
    for taskid, v in _taskCon.items():
        if v["stype"] == "101":
            _FinishInfo.update({taskid: 1})
    _taskInfo = _FinishInfo
    _recList = []
    _jifen = 0
    _boxreclist = []
    _alljifen = 0
    _allJfRecList = []
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _data = g.getAttrOne(uid, _w)
    if _data:
        _taskInfo = _data["v"]
        _recList = _data["reclist"]
        _jifen = _data["jifen"]
        _boxreclist = _data["boxreclist"]
        _alljifen = _data["alljifen"]
        _allJfRecList = _data["alljfreclist"]
        # 如果过期了
        if _data["lasttime"] < _zt:
            _setData = {}
            _taskInfo = _setData["v"] = _FinishInfo
            _recList = _setData["reclist"] = []
            _jifen = _setData["jifen"] = 0
            _boxreclist = _setData["boxreclist"] = []
            # 更新数据
            setTaskInfo(uid, _hdinfo, _setData)
    else:
        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype},
                  {"v": _taskInfo, "k": _hdinfo["hdid"], "reclist": _recList, "jifen": _jifen, "boxreclist": _boxreclist,
                   "alljifen":_alljifen, "alljfreclist": _allJfRecList})


    _res["taskinfo"] = {}
    for taskid in _taskCon:
        _res["taskinfo"][taskid] = _taskInfo.get(taskid, 0)

    # 任务领取情况
    _res["reclist"] = _recList
    _res["jifen"] = _jifen
    _res["boxreclist"] = _boxreclist
    _res["alljifen"] = _alljifen
    _res["alljfreclist"] = _allJfRecList
    return _res

# 设置任务数据
def setTaskInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_task"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)


# 处理任务监听
def OnTaskEvent(uid, stype, val=1):
    _hdinfo = getHuoDongInfo()
    if not _hdinfo:
        return
    if "task" not in _hdinfo["data"]["openinfo"]:
        return

    _data = getTaskInfo(uid,_hdinfo)
    _taskInfo = _data["taskinfo"]
    _taskCon = _hdinfo["data"]["openinfo"]["task"]["tasklist"]
    for taskid in _taskCon:
        if _taskCon[taskid]["stype"] != stype:
            continue
        # 如果任务进度已经满了，就返回
        if _taskInfo.get("taskid", 0) >= _taskCon[taskid]["pval"]:
            return
        _taskInfo[taskid] = _taskInfo.get(taskid, 0) + val
    # 设置任务
    setTaskInfo(uid, _hdinfo, {"v": _taskInfo})



# 获取招募数据
def getZhouKaInfo(uid, _hdinfo):
    _res = {}
    _con = _hdinfo["data"]["openinfo"]["zhouka"]["arr"]
    _ctype = "wangzhezhaomu_zhouka"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    # 每日登陆奖励初始就给他加上
    _recList = []
    # 当前可领奖励
    _getList = []
    # 购买时间
    _buy = 0
    _data = g.getAttrOne(uid, _w)
    if _data:
        _recList = _data["v"]
        _buy = _data["buy"]
    else:
        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype},{"v": [], "k": _hdinfo["hdid"], "buy": 0})
    _nt = g.C.NOW()
    _diffDay = g.C.getDateDiff(_hdinfo["stime"], _nt) + 1
    # 生成的可领奖天数不能超过奖励天数
    if _diffDay > len(_con):
        _diffDay = len(_con)
    # 如果购买了
    if _buy:
        # 循环生成可领取的索引
        for i in xrange(_diffDay):
            if i not in _recList:
                _getList.append(i)

    # 任务领取情况
    _res["reclist"] = _recList
    _res["getlist"] = _getList
    _res["idx"] = _diffDay - 1
    _res["buy"] = _buy
    return _res

# 设置任务数据
def setZhouKaInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_zhouka"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)

# 周卡监听
def OnZhouKaEvent(uid,act,money,orderid,payCon):
    _hdinfo = getHuoDongInfo()
    if not _hdinfo:
        return
    _con = g.GC["wangzhezhaomu"]["zhouka"]
    _proid = _con["proid"]
    # 判断是不是这个活动的
    if _proid != act:
        return
    _data = getZhouKaInfo(uid, _hdinfo)
    # 如果已经购买过
    if _data["buy"]:
        return
    _nt = g.C.NOW()
    _setData = {}
    _setData["buy"] = 1
    setZhouKaInfo(uid, _hdinfo, _setData)
    # 发奖
    _prize = _con["buyprize"]
    _send = g.getPrizeRes(uid, _prize, {'act': 'wangzhezhaomu_payzhouka', 'prize': _prize})
    g.sendUidChangeInfo(uid, _send)

# 获取礼包数据
def getLiBaoInfo(uid, _hdinfo):
    _res = {}
    _con = _hdinfo["data"]["openinfo"]["libao"]
    _ctype = "wangzhezhaomu_libao"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    # 每日登陆奖励初始就给他加上
    _buyInfo = {}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _buyInfo = _data["v"]
    else:
        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype}, {"v": {}, "k": _hdinfo["hdid"]})
    # 任务领取情况
    _res["buyinfo"] = _buyInfo
    return _res

# 设置任务数据
def setLiBaoInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_libao"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)

# 礼包监听
def OnLiBaoEvent(uid,act,money,orderid,payCon):
    _hdinfo = getHuoDongInfo()
    if not _hdinfo:
        return
    _con = _hdinfo["data"]["openinfo"]["libao"]
    _idx = -1
    for i, v in enumerate(_con):
        if act == v["pid"]:
            _idx = i
            break
    # 判断是不是这个活动的
    if _idx == -1:
        return
    _data = getLiBaoInfo(uid, _hdinfo)
    # 判断是否还有购买次数
    if _data["buyinfo"].get(str(_idx), 0) >= _con[_idx]["val"]:
        return

    _data["buyinfo"][str(_idx)] = _data["buyinfo"].get(str(_idx), 0) + 1
    _setData = {}
    _setData["v"] = _data["buyinfo"]
    setLiBaoInfo(uid, _hdinfo, _setData)
    # 发奖
    _prize = _con[_idx]["p"]
    _send = g.getPrizeRes(uid, _prize, {'act':'wangzhezhaomu_paylibao','prize':_prize, "idx": _idx})
    g.sendUidChangeInfo(uid, _send)

# 获取招募数据
def getZhaoMuInfo(uid, _hdinfo):
    _res = {}
    _con = _hdinfo["data"]["openinfo"]["zhaomu"]
    _ctype = "wangzhezhaomu_zhaomu"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}

    _num = 0
    _recList = []
    _rec = []
    _choose = 0
    _recHero = {}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _recList = _data["reclist"]
        _rec = _data.get('jifenreclist', [])
        _num = _data["v"]
        _choose = _data.get("choose", 0)
        _recHero = _data.get("rechero", {})
    else:
        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype}, {"v": _num, "k": _hdinfo["hdid"], "reclist": _recList, "choose": _choose, "rechero": _recHero,'jifenreclist':[]})


    # 任务领取情况
    _res["num"] = _num
    _res["reclist"] = _recList
    _res["jifenreclist"] = _rec
    _res["choose"] = _choose
    _res["rechero"] = _recHero
    _res["hid"] = _con["mainhero"][_choose]["prize"][0]["t"]
    _boxPrize = []

    _boxprizenum = g.GC["wangzhezhaomu"]["zhaomu"]["boxPrizeNum"]

    for idx, p in enumerate(_con["boxprize"]):
        _prizeInfo = {"val": p["val"]}
        _num = _boxprizenum[idx]
        hid = _recHero.get(str(idx), "") if _recHero.get(str(idx), "") else _res["hid"]
        _prizeInfo["prize"] = [{"a": "item", "t": hid, "n": _num}]
        _boxPrize.append(_prizeInfo)
    _res["boxprize"] = _boxPrize
    return _res

# 设置任务数据
def setZhaoMuInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_zhaomu"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)


# 获取挑战boss的数据
def getBossInfo(uid, _hdinfo):
    _res = {}
    _con = _hdinfo["data"]["openinfo"]["boss"]
    _ctype = "wangzhezhaomu_boss"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}

    _num = 0
    _recList = []
    _buyInfo = {}
    _boosData = {}
    _jifen = 0
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    # 获取活动数据
    _data = g.getAttrOne(uid, _w)
    if _data:
        _recList = _data["reclist"]
        _buyInfo = _data["buyinfo"]
        _num = _data["v"]
        _bossData = _data["bossdata"]
        _jifen = _data["jifen"]
        # 如果过期了
        if _data["lasttime"] < _zt:
            _setData = {}
            _num = _setData["v"] = 0
            g.setAttr(uid, _w, _setData)
    else:
        _bossData = list(g.C.dcopy(g.GC["wangzhezhaomu"]["boss"]["bossdata"]))
        _headList = g.GC["pre_hero_pinglun"][_hdinfo["data"]["plid"]]
        _hid = sorted(_headList.items(), key=lambda x: x[1])[0][0]
        _heroCon = g.m.herofun.getHeroCon(_hid)
        _bossname = _heroCon["name"]
        _bossData[0]["heroico"] = _hid
        _bossData[0]["hid"] = _hid
        _bossData[0]["name"] = _heroCon["name"]
        _bossData[0]["model"] = _heroCon["model"]
        _bossData[0]['job'] = _heroCon['job']
        _bossData[0]["skill"] = g.m.herofun.getOpenBDSkillByHeroData(_bossData[0])
        _bossData[0]["xpskill"] = _heroCon["xpskill"]
        _bossData[0]["normalskill"] = _heroCon["normalskill"]
        _heroCon =g.m.herofun.getHeroCon(_hid)
        # 成长id
        _growid = str(_heroCon['growid'])
        # 基础属性值
        _lv = _bossData[0]['lv']
        # _dengjielv = herodata['dengjielv']
        _growCon = g.GC['herogrow'][_growid]
        if _bossData[0]['star'] > 6:
            # 升级配置
            _djBuffCon = g.GC.herostarup[_hid][str(_bossData[0]['star'])]
        else:
            _djBuffCon = g.GC.herocom['herojinjieup'][str(_bossData[0]['star'])]
        # 基础属性
        _bossData[0]["atk"] = int((_growCon['atk'] + (_lv - 1) * _growCon['atk_grow']) * _djBuffCon['atkpro'])
        _bossData[0]["def"] = int((_growCon['def'] + (_lv - 1) * _growCon['def_grow']) * _djBuffCon['defpro'])
        _bossData[0]["speed"] =int((_growCon['speed'] + (_lv - 1) * _growCon['speed_grow']) * _djBuffCon['speedpro'])


        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype},
                  {"v": _num, "k": _hdinfo["hdid"], "reclist": _recList, "buyinfo": _buyInfo, "jifen":_jifen, "bossdata": _bossData})

    # 任务领取情况
    _res["num"] = _num
    _res["reclist"] = _recList
    _res["buyinfo"] = _buyInfo
    _res["jifen"] = _jifen
    _res["bossdata"] = _bossData
    # _npcList, _allZhanli = g.m.npcfun.getNpcById(_con["npcid"])
    # _res["npcdata"] = {"npcid": _con["npcid"], "npczhanli": _allZhanli}

    return _res

# 设置任务数据
def setBossInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_boss"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)


# 获取挑战boss的数据
def getPeiYangInfo(uid, _hdinfo):
    _res = {}
    _con = _hdinfo["data"]["openinfo"]["peiyang"]
    _ctype = "wangzhezhaomu_peiyang"
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}

    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    # 获取活动数据
    _reclist = []
    _taskInfo = {}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _reclist = _data.get("v", [])
        _taskInfo = _data.get("taskinfo", {})
        # # 如果过期了
        # if _data["lasttime"] < _zt:
        #     _setData = {}
        #     _reclist = _setData["v"] = []
        #     g.setAttr(uid, _w, _setData)
    else:
        # 先设置数据
        g.setAttr(uid, {"ctype": _ctype},
                  {"v": _reclist, "k": _hdinfo["hdid"], "taskinfo": _taskInfo})

    # _plid = _hdinfo["data"]["plid"]
    # _hidlist = g.GC["pre_hero_pinglun"][_plid].keys()
    # _maxStarHero = g.mdb.find1("hero", {"hid": {"$in": _hidlist}, "uid": uid}, sort=[["star", -1]], fields=["star"])
    # _maxStar = 0
    # if _maxStarHero:
    #     _maxStar = _maxStarHero["star"]

    # 任务领取情况
    _res["reclist"] = _reclist
    _res["val"] = _taskInfo

    return _res

# 设置任务数据
def setPeiYangInfo(uid, _hdinfo, _setData):
    _ctype = "wangzhezhaomu_peiyang"
    _hdid = _hdinfo["hdid"]
    _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
    g.setAttr(uid, _w, _setData)

def OnPeiYangEvent(uid, hid, val=None):
    _hdinfo = getHuoDongInfo()
    if not _hdinfo:
        return
    # 判断培养是否存在
    if "peiyang" not in _hdinfo["data"]["openinfo"]:
        return

    _con = _hdinfo["data"]["openinfo"]["peiyang"]
    _heroCon = g.GC['hero'][hid]
    val = val or _heroCon['star']
    _plId = _heroCon['pinglunid']
    if _plId not in map(lambda x:x['id'], _con['arr']):
        return

    _setData = {}
    for i, v in enumerate(_con["arr"]):
        if val >= v["val"]:
            _setData['taskinfo.{}'.format(i)] = 1

    # 判断是不是这个活动的
    if not _setData:
        return
    getPeiYangInfo(uid, _hdinfo)
    # _data["val"][str(_idx)] = 1
    # _setData["taskinfo"] = _data["val"]
    setPeiYangInfo(uid, _hdinfo, _setData)




# 判断活动是否开启
def isopon(uid):
    _res = {"etime": -1, "act": 0}
    _nt = g.C.NOW()
    _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'etime': {'$gte': _nt}, 'stime': {'$lte': _nt}}, fields=['_id', 'etime','rtime',"hdid"], sort=[["etime", -1]])
    if _hdInfo:
        _res["etime"] = _hdInfo["etime"]
        _res["rtime"] = _hdInfo["rtime"]
        _res["hdid"] = _hdInfo["hdid"]
        _res["act"] = 1
    return _res




# 获取活动数据
def getHuoDongInfo():
    _nt = g.C.NOW()
    _mkey = "wangzhezhaomu"
    _res = g.mc.get(_mkey)
    _nt = g.C.NOW()
    if _res and _res["etime"] > _nt:
        return _res
    else:
        _res = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=["_id"])
        # 加上配置里面的数值
        if _res:
            _con = g.GC["wangzhezhaomu"]
            for key, ele in _res["data"]["openinfo"].items():
                if key == "boss":
                    ele["dpsprize"] = _con[key]["dpsprize"]
                elif key == "zhouka":
                    _res["data"]["openinfo"][key] = dict(_con[key])
                # elif key == "libao":
                #     _res["data"]["openinfo"][key] = list(_con[key])
                elif key == "zhaomu":
                    _temp = dict(_con[key])
                    _temp.update(ele)
                    _res["data"]["openinfo"][key] = _temp
            g.mc.set(_mkey, _res, 600)
    return _res
# 判断是否开启
def isOpen(uid):
    _res = {"etime": -1, "act": 0}
    _hdInfo = getHuoDongInfo()
    if _hdInfo:
        _res["etime"] = _hdInfo["etime"]
        _res["rtime"] = _hdInfo["rtime"]
        _res["hdid"] = _hdInfo["hdid"]
        _res["act"] = 1
    return _res

# 红点
def getHongDian(uid):
    _res = {"wangzhezhaomu": []}
    if not isOpen(uid)["act"]:
        return _res
    _hdinfo = getHuoDongInfo()
    _openInfo = _hdinfo["data"]["openinfo"]

    _hdFun = {
        # 获取玩家任务数据
        "task": getTaskHD,
        "zhouka": getZhouKaHD,
        "zhaomu": getZhaoMuHD,
        "boss": getBossHD,
        "libao": getLiBaoHD,
        "peiyang": getPeiYangHD,
    }

    for type in _openInfo:
        if _hdFun[type](uid, _hdinfo):
            _res["wangzhezhaomu"].append(type)

    return _res

# 获取BossHuodong
def getBossHD(uid, _hdinfo):
    _res = False
    _info = getBossInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["boss"]
    # 判断是否还有挑战次数
    if _info["num"] < _con["val"]:
        return True
    # 判断是否可以领奖
    for idx, v in enumerate(_con["jifenprize"]):
        if _info["jifen"] >= v["val"] and idx not in _info["reclist"]:
            return True
    return _res

# 获取TaskHuodong
def getTaskHD(uid, _hdinfo):
    _res = False
    _info = getTaskInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["task"]

    # 判断是否可以领奖
    for idx, v in enumerate(_con["boxprize"]):
        if _info["jifen"] >= v["val"] and idx not in _info["boxreclist"]:
            return True
    # 判断是否可以领奖
    for idx, v in enumerate(_con["jifenprize"]):
        if _info["alljifen"] >= v["val"] and idx not in _info["alljfreclist"]:
            return True

    # 判断是否可以领奖
    for taskid, v in _con["tasklist"].items():
        if _info["taskinfo"][taskid] >= v["pval"] and taskid not in _info["reclist"]:
            return True
    return _res

# 获取周卡红点
def getZhouKaHD(uid, _hdinfo):
    _res = True
    _info = getZhouKaInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["zhouka"]

    # 如果没有可领取得奖励
    if not _info["buy"]:
        return False
    # 如果没有可领取得奖励
    if not _info["getlist"]:
        return False
    return _res


# 获取招募红点
def getZhaoMuHD(uid, _hdinfo):
    _res = False
    _info = getZhaoMuInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["zhaomu"]
    # 判断是否可以领奖
    for idx, v in enumerate(_con["boxprize"]):
        if _info["num"] * _con["addjifen"] >= v["val"] and idx not in _info["reclist"]:
            return True

    # 判断是否可以领奖
    for idx, v in enumerate(_con.get('jifenprize', [])):
        if _info["num"] * _con["addjifen"] >= v["val"] and idx not in _info["jifenreclist"]:
            return True
    return _res

# 获取培养红点
def getPeiYangHD(uid, _hdinfo):
    _res = False
    _info = getPeiYangInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["peiyang"]
    # 判断是否可以领奖
    for idx, v in enumerate(_con["arr"]):
        if _info["val"].get(str(idx), 0) and idx not in _info["reclist"]:
            return True
    return _res

def getLiBaoHD(uid, _hdinfo):
    return False

# 本服定时器发奖
def timer_sendPrize():
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "etime": {"$lte": _nt}}, fields=["_id"], sort=[["etime", -1]])
    if _hdinfo:
        _con = g.GC["wangzhezhaomu"]
        for key, ele in _hdinfo["data"]["openinfo"].items():
            if key == "boss":
                ele["dpsprize"] = _con[key]["dpsprize"]
            elif key == "zhouka":
                _hdinfo["data"]["openinfo"][key] = dict(_con[key])
            # elif key == "libao":
            #     _hdinfo["data"]["openinfo"][key] = list(_con[key])
            elif key == "zhaomu":
                ele.update(dict(_con[key]))
    if not _hdinfo:
        return
    if _hdinfo.get("finish", 0):
        return
    _userData = {}
    _openInfo = _hdinfo["data"]["openinfo"]
    for type, info in _openInfo.items():
        if type not in ["peiyang", "task", "zhaomu", "boss"]:
            continue
        _ctype = g.C.STR("wangzhezhaomu_{1}", type)
        _data = g.mdb.find("playattr", {"ctype": _ctype, "k": _hdinfo["hdid"]})
        _con = _hdinfo["data"]["openinfo"][type]
        for d in _data:
            _setData = {}
            if d["uid"] not in _userData: _userData[d["uid"]] = []
            # 如果是培养未领奖
            if type == "peiyang":
                _plid = _hdinfo["data"]["plid"]
                _hidlist = g.GC["pre_hero_pinglun"][_plid].keys()
                _maxStarHero = g.mdb.find1("hero", {"hid": {"$in": _hidlist}, "uid": d["uid"]}, sort=[["star", -1]],
                                           fields=["star"])
                _maxStar = 0
                if _maxStarHero:
                    _maxStar = _maxStarHero["star"]
                # 判断是否有奖没领
                for idx, v in enumerate(_con["arr"]):
                    if _maxStar >= v["val"] and idx not in d["v"]:
                        _userData[d["uid"]] += v["p"]
                        d["v"].append(idx)
                _setData["v"] = d["v"]
            # task未领奖
            elif type == "task":
                # 判断是否可以领奖
                for idx, v in enumerate(_con["jifenprize"]):
                    if d["alljifen"] >= v["val"] and idx not in d["alljfreclist"]:
                        _userData[d["uid"]] += v["prize"]
                        d["alljfreclist"].append(idx)
                _setData["alljfreclist"] = d["alljfreclist"]

            # task未领奖
            elif type == "zhaomu":
                # 判断是否可以领奖
                for idx, v in enumerate(_con["boxprize"]):
                    if d["v"] * _con["addjifen"] >= v["val"] and idx not in d["reclist"]:
                        _userData[d["uid"]] += v["prize"]
                        d["reclist"].append(idx)
                _setData["reclist"] = d["reclist"]
            # task未领奖
            elif type == "boss":
                # 判断是否可以领奖
                for idx, v in enumerate(_con["jifenprize"]):
                    if d["jifen"] >= v["val"] and idx not in d["reclist"]:
                        _userData[d["uid"]] += v["prize"]
                        d["reclist"].append(idx)
                _setData["reclist"] = d["reclist"]
            # 判断设置已经领奖
            if _setData:
                _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
                g.setAttr(d["uid"], _w, _setData)
    _title = _hdinfo["data"]["email"]["title"]
    _content = _hdinfo["data"]["email"]["content"]
    _con = g.GC['item']
    # 发奖
    for uid, prize in _userData.items():
        _prize = g.mergePrize(prize)
        # 发送奖励
        _prize = [i for i in _prize if i['a']!='item' or (i['a']=='item' and _con[i['t']]['usetype']!='5')]
        if _prize:
            g.m.emailfun.sendEmail(uid, 1, _title, _content, _prize)
    g.mdb.update("hdinfo", {"hdid":_hdinfo["hdid"]}, {"finish": 1})

# 本服定时器发奖
def timer_todaySendPrize():
    _nt = g.C.NOW()
    _hdinfo = getHuoDongInfo()

    if not _hdinfo:
        return
    if _hdinfo.get("finish", 0):
        return
    _userData = {}
    _openInfo = _hdinfo["data"]["openinfo"]
    _itemCon = g.GC["item"]
    for type, info in _openInfo.items():
        if type not in ["task", "zhouka"]:
            continue
        _ctype = g.C.STR("wangzhezhaomu_{1}", type)
        _data = g.mdb.find("playattr", {"ctype": _ctype, "k": _hdinfo["hdid"]})
        _con = info
        for d in _data:
            _setData = {}
            if d["uid"] not in _userData: _userData[d["uid"]] = []
            # task未领奖
            if type == "zhouka":
                # 如果没有可领取得奖励
                if not d["buy"]:
                    continue
                _nt = g.C.NOW()
                _diffDay = g.C.getDateDiff(_hdinfo["stime"], _nt) + 1
                # 生成的可领奖天数不能超过奖励天数
                if _diffDay > len(_con["arr"]):
                    _diffDay = len(_con["arr"])
                # 循环生成可领取的索引
                _getList = []
                for i in xrange(_diffDay):
                    if i not in d["v"]:
                        _getList.append(i)
                for i in _getList:
                    _userData[d["uid"]] += _con["arr"][i]
                    d["v"].append(i)
                _setData["v"] = d["v"]
            elif type == "task":
                # 判断是否可以领奖
                for taskid, v in _con["tasklist"].items():
                    if d["v"].get(taskid, 0) >= v["pval"] and taskid not in d["reclist"]:
                        _userData[d["uid"]] += v["prize"]
                        d["reclist"].append(taskid)
                        # 加上积分数据
                        d["jifen"] += v["addjifen"]
                        d["alljifen"] += v["addjifen"]
                # 判断是否可以领奖
                for idx, v in enumerate(_con["boxprize"]):
                    if d["jifen"] >= v["val"] and idx not in d["boxreclist"]:
                        _userData[d["uid"]] += v["prize"]
                        d["boxreclist"].append(idx)

                _setData["reclist"] = d["reclist"]
                _setData["boxreclist"] = d["boxreclist"]
                _setData["jifen"] = d["jifen"]
                _setData["alljifen"] = d["alljifen"]


            # 判断设置已经领奖
            if _setData:
                _w = {"ctype": _ctype, "k": _hdinfo["hdid"]}
                g.setAttr(d["uid"], _w, _setData)
    _title = _hdinfo["data"]["closeemail"]["title"]
    _content = _hdinfo["data"]["closeemail"]["content"]
    # 发奖
    for uid, prize in _userData.items():
        _prize = g.mergePrize(prize)
        _prize = [p for p in _prize if p["a"] != "item" or _itemCon[p["t"]]["usetype"] != "5"]

        # 发送奖励
        if _prize:
            g.m.emailfun.sendEmail(uid, 1, _title, _content, _prize)
    # g.mdb.update("hdinfo", {"hdid":_hdinfo["hdid"]}, {"finish": 1})



#任务监听
g.event.on("wzzmtask", OnTaskEvent)
# 周卡监听
g.event.on("chongzhi", OnZhouKaEvent)
# 礼包监听
g.event.on("chongzhi", OnLiBaoEvent)
# 升星监听
g.event.on("hero_tongu", OnPeiYangEvent)

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    a = timer_sendPrize()
    print a





