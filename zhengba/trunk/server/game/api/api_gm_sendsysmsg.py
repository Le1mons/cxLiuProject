#!/usr/bin/env python
#coding:utf-8

'''
    后台直接发送系统消息
'''

import sys
sys.path.append('..')

import g,hashlib


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def doproc(conn, data):
    _res = {'s':1}

    msg = str(data[0])
    time = str(data[1])
    md5 = str(data[2])

    api_key = g.conf['APIKEY']
    src = api_key + time
    cal_md5 = hashlib.md5(src).hexdigest()
    if cal_md5 != md5:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_md5_error')
        return _res

    _nt = g.C.NOW()
    if len(data)>3:
        stime = int(data[3])
        etime = int(data[4])
        intervals = int(data[5])
        _data = {
            'ctime': _nt,
            'stime': stime,
            'etime': etime,
            'msg': msg,
            'intervals': intervals
        }
        _id = str(g.mdb.insert('gmmessage', _data))
        _res['d'] = _id
        g.mc.delete('gmmessage')

    # 系统消息不过滤
    #g.m.chatfun.sendMsg(msg, 1, isfilter=1)
    return _res

if __name__ == '__main__':
    _nt = str(g.C.NOW())
    key = 'uutown123456'
    _src = key + _nt
    _md5 = hashlib.md5(_src).hexdigest()
    print _md5
    print doproc(g.debugConn, ['test',_nt,_md5, 1491876672, 1491963072, 300])