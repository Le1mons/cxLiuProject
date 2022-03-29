#!/usr/bin/python
#coding:utf-8

# 检查公会争锋是否开启
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'competing_chkopen start ...'
    # 周末休战期
    if g.C.getWeek() == 0:
        return
    _season = g.m.competingfun.getSeasonNum()
    _data = g.m.competingfun.isOpen(_season)
    # 已开启
    if _data == 1:
        return

    _ghlist = []
    for i in _data['guild']:
        _ghlist.extend(_data['guild'][i])

    # 不满数量条件
    if len(_ghlist) < g.GC['guildcompeting']['base']['cond']['guild_num']:
        return

    g.crossDB.update('competing_signup', {'season': _season}, {'open': 1})

    print 'competing_chkopen end ...'

if __name__ == '__main__':
    proc(1,2)
    # g.crossMC.flush_all()bingo('item','2012',99999)
    # _all = g.mdb.find('gonghui',{})
    # g.crossDB.update('competing_signup',{'season':1},{'$push':{'guild.0':{'$each':map(lambda x:str(x['_id']), _all)}}})