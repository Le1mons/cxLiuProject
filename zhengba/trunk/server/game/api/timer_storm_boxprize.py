#!/usr/bin/python
# coding:utf-8

# 风暴战场 天降宝箱
if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g


def proc(arg, karg):
    print 'storm_boxprize start ...'
    g.m.stormfun.timer_getBoxPrize()
    print 'storm_boxprize end ...'

if __name__ == '__main__':
    proc(1,1)