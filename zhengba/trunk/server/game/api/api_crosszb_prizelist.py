#!/usr/bin/python
#coding:utf-8
'''
打开跨服争霸积分赛领奖界面
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

        {'d': {
            'winnum': 当日胜场,
            'reclist': [以领取的索引]
        },
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _resData = {}
    #当日胜场
    _resData['winnum'] = g.m.crosszbfun.getJiFenWinNum(uid)
    #当日领取奖励信息
    _resData['reclist'] = g.m.crosszbfun.getJiFenRecPrizeList(uid)
    # _resData['scjl'] = g.m.hongdianfun.getCanSCJJ(uid) #是否可以领奖
    _res['d'] = _resData
    return _res
    
    
if __name__ == "__main__":
    #测试vip等级上升后，viplvchange事件是否正确
    g.debugConn.uid = g.buid('666')
    print doproc(g.debugConn, [])