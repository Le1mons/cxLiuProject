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
    print 'herohot_tishi start ...'
    g.m.herohotfun.timer_herohot_tishi()

    # g.m.niudanfun.timer_niudan_tishi()
    print 'herohot_tishi finished ...'

if __name__ == '__main__':
    proc(1,2)