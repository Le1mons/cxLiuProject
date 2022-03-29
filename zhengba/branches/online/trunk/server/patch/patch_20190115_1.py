#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g,config,time

'''
    更新装备
'''
print 'start..................'
def sendZyppjjc():
    _w = {'ctype': 'zypkjjc_dayprize'}
    _data = g.mdb.find1('gameconfig', _w)
    _nt = g.C.NOW()
    # 如果数据已存在 或者 时间不到晚上9点 或者是同一天
    if (_data and g.C.chkSameDate(_data['lasttime'], _nt)):
        g.timerlog.info(g.C.STR('nt:{1},lasttime:{2},hour:{3}',_nt,_data['lasttime'],g.C.HOUR()))
        return

    g.m.zypkjjcfun.timer_sendEveryPrize()
    g.mdb.update('gameconfig', _w, {'v':1,'lasttime':_nt},upsert=True)

def sendYueka():
    _nt = g.C.NOW()
    _temp = g.m.gameconfigfun.getGameConfigByDate({'ctype': 'dayueka_prize'})
    _w = {'ctype': 'yueka_da', 'v.isjh': 1, 'v.nt': {'$lt': _nt}}
    _data = g.mdb.find('playattr', _w)
    if _temp or not _data:
        g.timerlog.info(g.C.STR('temp:{1},data:{2},hour:{3}', bool(_temp), bool(_data), g.C.HOUR()))
        return

    _list = g.m.vipfun.dayueka_sendPrize(_data)
    g.mdb.update('gameconfig',{'ctype': 'dayueka_prize'}, {'v': _list,'lasttime':_nt},upsert=True)

def sendHuodong():
    _nt = g.C.ZERO(g.C.NOW()) - 2*60
    _dKey = g.C.getWeekNumByTime(_nt)
    _htype = 14
    _w = {'ctype': 'huodong_' + str(_htype), 'k': _dKey}
    _data = g.mdb.find1('rankprize', _w)
    if _data:
        print "ZhouChangHD Already Send==", _dKey
        return

    _info = g.mdb.find('hdinfo', {'htype': 14, 'etime': {"$gte": _nt}, 'rtime': {'$lte': _nt}})
    if not _info:
        print "ZhouChangHD Not Send==", _dKey
        return

    _resList = []
    for x in _info:
        _hdid = x['hdid']
        _rankprize = x['data']['rankprize']
        _rank = g.mdb.find('hddata', {'hdid': _hdid}, sort=[['val', -1], ['lasttime', 1]], limit=1000)
        _title = x['data']['email']['title']
        for idx, i in enumerate(_rank):
            _temp = {}
            _temp['rank'] = idx + 1
            _temp['uid'] = i['uid']
            _content = g.C.STR(x['data']['email']['content'], _temp['rank'])
            _prize = getPrizeByRank(_temp['rank'], _rankprize)
            g.m.emailfun.sendEmails([i['uid']], 1, _title, _content, _prize)
            _temp['issend'] = 1
            _temp['mark'] = x['data']['mark']
            _resList.append(_temp)

    g.mdb.update('rankprize', _w, {'v': _resList, 'lasttime': _nt}, upsert=True)

def getPrizeByRank(rank, con):
    if rank >= con[-1][0][0]:
        return con[-1][1]
    for i in con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]
    return []


sendZyppjjc()
sendYueka()
sendHuodong()
print 'ok...............'