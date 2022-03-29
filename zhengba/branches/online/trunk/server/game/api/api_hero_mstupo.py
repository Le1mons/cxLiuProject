#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄 - 融魂突破
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄的tid
    tid = data[0]
    # 玩家等级不足
    if not g.chkOpenCond(uid, 'meltsoul'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, tid, keys='_id,hid,extbuff,meltsoul,lv,speed')
    _extbuff = _heroInfo.get('extbuff')
    # 英雄等级不够
    if not _extbuff or 'meltsoul' not in _extbuff:
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _curLv = _heroInfo.get('meltsoul',1)
    _con = g.GC['meltsoul'][_heroInfo['hid']]
    _comcon = g.GC['meltsoulcom']['base']
    # 已到达融魂最大等阶
    if str(_curLv) not in _comcon['tupo']:
        _res['s'] = -4
        _res['errmsg'] = g.L('hero_meltsoul_-4')
        return _res

    # 英雄等级不够
    if _heroInfo['lv'] < _comcon['tupo'][str(_curLv)]:
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_meltsoul_-2')
        return _res

    # 已到达融魂最大等阶
    if str(_curLv + 1) not in _con:
        _res['s'] = -4
        _res['errmsg'] = g.L('hero_meltsoul_-4')
        return _res

    _buffKeys = map(lambda x:x.keys()[0], _extbuff['meltsoul'])
    for key,val in _con[str(_curLv)]['upperlimit'].items():
        if key not in _buffKeys:
            _res['s'] = -3
            _res['errmsg'] = g.L('hero_meltsoul_-3')
            return _res

        for buff in _extbuff['meltsoul']:
            if buff.keys()[0] == key and buff.values()[0] < val:
                _res['s'] = -3
                _res['errmsg'] = g.L('hero_meltsoul_-3')
                return _res

    _heroInfo['meltsoul'] = _curLv + 1
    _buff = _con[str(_curLv)]['extrabuff']
    _extbuff = g.m.herofun.addExtbuffVal(_extbuff, {'meltsoul': [_buff]})

    g.m.herofun.updateHero(uid, tid, {'meltsoul':_heroInfo['meltsoul'],'extbuff':_extbuff})
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid)
    _heroBuff[tid].update({'meltsoul':_heroInfo['meltsoul'],'extbuff':_extbuff})
    g.sendChangeInfo(conn, {'hero': _heroBuff})

    _res['d'] = {'hero': _heroBuff}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc0d7f1c0911a2ed8d11eb0'])