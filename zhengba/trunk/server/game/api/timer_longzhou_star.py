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
    print 'longzhou start ...'
    g.m.longzhoufun.timer_longzhou_star()
    print 'longzhou end ...'

if __name__ == '__main__':
    proc(1,2)