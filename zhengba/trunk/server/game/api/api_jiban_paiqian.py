#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 派遣
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
    # 派遣的tid
    _tid = str(data[0])

    # 获取当前玩家派遣武将列表
    _dispatchData, name = g.m.jibanfun.getDispatchHero(uid)
    # 替换的tid
    if len(data) > 1:
        # 替换的tid
        _replaceTid = str(data[1])
        if _replaceTid in _dispatchData:
            del _dispatchData[_replaceTid]

    # 判断派遣不能超过六个
    if len(_dispatchData) >= 6:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('jiban_paiqian_res_-1')
        return _chkData

    # 判断这个英雄是否上阵存在
    _heroData = g.m.herofun.getHeroInfo(uid, _tid)
    if not _heroData:
        #  武将不存在
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_heroerr')
        return _chkData

    _hid = _heroData["hid"]
    _heroCon = g.m.herofun.getPreHeroCon(_hid)
    _heroData["star"] = _heroData["star"]


    # 判断颜色是否满足
    if _heroData["star"] < 4:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('jiban_paiqian_res_-2')
        return _chkData

    _chkData["tid"] = _tid
    _chkData["herodata"] = _heroData
    _chkData["dispatchData"] = _dispatchData

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

    _tid = _chkData["tid"]
    _heroData = _chkData["herodata"]
    _dispatchData = _chkData["dispatchData"]
    # 获得阵容初始化数据
    fmtData = g.m.jibanfun.fmtHeroData(uid, _heroData)
    # 加入派遣列表
    _dispatchData.update(fmtData)
    g.m.jibanfun.setDispatchHero(uid, _dispatchData)

    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('wlx1')
    g.debugConn.uid = uid
    _data = ['5de2d6b19dc6d64843083081']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'