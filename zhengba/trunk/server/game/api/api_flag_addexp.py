#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int]
    :return:
    ::

        {'d':{'recording': {
                    'zhanli': 战力,
                    'fightdata':fightres{}
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
    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv','addtime','exp','jinjie'])
    # 没有信息
    if not _flag:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 没有进阶
    if not _flag['jinjie']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 已领取
    _key = g.C.getWeekNumByTime(g.C.NOW())
    if 'addtime' in _flag and _key == _flag['addtime']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    g.m.flagfun.addFlagExp(_flag, g.GC['flag']['base']['addexp'][0]['n'])
    g.mdb.update('flag',{'uid':uid},{'lv': _flag['lv'],
                                     'exp': _flag['exp'],
                                     'addtime': _key,
                                     'lasttime': g.C.NOW()})

    _flag['prize'] = g.GC['flag']['base']['addexp']
    _res['d'] = _flag
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])