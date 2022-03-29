# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
武魂———武魂穿戴，替换
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str, 武魂tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _wid, _tid = data[0], data[1]

    _wuhun = g.mdb.find1('wuhun', {'uid': uid, '_id': g.mdb.toObjectId(_wid)}, fields=['wearer','id'])
    # 武魂不存在 或者已穿戴
    if _wuhun is None or _wuhun.get('wearer'):
        _res["s"] = -1
        _res["errmsg"] = g.L('wuhun_wear_-1')
        return _res

    _hero = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,wuhun,hid')
    # 英雄不存在 或者已经带了
    if _hero is None:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    # 该英雄不能带此种武魂
    if g.GC['hero'][_hero['hid']]['wuhun'] != _wuhun['id']:
        _res["s"] = -3
        _res["errmsg"] = g.L('global_argserr')
        return _res

    # 已经穿戴了
    if _hero.get('wuhun') == _wid:
        _res["s"] = -4
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _res['hero'] = _hero
    _res['wuhun'] = _wuhun
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    if 'wuhun' in _chkData['hero']:
        g.mdb.update('wuhun', {'uid':uid,'_id':g.mdb.toObjectId(_chkData['hero']['wuhun'])}, {'$unset': {'wearer': 1}})
        g.sendChangeInfo(conn, {'wuhun': {_chkData['hero']['wuhun']: {'wearer': ''}}})

    # 穿戴装备
    g.mdb.update('wuhun', {'uid': uid, '_id': _chkData['wuhun']['_id']},{'wearer': data[1]})
    g.m.herofun.updateHero(uid, data[1], {'wuhun': data[0]})
    _sendData = g.m.herofun.reSetHeroBuff(uid, data[1], ['wuhun'])
    _sendData[data[1]]['wuhun'] = data[0]
    g.sendChangeInfo(conn, {'hero': _sendData, 'wuhun': {data[0]: {'wearer': data[1]}}})

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ["5e9fbd579e2178edaa0d8d13", "5e9025ba9dc6d67cf8308c03"]
    _r = doproc(g.debugConn, data)
    print _r
