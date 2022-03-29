# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
武魂———武魂卸下
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _tid = data[0]

    _hero = g.m.herofun.getHeroInfo(uid, _tid, keys='wuhun')
    # 英雄不存在 或者已经带了
    if _hero is None or 'wuhun' not in _hero:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _wid = _hero['wuhun']
    _wuhun = g.mdb.find1('wuhun', {'uid': uid, '_id': g.mdb.toObjectId(_wid)}, fields=['wearer'])
    # 武魂不存在 或者已穿戴
    if _wuhun is None or 'wearer' not in _wuhun:
        _res["s"] = -1
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

    _wid = str(_chkData['wuhun']['_id'])
    g.mdb.update('wuhun', {'uid':uid,'_id':_chkData['wuhun']['_id']}, {'$unset': {'wearer': 1}})
    g.sendChangeInfo(conn, {'wuhun': {_wid: {'wearer': ''}}})

    # 穿戴装备
    g.m.herofun.updateHero(uid, data[0], {'$unset': {'wuhun': 1}})
    _sendData = g.m.herofun.reSetHeroBuff(uid, data[0], ['wuhun'])
    _sendData[data[0]]['wuhun'] = ''
    g.sendChangeInfo(conn, {'hero': _sendData, 'wuhun': {_wid: {'wearer': ''}}})

    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ["5e91387f9dc6d67283172e5e"]
    _r = doproc(g.debugConn, data)
    print _r
