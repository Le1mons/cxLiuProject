#!/usr/bin/python
# coding:utf-8
'''
装备 - 装备转换
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要转换的材料装备id:str, 要转换的目标装备id:str]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 转换的材料
    _eid = data[0]
    # 要转换的装备
    _cEid = data[1]
    # 数量
    _num = 1
    if len(data) > 2:
        _num = int(data[2])

    if _num <= 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 可以兑换的eid list
    _con = g.GC['equip']
    _eidList = [k for k,v in _con.items() if v['color'] == _con[_eid]['color'] and v['star']==_con[_eid]['star'] and k!=_eid and v['colorlv'] == _con[_eid]['colorlv']]
    # 不能兑换此装备
    if _cEid not in _eidList:
        _res['s'] = -1
        _res['errmsg'] = g.L('equip_change_-1')
        return _res

    _need = [{'a':'equip','t':_eid,'n':_num}] + g.fmtPrizeList(list(_con[_eid]['changeprize'])*_num)
    _chk = g.chkDelNeed(uid, _need)

    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'equip_change','need':_need})
    g.sendChangeInfo(conn, _sendData)

    _prize = [{'a':'equip','t':_cEid,'n':_num}]
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'equip_change','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['1056','105601',3]
    _r = doproc(g.debugConn, data)
    print _r