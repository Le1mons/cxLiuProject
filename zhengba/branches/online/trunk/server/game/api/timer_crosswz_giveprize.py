#!/usr/bin/env python
#coding:utf-8

'''
    @author      : gch
    @date        : 2017-02-16
    @description : 
        钻石赛、王者赛前四强发奖
        
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

@g.timerretry
def proc(arg, kwarg):
    # 检查上一步是否完成，如果未完成则延迟执行
    # 如果已经执行过，则跳过
    mtype = str(arg[0])
    g.m.crosswzfun.runPrizeTimer(mtype)

if __name__ == '__main__':
    proc(['zuanshi'],**{})
