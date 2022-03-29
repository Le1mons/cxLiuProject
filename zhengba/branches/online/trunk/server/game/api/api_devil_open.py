#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
神殿魔王 -  打开界面
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'temple_devil'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res


    _con = g.GC['shendianmowang']['base']
    _nt = g.C.NOW()
    # 只能在规定时间内看到
    if not _con['time'][0] + g.C.ZERO(_nt) <= _nt <= _con['time'][1] + g.C.ZERO(_nt):
        _res['s'] = -1
        _res['errmsg'] = g.L('devil_open_-1')
        return _res

    _rData = {'ranklist':[]}
    _rData['fight_num'] = g.m.devilfun.getFightNum(uid)
    _rData['boss'] = g.m.devilfun.getBossData()

    _myRank,myval = -1,0
    _zt = g.C.ZERO(g.C.NOW())
    # 前三排名
    _rank = g.mdb.find('gameattr',{'ctype':'temple_devil_dps','lasttime':{'$gte':_zt}},fields=['_id','uid','v'],sort=[['v', -1]],limit=3)
    for idx, i in enumerate(_rank):
        if i['uid'] == uid:
            _myRank = idx + 1
            myval = i['v']
        i['name'] = g.getGud(i['uid'])['name']
        _rData['ranklist'].append(i)

    # 我得排名数据
    if _myRank == -1:
        _myDps = g.m.devilfun.GATTR.getAttrByDate(uid,{'ctype':'temple_devil_dps'}) or [{'v':0}]
        myval = _myDps[0]['v']
        if myval > 0:
            _myRank = g.mdb.count('gameattr',{'ctype':'temple_devil_dps', 'v': {'$gt': _myDps[0]['v']},'lasttime':{'$gte':_zt}})+1
    _rData['myrank'] = _myRank
    _rData['myval'] = myval

    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, [])
    pprint(a)