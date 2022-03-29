#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g
import config
'''
读取config.py中的SERVERCONFIG
'''
def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    

def doproc(conn,data):
    _res = {"s":1,"d":{}}
    if hasattr(config,"SERVERCONFIG"):
        _res['d'] = config.SERVERCONFIG
    return _res

if __name__ == "__main__":
    g.debugConn.uid = "10_57392ab22245ff196c4752eb"
    proc(g.debugConn,[])