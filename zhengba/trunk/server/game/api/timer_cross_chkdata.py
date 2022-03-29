#!/usr/bin/python
#coding:utf-8

# 公会争锋--结算
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'crossserver_chkdata start ...'
    _num = g.crossDB.count('jjcdefhero')
    if _num < 100000:
        return

    # 小于50级  并且7天内没登陆
    _users = g.crossDB.find('cross_friend', {'$or':[{'head.lv': {'$lte': 50}, 'logintime': {'$lt': g.C.NOW() - 7 * 24 * 3600}},{'head.lv':{'$lte':30}}]},fields=['uid',"_id"])
    if _users:
        g.crossDB.delete('jjcdefhero', {'uid': {'$in': map(lambda x:x['uid'], _users)}})

    g.crossDB.delete('jjcdefhero', {'headdata.lv':{'$lte':30}})

    print 'crossserver_chkdata end ...'

if __name__ == '__main__':
    proc(1,2)