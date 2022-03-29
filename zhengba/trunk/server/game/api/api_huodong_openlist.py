#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")


import g

'''
活动 - 打开活动列表
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    # 活动的显示类型 默认是之前的活动 weixin是微信红包活动
    hdvtype = ""
    if len(data) == 1:
        hdvtype = str(data[0])
    _hdList = g.m.huodongfun.getOpenList(uid,hdvtype=hdvtype)

    _reshdList = []
    for hd in _hdList:
        # 月基金不在活动中显示
        if hd['htype'] == 170:
            continue
        _reshdList.append(hd)

    _hdList = _reshdList

    _hdList = sorted(_hdList, key=lambda e: e.get('hdid',0))
    _hdList.sort(cmp=lambda x,y: cmp(int(x.get("order", 0)),int(y.get("order", 0))))
    _res["d"] = _hdList

    g.event.emit("checkHongdian", uid, g.m.huodongfun.getFunctionName())
    return _res


if __name__ == "__main__":
    uid = g.buid('yyw')
    g.debugConn.uid = uid
    a = doproc(g.debugConn, [])
    print a