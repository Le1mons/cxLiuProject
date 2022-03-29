#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
炼魂塔-领取奖励
'''

def proc(conn, data, key=None):
    """
    炼魂塔-领取奖励
    :param conn:
    :param data: [奖励档位下标]
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
    # 奖励的下标
    _idx = int(data[0])

    # 获取自己的数据
    _myInfo = g.m.lianhuntafun.getData(uid)

    # 判断是否已经领奖
    if _idx in _myInfo["rec"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _starprize = g.GC["lianhuntacom"]["starprize"]
    _needVal = _starprize[_idx]
    # 判断是否可以领奖
    if _myInfo["allstar"] < _needVal["val"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 判断是否已经领奖
    if _idx in _myInfo["rec"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _pIdx =_myInfo["selectprize"].get(str(_idx), -1)
    if _pIdx == -1:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    _chkData["myinfo"] = _myInfo

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
    _idx = int(data[0])


    _myInfo = _chkData["myinfo"]

    _setData = {}
    _myInfo["rec"].append(_idx)
    _setData["rec"] = _myInfo["rec"]

    _con = g.GC["lianhuntacom"]["prizepool"]
    _prize = _con[_myInfo["selectprize"][str(_idx)]]["prize"]
    g.m.lianhuntafun.setData(uid, _setData)
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'lianhunta_fight', "idx": _idx})
    g.sendChangeInfo(conn, _sendData)
    _resData["myinfo"] = g.m.lianhuntafun.getData(uid)
    _resData["prize"] = _prize
    # _resData["layerinfo"] = g.m.lianhuntafun.getLayerInfo(uid)

    _res["d"] = _resData

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('4')
    print g.debugConn.uid
    _data = ['0', "0"]
    from pprint import pprint

    pprint (doproc(g.debugConn,_data))