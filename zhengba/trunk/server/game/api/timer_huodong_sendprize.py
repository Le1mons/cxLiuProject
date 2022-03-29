#coding:utf-8
#!/usr/bin/python

'''
    活动 - 每周发送奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'huodong_sendprize start ...'
    # 周常活动的奖励
    g.m.huodongfun.timer_sendPrize(14)
    # 两个礼包
    for htype in (34, 35):
        g.m.huodong.bravegiftbag_35.timer_sendPrize(htype)
    # 龙骑试炼
    for i in g.mdb.find('hdinfo', {'htype': 46, 'rtime': {'$gt': g.C.NOW()}, 'stime': {'$lt': g.C.NOW()}},fields=['_id','hdid','data']):
        g.m.huodong.dragonknight_trial_46.timer_sendPrize(i)
    print 'huodong_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)