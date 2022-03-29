#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
领取爵位礼包奖励
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
    _type = str(data[0])
    gud = g.getGud(uid)
    _titleLv = gud["title"]
    # _ctime = gud["ctime"]
    # 获取当前零点时间戳
    # _nt = g.C.NOW()
    # _zt = g.C.ZERO(_nt)

    # 获取创建账号的是零点时间戳
    # _czt = g.C.ZERO(_ctime)
    # 判断玩家是否满足了创建账号22天后开启的条件
    if g.getOpenDay() < 22:
        # 不满足开启条件
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('title_lvup_res_-1')
        return _chkData

    _key = g.C.getWeekNumByTime(g.C.NOW())
    # 数量不足
    if _type == '1':
        _num = g.getAttrByCtype(uid, 'title_cost_1')
    else:
        _num = g.getAttrByCtype(uid,'title_cost_2',bydate=False,k=_key)
    _con = g.GC['titlecom']['libao'][_type]
    if _num < _con['val']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    _set = {'v': -1} if _type == '1' else {'v': -1, 'k': _key}
    g.setAttr(uid, {'ctype': 'title_cost_{}'.format(_type)}, _set)

    _chkData['type'] = _type
    _chkData['con'] = _con
    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _prize = _chkData['con']['prize']
    _send = g.getPrizeRes(uid, _prize, {'act':'title_libao','type':data})
    g.sendChangeInfo(conn, _send)
    _res["d"] = {'prize': _prize}
    return _res


if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    # g.getPrizeRes(uid, [{"a":"attr", "t": "jinbi", "n": 100000000000}])
    gud = g.getGud(uid)
    data = ["5d77521c0ae9fe4150e7b0bb", 5]

    _r = doproc(g.debugConn, data)
    pprint(_r)
    if 'errmsg' in _r: print _r['errmsg']