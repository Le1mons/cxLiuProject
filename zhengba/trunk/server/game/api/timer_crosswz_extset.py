#!/usr/bin/env python
#coding:utf-8

'''
王者赛竞猜人数增加
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

@g.timerretry
def proc(arg, kwarg):
    mtype = int(arg[0])
    g.m.crosswzfun.timer_addGuessExtNum(mtype)

if __name__ == '__main__':
    proc(['zuanshi'],**{})
