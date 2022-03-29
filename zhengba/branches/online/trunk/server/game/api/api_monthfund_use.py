#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g
import huodong

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 获取活动id
    hdid = data[0]
    # _res = g.m.monthfund.getPrize(uid, hdid)
    _res = huodong.monthfund.getPrize(uid, hdid)
    if _res['s'] == 1 and 'd' in _res:
        if 'cinfo' in _res['d']:
            g.sendChangeInfo(conn, _res['d'].pop('cinfo'))

    return _res

if __name__ == '__main__':
    uid = g.buid('liu9104')
    g.debugConn.uid = uid
    _r = doproc(g.debugConn, [170])
    print _r

