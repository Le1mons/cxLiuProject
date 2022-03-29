#!/usr/bin/python
#coding:utf-8
'''
公会 - 获取公会成员信息列表
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

        {"d":{"userlist":[{"headdata":{},"maxzhanli":战力,"hearttime":最后上线时间}]}}
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
    _resData['userlist'] = []
    _userList = g.mdb.find('gonghuiuser',{'ghid':_ghid},fields=['_id'])
    for d in _userList:
        gud = g.getGud(d['uid'])
        d['headdata'] = g.m.userfun.getShowHead(d['uid'])
        d['maxzhanli'] = gud['maxzhanli']
        d['hearttime'] = gud['logintime']
        _resData['userlist'].append(d)
        
    _res['d'] = _resData
    return _res
        
if __name__ == '__main__':
    g.debugConn.uid = g.buid('tk1')
    print g.debugConn.uid
    print doproc(g.debugConn,[0])