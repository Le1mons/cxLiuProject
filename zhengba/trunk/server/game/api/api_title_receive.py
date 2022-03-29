#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
领取爵位奖励
'''


def proc(conn,data):
    '''

    :param conn:
    :param data: [tid:str]:tid:英雄tid
    :param key:
    :return: dict
    ::

       {'s': 1}

    '''

    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _idx = abs(int(data[0]))
    _con = g.GC["titlecom"]
    gud = g.getGud(uid)
    _titleLv = gud["title"]
    if g.getOpenDay() < 22:
        # 不满足开启条件
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('title_lvup_res_-1')
        return _chkData

    _con = g.GC['titlecom']['aimsprize'][_idx]
    # 条件不足
    if _titleLv < _con['cond']:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('title_getprize_res_-4')
        return _chkData

    _recList = g.getAttrByCtype(uid, 'title_aimsprize', bydate=False, default=[])
    # 是否领取过
    if _idx in _recList:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('title_getprize_res_-2')
        return _chkData

    _chkData["con"] = _con
    _chkData["prize"] = _con['prize']
    _chkData["idx"] = _idx
    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _con = _chkData["con"]
    _prize = _chkData["prize"]
    _idx = _chkData["idx"]

    g.setAttr(uid, {'ctype': 'title_aimsprize'}, {'$push': {'v': _idx}})
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'title_receive'})
    # 推送前端
    g.sendChangeInfo(conn, _sendData)

    _res["d"] = {"prize": _prize}
    return _res


if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # g.getPrizeRes(uid, [{"a":"attr", "t": "jinbi", "n": 100000000000}])
    gud = g.getGud(uid)
    data = ["5d77521c0ae9fe4150e7b0bb", 5]

    _r = doproc(g.debugConn, data)
    pprint(_r)
    if 'errmsg' in _r: print _r['errmsg']