#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')


import g


@g.timerretry
def proc(arg,karg):
    print "start update wangzhezhidian"
    _r = g.m.crosswzfun.act_updateWZZhidian()
    print "end update wangzhezhidian"


if __name__ == "__main__":
    proc(1, 2)