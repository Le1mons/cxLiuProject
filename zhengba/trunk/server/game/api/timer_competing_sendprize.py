#!/usr/bin/python
#coding:utf-8

# 公会争锋 发送赛季奖励
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'competing_sendprize start ...'

    _season = g.m.competingfun.getSeasonNum()
    _data = g.crossDB.find1('competing_signup',{'season': _season}, fields=['_id','guild','open','matched'])
    # 未开启
    if not _data or (_data and not _data.get('open')):
        print 'competing is no open......'
        return

    _tmep = g.mdb.find1('gameconfig',{'ctype':'competing_sendprize','season':_season})
    if _tmep:
        print 'season:{} prize is send......'.format(_season)
        return

    _res = g.m.competingfun.timer_sendweekprize(_season)

    g.mdb.update('gameconfig',{'ctype':'competing_sendprize'},{'v':_res,'ctime':g.C.NOW(),'season':_season},upsert=True)
    print 'competing_sendprize end ...'

if __name__ == '__main__':
    proc(1,2)