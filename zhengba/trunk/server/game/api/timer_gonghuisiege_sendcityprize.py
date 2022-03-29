#!/usr/bin/python
# coding:utf-8

# 工会战

if __name__ == '__main__':
    import sys

    sys.path.append('..')
    sys.path.append('game')

import g


def proc(arg, karg):
    print "start gonghuisiege sendcityprize"
    # 所有公会设置为不活跃
    g.m.gonghuisiegefun.timer_sendCityPrize()
    print "end gonghuisiege sendcityprize"


if __name__ == '__main__':
    proc(1, 2)