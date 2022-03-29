#!/usr/bin/python
#coding:utf-8

'''
每日限购免费领取奖励
'''


import sys
sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s":1}

    uid = conn.uid
    gud = g.getGud(uid)
    _con = g.GC['chongzhihd']['meirixiangou'][0]
    #领取标识
    _key = _con['chkkey']
    _recData = g.m.chongzhihdfun.getMRXGRecData(uid)
    if _key in _recData:
        #今日已经领取的vip每日奖励
        _res["s"]=-2
        _res["errmsg"] = g.L("vip_recmrprize_res_-2")
        return _res
    
    #设置领取信息
    g.m.chongzhihdfun.setMRXGRecData(uid,_key)
    _prize = list(_con['prize'])
    _changeInfo = g.getPrizeRes(uid,_prize,{'act': 'meirixiangou_mrprizerec','mrprize':_prize})
    g.sendChangeInfo(conn, _changeInfo)
    _resData = {'prize':_prize}
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid('tk1')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn,['1026', '84']))