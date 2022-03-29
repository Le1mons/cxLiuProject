#!/usr/bin/python
# coding:utf-8
'''
英雄 - 融魂重铸
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: ['5d2db17c0ae9fe3a60067ac2'重铸英雄的tid]
    :return:
    ::

        {'s': 1, 'd': {'prize'重铸返还: [{u'a': u'item', u't': u'2021', u'n': 100}]}}
    """
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

    _heroinfo = g.m.herofun.getHeroInfo(uid, tid)
    if not _heroinfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _temp = g.getAttrOne(uid, {'ctype': 'meltsoul_cost', 'k': tid}, keys='_id,v,hero') or {}
    _prize = _temp.get('v', [])
    # 没有融魂过 无需重铸
    if not _prize:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _need = g.GC['meltsoulcom']['base']['recast_cost']
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

    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'hero_msrecast'})
    _pData = g.getPrizeRes(uid, _prize, {'act': 'hero_msrecast','hero':_temp.get('hero', {})})
    g.mergeDict(_sendData, _pData)
    g.sendChangeInfo(conn, _sendData)


    g.delAttr(uid, {'uid':uid,'ctype':'meltsoul_cost','k':tid})
    # 增加extbuff里的对应属性
    g.m.herofun.updateHero(uid, tid, {'$unset': {'extbuff.meltsoul': 1},'$set':{'meltsoul':1}})
    _extBuff = _heroinfo.get('extbuff', {})
    if 'meltsoul' in _extBuff:
        del _extBuff['meltsoul']

    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid)
    _heroBuff[tid]['extbuff'] = _extBuff
    _heroBuff[tid]['meltsoul'] = 1
    g.sendChangeInfo(conn, {'hero': _heroBuff})
    _res['d'] = {'prize':_prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5d2db17c0ae9fe3a60067ac2'])
