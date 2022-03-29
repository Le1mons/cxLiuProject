#!/usr/bin/python
# coding:utf-8
'''
龙舟活动-选择英雄
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data, key=None):
    """

    :param conn: 参数 [id] 龙舟id
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

    _id = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(74, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData


    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.longzhoufun.getData(uid, _hd['hdid'])
    if _data["select"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData


    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    _chkData["data"] = _data
    _chkData["id"] = _id
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
    _id = _chkData["id"]
    _hdinfo = _chkData["hdinfo"]
    _hdid = _chkData["hdid"]

    _nt = g.C.NOW()
    _day = g.C.getTimeDiff(_hdinfo["stime"], _nt)
    _setData = {}
    _setData["select"] = _id
    _setData["info.{}.{}".format(_day, _id)] = 0
    _data["select"] = _id
    # 设置任务领奖
    g.m.longzhoufun.setData(uid, _chkData['hdid'], _setData)
    # 获取跨服数据
    _crossData = g.m.longzhoufun.getCrossData(uid, _chkData["hdid"])
    _setCrossData = {}
    _setCrossData["select"] = _id
    g.m.longzhoufun.setCrossData(uid, _chkData["hdid"], _setCrossData)

    _dkey = g.C.getDate()
    _ctype = 'HUODONG_LONGZHOU_NUM'
    _chk1Data = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _chkData['hdid'], "dkey": _dkey})
    _allNum = {}
    if _chk1Data:
        _allNum = _chk1Data[0]["v"]

    _allNum[_id] = _allNum.get(_id, 0) + 1
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {"v": _allNum, 'k': _chkData['hdid'], "dkey": _dkey})

    _resData["myinfo"] = _data
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('0')
    from pprint import pprint

    _data = [1]
    pprint(doproc(g.debugConn, _data))