#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g

'''
宝石 - 激活宝石
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
    _userwear = g.m.herofun.getUserwearInfo(uid, tid)
    #宝石类型
    _bsType = '6'
    # 已经装备了宝石
    if _userwear and _userwear.get(_bsType):
        _res['s'] = -2
        _res['errmsg'] = g.L('baoshi_jihuo_res_-2')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄等级不够
    if _heroInfo['lv'] < 40:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_jihuo_res_-1')
        return _res

    _baoshiCon = g.m.baoshifun.getBaoshiCon('1')
    _baoshibuffs = _baoshiCon['buff']

    # 随机取一个buff组里的数字
    _buffList = _baoshibuffs.keys()
    _buffNum = g.C.RANDLIST(_buffList)[0]

    _baoshiData = g.m.herofun.setUserWearInfo(uid, tid, _bsType, {'1': _buffNum})
    _sendData = g.m.herofun.reSetHeroBuff(uid, tid,['baoshi'])
    _sendData[tid].update(_baoshiData)
    g.event.emit('JJCzhanli', uid, tid)
    g.sendChangeInfo(conn, {'hero':_sendData})

    return _res


if __name__ == '__main__':
    uid = g.buid("8")
    # g.debugConn.uid = uid
    # print doproc(g.debugConn, data=["5b208850c0911a1640075269"])