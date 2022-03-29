#coding:utf-8
#!/usr/bin/python

'''
    活动 - 每周发送奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'xszm_sendprize start ...'
    # 限时招募 只发500分以上的奖励
    g.m.xszmfun.timer_sendPrize(31)
    print 'xszm_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)