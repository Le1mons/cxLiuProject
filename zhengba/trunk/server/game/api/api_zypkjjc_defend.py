#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 防守英雄
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [防守阵容:{}]
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
    _fightData = data[0]
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData, side=1)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 设置上阵英雄
    _zhanli = _chkFightData['zhanli']
    _fightData['pet'] = g.m.petfun.getPlayPet(uid)
    g.m.zypkjjcfun.setUserJJC(uid,{'defhero': _fightData,'zhanli':_zhanli})

    # 设置到跨区数据库中
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=_fightData.get('sqid'))
    _userFightData.sort(key=lambda x:x.get('pos',0))
    _data = g.m.crosscomfun.fmtCrossUserData(uid,_userFightData)
    _data['zhanli'] = _zhanli
    _data['headdata'] = _data.pop('head')
    _data["headdata"] = g.m.userfun.getShowHead(uid)
    _data['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid'])
    g.crossDB.update('jjcdefhero',{'uid':uid},_data,upsert=True)

    _res['d'] = {'fightdata': _fightData}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[{"5":"5e9025ba9dc6d67cf8308c03","7":"5e876da89dc6d6742a4eae2e"}])