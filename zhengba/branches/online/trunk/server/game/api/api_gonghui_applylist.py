#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 获取公会的申请列表
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _resData = {}
    _resData['applylist'] = []
    _applyList = g.mdb.find('gonghuiapply',{'ghid':_ghid},fields=['_id'],sort=[['ctime',-1]],limit=50)
    for d in _applyList:
        del d['ttltime']
        gud = g.getGud(d['uid'])
        d['headdata'] = g.m.userfun.getShowHead(d['uid'])
        d['maxzhanli'] = gud['maxzhanli']
        _resData['applylist'].append(d)
        
    _res['d'] = _resData
    return _res
        
if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    print doproc(g.debugConn,[0])