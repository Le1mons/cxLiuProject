# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/15:50

小月卡

钱数够
时间是当月内
有次数

'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'isjh': 是否激活,'nt':激活时间,'act':今天能否领取},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    key = str(data[0])
    _nt = g.C.NOW()
    con = g.m.yuekafun.getCon(key)
    yuekaInfo = g.m.yuekafun.getYueKaInfo(uid,key)

    # 累计充值不够
    if con['maxmoney'] > yuekaInfo['rmbmoney']:
        _res["s"] = -1
        _res["errmsg"] = g.L("yueka_money-1")
        return (_res)


    # 时间不再当月内
    ykzt = yuekaInfo['nt']
    nt = g.C.NOW()
    # ykzt = g.C.ZERO(yknt)
    day = con['day']
    endtime = ykzt + 3600* 24 * day
    # 时间不在当月内
    if not (ykzt <= nt <= endtime):
        _res["s"] = -3
        _res["errmsg"] = g.L("yueka_getprize_res_-3")
        return _res


    # 月卡次数限制
    # ykget = yuekaInfo["lqnum"]
    # if ykget <= 0:
    #     _res["s"] = -2
    #     _res["errmsg"] = g.L("yueka_getprize_res_-2")
    #     return _res

    yuekaInfo["lqnum"] -= 1
    if yuekaInfo["lqnum"] < 0:
        yuekaInfo["lqnum"] = 0

    zt = g.C.ZERO(nt)
    # 当天是否领取
    # if yuekaInfo['lqtime'] < zt or yuekaInfo['lqtime'] > zt + 3600*24:
    if (zt < yuekaInfo['lqtime'] < zt + 3600*24):
        _res["s"] = -1
        _res["errmsg"] = g.L("yueka_getprize_res_-1")
        return _res

    yuekaInfo['lqtime'] = nt

    # nt = g.C.NOW()
    # # ykzt = g.C.ZERO(yknt)
    # ykzt = yuekaInfo['nt']
    # day = con['day']
    # ykZtEndTime = ykzt + 3600* 24 * (day-1)
    # ytEndNt = yknt + 3600* 24 * (day-1)
    # ykEndTime = ykzt + 3600* 24 * (day-1)
    # # 周期时间
    # enddaytime = (ykZtEndTime <= ytEndNt <= ykEndTime)
    #
    # if yuekaInfo["lqnum"] == 0 and enddaytime:
    #     yuekaInfo['nt'] = nt
    #     yuekaInfo['rmbmoney'] = 0

    #领取奖励
    prize = list(con['prize'])

    changeInfo = g.getPrizeRes(uid, prize, {'act': key})
    g.sendChangeInfo(conn, changeInfo)
    # yuekaInfo["isjh"] = 1
    ctype = 'yueka_' + key
    g.setAttrByCtype(uid, ctype, yuekaInfo, default={}, bydate=False, valCall='update')

    _res["d"] = yuekaInfo
    return _res
if __name__ == "__main__":
    uid = g.buid('lsq5555')
    # g.debugConn.uid = "0_5aea81d0625aee4a04a0146d"
    g.debugConn.uid = uid
    print doproc(g.debugConn,['da'])

