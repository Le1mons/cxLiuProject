#!/usr/bin/python
#coding:utf-8
'''
王者风范接口
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

        {'d': [{
            'flogid': 日志id,
            'uid':我的uid,
            'touid': 对手uid，
            ‘torank’: 对手排行,
            'rank': 我的排行,
            'toheaddata': 对手的headdata,
            'zhanli': 我的战力,
            'tozhanli': 对手战力,
            'headdata': {},
            'step': 层数
        }],
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _dkey = g.m.crosszbfun.dkey_ZBRank()
    _step = g.m.crosszbfun.getZhengBaStep(uid)
    _data = g.crossDB.find('crosszbtoplog',{'dkey':_dkey,'step':_step},fields=['_id'],sort=[['ctime',-1]],limit=20)
    _res['d'] = _data
    return _res
    
    
if __name__ == "__main__":
    uid = g.buid("666")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, [])
    print g.m.crosszbfun.dkey_ZBRank()