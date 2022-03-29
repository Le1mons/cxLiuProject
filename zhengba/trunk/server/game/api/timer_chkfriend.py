#!/usr/bin/env python
#coding:utf-8

'''
检测最近登陆的好友
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

def proc(arg, kwarg):
    print 'chkfriend open......'
    _users = g.m.devilfun.GATTR.getOne({'ctype': 'friends', 'uid': 'SYSTEM'},keys='_id,v')
    if not _users or not _users['v']:
        return

    _allUser = g.mdb.find('userinfo', {'uid': {'$in': _users['v']},
                                       'logintime':{'$gte':g.C.NOW()-24*3600},
                                       'friendnum':{'$lt': g.GC['friend']['base']['friendmaxnum']}},fields=['_id','uid'])
    if _allUser:
        g.m.devilfun.GATTR.setAttr("SYSTEM", {'ctype': 'friends'}, {'v': map(lambda x:x['uid'], _allUser)})

    print 'chkfriend end......'



if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
