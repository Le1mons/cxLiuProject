#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g

'''
活动 - 打开活动子列表
'''


def proc(conn,data):
    """
    获取单独的活动数据


    :param data: list [hdid] 活动唯一hdid
    :return:
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    hdid = int(data[0])
    #获取已开启的活动列表
    _hdList = g.m.huodongfun.getOpenList(uid, 1,isxianshi=0)
    #活动未开放无法获取列表
    if hdid not in _hdList:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_nohuodong')
        return (_res)

    #获取活动返回的数据,每个活动单独逻辑去做
    _rdata = g.m.huodongfun.getHuodongData(uid, hdid)
    #子逻辑有错误判断
    if "errmsg" in _rdata:
        return (_rdata)

    _res["d"] = _rdata
    return (_res)

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [3100])