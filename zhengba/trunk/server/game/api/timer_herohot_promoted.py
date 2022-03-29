#coding:utf-8
#!/usr/bin/python

'''
    英雄人气晋级
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'herohot_promoted start ...'
    g.m.herohotfun.timer_herohot_promoted()
    print 'herohot_promoted finished ...'

if __name__ == '__main__':
    proc(1,2)