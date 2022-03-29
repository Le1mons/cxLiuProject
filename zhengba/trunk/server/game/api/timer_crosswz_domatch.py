#!/usr/bin/env python
#coding:utf-8

'''
    @author      : gch
    @date        : 2017-02-16
    @description : 
        钻石赛 16 - 8
        
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

@g.timerretry
def proc(arg, kwarg):
    # 检查上一步是否完成，如果未完成则延迟执行
    # 如果已经执行过，则跳过
    _step = int(arg[0])
    g.m.crosswzfun.runMatchTimer(_step)

if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
