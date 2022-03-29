#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

'''
竞技场 - 防守英雄
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄的站位信息
    _fightData = data[0]
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 设置上阵英雄
    _zhanli = _chkFightData['zhanli']
    g.m.zypkjjcfun.setUserJJC(uid,{'defhero': _fightData,'zhanli':_zhanli})

    # 设置到跨区数据库中
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=_fightData.get('sqid'))
    _userFightData.sort(key=lambda x:x['pos'])
    _data = g.m.crosscomfun.fmtCrossUserData(uid,_userFightData)
    _data['headdata'] = _data.pop('head')
    g.crossDB.update('jjcdefhero',{'uid':uid},_data,upsert=True)

    _res['d'] = {'fightdata': _fightData}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[{"5":"5c29c0b6c0911a34646badf9","2":"5c29c0b6c0911a34646bae00"}])