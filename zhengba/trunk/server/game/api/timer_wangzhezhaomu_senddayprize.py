#coding:utf-8
#!/usr/bin/python

'''
   王者招募
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'wangzhezhaomufuntodaySendPrize start ...'
    g.m.wangzhezhaomufun.timer_todaySendPrize()
    print 'wangzhezhaomufuntodaySendPrize finished ...'

if __name__ == '__main__':
    proc(1,2)