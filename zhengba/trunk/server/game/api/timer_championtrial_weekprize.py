# coding:utf-8
# !/usr/bin/python

'''
    冠军试练 - 每个星期日21点发奖
    功能：
    1， 根据排名发送每周赛季奖励
'''
import sys

sys.path.append('..')
import g


def proc(arg, karg):
    print 'championtrial_weekprize start ...'
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'champion_sendweekprize', 'k': _dKey}
    _data = g.mdb.find1('gameconfig', _w)
    # 如果数据已存在 或者 时间不到晚上9点
    if _data or g.C.HOUR() < 21 or g.C.WEEK(_nt) != 0:
        return

    _list = g.m.championfun.timer_sendWeekPrize()
    del _w['k']
    g.mdb.update('gameconfig', _w, {'k': _dKey,'lasttime': _nt, 'v': _list},upsert=True)
    # 发送奖励后清空数据
    # g.mdb.update('championtrial', {}, data={'jifen': g.GC['championtrial']['base']['initjifen']})
    print 'championtrial_weekprize finished ...'

if __name__ == '__main__':
    proc(1,2)