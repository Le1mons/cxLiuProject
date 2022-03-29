#coding:utf-8

import g


# 获取当前多少周
def getKey(time=None):
    if not time:
        time = g.C.NOW()
    _key = g.C.getWeekNumByTime(time)
    return _key



# 获取玩家数据
def getUserData(uid):
    _week = getKey()
    _data = g.crossDB.find1("wujinzhita", {"uid": uid, "week": _week}, fields={"_id":0, "ttltime":0, "ctime": 0})
    _nt = g.C.NOW()
    if not _data:
        _con = g.GC["wujintafang"]
        _oldData = g.crossDB.find1("wujinzhita", {"uid": uid}, fields=["_id", "maxlayer"],sort=[["ctime",-1]]) or {}
        starlayer = int(_oldData.get("maxlayer", 0) * _con["wipecond"] / 100)
        _init = {
            "week":_week,
            "layer":starlayer,
            "maxlayer": starlayer,
            "ctime":_nt,
            "lasttime":_nt,
            "starlayer": starlayer,
            "ttltime":g.C.getTTLTime(),
            "uid":uid,
            "headdata":g.m.userfun.getShowHead(uid),
            "sid": g.getHostSid()
        }
        g.crossDB.insert("wujinzhita", _init)
        if "_id" in _init:
            del _init["_id"]
        if starlayer != 0:
            _chkData = getInitChk(starlayer)
            g.m.wujinzhitafun.setChkData(uid, _chkData)

        _data = _init
    return _data


# 获取玩家初始关卡数据
def getInitChk(layer):
    _con = g.GC["wujintafang"]
    _enemy = _con["enemy"]
    _player = _con["player"]
    _all = 0
    _goldNum = _enemy["gold"]
    for i in xrange(1, layer + 1):
        _num = 11 + int(i / _enemy["num"])
        _all += _num
    gold = _all * _goldNum + _player["gold"]
    _res = {"mapdata": {}, "hp": _player["hp"], "gold": gold, "layer": layer}
    return _res


# 获取排名
# 获取排行榜
def getRanklist(uid):
    _week = getKey()
    _rankList = []
    _cacheRank = g.crossMC.get('wujinzhita_rank')
    # 默认读取缓存
    if _cacheRank:
        _rankList = _cacheRank['list']
        _rankNum = _cacheRank['count']
        _backList = _cacheRank["backlist"]
    else:

        _allData = g.crossDB.find("wujinzhita", {"week": _week, "maxlayer":{"$gt": 0}}, sort=[["maxlayer", -1], ["lasttime", 1]], fields=["_id"], limit=50)
        _uidList = [d["uid"] for d in _allData]
        _backList = []
        # # 获取平均值
        # _avg10Layer = sum([i.get("maxlayer", 0) for i in _allData[0:10]]) / 10
        # _avg5Layer = sum([i.get("maxlayer", 0) for i in _allData[0:5]]) / 5
        # # 获取玩家的跨服数据
        # _userData = g.crossDB.find('jjcdefhero', {'uid': {'$in': _uidList}}, fields=["_id", "headdata"])
        _resData = []
        for idx, d in enumerate(_allData):
            data = {}
            data["headdata"] = d.get("headdata", {})
            if not data["headdata"]:
                _userData = g.crossDB.find1('jjcdefhero', {'uid': d["uid"]}, fields=["_id", "headdata"])
                if _userData:
                    data["headdata"] = _userData["headdata"]
            data["val"] = d.get("maxlayer", 0)
            data["uid"] = d["uid"]
            # # 筛选作弊玩家
            # if (data["val"] >= _avg10Layer + 20 or data["val"] >= _avg5Layer + 10) and len(_allData) >= 50:
            #     _backList.append(d["uid"])
            #     continue

            _rankList.append(data)
            if len(_rankList) >= 50:
                break


        # 获取参与的人数
        _rankNum = g.crossDB.count("wujinzhita", {"week": _week, "maxlayer": {"$gt": 0}})

        if _rankList:
            g.crossMC.set('gupiao_rank', {'list': _rankList, "count": _rankNum, "backlist": _backList}, 600)
        # # 排序
        # _rankList = sorted(_resData, key=lambda x: x["layer"], reverse=True)

    _myRankData = {}
    _myRankData["myrank"] = -1
    _myData = g.crossDB.find1("wujinzhita", {"uid": uid, "week": _week}, fields=["_id"]) or {}
    _myRankData["myval"] = _myData.get("maxlayer", 0) if _myData else 0
    _myRankData["ranknum"] = _rankNum
    # 获取玩家处在的排行
    for idx, d in enumerate(_rankList):
        if d["uid"] == uid:
            _myRankData["myrank"] = idx + 1
            _myRankData["myval"] = d.get("val", 0)
            break

    #  如果在黑名单
    if uid in _backList:
        _myRankData["myval"] = 0
    # 如果没在排行榜里面也要现实百分比了
    if _myRankData["myrank"] == -1 and _myRankData["myval"] != 0 and uid not in _backList:
        _myRankData["myrank"] = g.crossDB.count("wujinzhita", {"week": _week,  '$or': [{'maxlayer': {'$gt': _myRankData["myval"]}},{'maxlayer': _myRankData["myval"], "lasttime": {"$lt": _myData.get("lasttime", 0)}}]}) + 1

    return _rankList, _myRankData


