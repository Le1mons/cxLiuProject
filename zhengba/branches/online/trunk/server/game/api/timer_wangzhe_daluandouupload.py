#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')


import g


@g.timerretry
def proc(arg,karg):
    print "start upload 256 player"
    g.m.crosswzfun.act_setLuanDouUser2JinJi()
    print "end upload 256 player"


if __name__ == "__main__":
    proc(1, 2)