#!/usr/bin/python
#coding:utf-8

#检测是否有重置活动
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('game')
import g

def proc(arg,karg):
    print "start repeat huodong"
    _r = g.m.huodongfun.rePeatHuoDong()
    g.m.huodong.chaozhilibao12.rePeatHuoDong()
    print "end repeat huodong"

if __name__ == '__main__':
    proc(1,2)