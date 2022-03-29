#!/usr/bin/python
# coding:utf-8


'''
    自动化测试-使用定时器
'''

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g



def proc(conn, data, key=None):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
def doproc(conn, data):
    _res = {'s': 1}
    print data
    # 设置需要达到的时间戳
    _nt = int(data[0])
    _timerName = str(data[1])
    args = data[2]
    kargs = data[3]

    if g.conf['VER'] != 'debug':
        _res["s"] = -1
        _res["errmsg"] = g.L('global_nohuodong')
        return _res

    # 修改时间
    g.set_override_time(_nt)
    # 执行定时器
    procfun = __import__("timer_{}".format(_timerName))

    procfun.proc(args,kargs)

    _res['d'] = {"nownt":g.C.getDate()}
    return _res

if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [g.C.NOW(), "lianhunta_creationguanka", [], {}])
