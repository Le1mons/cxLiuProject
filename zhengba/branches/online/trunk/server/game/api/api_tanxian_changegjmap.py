#!/usr/bin/python
# coding: utf-8
'''
探险——跳转挂机地图
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 地图id
    _mapid = int(data[0])
    gud = g.getGud(uid)
    _con = g.GC['tanxiancom']['base']
    if _mapid > gud['maxmapid'] or _mapid > _con['maxmapid']:
        #超出地图上限
        _res['s'] = -1
        _res['errmsg'] = g.L('tanxian_changegjmap_-1')
        return _res
    
    if _mapid == int(gud['mapid']):
        #已在当前地图挂机
        _res['s'] = -2
        _res['errmsg'] = g.L('tanxian_changegjmap_-2')
        return _res
    
    #修改玩家的挂机地图
    _setData = {'mapid':_mapid}
    g.m.userfun.updateUserInfo(uid,_setData,{"mapid":_mapid,"act":"changemapid"})
    g.sendChangeInfo(conn, {'attr':{'mapid':_mapid}})
    #设置挂机信息-记录之前地图的挂机时间，并且将最后领取奖励时间设置会当前最新时间戳
    #g.m.tanxianfun.setGuaJiTimeData(uid)
    _main = g.m.tanxianfun.getTanXianMain(uid)
    #设置最大挂机地图
    g.m.statfun.setStatByMax(uid,'tanxian_maxgjmap',_mapid)
    _res['d'] = _main
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["401"])