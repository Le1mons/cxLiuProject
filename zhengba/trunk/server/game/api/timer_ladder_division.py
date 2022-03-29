#!/usr/bin/env python
# coding:utf-8

'''
上传本赛季赛区
'''
import sys

if __name__ == '__main__':
    sys.path.append('..')

import g


def proc(arg, kwarg):
    print 'ladder_division open......'
    _day = g.getOpenDay() + 1
    # 根据天数分区
    if 1 <= _day <= 30:
        _dv = 1
    elif 31 <= _day <= 60:
        _dv = 2
    elif 61 <= _day <= 120:
        _dv = 3
    elif 121 <= _day <= 210:
        _dv = 4
    else:
        _dv = 5

    g.mdb.update('gameconfig',{'ctype':'ladder_division'},{'v':_dv},upsert=True)
    print 'ladder_division end......'


if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
