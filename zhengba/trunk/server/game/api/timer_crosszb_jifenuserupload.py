#!/usr/bin/python
#coding:utf-8

#跨服争霸上传竞技场玩家数据
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'crosszb_jifenuserupload start ...'
    g.m.crosszbfun.timer_jifenUserUpLoad()
    print 'crosszb_jifenuserupload end ...'

if __name__ == '__main__':
    proc(1,2)