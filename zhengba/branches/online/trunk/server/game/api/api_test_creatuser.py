#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    
    
import g

'''
测试创建角色
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
def doproc(conn,data):
    _binduid = str(data[0])
    _name = str(data[1])
    _res = g.m.userfun.creatPlayer(_binduid,_name,1)
    return _res
    
    
if __name__ == "__main__":
    uid = g.buid("www12336")
    g.debugConn.uid = uid
    for i in xrange(100,200):
        uid = g.buid(str(i))
        g.m.herofun.addHero(uid,'25075')
        g.m.herofun.addHero(uid,'25076')
        g.m.herofun.addHero(uid,'41013')
        g.m.herofun.addHero(uid,'45023')
        g.m.herofun.addHero(uid,'32035')
        g.m.herofun.addHero(uid,'32034')
        '''data = [str(i),str(i)] #[登录名，游戏角色名]
        _r = doproc(g.debugConn, data)
        print _r
        if 'errmsg' in _r: print _r['errmsg']'''