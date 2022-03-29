#!/usr/bin/python
#coding:utf-8
'''
刷新跨服争霸赛对战对手
'''
if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': 'top10': [{'uid':前10的uid,'rank':排行,'headdata':{},'zhanli':战力，'herolist':[{英雄数据}],'servername':区服名字}],
                'pkdata':[{'headata':{}, 'herolist':[{英雄属性}], 'zhanli':玩家战力, 'jifen':获胜积分, 'prize': '获胜奖励'}]
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _con = g.m.crosszbfun.getCon()
    #检查玩家等级是否满足要求
    if not g.chkOpenCond(uid, 'crosszb'):
        _res['s'] = -1
        _res['errmsg'] = g.L("global_limitlv")
        return _res
    
    _dkey_rank = g.m.crosszbfun.dkey_ZBRank()
    #不加step条件
    _myZB = g.crossDB.find1('crosszb_zb',{'uid':uid,'dkey':_dkey_rank})
    if _myZB == None:
        #没有排名，不在休战阶段内不能进主页面
        _res['s'] = -3
        _res['errmsg'] = g.L("crosszb_refzbpk_-3")
        return _res

    _resData = {}
    _resData['pkdata'] = g.m.crosszbfun.refZBFightData(uid)
    _resData['top10'] = g.m.crosszbfun.getZBTopRank(uid, g.m.crosszbfun.getZhengBaStep(uid))
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    #测试vip等级上升后，viplvchange事件是否正确
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [1])