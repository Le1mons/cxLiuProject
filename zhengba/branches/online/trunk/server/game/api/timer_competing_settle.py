#!/usr/bin/python
#coding:utf-8

# 公会争锋--结算
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'competing_settle start ...'
    # 周末休战期
    if g.C.getWeek() == 0:
        return
    _season = g.m.competingfun.getSeasonNum()
    # 周六22点因为赛季增加 保持不变减了1  所以需要增加
    if g.C.WEEK() == 6:
        _season += 1
    _round = g.m.competingfun.getRoundNum(_season)
    _round = 1 + _round if _round < 6 else 6
    _settle = g.m.competingfun.timer_dailySettlement(_season)
    g.crossDB.update('competing_signup',{'season':_season},{'round':_round,'settle': _settle})

    if g.C.getWeek() == 6:
        # 增加王者风范
        _top = g.crossDB.find('competing_main', {'season': _season, 'segment': 4}, sort=[['alljifen', -1], ['zhanli', -1]],
                              limit=3, fields=['_id', 'name', 'guildinfo', 'season', 'zhanli','ghid'])
        if _top:
            g.crossDB.insert('competing_toplog', _top)

        g.crossDB.insert('crossconfig', {'k': _season, 'ctype': 'competing_season', 'v': 1, 'ctime': g.C.NOW()})

    print 'competing_settle end ...'

if __name__ == '__main__':
    proc(1,2)