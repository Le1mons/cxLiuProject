#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 备战
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid列表:list]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'watcher'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['watchercom']['base']
    _tidList = data[0]
    # 上阵数量有问题
    if len(_tidList) > _con['maxheronum'] or not _tidList or len(set(_tidList))!=len(_tidList):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _heros = g.m.watcherfun.getHeroInfo(uid, _tidList)
    if not _heros['chk']:
        _res['s'] = _heros['chk']
        _res['errmsg'] = _heros['errmsg']
        return _res

    _heroList, _zhanli = _heros['herolist'], _heros['zhanli']
    _WatcherData = g.mdb.find1('watcher', {'uid': uid}, fields=['_id'])
    # 还没到轮回时间
    if _WatcherData and g.C.NOW() < _WatcherData['rebirthtime']:
        _res['s'] = -3
        _res['errmsg'] = g.L('watcher_prepare_-3')
        return _res

    # 超过两天了  需要轮回
    if _WatcherData and g.C.NOW() > _WatcherData['rebirthtime']:
        _data = g.m.watcherfun.refreshWatcherData(uid, _WatcherData, _heroList, zhanli=_zhanli)

    else:
        _data = {}
        _data['herolist'] = _heroList
        _data['ctime'] = g.C.NOW()
        _data['rebirthtime'] = g.C.ZERO(g.C.NOW() + 2 * 24 * 3600)
        _data['layer'] = _WatcherData['layer'] if _WatcherData else 1
        _data['toplayer'] = _WatcherData['toplayer'] if _WatcherData else 1
        _npc = g.GC['watcher'][str(_data['layer'])]['npc']
        _boss = g.m.fightfun.getNpcFightData(_npc)
        _boss['herolist'][0].update({'enlargepro':1.5})
        _data['npc'] = _boss
        _data['winnum'] = 0
        _data['zhanli'] = _zhanli

        g.mdb.update('watcher',{'uid':uid},_data,upsert=True)
    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [['1','1']])