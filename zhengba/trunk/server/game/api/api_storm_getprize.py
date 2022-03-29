#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 领取目标奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [奖励的索引:int]
    :return:
    ::

        {"d":{'prize':[]}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _idx = abs(int(data[0]))
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.getAttrOne(uid, {'ctype': 'storm_gjtime'}, keys='_id,v,reclist') or {'v': 0}
    # 奖励已领取
    if _idx in _data.get('reclist', []):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _con = g.GC['storm']['base']['targetprize'][_idx]
    # 时间不足
    if _data['v'] < _con[0]:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_valerr')
        return _res

    _r = g.getPrizeRes(uid, _con[1], {'act':'storm_getprize','idx':_idx})
    g.sendChangeInfo(conn, _r)
    g.setAttr(uid, {'ctype': 'storm_gjtime'}, {'$push': {'reclist': _idx}})

    _res['d'] = {'prize': _con[1]}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, data=['time',{'area':'22','number':0},28800])