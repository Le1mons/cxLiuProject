#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
宝石 - 改变属性
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    #英雄tid
    _tid = str(data[0])
    #宝石类型
    _bsType = '6'
    #穿戴信息
    _wearData = g.m.herofun.getUserwearInfo(uid, _tid)
    #判断是否有宝石
    if _wearData == None or _bsType not in _wearData:
        #未激活宝石
        _res['s'] = -2
        _res['errmsg'] = g.L('baoshi_buffchange_res_-2')
        return _res
    
    _baoshiInfo = _wearData[_bsType]
    _lv, _buffNum = _baoshiInfo.items()[0]

    _baoshiCon = g.m.baoshifun.getBaoshiCon(_lv)
    _baoshibuffs = _baoshiCon['buff']
    _need = _baoshiCon['changeneed']
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

    # 随机取一个buff组里的数字
    _buffList = _baoshibuffs.keys()
    if _buffNum in _buffList: _buffList.remove(_buffNum)
    _buffId = g.C.RANDLIST(_buffList)[0]

    _sendData = g.delNeed(uid, _need,logdata={'act': 'baoshi_buffchange'})
    g.sendChangeInfo(conn, _sendData)

    _w = {'ctype':'baoshi_buff'}
    g.setAttr(uid,_w,{'v': _buffId})
    _res['d'] = {'buffid': _buffId}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc1548ac0911a1710920989'])