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
    if _num < 200000:
        return

    sid = g.getSvrIndex()
    _users = g.crossDB.find('jjcdefhero',{'sid':sid,'lv':{'$lt':30}},fields=['_id','uid'])
    if not _users:
        return

    _delUsers = g.mdb.find('userinfo',{'uid':{'$in':map(lambda x:x['uid'],_users)},'logintime':{'$lt':g.C.NOW() - 7*3600*24}},fields=['_id','uid'])
    if not _delUsers:
        return

    g.crossDB.delete('jjcdefhero', {'sid': sid, 'lv': {'$lt': 30},'uid':{'$in':map(lambda x:x['uid'],_delUsers)}})

    print 'crossserver_chkdata end ...'

if __name__ == '__main__':
    proc(1,2)