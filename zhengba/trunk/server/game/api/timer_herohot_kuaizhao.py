#coding:utf-8
#!/usr/bin/python

'''
    英雄人气快照
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'herohot_kuaizhao start ...'
    g.m.herohotfun.timer_herohot_kuaizhao()
    print 'herohot_kuaizhao finished ...'

if __name__ == '__main__':
    proc(1,2)