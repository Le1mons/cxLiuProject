#coding:utf-8
#!/usr/bin/python

'''
    自由竞技场 - 每天21点发奖
    功能：
    1， 根据排名发送每日奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'zypkjjc_dayprize start ...'
    _w = {'ctype': 'zypkjjc_dayprize'}
    _data = g.mdb.find1('gameconfig', _w)
    _nt = g.C.NOW()
    # 如果数据已存在 或者 时间不到晚上9点 或者是同一天
    if (_data and g.C.chkSameDate(_data['lasttime'], _nt)) or g.C.HOUR() != 21:
        print 'data:{0} hour:{1} nt:{2}'.format(bool(_data), g.C.HOUR(), _nt)
        return

    _res = g.m.zypkjjcfun.timer_sendEveryPrize()
    g.mdb.update('gameconfig', _w, {'v':_res,'lasttime':_nt},upsert=True)
    print 'zypkjjc_dayprize finished ...'

if __name__ == '__main__':
    proc(1,2)