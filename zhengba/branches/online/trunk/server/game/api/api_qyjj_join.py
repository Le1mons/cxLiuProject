#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
群英集结 - 开启界面
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    return _res
    uid = conn.uid
    # 军团长uid
    _headUid = data[0]
    # 等级不够
    if not g.chkOpenCond(uid, 'tuanduifuben'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 锁机制
    if g.crossMC.get(g.C.STR('team_copy_{1}', _headUid)):
        _res['s'] = -8
        _res['errmsg'] = g.L('qyjj_join_-8')
        return _res
    g.crossMC.set(g.C.STR('team_copy_{1}', _headUid),1,1)

    # 已有副本
    if g.crossDB.find1('allhero_together', {g.C.STR('user.{1}',uid): {'$exists': 1}}, fields={'_id': 1}):
        _res['s'] = -4
        _res['errmsg'] = g.L('qyjj_join_-4')
        return _res

    _copyData = g.crossDB.find1('allhero_together',{'uid': _headUid},fields=['_id','ctime','user','type','leadnum'])
    # 数据不存在
    if not _copyData:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['tuanduifuben']['base']['group']
    # 等级不够
    if g.getGud(uid)['lv'] < _con[_copyData['type']]['lvlimit']:
        _res['s'] = -7
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 超过了时间
    if g.C.NOW() > _copyData['ctime'] + _con[_copyData['type']]['duration']:
        _res['s'] = -3
        _res['errmsg'] = g.L('qyjj_join_-3')
        return _res

    # 满员了
    if len(_copyData['user']) >= _con[_copyData['type']]['num_limit']:
        _res['s'] = -5
        _res['errmsg'] = g.L('qyjj_join_-5')
        return _res

    # 没有参团次数
    if g.m.qyjjfun.getCanJoinNum(uid) <= 0:
        _res['s'] = -6
        _res['errmsg'] = g.L('qyjj_join_-6')
        return _res

    gud = g.getGud(uid)
    g.setPlayAttrDataNum(uid, 'qyjj_usedjoinnum')
    g.crossDB.update('allhero_together',{'uid':_headUid,'type':_copyData['type']},{
        g.C.STR('user.{1}',uid): {'svrname':gud['ext_servername'],'name':gud['name'],'time':g.C.NOW()}
    })

    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['0_5bc01c47c0911a2c50550e5d','djlv'])