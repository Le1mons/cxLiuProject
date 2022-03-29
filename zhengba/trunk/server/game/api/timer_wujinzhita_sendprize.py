#coding:utf-8
#!/usr/bin/python

'''
    英雄提示
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'wujinzhita start ...'
    g.m.wujinzhitafun.timer_sendRankPrize()
    print 'wujinzhita end ...'

if __name__ == '__main__':
    proc(1,2)