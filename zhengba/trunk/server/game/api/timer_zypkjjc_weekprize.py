# coding:utf-8
# !/usr/bin/python

'''
    自由竞技场 - 每个星期日22点发奖
    功能：
    1， 根据排名发送每周赛季奖励
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
import g


def proc(arg, karg):
    print 'zypkjjc_weekprize start ...'
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'zypkjjc_weekprize', 'k': _dKey}
    _data = g.mdb.find1('gameconfig', _w)
    # 如果数据已存在 或者 时间不到晚上9点
    if _data or g.C.HOUR() < 22 or g.C.WEEK(_nt) != 0:
        print 'data:{2} hour:{0} week:{1}'.format(g.C.HOUR(), g.C.WEEK(), bool(_data))
        return

    _list = g.m.zypkjjcfun.timer_sendWeekPrize()

    del _w['k']
    g.mdb.update('gameconfig', _w, {'k': _dKey,'v':_list,'lasttime':_nt},upsert=True)
    # # 发送奖励后清空数据
    # g.mdb.update('zypkjjc', {}, data={'jifen': g.GC['zypkjjccom']['base']['initjifen']})
    print 'zypkjjc_weekprize finished ...'

if __name__ == '__main__':
    proc(1,2)