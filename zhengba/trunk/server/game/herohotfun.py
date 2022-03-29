#!/usr/bin/python
#coding:utf-8

'''
英雄人气冲榜
'''
import g

htype = 69

# 获取现在活动在哪一天
def getHuoDongDay(stime=0):
    _nt = g.C.NOW()
    if not stime:
        _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},fields=['_id', "stime", "hdid"])
        if _hdinfo:
            stime = _hdinfo["stime"]
    _diffDay = g.C.getTimeDiff(_nt, stime, 0)
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _retVal = _diffDay + 1
    if _retVal > len(_openTime):
        _retVal = len(_openTime)
    return _retVal



# 初始化玩家数据方法
def initUserData(uid, hdid):
    _nt = g.C.NOW()
    _headData = g.m.userfun.getShowHead(uid)
    _initData = {
        "uid": uid,
        "hdid": hdid,
        "ctime": _nt,
        "num": 0,  # 总投票次数
        "lasttime": _nt,
        "pinfo": {}, # 本次比赛每个英雄得奖的权重
        "heronum":{}, # 每个阶段英雄的投票次数
        "haixuan":[],#海选投票的英雄
        "sid":g.getHostSid(),
        "selecthid":"",# 本轮投票的英雄
        "duihuan": {}, # 道具兑换次数
        "libao":{}, # 礼包购买情况
        "task":{}, #当前任务完成情况
        "taskrec":[], #当前任务领取情况
        "zhekou":{}, # 应援折扣
        "fuli":[],# 应援福利
        "name":_headData["name"], # 玩家姓名
        "severname": g.m.crosscomfun.getSNameBySid(g.getHostSid())
    }
    # 设置工会数据
    g.crossDB.insert("herohot_user", _initData)
    if "_id" in _initData:
        del _initData["_id"]
    return _initData







# 获取玩家数据
def getUserData(uid, hdid):
    _res = {}
    _data = g.crossDB.find1("herohot_user", {"uid": uid, "hdid": hdid}, fields=["_id"])
    if _data:
        _nt = g.C.NOW()
        _zt = g.C.getZeroTime(_nt)
        _lastZt = g.C.getZeroTime(_data["lasttime"])
        # 隔天刷新
        _setData = {}
        # 获取当前阶段，判断是否需要重新设置投票英雄
        _day = getHuoDongDay()
        _con = g.GC["herohot"]
        _openTime = _con["opentime"]
        _state = _openTime[str(_day)]["state"]
        if _lastZt != _zt:
            _setData["task"] = _data["task"] = {}
            _setData["taskrec"] = _data["taskrec"] = []
            _setData["libao"] = _data["libao"] = {}
        # 判断当前阶段是否已经选择过投票英雄
        if str(_state) not in _data["heronum"] and _state <= 5 and _data["selecthid"]:
            _setData["selecthid"] = _data["selecthid"] = ""
        # 判断是否需要重置
        if _setData:
            # 设置数据
            setUserData(uid, hdid,_setData)
        _res = _data
    else:
        _res = initUserData(uid, hdid)
    return _res



# 设置玩家数据
def setUserData(uid, hdid, data):
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    g.crossDB.update("herohot_user", {"uid": uid, "hdid": hdid}, _setData)


# 获取对应状态的数据
def getHeroHotInfo(hdid, state, plid):
    _nt = g.C.NOW()
    _res = {"plid": plid, "state": state, "hdid":hdid, "num":0, "lasttime":_nt}
    _where = {"hdid": hdid, "state": state, "plid":plid}
    # 获取当前票数排行
    _data = g.crossDB.find1("herohot", _where, fields=["_id"])
    if _data:
        _res = _data
    else:
        g.crossDB.insert("herohot",  _res)
    return _data

# 设置对应状态的数据
def setHeroHotInfo(hdid, state, plid, data):
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)


    _setData["$set"]["lasttime"] = _nt
    a = g.crossDB.update("herohot", {"state": state, "hdid": hdid, "plid": plid}, _setData)
    if not a['updatedExisting']:
        _init = {"plid": plid, "state": state, "hdid": hdid, "num": 0, "lasttime": _nt}
        g.crossDB.insert("herohot", _init)
        g.crossDB.update("herohot", {"state": state, "hdid": hdid, "plid": plid}, _setData)



