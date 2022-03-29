#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 升级
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要买的级数:int]
    :return:
    ::

        {'d':{'lv': 最后等级
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要买多少级
    _num = abs(data[0])
    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv'])
    # 没有信息
    if not _flag:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _flag['lv'] += _num
    # 升至最大等级
    if str(_flag['lv']) not in g.GC['flag']['base']['exp']:
        _res['s'] = -2
        _res['errmsg'] = g.L('flag_upgrade_-2')
        return _res

    _need = list(g.GC['flag']['base']['upgrade_need'])
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

    _sendData = g.delNeed(uid, _need,0, logdata={'act': 'flag_upgrade'})
    g.sendChangeInfo(conn, _sendData)

    g.mdb.update('flag',{'uid':uid},{'lv': _flag['lv'], 'lasttime':g.C.NOW()})

    _res['d'] = {'lv': _flag['lv']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])