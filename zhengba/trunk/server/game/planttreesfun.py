#!/usr/bin/python
# coding:utf-8

'''
植树节
'''
import g


htype=71
# 获取配置
def getCon():
    res = g.GC['planttrees']
    return res


# 获取数据
def getData(uid, hdid):
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
            "val":0,                              # 获得的总能量数量
            "fruitrec":{},                        # 记录的获取过的果实数量
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            "fuli":{},                           # 福利
            'libao':{},                        # 礼包购买次数
            "posinfo": {str(i):{"p":-1, "v":0, "color": 4} for i in xrange(8)},# 每个槽位的情况
            "allv":0,                     # 额外的能量
            "commonprize":[],             # 公共奖励领取情况,
            "gift":[],                    # 发送的玩家uid列表
            "accept": [],                 # 领取的玩家uid列表
            "shifeinum": 0,                # 今天施肥次数
            "allshifeinum": 0               # 活动期间施肥的总次数
        }
    # 任务跨天重置
    if _myData.get('date') != _dkey:
        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':[]}
        _set['date'] = _myData['date'] = _dkey
        _set["shifeinum"] = _myData["shifeinum"] = 0
        _set["gift"] = _myData["gift"] = []
        _set["accept"] = _myData["accept"] = []

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    return _myData

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
        g.m.mymq.sendAPI(uid, 'planttrees_redpoint', '1')

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
    if _data['libao'].get(act, 0) >= _con["libao"][act]['buynum']:
        g.success[orderid] = False
        return

    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(act): 1, "fruitrec.{}".format(5): _con["libao"][act]["fcolor"]}})
    _send = g.getPrizeRes(uid, _con["libao"][act]['prize'], {'act': 'planttreeshd_libao'})
    g.sendUidChangeInfo(uid, _send)

    # 判断八个果子加一点世界绿化率
    _getNum = g.getAttrByCtype(uid, "planttrees_5num", k=_hd["hdid"], bydate=False, default=0)

    # 增加世界积分
    addAllVal, lessVal = divmod(_getNum + _con["libao"][act]["fcolor"], 8)

    # 设置总绿化率
    _ctype = 'planttrees_allval'
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hd["hdid"]}, {"$inc": {"v": addAllVal}})

    # 设置玩家今天的获取苹果次数
    g.setAttr(uid, {"ctype": "planttrees_5num"}, {"k": _hd["hdid"], "v": lessVal})


    # 增加玩家金果子数量
    _ctype = "planttrees_5num"
    _crossRes = g.m.crosscomfun.CATTR().setAttr(uid, {'ctype': _ctype, "k": _hd["hdid"]}, {"$inc": {"v": _con["libao"][act]["fcolor"]}, "$set": {"sid":  g.getHostSid()}})



# 获取红点
def getHongDian(uid):
    _res = {"planttrees": {"fuli":0 , "task": 0, "commonprize":0, "gift": 0, "accept": 0}}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])


    # 判断当前绿化率是多少
    _ctype = 'planttrees_allval'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hd['hdid']})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]
    for idx, info in enumerate(_con["commonprize"]):
        if _allval >= info['val'] and idx not in _myData['commonprize']:
            _res["planttrees"]["commonprize"] = 1
            break

    for idx, info in enumerate(_con["fuli"]):
        if info["type"] == 1:
            _val = _myData["val"]
        else:
            _val = _myData["fruitrec"].get(str(info["cond"][0]))

        if _val >= info['val'] and str(idx) not in _myData['fuli']:
            _res["planttrees"]["fuli"] = 1
            break
    _nt = g.C.NOW()
    if _nt < _hd['rtime']:
        # 判断是达到条件
        _friendList = g.m.friendfun.getFriendList(uid)
        if len(_friendList) > len(_myData["gift"]):
            _res["planttrees"]["gift"] = 1

        # 获取援助列表
        _helpList = g.m.planttreesfun.getHelpData(uid, _hd['hdid'])
        _maxNum = _con["acceptmaxnum"]
        if len(_myData["accept"]) < _maxNum and len(_helpList) > len(_myData["accept"]):
            _res["planttrees"]["accept"] = 1

        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["planttrees"]["task"] = 1
                break
    return _res



# 获取可以接受的印记列表
def getHelpData(uid, _hdid):
    _res = []
    _ctype = 'planttrees_help'
    _crossRes = g.m.crosscomfun.CATTR().getAttrByDate(uid, {'ctype': _ctype, "k":_hdid})
    if _crossRes:
        _res += _crossRes[0].get('v', [])
    return _res

def setHelpData(uid, _hdid, set):
    _ctype = 'planttrees_help'
    _list = getHelpData(uid, _hdid)
    _list += set
    _setData = {}
    _setData["k"] = _hdid
    _setData["v"] = _list
    _crossRes = g.m.crosscomfun.CATTR().setAttr(uid, {'ctype': _ctype}, _setData)


# 提示兑换 跨服
def timer_planttrees_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "rtime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid", "etime"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return
    _stime = _hdinfo["stime"]
    _day = g.C.getTimeDiff(_nt, _stime) + 1
    # 如果不是第一天就直接返回
    # 防止上了多个活动
    if _day != 8:
        return

    _con = getCon()
    _email = _con["tishiemail"]

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


# 借阴兵
def timer_planttrees_commonval():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "rtime": {"$gte": _nt - 3600}},
                                  fields=['_id', "stime", "hdid"])
    if not _hdinfoInfo:
        return

    _day = g.C.getTimeDiff(_nt - 3600, _hdinfoInfo["stime"], 0)

    _hdid = _hdinfoInfo["hdid"]
    _con = g.GC["planttrees"]
    if str(_day) not in _con["todaycommonval"]:
        return
    _ctype2 = 'planttrees_allval'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]

    if _allval > _con["todaycommonval"][str(_day)]:
        return
    # 判断是否已经执行过
    _ctype = 'TIMER_Planttrees_commonval'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData and _chkData[0]["v"] > 6:
        return
    ##(指定绿化率 + rand(1, 100) - 当前绿化率) / 6

    _addVal = int((_con["todaycommonval"][str(_day)] + g.C.RANDINT(1, 100) - _allval) / 6)
    if _addVal > 0:

        g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"$inc": {"v": _addVal}})
    # 加上添加次数
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"$inc": {"v": 1}})


# 发奖 跨服
def timer_planttrees_sendprize():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "etime": {"$lte": _nt}}, fields=['_id', "stime", "hdid"], sort=[["etime", -1]])
    if not _hdinfoInfo:
        return
    _hdid = _hdinfoInfo["hdid"]
    _con = g.GC["planttrees"]
    _rankPrize = _con["rankprize"]
    _email = _con["email"]
    # 判断是否已经执行过
    _ctype = 'TIMER_Planttrees_SENDPRIZE'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData:
        return

    _ranklist = g.crossDB.find("crossplayattr", {"ctype": "planttrees_5num", "k": _hdid},sort=[["v",-1], ["lasttime", 1]],fields=["uid", "v", "sid"], limit=50)
    _lottery = {}
    for idx, data in enumerate(_ranklist):
        _rank = idx + 1
        _prize = []
        _uid = data["uid"]

        # 发奖
        for ele in _rankPrize:
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


# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('planttreeshd', onChkTask)

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print   divmod(15, 8)