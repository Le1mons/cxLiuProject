#!/usr/bin/python
#coding:utf-8


'''
活动 - 使用活动(领取/购买)
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")
import g

def proc(conn,data):
    """

    :param conn:
    :param data: [活动hdid:int, 动作 1领取，2购买:int, 奖励下标:int]
    :return:
    ::

        {'s': 1, 'd': {'prize':[]}
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    #活动id
    hdid = int(data[0])
    #动作 1领取，2购买
    act = int(data[1])
    #奖励下标
    idx = data[2]

    # 微信活动 兑换码字段
    wxcode = None
    if len(data) == 4:
        wxcode = data[3]

    #获取已开启的活动列表
    _hdList = g.m.huodongfun.getBaseOpenList(uid)
    _hdList = [tmp['hdid'] for tmp in _hdList if tmp['hdid'] == hdid]
    #活动未开放无法获取列表
    if hdid not in _hdList:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_nohuodong')
        return _res

    # 使用之前先检测是否需要重置
    g.m.huodongfun.getHuodongData(uid,hdid)

    #获取活动返回的数据,每个活动单独逻辑去做
    _rdata = g.m.huodongfun.getPrize(uid, hdid, act=act, idx=idx, wxcode=wxcode)
    #子逻辑有错误判断
    if "s" in _rdata and _rdata["s"]<=0:
        return _rdata

    #改变信息
    if "cinfo" in _rdata:
        _r = g.sendChangeInfo(conn,_rdata["cinfo"])
        del _rdata["cinfo"]

    _res["d"] = _rdata
    return _res


if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [12342423,"5","0", "1"])