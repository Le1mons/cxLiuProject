#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')
    
import g,sys,os

'''
系统接口 - 重载配置接口
'''


def proc(conn,data):
    conn.response({'s':1})
    conn.send()    
    _res = doproc(conn,data)
    
    

def doproc(conn,data):
    g.GC.reload()
    g.m.preparefun.fmtConfig()
    
    for parent,dirnames,filenames in os.walk(g.ROOTPATH+'game'):
        for f in filenames:
            info = os.path.splitext(f)
            basename = info[0]
            extname = info[1]
            if extname=='.py' and basename not in ['__init__'] and (basename.startswith('api_') or basename.startswith('timer_')):
                if basename in sys.modules:
                    print 'reload',basename
                    reload(sys.modules[basename])
    
if __name__ == "__main__":
    g.debugConn.uid = "0_574916fd85bf0620603269aa"
    gud = g.getGud(g.debugConn.uid)
    proc(g.debugConn,[])