# 获取对应状态的数据
def getHeroHotRankList(hdid, state, islimit=False):

    _nt = g.C.NOW()
    _con = g.GC["herohot"]
    _stateInfo = _con["stateinfo"]
    _limit = 9999
    if islimit:
        _limit = _stateInfo[str(state)]["limit"]
    # 获取当前票数排行
    _list = g.crossDB.find("herohot", {"hdid": hdid, "state": state}, fields=["_id"], sort=[["num", -1], ["lasttime", 1]], limit=_limit)
    if len(_list) < _limit:
        # 获取已经随机出来的英雄
        _plidList = [i["plid"] for i in _list]
        # 获取所有的英雄plid
        _allPlid = g.GC["pre_hero_pinglun"].keys()
        _lessPlid = list(set(_allPlid) - set(_plidList))
        _lessNum = _limit - len(_list)
        _randomList = g.C.RANDLIST(_lessPlid, _lessNum)
        for plid in _randomList:
            _list.append({"plid": plid, "state": state, "hdid": hdid, "num": 0, "lasttime": _nt})

    _rankList = []
    _oldNum = 0
    _rankNum = 0
    for i in _list:
        if _rankNum <= _stateInfo[str(state)]["limit"]:
            _num = i["num"]
            # 如果投票数量一致，就把前面所有排名的英雄数量加1
            if _num == _oldNum:
                for _rank in _rankList:
                    _rank["num"] += 1
            _oldNum = _num
        _rankList.append(i)
        _rankNum += 1
    return _rankList



# 晋升定时器 跨服
def timer_herohot_promoted():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.crossDB.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},fields=['_id', "stime", "hdid"])
    if not _hdinfoList:
        return
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # 获取活动当前是第几天
        _day = getHuoDongDay(_stime)
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if str(_day) not in _openTime:
            continue

        _state = _openTime[str(_day)]["state"]

        if str(_state) not in _stateInfo:
            continue

        if _stateInfo[str(_state)]["day"] != _day:
            continue

        # 判断是否已经执行过
        _ctype = 'TIMER_HAIXUAN_HEROHOT'
        _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid, "state": _state})
        if _chkData:
            continue
        # 获取当前票数排行
        _limit = _stateInfo[str(_state)]["limit"]
        _oldLimit = 9999
        if str(_state - 1) in _stateInfo:
            _oldLimit = _stateInfo[str(_state - 1)]["limit"]

        # 获取当前状态的排名情况
        _ranklist = getHeroHotRankList(_hdid, _state)
        _upList = _ranklist
        # 如果状态大于等于5就表示决赛了
        if _state < 5:
            # 处理数据
            _upList = []
            _rank2list = g.C.dcopy(_ranklist[:_limit])
            for rank in _rank2list:
                rank["state"] += 1
                rank["num"] = 0

                _upList.append(rank)

            # 插入已经竞技的数据
            g.crossDB.insert("herohot", _upList)

            for i in _upList:
                if "_id" in i:
                    del i["_id"]
        else:
            _selectNum = {}
            _nt = g.C.NOW()
            _zt = g.C.ZERO(_nt - 24 * 3600)
            for rank in _ranklist[:_limit]:
                _selectNum[rank["plid"]] = g.crossDB.count("herohot_user",{"hdid": _hdid, "selecthid": rank["plid"], "lasttime": {"$gte":_zt}})
                rank["selectnum"] = g.crossDB.count("herohot_user",{"hdid": _hdid, "selecthid": rank["plid"], "lasttime": {"$gte":_zt}})

            _ctype3 = "HEROHOT_selectNum"
            g.m.crosscomfun.setGameConfig({'ctype': _ctype3, 'k': _hdid},{"v": _selectNum})
        # 设置快照,提供给前端显示
        _ctype2 = "HEROHOT_PROMOTED"
        g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"v": {"win": _ranklist[:_limit], "lose": _ranklist[_limit:_oldLimit]}})
        # # 设置快照,提供给前端显示
        # _ctype3 = "HEROHOT_KUAIZHAO"
        # g.m.crosscomfun.setGameConfig({'ctype': _ctype3, 'k': _hdid}, {"v": _ranklist[:_limit]})

        # 设置已经竞技的数据
        g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v": 1, "state": _state})


