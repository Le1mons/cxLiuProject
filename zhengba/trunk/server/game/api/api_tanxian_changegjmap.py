#!/usr/bin/python
# coding: utf-8
'''
探险——跳转挂机地图
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [地图id:int]
    :return:
    ::

        {"d":{
            'gjtime':挂机时间
            'gjmapid':挂机地图id
            'gjprize':挂机奖励
            'freetxnum':当天可免费探险次数
            'maxbuytxnum':最大可购买探险次数
            'txnum':当天已经探险次数
            'passprizeidx':已领取的阶段奖励下标
            'isadventure':探险者特权
            'tqpasstime':探险过期时间
            'zchuodong':周常活动 探险先锋
            'isopen':限时掉落活动是否开启
        }
        's': 1}

    """
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


    if gud['lv'] >= 20:
        # 上传到跨服
        _set = {'zhanli': gud['maxzhanli'], 'mapid': _mapid, 'headdata': g.m.userfun.getShowHead(uid),'ttltime':g.C.TTL()}
        g.crossDB.update('tanxian', {'uid': uid}, _set, upsert=True)
    _res['d'] = _main
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["401"])