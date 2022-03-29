#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
炼魂塔-租借
'''

def proc(conn, data, key=None):
    """
    炼魂塔-租借
    :param conn:
    :param data: [tid] 英雄tid
    :param key:
    :return:
    ::
        {"s": 1}


    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _tid = str(data[0])

    _heroInfo = g.mdb.find1("hero", {"uid":uid, "_id": g.mdb.toObjectId(_tid)},fields=["_id"])

    if not _heroInfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData


    _chkData["heroinfo"] = _heroInfo
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
        # 奖励的下标

    _tid = str(data[0])
    _heroInfo = _chkData["heroinfo"]

    _ctype = "lianhunta_borrowhero"
    _w = {"ctype": _ctype}

    # 玩家战斗信息
    _userFightData = g.m.lianhuntafun.fmtHeroList(uid, [_heroInfo])["herolist"]


    gud = g.getGud(uid)
    name = gud["name"]
    g.CROSSATTR.setAttr(uid, _w, {"v": _userFightData, "name": name})

    _setData = {}
    _setData["borrow"] = _tid

    g.m.lianhuntafun.setData(uid, _setData)


    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('yyw')
    print g.debugConn.uid
    _data = ['602003199dc6d605bf66908b']
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))