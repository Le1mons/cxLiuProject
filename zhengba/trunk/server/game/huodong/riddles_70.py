#! /usr/bin/python
# -*-coding:utf-8-*-


"""
元宵活动之谜语人
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 70
import g



def getOpenList(uid, hdinfo):

    return


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime,topic')
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    if hdData["lasttime"] < _zt:
        # # 随机3个谜语
        # questions = g.GC["riddles"]["questions"]
        # 随机下标
        _topic = g.GC["riddles"]["topic"]
        _day = g.C.getDateDiff(hdinfo["stime"], _nt)
        if _day >= len(_topic):
            _randomList = _topic[-1]
        else:
            _randomList = _topic[_day]

        # _list = range(len(questions))
        # _randomList = g.C.getRandList(_list, 3)
        # 设置今天的vip等级
        g.m.huodongfun.setHDData(uid, hdid, {"gotarr.riddle": {}, "topic": _randomList})
        hdData["gotarr"]["riddle"] = {}
        hdData["topic"] = _randomList

    _retVal = {"info":hdinfo,"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _con = g.GC["riddles"]

    act = kwargs['idx']
    _id = kwargs['act']

    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime,topic')
    # 判断是否隔天
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    if hdData["lasttime"] < _zt:
        _res['s'] = -1
        _res['errmsg'] = g.L('riddle_res_-1')
        return _res

    # 如果是灯谜
    if act == "riddle":
        _idx = abs(int(kwargs['wxcode']))
        if str(_id) in hdData['gotarr']["riddle"]:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res
        qid = _id
        questions = _con["questions"][int(qid)]
        # 判断题目是否是今天的
        if int(qid) not in hdData["topic"]:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_algetprize')
            return _res


        _win = 1
        if str(_idx) == questions["right"]:
            _win = 0
        if not _win:
            _prize = questions["winprize"]
        else:
            _prize = questions["loseprize"]
        hdData['gotarr']["riddle"][str(_id)] = _idx
        g.m.huodongfun.setHDData(uid, hdid, {'gotarr.riddle': hdData['gotarr']["riddle"]})
    else:

        _num = abs(int(kwargs['wxcode']))

        _duihuan = _con["duihuan"][str(_id)]

        hdData['gotarr']["duihuan"][str(_id)] = hdData['gotarr']["duihuan"].get(str(_id), 0) + _num
        # 购买次数不足
        if _duihuan["maxnum"] < hdData['gotarr']["duihuan"][str(_id)]:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _need = _duihuan['need']
        _need = _need * _num
        _need = g.mergePrize(_need)
        _chk = g.chkDelNeed(uid, _need)
        # 判断消耗品是否充足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res
        g.delNeed(uid, _need, {"act": "hdgetprize_{}".format(htype), "hdid": hdid, "num": hdData['gotarr']["duihuan"][str(_id)],'id': _id})

        g.m.huodongfun.setHDData(uid, hdid, {'gotarr.duihuan': hdData['gotarr']["duihuan"]})
        _prize = _duihuan['prize'] * _num
        _prize = g.mergePrize(_prize)

    _changeInfo = {"item": {}, "attr": {}, "hero": {}, "record": {}}
    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprize_{}".format(htype), "hdid": hdid, 'id': _id, "type":act})

    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["prize"] = _prize
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

    return _rData


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    gud = g.getGud(uid)


    # # 随机3个谜语
    # questions = g.GC["riddles"]["questions"]
    # # 随机下标
    # _list = range(len(questions))
    # _randomList = g.C.getRandList(_list, 3)

    _nt = g.C.NOW()
    hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])

    _topic = g.GC["riddles"]["topic"]
    _day = g.C.getDateDiff(hdinfo["stime"], _nt)
    if _day >= len(_topic):
        _randomList = _topic[-1]
    else:
        _randomList = _topic[_day]

    setData = {"$set": {"gotarr": {"libao": {}, "duihuan": {}, "riddle": {}}, "val": 0, "topic": _randomList}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    return
    if etype != 'chongzhi':
        # 只处理充值事件
        return



def isOpen(uid):
    _res = {}
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    # 判断活动是否开启
    if not _hdinfo:
        return _res


    _res["act"] = 1
    _res["hdid"] = _hdinfo["hdid"]
    _res["stime"] = _hdinfo["stime"]
    _res["etime"] = _hdinfo["etime"]
    return _res


# 提示兑换 跨服
def timer_riddles_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoList = g.mdb.find("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid", "etime"])
    if not _hdinfoList:
        return
    _con = g.GC["riddles"]
    _openTime = _con["opentime"]
    _stateInfo = _con["stateinfo"]

    _email = _con["tishiemail"]
    for _hdinfo in _hdinfoList:
        _stime = _hdinfo["stime"]
        _hdid = _hdinfo["hdid"]
        # 获取活动当前是第几天
        _diffDay = g.C.getTimeDiff( _hdinfo["etime"], _nt, 0)
        _day = _diffDay + 1
        # 如果不是第一天就直接返回
        # 防止上了多个活动
        if _day != 2:
            continue

        # 发送跨服工会邮件
        _title = _email["title"]
        _content =_email['content']
        _fmtContent = _content.format(g.C.DATE(_hdinfo["etime"]))
        # 发送邮件
        _userlist = g.mdb.find("hddata", {"hdid":_hdid}, fields=["uid"])

        for user in _userlist:
            g.m.emailfun.sendEmail(user["uid"], 1, _title, _fmtContent)




if __name__ == "__main__":
    uid = g.buid("liu1")
    timer_riddles_tishi()