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
    print 'planttrees_sendprize start ...'
    g.m.planttreesfun.timer_planttrees_sendprize()
    g.m.qixifun.timer_qixi_sendprize()
    g.m.herothemefun.timer_sendRankPrize()

    print 'planttrees_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)