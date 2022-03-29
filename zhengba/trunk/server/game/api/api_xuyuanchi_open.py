#!/usr/bin/python
# coding:utf-8
'''
许愿池--打开
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'xycdata': {'xycdata':[内容参考shop_open],'lucky':幸运值}, 'box':{}, 'jilu':[]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 许愿池的名字   普通或者高级
    _poolname = data[0]

    # 许愿池参数错误
    if _poolname not in ('common', 'high'):
        _res['s'] = -1
        _res['errmsg'] = g.L('xuyuanchi_open_res_-1')
        return _res

    # 如果是高级许愿池做等级判断
    gud = g.getGud(uid)
    _lv = gud['lv']
    _vip = gud['vip']
    _lvCon = g.GC['opencond']['base']['xuyuanchi']['main']

    # 判断等级是否足以开启
    if _poolname == 'common':
        _lvLimit = _lvCon[0][1]
        if _lv < _lvLimit:
            _res['s'] = -2
            _res['errmsg'] = g.L('xuyuanchi_open_res_-2')
            return _res
    else:
        _lvLimit = _lvCon[1][1]
        _vipLimit = _lvCon[2][1]

        if _lv < _lvLimit and _vip < _vipLimit:
            _res['s'] = -3
            _res['errmsg'] = g.L('xuyuanchi_open_res_-3')
            return _res

    _resData = {}
    _resData['xycdata'] = g.m.xuyuanchifun.getXuyuanchiData(uid, _poolname)
    _integral = g.getAttrByCtype(uid,'xuyuanchi_integral',bydate=False,default={})
    _resData['energy'] = _integral.get(_poolname, 0)
    # 普通许愿池显示宝箱次数
    if _poolname == 'common':
        _data = g.m.xuyuanchifun.getLotteryInfo(uid)
        _resData['num'] = _data['v']
        _resData['reclist'] = _data['reclist']
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['common'])