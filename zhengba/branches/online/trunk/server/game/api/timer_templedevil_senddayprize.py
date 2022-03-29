#coding:utf-8
#!/usr/bin/python

'''
    月卡——每日奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'templedevil_senddayprize start ...'
    _nt = g.C.NOW()
    _temp = g.m.gameconfigfun.getGameConfigByDate({'ctype': 'templedevil_dayprize'})
    if _temp or g.C.HOUR() != 22:
        print 'temp:{0} hour:{1}'.format(bool(_temp), g.C.HOUR())
        return

    _list = g.m.devilfun.timer_senddayprize()
    g.mdb.update('gameconfig',{'ctype': 'templedevil_dayprize'}, {'v': _list,'lasttime':_nt},upsert=True)
    print 'templedevil_senddayprize finished ...'

if __name__ == '__main__':
    proc(1,2)