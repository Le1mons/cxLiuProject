#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 金盆洗手
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'d': {},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄的站位信息
    _tid = data[0]

    _fightData = g.m.zypkjjcfun.getDefendHero(uid)

    for i in _fightData.keys():
        if _fightData[i] == _tid:
            del _fightData[i]
            break
    else:
        # 没有此英雄
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    if len(_fightData) <= 1:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 设置上阵英雄
    _zhanli = _chkFightData['zhanli']
    _fightData['pet'] = g.m.petfun.getPlayPet(uid)
    g.m.zypkjjcfun.setUserJJC(uid, {'defhero': _fightData, 'zhanli': _zhanli})
    # 更新战力
    g.mdb.update('userinfo', {'uid': uid}, {'zhanli': _zhanli})
    _gud = g.getGud(uid)
    _gud["zhanli"] = _zhanli
    g.gud.setGud(uid, _gud)

    # 设置到跨区数据库中
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1, sqid=_fightData.get('sqid'))
    _userFightData.sort(key=lambda x: x.get('pos', 0))
    _data = g.m.crosscomfun.fmtCrossUserData(uid, _userFightData, _chkFightData['herolist'])
    g.crossDB.update('jjcdefhero', {'uid': uid}, _data, upsert=True)

    _res['d'] = {'fightdata': _fightData}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5e9025bb9dc6d67cf8308c04"])
