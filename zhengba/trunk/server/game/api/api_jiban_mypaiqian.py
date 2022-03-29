#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 额外列表
'''

def proc(conn, data, key=None):
    """
    获得通告函的信息

    :param conn:
    :param data:
    :param key:
    :return:
    ::
        {'d': {'tonggaohan': {'num': 1598, 'refreshtime': -1}}, 's': 1}


    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = []
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 获取羁绊的数据
    _dispatchHero, name = g.m.jibanfun.getDispatchHero(uid)

    _tidList = [tid for tid in _dispatchHero]
    _heroData = g.mdb.find("hero", {"_id": {"$in": map(g.mdb.toObjectId, _tidList)}})
    if len(_tidList) != len(_heroData):
        for hero in _heroData:
            tid = str(hero["_id"])
            if tid in _tidList:
                _tidList.remove(tid)
        # 如果有不存在的tid
        if _tidList:
            for ele in _tidList:
                del _dispatchHero[ele]

            g.m.jibanfun.setDispatchHero(uid, _dispatchHero)

    _res["d"] = _dispatchHero
    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = ['1001']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'