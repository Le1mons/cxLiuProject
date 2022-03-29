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
    print 'planttrees_commonval start ...'
    g.m.planttreesfun.timer_planttrees_commonval()
    g.m.qixifun.timer_qixi_commonval()
    g.m.heropreheat_79.timer_heropreheat_commonval()
    print 'planttrees_commonval finished ...'

if __name__ == '__main__':
    proc(1,2)