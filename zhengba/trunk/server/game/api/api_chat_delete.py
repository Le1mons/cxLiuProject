#!/usr/bin/python
# coding:utf-8
import g


'''
    删除聊天
'''


def proc(conn, data, key=None):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 删除的uid
    touid = str(data[0])
    # 如果是本服的
    if g.m.crosscomfun.chkIsThisService(touid):
        DB = g.mdb
    else:
        DB = g.crossDB
    _where = {'uid': uid, 'touid': touid}
    DB.delete('chat', _where)
    return _res