# 快照 跨服
def timer_herohot_kuaizhao():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.crossDB.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},fields=['_id', "stime", "hdid"])
    if not _hdinfoList:
        return
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # 获取活动当前是第几天
        _day = getHuoDongDay(_stime)
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if str(_day) not in _openTime:
            continue

        # 如果是第一天
        if _day > 7:
            continue
        _state = _openTime[str(_day)]["state"]
        _kuaizhao = _openTime[str(_day)]["kuaizhao"]
        _nt = g.C.NOW()
        _zt = g.C.ZERO(_nt)
        _hour = g.C.HOUR()
        if not _kuaizhao:
            continue

        if _hour < 22:
            # 获取时间段的类型
            _type = _kuaizhao[0]

        else:
            _type = _kuaizhao[1]

        if _type == 1:
            if str(_state - 1) not in _stateInfo:
                _limit = 32
            else:
                _limit = _stateInfo[str(_state - 1)]["limit"]
        else:
            # 获取当前票数排行
            _limit = _stateInfo[str(_state)]["limit"]


        # 获取当前状态的排名情况
        _ranklist = getHeroHotRankList(_hdid, _state)

        # 设置快照,提供给前端显示
        _ctype2 = "HEROHOT_KUAIZHAO"
        g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"v": _ranklist[:_limit]})
        g.mc.delete(_ctype2)

# 发奖 跨服
def timer_herohot_sendPoolPrize():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.crossDB.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid"])
    if not _hdinfoList:
        return
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    _emailPrize = _con["poolprize"]
    _email = _con["poolemail"]

    _email2 = _con["pool2email"]

    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # 获取活动当前是第几天
        _day = getHuoDongDay(_stime)
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if _day != 8:
            continue

        # # 判断是否已经执行过
        _ctype = 'TIMER_HEROHOT_SENDPOOLPRIZE'
        _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
        if _chkData:
            continue

        _state = 5

        _ranklist = getHeroHotRankList(_hdid, _state)
        _lottery = {}
        for idx, data in enumerate(_ranklist):
            _rank = idx + 1
            _prize = []
            _prize2 = []
            _maxnum = 0
            _basenum = 0
            _hid = data["plid"]

            # 发奖
            for ele in _emailPrize:
                if ele[0][0] <= _rank <= ele[0][1]:
                    _prize += ele[1]
                    _basenum = ele[2]
                    _maxnum = ele[3]
                    _prize2 = ele[4]
                    break
            # 发奖
            if _prize:
                # 发送跨服工会邮件
                _title = _email["title"]
                _content = g.C.STR(_email['content'], str(_rank))
                _title2 = _email2["title"]
                _content2 = g.C.STR(_email2['content'], str(_rank))
                # 发送邮件
                _nt = g.C.NOW()
                _zt = g.C.ZERO(_nt - 48 * 3600)
                _userlist = g.crossDB.find("herohot_user", {"hdid":_hdid, "selecthid": _hid, "lasttime": {"$gte":_zt}}, fields=["uid", "sid", "pinfo", "name","severname"])
                _randomlist = []
                for user in _userlist:
                    if _hid not in user["pinfo"]:
                        continue
                    p = user["pinfo"][_hid]
                    # 参与奖发奖
                    g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _title2, _content2, prize=_prize2)

                    _randomlist.append({"p": p, "uid": user["uid"], "sid":user["sid"], "name": user.get("name", "神秘玩家"), "servername":user.get("severname", "暂无区服")})
                # 总人数
                _usernum = len(_randomlist)
                _prizelist = []
                if _usernum > 0:
                    # # 总人数除以每多少个人抽一个奖励的基数
                    # _prizenum, _lessnum = divmod(_usernum, _basenum)
                    # if _lessnum > 0:
                    #     _prizenum += 1
                    _prizenum = int(_usernum / _basenum) if int(_usernum / _basenum) > 0 else 1
                    # 不能超过最大的发奖个数
                    if _prizenum > _maxnum:
                        _prizenum = _maxnum
                    # 随机出发奖的uid
                    _prizelist = g.C.getRandArrNum(_randomlist, _prizenum)
                _lottery[_hid] = _prizelist
                for user in _prizelist:
                    g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _title, _content, prize=_prize)

        g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v": _lottery})


