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
    print 'niudan_tishi start ...'
    g.m.niudanfun.timer_niudan_tishi()
    g.m.labourfun.timer_labour_tishi()
    g.m.longzhoufun.timer_longzhou_tishi()
    print 'niudan_tishi finished ...'

if __name__ == '__main__':
    proc(1,2)