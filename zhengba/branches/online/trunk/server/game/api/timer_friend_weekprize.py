#coding:utf-8
#!/usr/bin/python

'''
    好友探宝 - 每个星期日24点发奖
    功能：
    1， 根据排名发送每周赛季奖励
'''
import sys

sys.path.append('..')
import g

def proc(arg,karg):
    print 'friend_weekprize start ...'
    _nt = g.C.NOW() - 24*60*60
    # 每周一发奖励    当前时间需要减一天获取上周标识
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'friend_weekprize','k':_dKey}
    _data = g.mdb.find1('gameconfig', _w)
    _nt = g.C.NOW()
    # 如果数据已存在 或者 时间不到晚上24点
    if _data or g.C.HOUR() != 0 or g.C.WEEK(_nt) != 1:
        print 'data:{0} hour:{1} week:{2}'.format(bool(_data), g.C.HOUR(), g.C.WEEK(_nt))
        return

    del _w['k']
    _data = g.m.friendfun.timer_sendWeekPrize()

    g.mdb.update('gameconfig',_w,{'lasttime': _nt,'v':_data,'k':_dKey},upsert=True)
    # 发送奖励后清空数据
    g.mdb.update('playattr',{'ctype':'friend_jifen'},data={'v':0})
    print 'friend_weekprize finished ...'

if __name__ == '__main__':
    proc(1,2)