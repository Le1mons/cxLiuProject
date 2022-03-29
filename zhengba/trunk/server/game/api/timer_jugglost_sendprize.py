#coding:utf-8
#!/usr/bin/python

'''
   剑圣迷踪
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'jugglost_sendprize start ...'
    g.m.jugg_lost_52.timer_sengPrize()
    g.m.jugg_trial_50.timer_sendPrize()
    print 'jugglost_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)