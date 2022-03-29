#!/usr/bin/python
# coding:utf-8
'''
许愿池--进化
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [许愿池类型:str]
    :return:
    ::

        {'d': {'shopitem': [内容参考shop_open]},
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
    _con = g.GC['xuyuanchi'][_poolname]
    _integralInfo = g.mdb.update('playattr',{'ctype':'xuyuanchi_integral','v.{}'.format(_poolname):{'$gte':_con['energy'][1]},'uid':uid},{'$inc':{'v.{}'.format(_poolname):-_con['energy'][1]}})
    # 积分不足
    if _integralInfo['updatedExisting'] == False:
        _res['s'] = -1
        _res['errmsg'] = g.L('xuyuanchi_upgrade_-1')
        return _res

    _shopitem = g.m.xuyuanchifun.createXYCitems(uid, _poolname, super=True)
    g.setAttr(uid, {'ctype': 'xuyuanchi_super{}'.format(_poolname)}, {'v': _shopitem})
    _res['d'] = {'shopitem': _shopitem}
    return _res



if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['common'])
