#!/usr/bin/python
# coding:utf-8

import sys,threading

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
    uid = conn.uid
    # 等级不够
    if not g.chkOpenCond(uid, 'tuanduifuben'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _rData = {}
    _nt = g.C.NOW()
    _con = g.GC['tuanduifuben']['base']

    # 没有传参数就有什么给什么
    if not data:
        # 如果玩家已经参加了副本
        _copyData = g.crossDB.find1('allhero_together',{g.C.STR('user.{1}', uid): {'$exists': 1}}, fields=['_id'])
        if _copyData and _nt < _con['group'][_copyData['type']]['duration'] + _copyData['ctime'] + _con['keep_time']:
            _rData['data'] = _copyData

    # 有一个参数 或者 没有个人参与的副本
    if 'data' not in _rData or len(data) == 1:
        _list = g.crossDB.find('allhero_together',fields=['ctime','user','leadnum','type','rec_data','uid'])
        _rData['list'] = []
        _expire = []
        # 过滤掉超时的
        for i in _list:
            # 超过一小时的不显示列表中
            if _nt > _con['group'][i['type']]['duration'] + i['ctime']:
                # 超过24小时的发送邮件奖励
                if _nt > _con['group'][i['type']]['duration'] + i['ctime']+_con['keep_time']:
                    _expire.append(i)
                continue
            _temp = {}
            _temp['type'] = i['type']
            _temp['uid'] = i['uid']
            _temp['user'] = i['user']
            _temp['opennum'] = i['leadnum']
            _temp['ctime'] = i['ctime']
            _rData['list'].append(_temp)

        if _expire:
            _idList = g.m.qyjjfun.sendExpireEmail(_expire)
            g.crossDB.delete('allhero_together', {'_id': {'$in': _idList}})

    # 剩余参团次数
    _rData['num'] = g.m.qyjjfun.getCanJoinNum(uid)
    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])