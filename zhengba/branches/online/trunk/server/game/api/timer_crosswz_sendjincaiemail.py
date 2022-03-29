#coding:utf-8
#!/usr/bin/python

'''
	发送竞猜开始的通知邮件
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(arg,karg):
    g.m.crosswzfun.sendWangzheJingcaiEmail()


if __name__ == "__main__":
    # print getDbqbCon()
    print proc([],{})