# 发奖 跨服
def timer_herohot_sendprize():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.crossDB.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid"])
    if not _hdinfoList:
        return
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    _emailPrize = _con["emailprize"]
    _email = _con["prizeemail"]
    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # 获取活动当前是第几天
        _day = getHuoDongDay(_stime)
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if _day != 8:
            continue

        # 判断是否已经执行过
        _ctype = 'TIMER_HEROHOT_SENDPRIZE'
        _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
        if _chkData:
            continue

        _state = 5
        # _ranklist = getHeroHotRankList(_hdid, _state)
        _ranklist = g.crossDB.find("herohot_user", {"hdid": _hdid, "num":{"$gt": 0}},sort=[["num",-1], ["tptime", 1], ["lasttime", 1]],fields=["uid", "sid", "pinfo", "name"])
        _lottery = {}
        for idx, data in enumerate(_ranklist):
            _rank = idx + 1
            _prize = []
            _uid = data["uid"]
            _maxnum = 0
            _basenum = 0

            # 发奖
            for ele in _emailPrize:
                if ele[0][0] <= _rank <= ele[0][1]:
                    _prize += ele[1]
                    break
            # 发奖
            if _prize:
                # 发送跨服工会邮件
                _title = _email["title"]
                _content = g.C.STR(_email['content'], str(_rank))

                g.m.emailfun.sendCrossEmail(_uid, data["sid"], _title, _content, prize=_prize)

        g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v": 1})


# 获取当前状态的快照
def getKuaiZhao(_hdid):
    _res = []
    # 设置快照,提供给前端显示
    _ctype2 = "HEROHOT_KUAIZHAO"
    _cacheRank = g.mc.get(_ctype2)
    if _cacheRank != None:
        _res = _cacheRank
    else:
        _configData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
        if _configData:
            _res = _configData[0]["v"]
            g.mc.set(_ctype2, _res, 300)

    return _res


# 获取当前决赛英雄选择情况
def getSelectNum(_hdid):
    _res = {}
    # 设置快照,提供给前端显示
    _ctype2 = "HEROHOT_selectNum"
    _cacheRank = g.mc.get(_ctype2)
    if _cacheRank != None:
        _res = _cacheRank
    else:
        _configData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
        if _configData:
            _res = _configData[0]["v"]
            g.mc.set(_ctype2, _res, 300)

    return _res


# 获取当前状态的竞技数据
def getPromoted(_hdid):
    _res = {}
    # 设置快照,提供给前端显示
    _ctype2 = "HEROHOT_PROMOTED"
    _cacheRank = g.mc.get(_ctype2)
    if _cacheRank != None:
        _res = _cacheRank
    else:
        _configData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
        if _configData:
            _res = _configData[0]["v"]
            g.mc.set(_ctype2, _res, 300)

    return _res

# 获取当前状态的竞技数据
def getLottery(_hdid):
    _res = {}
    # 设置快照,提供给前端显示
    _ctype2 = "TIMER_HEROHOT_SENDPOOLPRIZE"
    _cacheRank = g.mc.get(_ctype2)
    if _cacheRank != None:
        _res = _cacheRank
    else:
        _configData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
        if _configData:
            _res = _configData[0]["v"]
            g.mc.set(_ctype2, _res, 300)

    return _res



# 提示兑换 跨服
def timer_herohot_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.crossDB.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid", "etime"])
    if not _hdinfoList:
        return
    _con = g.GC["herohot"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    _email = _con["tishiemail"]
    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # # 获取活动当前是第几天
        # _day = getHuoDongDay(_stime)
        _day = g.C.getTimeDiff(_nt, _stime) + 1
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if _day != 8:
            continue

        # 发送跨服工会邮件
        _title = _email["title"]
        _content =_email['content']
        _fmtContent = _content.format(g.C.DATE(_hdinfo["etime"]))
        # 发送邮件
        _userlist = g.crossDB.find("herohot_user", {"hdid":_hdid}, fields=["uid", "sid"])

        for user in _userlist:
            g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _title, _fmtContent)


# 监听任务
def OnTask(uid, taskid, val=1):

    _openinfo = g.m.herohot_69.isOpen(uid)
    # 判断是否开启
    if not _openinfo["act"]:
        return


    _hdid = _openinfo["hdid"]
    _stime = _openinfo["stime"]
    _taskCon = g.GC["herohot"]["task"]
    # 获取当前礼包数据
    _userinfo = getUserData(uid, _hdid)
    _userinfo["task"][taskid] = _userinfo["task"].get(taskid, 0) + val
    # 设置购买数据
    setUserData(uid, _hdid, {"task": _userinfo["task"]})

    if _taskCon[taskid]["pval"] <= _userinfo["task"][taskid]:
        # 判断奖励
        g.m.mymq.sendAPI(uid, 'herohot_redpoint', "1")




