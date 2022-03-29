# coding:utf-8
# !/usr/bin/python

'''
    竞技场 -
    功能：
    1， 每个星期1 凌晨重置分数
'''
import sys

sys.path.append('..')
import g


def proc(arg, karg):
    print 'championtrial_open start ...'
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    if g.C.HOUR() < 0 or g.C.WEEK(_nt) != 1:
        return

    g.mdb.update('zypkjjc', {}, data={'jifen': g.GC['championtrial']['base']['initjifen']})
    # 发送奖励后清空数据
    g.mdb.update('championtrial', {}, data={'jifen': g.GC['championtrial']['base']['initjifen']})

    print 'championtrial_open finished ...'
