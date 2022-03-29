#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 重置
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [任务id:str]
    :return:
    ::

        {'d':{战旗信息参考open界面}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'flag'):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv','endtime','receive','jinjie','prize'])
    # 没有信息
    if not _flag:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['flag']['base']['recast']
    # 大于80j 且 剩余时间少于30天
    if _flag['lv'] < _con['lv'] or g.C.getTimeDiff(_flag['endtime'], g.C.NOW(),0)>_con['day']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 发送未领取的奖励
    g.m.flagfun.sendEmail(uid, _flag)
    # 没有就根据建号时间 或者 功能上新生成
    _ctime = g.C.ZERO(g.C.NOW())
    _flag = g.m.flagfun.updateFlagData(uid, _ctime, 1)

    _res['d'] = _flag
    return _res

if __name__ == '__main__':
    uid = g.buid("s50lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])