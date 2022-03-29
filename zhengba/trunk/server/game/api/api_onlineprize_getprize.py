#!/usr/bin/python
#coding:utf-8
'''
在线奖励：获取在线奖励
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

        {"d": {'cd': 下次领取时间,'num':已领取数量}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":"1"}
    uid=conn.uid
    _con = g.GC['onlinepri']['list']
    #在线奖励领取的次数
    _num = g.m.onlineprizefun.getRecPrizeNum(uid)
    if _num >= len(_con):
       #奖励已经领取完毕
       _res['s'] = -1
       _res['errmsg'] = g.L('onlineprize_getprize_-1')
       return _res

    _nt = g.C.NOW()
    _cd = g.m.onlineprizefun.getCD(uid)
    if _cd > _nt:
        # 倒计时中
        _res['s'] = -2
        _res['errmsg'] = g.L('onlineprize_getprize_-2')
        return _res

    _prize = list(_con[_num]['prize'])
    #设置领取数量
    _resNum = _num + 1
    _cdSize = _con[_num + 1 if _num+1<len(_con) else _num]['cd']
    # #设置cd时间
    _resCD = _nt + _cdSize
    g.m.onlineprizefun.setCD(uid,_cdSize)
    g.m.onlineprizefun.setRecPrizeNum(uid,_resNum)
    #获取奖励
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':"onlineprize","prize":_prize})
    g.sendChangeInfo(conn, _prizeRes)
    _resData = {'cd':_resCD,'num':_resNum}
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = "0_5aec54eb625aee6374e25e0c"
    g.debugConn.uid = uid
    # for x in range(3):
    r = doproc(g.debugConn, [])
    print(r)

