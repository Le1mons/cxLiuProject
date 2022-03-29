#!/usr/bin/python
#coding:utf-8
'''
公会 - 日志列表
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {"list": []}
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
    _ghid = gud['ghid']
    if _ghid == '':
        _res["s"]=-2
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res
    
    _resData = {}
    _resData['list'] = g.m.gonghuifun.getGhLog(_ghid)
    _res['d'] = _resData
    return _res
        
if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    print doproc(g.debugConn,[])