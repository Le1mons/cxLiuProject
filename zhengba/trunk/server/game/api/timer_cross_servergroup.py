# coding:utf-8
# !/usr/bin/python

'''

    功能：跨服分组
'''
import sys

sys.path.append('..')
import g


def proc(arg, karg):
    print 'cross_servergroup start ...'
    g.m.crosscomfun.timer_createOpenDayGroupID()
    print 'cross_servergroup finished ...'

if __name__ == '__main__':
    proc(1,1)