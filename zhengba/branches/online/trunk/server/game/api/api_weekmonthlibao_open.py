# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/6/16:14

d {'rtime':12313,'items':[{'num':3}, ...]}

'''

import sys

sys.path.append('..')

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    uid = conn.uid
    _res = {"s": 1}
    key = str(data[0])

    res = g.m.weekmonthlibaofun.getWMLiBao(uid,key)
    # 周期结束
    nt = g.C.NOW()
    if nt > res['et']:
        res = g.m.weekmonthlibaofun.initData(uid,key)



    _res["d"]  = res
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print proc(g.debugConn, ['month'])
