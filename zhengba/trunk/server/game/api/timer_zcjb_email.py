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
    print 'zcjb_email start ...'
    # 招财进宝
    g.m.zhaocaijinbao20.timer_sendPrize()
    print 'zcjb_email finished ...'

if __name__ == '__main__':
    proc(1,2)