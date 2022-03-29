#!/usr/bin/python
# coding: utf-8
'''
探险——探险主界面信息
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d":{
            'gjtime':挂机时间
            'gjmapid':挂机地图id
            'gjprize':挂机奖励
            'freetxnum':当天可免费探险次数
            'maxbuytxnum':最大可购买探险次数
            'txnum':当天已经探险次数
            'passprizeidx':已领取的阶段奖励下标
            'isadventure':探险者特权
            'tqpasstime':探险过期时间
            'zchuodong':周常活动 探险先锋
            'isopen':限时掉落活动是否开启
        }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _main = g.m.tanxianfun.getTanXianMain(uid)
    _res['d'] = _main
    return _res

if __name__ == '__main__':
    uid = g.buid("14")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=["5aec5828625aee63808d3114"])
    g.mdb.update('hero',{'uid':uid,'star':6},{'dengjielv':9,'star':9,'lv':150})