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
    print 'midautumn2fun_sendprize start ...'
    g.m.midautumn2fun.timer_lottery_sendPirze()
    print 'midautumn2fun_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)