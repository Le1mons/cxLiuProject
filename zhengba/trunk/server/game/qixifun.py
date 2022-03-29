#!/usr/bin/python
# coding:utf-8

'''
七夕节
'''
import g


htype=76
# 获取配置
def getCon():
    res = g.GC['qixi']
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
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao':{},                        # 礼包购买次数
            "commonprize": [],                 # 公共奖励领取情况,
            "lasttime": _nt,                    # 设置时间
            "val":0,                            # 投票次数
        }
    # 任务跨天重置
    if _myData.get('date') != _dkey:
        # 补发奖励邮件
        _prize = []
        for taskid, info in _con['task'].items():
            if taskid not in _myData["task"]["rec"] and _myData["task"]["data"].get(taskid, 0) >= info["pval"]:
                _prize += info["prize"]
        # 如果有奖励就发送邮件
        if _prize:
            _hdinfo = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
            _title = _con["todayemail"]["title"]
            _content = _con["todayemail"]["content"]
            _fmtcontent = _content.format(g.C.DATE(_hdinfo["etime"]))
            g.m.emailfun.sendEmails(uid, 1, _title, _fmtcontent, prize=_prize)

        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':[]}
        _set['date'] = _myData['date'] = _dkey
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
        g.m.mymq.sendAPI(uid, 'qixi_redpoint', '1')

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

    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(act): 1}})
    _send = g.getPrizeRes(uid, _con["libao"][act]['prize'], {'act': 'qixi_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"qixi": {"task": 0, "commonprize":0, "help": 0}}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])



    # 判断当前绿化率是多少
    _ctype = 'qixi_allval'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hd['hdid']})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]
    for idx, info in enumerate(_con["commonprize"]):
        if _allval >= info['val'] and idx not in _myData['commonprize']:
            _res["qixi"]["commonprize"] = 1
            break


    _nt = g.C.NOW()
    if _nt < _hd['rtime']:
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["qixi"]["task"] = 1
                return _res


    _helpneed = g.m.qixifun.getCon()['helpneed']
    _chkRes = g.chkDelNeed(uid, _helpneed)
    if _chkRes["res"]:
        _res["qixi"]["help"] = 1
        return _res
    return _res


# 提示兑换 跨服
def timer_qixi_tishi():
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
def timer_qixi_commonval():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "rtime": {"$gte": _nt - 3600}},
                                  fields=['_id', "stime", "hdid"])
    if not _hdinfoInfo:
        return

    _day = g.C.getTimeDiff(_nt, _hdinfoInfo["stime"])

    _hdid = _hdinfoInfo["hdid"]
    _con = g.GC["qixi"]
    if str(_day) not in _con["todaycommonval"]:
        return
    _ctype2 = 'qixi_allval'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]

    if _allval > _con["todaycommonval"][str(_day)]:
        return
    # 判断是否已经执行过
    _ctype = 'TIMER_Qixi2_commonval'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData and _chkData[0]["v"] > 6:
        return
    ##(指定绿化率  - 当前绿化率) / 6

    _addVal = int((_con["todaycommonval"][str(_day)] - _allval) / 6)
    if _addVal > 0:
        g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"$inc": {"v": _addVal}})
    # 加上添加次数
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid},  {"v": _day})



# 发奖 跨服
def timer_qixi_sendprize():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "etime": {"$lte": _nt}}, fields=['_id', "stime", "hdid"], sort=[["etime", -1]])
    if not _hdinfoInfo:
        return
    _hdid = _hdinfoInfo["hdid"]
    _con = g.GC["qixi"]
    _rankPrize = _con["rankprize"]
    _email = _con["email"]
    # 判断是否已经执行过
    _ctype = 'TIMER_qixi_SENDPRIZE'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData:
        return

    _ranklist = g.crossDB.find("crossplayattr", {"ctype": "qixi_toupiaonum", "k": _hdid},sort=[["v",-1], ["lasttime", 1]],fields=["uid", "v", "sid"], limit=50)
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
g.event.on('qixihd', onChkTask)

if __name__ == '__main__':
    # uid = g.buid("lsq0")
    # g.debugConn.uid = uid
    # print   divmod(15, 8)

    timer_qixi_commonval()
