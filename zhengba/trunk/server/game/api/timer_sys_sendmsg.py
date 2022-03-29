#!/usr/bin/python
#coding:utf-8

'''
    积分赛发消息
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
import g

def proc(arg,karg):
    _nt = g.C.NOW()
    _info = g.mdb.find('gmmessage',{'stime':{"$lte":_nt},'etime':{'$gte':_nt}},fields=['msg','intervals','lasttime'])
    if not _info:
        return
    _tidList = []
    for i in _info:
        _cd = i['intervals']
        _lasttime = i.get('lasttime',0)
        if _lasttime + _cd > _nt:
            continue

        _tidList.append(i['_id'])
        g.m.chatfun.sendMsg(i['msg'], 2, ifcheck=0, ispmd=1)
    if not _tidList:
        return

    g.mdb.update('gmmessage', {'_id': {'$in': _tidList}},{'lasttime':_nt})

if __name__ == '__main__':
    proc(1,2)