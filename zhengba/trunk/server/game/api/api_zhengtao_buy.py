#!/usr/bin/python
# coding:utf-8
'''
征讨令 - 购买经验
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [次数:int]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _num = abs(int(data[0]))
    _con = g.GC['zhengtao']['base']
    # 开区8天后才能进来
    if g.getOpenDay() < _con['openday'] or _num == 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _flag = g.m.zhengtaofun.getZhengtaoData(uid)
    # haimei 到时间
    if g.C.NOW() <= _flag['buytime']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _need = list(_con['upgrade_need'])
    for i in _need:
        i['n'] *= _num
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

    _res['need'] = _need
    _res['num'] = _num
    _res['con'] = _con
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _sendData = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'zhengtao_buy'})
    g.sendChangeInfo(conn, _sendData)

    g.mdb.update('zhengtao',{'uid':uid},{'$inc': {'exp': int(_chkData['con']['addexp']) * _chkData['num']}})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['2','5'])