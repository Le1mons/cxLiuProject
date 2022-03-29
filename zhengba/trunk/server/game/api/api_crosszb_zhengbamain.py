#!/usr/bin/python
#coding:utf-8
'''
跨服争霸主界面
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [对手uid:str, 我的阵容:dict]
    :return:
    ::

        {'d': {'myrank': 我的排名,
                'status': 争霸赛状态,
                'top10':[{'uid':前10的uid,'rank':排行,'headdata':{},'zhanli':战力，'herolist':[{英雄数据}],'servername':区服名字}],
                'cdtime': 冷却时间,
                'buynum': 剩余购买次数,
                'buyneed': 购买消耗,
                'pknum': 可用pk次数,
                'rankprize':排名奖励,
                'refnum': 可刷新对手次数,
                'pkdata': 对手数据
                }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _con = g.m.crosszbfun.getCon()
    _lv = gud['lv']
    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res
    
    _status = g.m.crosszbfun.getZBStatus()
    if _status == 3:
        #筹备中
        _res['s'] = -2
        _res['errmsg'] = g.L("crosszb_zhengbamain_-2")
        return _res
    
    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    _myZB = g.crossDB.find1('crosszb_zb',{'uid':uid,'dkey':_dkey})
    if _myZB == None and _status != 2:
        #未晋争霸赛
        _res['s'] = -3
        _res['errmsg'] = g.L("crosszb_zhengbamain_-3")
        return _res
    
    _resData = g.m.crosszbfun.getZhengBaMainData(uid)
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,["0_5ba1e309e138236ef7ae6233",{"1":"5b91e589e1382372ccdea40f"}])