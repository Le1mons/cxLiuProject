#coding:utf-8
#!/usr/bin/python

'''
    双11——奖池邮件
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'double11_prize start ...'
    g.m.gongpingjjcfun.timer_sendPrize()
    print 'double11_prize finished ...'

if __name__ == '__main__':
    proc(1,2)