#!/usr/bin/env python
#coding:utf-8

'''
    巅峰王者 - 查看比赛记录接口
'''
import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    touid = str(data[0])
    deep = str(data[1])

    # 本周活动未开启
    _ifopen = g.m.crosswzfun.isWangZheOpen()
    if not _ifopen:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    # 直接获取缓存，缓存数据存在直接返回数据
    _mcKey = 'crosswz_fightlog_{0}_{1}'.format(deep, touid)
    _mcData = g.mc.get(_mcKey)
    if _mcData:
        _res['d'] = _mcData
        return _res

    _dkey = g.m.crosswzfun.getDKey()
    _r = g.crossDB.find1('wzfight',{'dkey': _dkey, 'uid': touid}, fields=['_id', 'matchlog'])
    if not _r:
        _res['s'] = -1
        _res['errmsg'] = g.L('crosswz_winlog_-1')
        return _res

    if deep not in _r['matchlog']:
        _res['s'] = -2
        _res['errmsg'] = g.L('crosswz_winlog_-1')
        return _res

    _rawdata = _r['matchlog'][str(deep)]['winlog']
    _winlog = []
    _fightuser = g.C.dcopy(_rawdata[0]['fightuser'])
    for ele in _rawdata:
        del ele['winarr']
        del ele['fightuser']

    _rdata = {
        'fightuser': _fightuser,
        'winlog': _rawdata
    }
    g.mc.set(_mcKey, _rdata, time=24 * 3600)
    _res['d'] = _rdata
    return _res
