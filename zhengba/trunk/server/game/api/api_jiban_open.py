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
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _jid = str(data[0])
    # 获取羁绊的数据
    _con = g.m.jibanfun.getCon(_jid)
    _showHero = []
    _chkHero = _con["chkhero"]
    for _plid in _chkHero:
        _heroData = g.GC["pre_hero_pinglun"][_plid]
        for hid, color in _heroData.items():
            if color == 4:
                _showHero.append(hid)
                break

    _jiBanInfo = g.m.jibanfun.getJiBanData(uid, _jid)
    _resData["showhero"] = _showHero
    _resData["info"] = _jiBanInfo
    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = ['1']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'