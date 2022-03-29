#!/usr/bin/env python
#coding:utf-8

'''
王者荣耀--生成npc
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

@g.timerretry
def proc(arg, kwarg):
    print 'crosswz_generatenpc start ...'
    g.m.crosswzfun.group()
    g.m.crosswzfun.generateNpc()
    print 'crosswz_generatenpc end ...'

if __name__ == '__main__':
    proc(['zuanshi'],{})
