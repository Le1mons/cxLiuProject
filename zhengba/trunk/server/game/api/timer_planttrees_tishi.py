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
    print 'planttrees_tishi start ...'
    g.m.planttreesfun.timer_planttrees_tishi()
    g.m.qixifun.timer_qixi_tishi()
    print 'planttrees_tishi finished ...'

if __name__ == '__main__':
    proc(1,2)