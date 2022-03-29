#!/usr/bin/python
#coding:utf-8


import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
查询某个玩家的某个小兵的全部信息
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    _chuid = data[0]
    _tid = data[1]
    _where = {'uid':_chuid,'_id':g.mdb.toObjectId(_tid)}
    _hero = g.mdb.find1('hero',where=_where,fields=["_id"])

    if _hero != None:
        _res["d"]={}
        _res["d"].update(_hero)
        return _res
    else:
        _res["s"] = -1
        _res["errmsg"] = g.L("userarmydetailsError-1")
        return _res

if __name__ == "__main__":
    g.debugConn.uid = "0_5aea7b67625aee5548970d49"
    print doproc(g.debugConn,["0_5aea7b67625aee5548970d49","5b0c041b625aee55d43dba90"])
