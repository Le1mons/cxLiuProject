#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g
'''
限时招募-领取积分奖励
'''
def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {'s': 1}
    uid = conn.uid
    _idx = int(data[0])
    # 参数有误
    if _idx < 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    hdinfo = g.m.xszmfun.getHuodongData()
    # 活动未开启
    if not hdinfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    if _idx in hdData['gotarr']:
        # 已经领取过奖励
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _con = g.GC['xianshi_zhaomu']
    # 未完成任务
    if hdData['val'] < _con['jifen2prize'][_idx][0]:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_valerr')
        return _res

    g.m.huodongfun.setHDData(uid, hdid, {"$push": {"gotarr": _idx}})
    _prizeMap = g.getPrizeRes(uid, _con['jifen2prize'][_idx][1],
                              {"act": "xszm_recprize", 'idx': _idx})
    g.sendChangeInfo(conn, _prizeMap)

    _res['d'] = {'prize': _con['jifen2prize'][_idx][1]}
    return _res

if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid('lyf248')
    g.debugConn.uid = uid
    a = doproc(g.debugConn,[1])
    pprint(a)