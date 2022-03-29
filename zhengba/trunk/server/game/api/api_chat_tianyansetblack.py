#!/usr/bin/python
# coding:utf-8

'''
聊天 - 天眼系统接口 设置聊天屏蔽
'''

if __name__ == '__main__':
    import sys

    sys.path.append('..')
    sys.path.append('game')

import g
import hashlib


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# @g.apiCheckLogin
def doproc(conn, data):
    res = {"s": 1}
    # uid = conn.uid

    playerId = str(data[0])     # 游戏角色ID binduid
    userId = str(data[1])       # 用户ID uid
    zoneId = str(data[2])       # 服务器环境标识 sid
    serverId = str(data[3])     # 区服ID 这里是指游戏里面选择的区服 sid
    time = int(data[4])         # 禁言时长(分钟)
    sign = str(data[5])         # 签名

    uid = userId

    print "tianyansetblack begin.........................", uid

    tanYanId = "\x5a\x3b"
    m = hashlib.md5()
    m.update(tanYanId + playerId + userId + zoneId + serverId + str(time))
    chkSign = m.hexdigest()
    if chkSign != sign:
        res["s"] = -1
        res["errmsg"] = g.L("global_argserr")
        return res

    nt = g.C.NOW()
    # 全频道禁封
    for i in (2,):
        setData = {
            'ctype': i,
            'etime': nt + time * 600,
            'uid': uid,
            'lasttime': nt
        }
        g.mdb.update("blacklist", {'uid': uid, 'ctype': i}, setData, upsert=True)

    g.crossDB.update('hero_comment', {}, {'$pull': {'comment': {'headdata.uid': userId}}})

    return res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid("liu1")

    g.debugConn.uid = uid
    a = doproc(g.debugConn, ["liu1", "0_5cf1294e9dc6d66532dd4976", "0", "0", 5, "WjtsaXUxMF81Y2YxMjk0ZTlkYzZkNjY1MzJkZDQ5NzYwMDU="])

    pprint(a)