# 监听购买礼包时间
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _libaoCon = g.GC["herohot"]["libao"]

    if act not in _libaoCon:
        return
    _openinfo = g.m.herohot_69.isOpen(uid)
    # 判断是否开启
    if not _openinfo["act"]:
        return
    _hdid = _openinfo["hdid"]
    _stime = _openinfo["stime"]


    # 获取当前礼包数据
    _userinfo = getUserData(uid, _hdid)

    # 判断是否超过购买次数
    if _userinfo["libao"].get(act, 0) >= _libaoCon[act]["buynum"]:
        return
    _prize = _libaoCon[act]["prize"]

    _userinfo["libao"][act] = _userinfo["libao"].get(act, 0) + 1
    # 设置购买数据
    setUserData(uid, _hdid, {"libao":_userinfo["libao"]})
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'herohot_libao', 'prize': _prize,  "proid": act, "hdid":_hdid})
    # 推送
    g.sendUidChangeInfo(uid, _sendData)



def getHongDian(uid):
    _res = {"herohot": 0}
    # 获取活动当前是第几天
    try:
        # 获取公平竞技场是否开启
        _openinfo = g.m.herohot_69.isOpen(uid)
        if not _openinfo["act"]:
            return _res

        _day = g.m.herohotfun.getHuoDongDay(_openinfo["stime"])
        _con = g.GC["herohot"]

        _openTime = _con["opentime"]
        # 获取本轮状态
        _state = 6
        if str(_day) in _openTime:
            _state = _openTime[str(_day)]["state"]

        # 判断是否是海选
        _nt = g.C.NOW()
        _zt = g.C.ZERO(_nt)
        _time = _nt - _zt
        # 获取玩家数据
        _myinfo = g.m.herohotfun.getUserData(uid, _openinfo["hdid"])
        # 海选没选人
        if _state == 1 and 0 <= _time <= 79200 and not _myinfo["haixuan"]:
            _res["herohot"] = 1
            return _res
        elif _state != 1 and _state <= 5 and 0 <= _time <= 79200:
            _data = g.getAttrOne(uid, {"ctype": "herohot_toupiaohd", "k": _openinfo["hdid"]})
            # 判断今天是否点进去过
            if not _data:
                _selecthid = _myinfo["selecthid"]
                _need = _con["toupiaoneed"]
                _chkRes = g.chkDelNeed(uid, _need)

                if _chkRes['res']:
                    _res["herohot"] = 1
                    return _res
        # 福利红点
        _num = _myinfo["num"]
        _fuli = _myinfo["fuli"]
        for idx, v in enumerate(_con["fuli"]):
            if idx not in _myinfo["fuli"] and v["val"] <= _num:
                _res["herohot"] = 1
                return _res

        # 任务红点
        _task = _myinfo["task"]
        for _taskid, v in _con["task"].items():
            if _myinfo["task"].get(_taskid, 0) >= v["pval"] and _taskid not in _myinfo["taskrec"]:
                _res["herohot"] = 1
                return _res
        # 如果状态是6且
        if _state == 6 and g.C.HOUR() >= 12:
            # 判断是否进去过奖池
            _data = g.getAttrOne(uid, {"ctype": "herohot_zhekehd", "k": _openinfo["hdid"]})
            if not _data:
                _res["herohot"] = 1
                return _res

        # 判断是否有红点
        if chkHd(uid, _myinfo,_openinfo["hdid"]):
            _res["herohot"] = 1
            return _res
    except:
        pass

    return _res




def chkHd(uid, _myinfo, hdid, isset=0):
    _res = 0
    _zhekeNum = 0
    _oldZhekeNum = 0
    _con = g.GC["herohot"]

    _data = g.getAttrOne(uid, {"ctype": "herohot_zhekehd", "k": hdid})
    if _data:
        _oldZhekeNum = _data["v"]
    for info in _con["zhekou"]:
        if info["val"] <= _myinfo["num"]:
            _zhekeNum += 1
    # 判断是否有红点
    if _zhekeNum > _oldZhekeNum:
        _res = 1

    if isset:
        g.setAttr(uid, {"ctype": "herohot_zhekehd"}, {"v": _zhekeNum, "k":hdid})
    return _res




g.event.on("chongzhi", OnChongzhiSuccess)

g.event.on("herohottask", OnTask)

if __name__ == '__main__':
    uid = g.buid('lsq0')
    timer_herohot_kuaizhao()
    timer_herohot_promoted()
    print divmod(1000, 60)