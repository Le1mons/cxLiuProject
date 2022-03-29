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
    print 'dayueka_prize start ...'
    _nt = g.C.NOW()
    _temp = g.m.gameconfigfun.getGameConfigByDate({'ctype': 'dayueka_prize'})
    _w = {'ctype': 'yueka_da', 'v.isjh': 1, 'v.nt': {'$lt': _nt}}
    _data = g.mdb.find('playattr', _w)
    if _temp or not _data or g.C.HOUR() != 0:
        print 'temp:{0} data:{1} hour:{2}'.format(bool(_temp), bool(_data), g.C.HOUR())
        return

    _list = g.m.vipfun.dayueka_sendPrize(_data)
    g.mdb.update('gameconfig',{'ctype': 'dayueka_prize'}, {'v': _list,'lasttime':_nt},upsert=True)
    print 'dayueka_prize finished ...'

if __name__ == '__main__':
    proc(1,2)