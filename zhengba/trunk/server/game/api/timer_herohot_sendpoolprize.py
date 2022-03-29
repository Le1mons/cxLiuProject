#coding:utf-8
#!/usr/bin/python

'''
    英雄奖池发奖
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'herohot_sendPoolPrize start ...'
    g.m.herohotfun.timer_herohot_sendPoolPrize()
    print 'herohot_sendPoolPrize finished ...'

if __name__ == '__main__':
    proc(1,2)