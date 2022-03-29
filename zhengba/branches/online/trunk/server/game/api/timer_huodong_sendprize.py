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
    print 'huodong_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)