# 设置数据
def setUserData(uid, data):
    for i in data:
        if i.startswith('$'):
            data['$set'] = data.get('$set', {})
            break
    else:
        _temp = data
        data = {}
        data['$set'] = _temp

    data['$set']['lasttime'] = g.C.NOW()
    _week = getKey()
    g.crossDB.update("wujinzhita", {"uid": uid, "week":_week}, data)





# 本服定时器
def timer_sendRankPrize():
    # 获取是第几周
    _week = getKey()

    # 不在重复执行
    _ctype = "WUJINZHITA_SENDRANKPRIZE"
    _config = g.m.crosscomfun.getGameConfig({"ctype": _ctype, "k": _week})
    if _config:
        return

    _con = g.GC["wujintafang"]["rankprize"]

    _title = _con["title"]
    _content = _con["content"]
    # 奖励字典
    _rankPrize = _con["prize"]
    _limit = _con["limit"]
    # 获取参与的人数
    _num = g.crossDB.count("wujinzhita", {"week": _week, "maxlayer": {"$gt": 0}})

    # # 参数人数的百分之5能获奖
    # _limit = int(_num * _limit // 100)

    # 获取本区所以参与本次股神的玩家
    _rankList = g.crossDB.find("wujinzhita", {"week": _week, "maxlayer":{"$gt": 0}}, sort=[["maxlayer", -1], ["lasttime", 1]], fields=["_id"])

    _rank = 1
    # 获取平均值
    # _avg10Layer = sum([i.get("maxlayer", 0) for i in _rankList[0:10]]) / 10
    # _avg5Layer = sum([i.get("maxlayer", 0) for i in _rankList[0:5]]) / 5
    for idx, d in enumerate(_rankList):

        # # 筛选作弊玩家
        # if (d.get("maxlayer", 0) >= _avg10Layer + 20 or d.get("maxlayer", 0) >= _avg5Layer + 10) and len(_rankList) >= 50:
        #     continue

        _uid = d["uid"]

        # 发过就不发奖了
        # if d.get("finish", 0):
        #     continue
        # 根据公式计算当前所在的区域
        _area = float(_rank) / _num
        _prize, _val = get2Prize(_rankPrize, _area * 100, _rank)

        # 判断是否有奖励
        if not _prize:
            continue

        _fmtContent = g.C.STR(_content, _val)
        # 发送邮件


        sid = d.get("sid", 0)
        if "sid" not in d:
            _userinfo = g.crossDB.find1("jjcdefhero", {"uid": _uid}, fields=["_id"]) or {}
            if not _userinfo:
                continue
            sid = _userinfo.get("sid", 0)


        g.m.emailfun.sendCrossEmail(_uid, sid, _title, _fmtContent, prize=_prize)

        g.crossDB.update("wujinzhita", {"week": _week, "uid": _uid}, {"finish": 1, 'ttltime': g.C.TTL()})
        _rank += 1
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': 1, 'k': _week})

# 获取前端存在我这里的数据
def getChkData(uid):
    _res = {}
    _ctype = "wujinzhita_chkdata"
    _data = g.getAttrOne(uid, {"ctype":_ctype})
    if _data:
        _res = _data["v"]
    return _res

# 设置前端检查数据
def setChkData(uid, data):
    _ctype = "wujinzhita_chkdata"
    _data = g.setAttr(uid, {"ctype": _ctype}, {"v":data})



# 计算玩家的奖励
def get2Prize(_rankPrize, val, rank):
    _prize = []
    _val = 0
    for ele in _rankPrize:
        if ele["percentum"] == 0:
            _val2 = rank
        else:
            _val2 = val

        if ele["val"] >= _val2:
            _prize = ele["p"]


            if ele["percentum"] == 0:
                _val = "第{0}名".format(_val2)
            else:
                _val = "前{0}%".format(ele["val"])
            break
    return _prize, _val


if __name__=='__main__':
    uid = g.buid("zzz1")
    #print uid
    #setLuxurySignStatus(uid,1,1)
    #print getAcSignInfo(uid)
    #print getPrizeJh(uid)
    #print type(getLuxurySignInfo(uid,[0,1])["0"]["prize"])
    #print setLuxurySignStatus(uid,0,2)
    #print g.C.DATE(fmtStr='%d')
    _con = g.GC["wujintafang"]["rankprize"]

    _title = _con["title"]
    _content = _con["content"]
    # 奖励字典
    _num = 1447
    _rank = 75
    _rankPrize = _con["prize"]
    _area = float(_rank) / _num
    _prize, _val = get2Prize(_rankPrize, _area * 100, _rank)
    print _val
    # g.event.emit("chongzhi",uid,'1',5,'111',{'config':'a'})