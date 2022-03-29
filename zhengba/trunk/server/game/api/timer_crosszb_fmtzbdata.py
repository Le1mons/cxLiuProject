#!/usr/bin/python
#coding:utf-8

#格式化争霸排名信息
if __name__ == '__main__':
    import sys
    sys.path.append('..')

import g


def proc(arg,karg):
    print 'crosszb_fmtzbdata start ...'
    if g.C.getWeek()  != 6:
        return
    g.m.crosszbfun.fmtZhengBaRank()
    print 'crosszb_fmtzbdata end ...'

if __name__ == '__main__':
    proc(1,2)