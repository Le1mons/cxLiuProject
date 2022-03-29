#!/usr/bin/python
# coding:utf-8

'''
中秋节2
'''
import g


htype=78
# 获取配置
def getCon():
    res = g.GC['midautumn2']
    return res


# 获取数据
def getData(uid, hdid, keys=None, hdinfo=None):


    # 默认读取的key
    dfeilds = []
    if keys:
        dfeilds += keys.split(',')

    if not hdinfo:
        hdinfo = g.m.huodongfun.getHDinfoByHtype(78, "etime")

    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            'task': {'data':{"1":1},'rec':[]},     # 任务数据
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao':{},                        # 礼包购买次数
            "subsidy":{},                      # 津贴使用情况
            "lasttime": _nt,                   # 设置时间
            "val":0,                           # 小游戏步数
            "gamenum": 0,                      # 小游戏次数
            "lottery": {}                      # 奖池数据
        }
    # 任务跨天重置
    if _myData.get('date') != _dkey:
        # # 补发奖励邮件
        _prize = []
        for taskid, info in _con['task'].items():
            if taskid not in _myData["task"]["rec"] and _myData["task"]["data"].get(taskid, 0) >= info["pval"]:
                _prize += info["prize"]

        # 如果有奖励就发送邮件
        if _prize:
            _title = _con["todayemail"]["title"]
            _content = _con["todayemail"]["content"]
            g.m.emailfun.sendEmails(uid, 1, _title, _content, prize=_prize)

        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':[]}
        _set['date'] = _myData['date'] = _dkey
        _set["gamenum"] = _myData["gamenum"] = 0
        _set["val"] = _myData["val"] = 0

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    _res = {}
    if dfeilds:
        for key in dfeilds:
            _res[key] = _myData.get(key, {})
    else:
        _res = _myData

    return _res



# 更新数据 带上日期
def setData(uid, hdid, data):
    g.m.huodongfun.setHDData(uid, hdid, data)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")

    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res["stime"] = _hd["stime"]
    return _res



# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'midautumn2_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        return

    _con = getCon()
    if act not in _con["libao"]:
        return

    _data = getData(uid, _hd['hdid'])
    if _data["libao"].get(act, 0) >= _con["libao"][act]['buynum']:
        g.success[orderid] = False
        return

    # 最大使用的津贴数量
    _maxSubsidyNum = _con["libao"][act]["subsidynum"]
    _itemid = _con["subsidyitem"]
    _itemdata = g.mdb.find1("itemlist", {"itemid": _itemid, "uid": uid}) or {}
    _useNum = _itemdata.get("num", 0)
    # 如果有对应道具
    if _useNum > _maxSubsidyNum:
        _useNum = _maxSubsidyNum
    _setData = {}
    _need = []
    # 扣除津贴
    if _useNum:
        _itemid = _con["subsidyitem"]
        _need.append({"a": "item", "t": _itemid, "n": _useNum})
        _data["subsidy"][act] = _data["subsidy"].get(act, 0) + _useNum
        _setData["subsidy"] = _data["subsidy"]
        # # 扣除奖励
        _send = g.delNeed(uid, _need, 0, {'act': 'midautumn2_libao', 'id': act})
        g.sendUidChangeInfo(uid, _send)


    _data["libao"][act] = _data["libao"].get(act, 0) + 1
    _setData["libao"] = _data["libao"]

    setData(uid, _hd['hdid'], _setData)
    _send = g.getPrizeRes(uid, _con["libao"][act]['prize'], {'act': 'midautumn2_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"midautumn2": 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])


    _nt = g.C.NOW()
    if _nt < _hd['rtime']:
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["midautumn2"] = 1
                return _res


    return _res


# 获取对应奖池目前投票数量
def getLotteryNum(hdid, fmt=1):
    _res = {}
    _ctype = "midautumn2_lotterynum"
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': hdid})
    if _conData:
        if fmt:
            for id, dict in _conData[0]["v"].items():
                _sumNum = sum([i["num"] for i in dict.values()])
                _res[id] = _sumNum
        else:
            _res = _conData[0]["v"]
    return _res

# 获取小游戏的rank
def getRankList(hdid, _myinfo=None, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}

    _cacheRank = g.mc.get("midautumn2_ranklist")
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid, 'val': {'$gt': 0}}, sort=[['val', 1], ['settime', 1]], limit=5,
                           fields=['_id', 'uid', 'val'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['val']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['val']

        if len(_rankList) > 0:
            g.mc.set("midautumn2_ranklist", {"list": _rankList, 'uid2rank': _uid2rank, 'uid2val': _uid2val}, 20)

    _myRank = -1
    _myVal = _myinfo["val"]
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _myVal}
    return _rData

# 提示兑换 跨服
def timer_midautumn2_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "rtime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid", "etime"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return
    _stime = _hdinfo["stime"]
    _day = g.C.getTimeDiff(_nt, _stime) + 1
    _con = getCon()

    # 如果不是第一天就直接返回
    # 防止上了多个活动
    if _day == 8:
        _email = _con["tishiemail"]
    elif _day == 7:
        _email = _con["tishi2email"]
    else:
        return

    _stime = _hdinfo["stime"]
    _hdid = _hdinfo["hdid"]

    # 发送跨服工会邮件
    _title = _email["title"]
    _content =_email['content']
    _fmtcontent = _content.format(g.C.DATE(_hdinfo["etime"]))

    # 发送邮件
    _userlist = g.mdb.find("hddata", {"hdid": _hdid})

    for user in _userlist:
        g.m.emailfun.sendEmails(user["uid"], 1,  _title, _fmtcontent)


# 定时器发奖
def timer_lottery_sendPirze():
    _nt = g.C.NOW()
    _hdinfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                              fields=['_id', "stime", "hdid", "rtime"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return

    if _hdinfo["rtime"] > _nt:
        return

    # 判断今天是否发奖
    _hdid = _hdinfo["hdid"]
    _ctype2 = "TIMER_MIDAUTUMN2_SENDPRIZE"
    # 设置今天已经生成数据的表示
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, "k": _hdid})
    if _chkData:
        return

    _con = getCon()
    _email = _con["email"]
    _pool = {}
    # 获取奖池投票数据
    _lotteryInfo = getLotteryNum(_hdinfo["hdid"], fmt=0)
    for id, dict in _lotteryInfo.items():
        _pool[id] = []
        _sumNum = sum([i["num"] for i in dict.values()])
        _lotteryCon = _con["lotteryprize"][id]
        # 判断是否达到开启条件,发送邮件给玩家发送兑换券
        if _sumNum < _lotteryCon["needval"]:
            _returnPrize = _con["returprize"]
            for _uid, data in dict.items():
                _prize = g.mergePrize(_returnPrize * data["num"])
                g.m.emailfun.sendCrossEmail(_uid, data["sid"], _email["title"], _email["content1"], prize=_prize)
            continue

        _prizeNum = _lotteryCon["baseprizenum"]
        _lessNum = _sumNum - _lotteryCon["needval"]
        _extPrizeNum = _lessNum / _lotteryCon["addlimit"]
        _prizeNum += _extPrizeNum
        _lotteryList = []
        for _uid, data in dict.items():
            for i in xrange(data["num"]):
                _lotteryList.append({"uid": _uid, "sid":data["sid"]})
        # 打乱分组
        g.C.SHUFFLE(_lotteryList)
        # 获取分组
        _prizeList = []
        _groupNum = _sumNum // _prizeNum
        if _groupNum <= 0:
            _groupNum = 1
        for i in xrange(_prizeNum):
           _randomList = _lotteryList[i * _groupNum: (i + 1) * _groupNum]
           _prizeUsers = g.C.RANDLIST(_randomList, num=len(_lotteryCon["prize"]))
           for idx, user in enumerate(_prizeUsers):
               _head = g.crossDB.find1('cross_friend', {'uid': user["uid"]}, fields=['_id', 'head.name', 'head.svrname']) or {
                   'head': {}}
               _pool[id].append(
                   {'uid': user["uid"], 'name': _head['head'].get('name', ''), 'svrname': _head['head'].get('svrname', ''),
                    'prize': _lotteryCon["prize"][idx], "idx": idx})
               g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _email["title"], _email["content"], prize=_lotteryCon["prize"][idx])

    # 设置重置活动的时间
    g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {'v': _pool})


# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('midautumn2', onChkTask)

if __name__ == '__main__':
    # uid = g.buid("lsq0")
    # g.debugConn.uid = uid
    # print   divmod(15, 8)

    print timer_lottery_sendPirze()

