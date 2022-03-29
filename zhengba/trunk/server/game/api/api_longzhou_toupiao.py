#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
龙舟活动-投票
'''


def proc(conn, data, key=None):
    """

    :param conn: 参数[num]   投票数量
    :return:
    ::

        {'d': {'allnum': 0,   参与活动的总人数
           'info': {u'data': {},
                    u'etime': 1621612800,
                    u'hdid': 1621303915,
                    u'rtime': 1621612800,
                    u'stime': 1621180800},
           'myinfo': {'date': '2021-05-19',
                      'duihuan': {}, 兑换情况
                      'info': {},
                      'libao': {},  礼包情况
                      'num': 0,    今日投票数量
                      'select': '',   选择的龙舟id
                      'task': {'data': {'1': 1}, 'rec': []}}},  任务完成情况
        's': 1}

    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _num = int(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(74, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.longzhoufun.getData(uid, _hd['hdid'])
    if not _data["select"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData


    toupiaoneed = g.GC["longzhou"]["toupiaoneed"]
    _need = toupiaoneed * _num
    _need = g.mergePrize(_need)
    # 判定消耗是否满足
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chkRes['t']
        else:
            _chkData["s"] = -104
            _chkData[_chkRes['a']] = _chkRes['t']
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["data"] = _data
    _chkData["need"] = _need
    _chkData["num"] = _num
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _data = _chkData["data"]

    _hdinfo = _chkData["hdinfo"]
    _hdid = _chkData["hdid"]
    _need = _chkData["need"]
    _num = _chkData["num"]

    # 消耗扣除
    _sendData = g.delNeed(uid, _need, logdata={'act': 'longzhou_toupiao', "id": _data["select"], "num": _num})
    g.sendChangeInfo(conn, _sendData)

    _toupiaoprize = g.GC["longzhou"]["toupiaoprize"]
    _prize = _toupiaoprize * _num
    _prize = g.mergePrize(_prize)

    _nt = g.C.NOW()
    _day = g.C.getTimeDiff(_hdinfo["stime"], _nt)
    _setData = {}
    _id = _data["select"]
    _setData["info.{}.{}".format(_day, _id)] = _setData.get("info.{}.{}".format(_day, _id), 0) + _num




    _setData["num"] = _data["num"] + _num

    # 设置任务领奖
    g.m.longzhoufun.setData(uid, _chkData['hdid'], _setData)

    _setCrossData = {"$inc":{}}

    _setCrossData["$inc"]["num"] = _num
    _con = g.GC["longzhou"]
    _extprize = _con["extprize"][_id]

    # 获取跨服数据
    _crossData = g.m.longzhoufun.getCrossData(uid, _chkData["hdid"])

    # 获取本次投票增加的权重
    for i in xrange(_num):
        for idx, jxInfo in enumerate(_extprize):
            _addP = 0
            for pinfo in jxInfo[0]:
                if _data["num"] < pinfo["num"]:
                    break
                _addP = pinfo["p"]
            _setCrossData["$inc"]["pinfo.{}.{}".format(_id, idx)] = _setCrossData["$inc"].get("pinfo.{}.{}".format(_id, idx), 0) + _addP
        _data["num"] += 1
    g.m.longzhoufun.setCrossData(uid, _chkData["hdid"], _setCrossData)

    _sendData = g.getPrizeRes(uid, _prize, {'act': 'longzhou_toupiao', "id": _data["select"], "num": _num})
    g.sendChangeInfo(conn, _sendData)


    _resData["myinfo"] = _data
    _resData["prize"] = _prize

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('ysr1')
    from pprint import pprint

    _data = [31]
    pprint(doproc(g.debugConn, _data))