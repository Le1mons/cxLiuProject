#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄 - 一键穿戴装备
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄唯一id
    tid = data[0]

    _preData = g.m.herofun.getUserwearInfo(uid, tid,strict=True)
    if _preData == False: 
        #英雄不存在时，不应该往下走，否则装备数据会出错
        _res = {"s": -1,"errmsg":g.L('hero_not_exist')}
        return _res
    
    if not _preData: _preData = {}
    _wearData = g.m.equipfun.getBestByWearData(uid, tid, _preData)
    _send = g.m.herofun.reSetHeroBuff(uid, tid)
    _send[tid]['weardata'] = _wearData['weardata']
    _sendData = {'hero':_send,'shipin':_wearData['shipin'],'equip':_wearData['equip']}
    g.sendChangeInfo(conn, _sendData)
    g.event.emit('JJCzhanli', uid, tid)
    _res['d'] = {'hero':_send}
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5bc5a16caeddbf2bc8b768d1"])