#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
炼魂塔-open
'''

def proc(conn, data, key=None):
    """
    炼魂塔-open
    :param conn:
    :param data:
    :param key:
    :return:
    ::
        {'d': {'myinfo': {u'allstar': 0,  总星星数
                u'borrowuid': [],   租借的uid列表
                u'layerstar': {},    每个小关的星星
                u'pool': {u'0': 1},   奖池使用的次数
                u'rec': [0],         领奖下标
                u'selectprize': {u'0': 0}},  赏金奖励选择的奖励id, k为奖励idx, v为选择的奖池idx
        'prize': ({'a': 'attr', 'n': 10, 't': 'rmbmoney'},)},



    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1
    # 判断是否有6个6星的来激活
    _hero6cond = g.m.lianhuntafun.chkHeroOpenCond(uid)
    if not _hero6cond:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('lianhunta_opencond_res_-1')
        return _chkData

    # 获取公平竞技场是否开启
    _chkOpen = g.m.lianhuntafun.checkOpen(uid)
    if not _chkOpen:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

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


    _resData["myinfo"] = g.m.lianhuntafun.getData(uid)

    _fashitaInfo = g.m.fashitafun.getFashitaInfo(uid) or {"layernum": 0}

    _resData["fashita"] = _fashitaInfo["layernum"]

    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dff']
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))