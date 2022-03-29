#!/usr/bin/python
#coding:utf-8

'''
    炼魂塔创建阵容
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
import g

def proc(arg,karg):
    print "lianhuntacreat star"
    g.m.lianhuntafun.timer_creationGuanKa()
    print "lianhuntacreat end"

if __name__ == '__main__':
    proc(1,2)