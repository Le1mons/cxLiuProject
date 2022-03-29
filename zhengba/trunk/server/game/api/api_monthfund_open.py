#!/usr/bin/python
# coding:utf-8
'''
月基金——开启界面
'''
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')

import g

import huodong

def proc(conn, data):
    """

    :param conn:
    :param data: [活动id：int]
    :return:
    ::

        {"d": {'info':[{活动数据}], 'myinfo': 我的活动数据}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    # _res = {'s': 1}
    # uid = conn.uid
    # _hdid = int(data[0])
    # # 获取活动id
    # # _hdinfo = g.m.huodongfun.getMonthFundInfo(uid)
    # _hdInfoList = huodong.monthfund.getMonthFundInfo(uid, [_hdid])
    # # _hdInfoList = [tmp for tmp in _hdinfo if tmp['hdid'] == _hdid]
    # # if len(_hdInfoList) <= 0:
    # #     _res['s'] = -1
    # #     _res['errmsg'] = g.L('monthfund_open_-1')
    # #     return _res
    # # _hdInfoList = _hdInfoList[0]['data']
    # _rdata = g.m.monthfund.getOpenData(uid, _hdid)
    # _res["d"] = {'myinfo': _rdata}
    # return _res
    _res = {'s': 1}
    uid = conn.uid
    # 获取活动id
    _hdid = data[0]
    # _hdinfo = g.m.huodongfun.getMonthFundInfo(uid)
    _hdinfo = huodong.monthfund.getMonthFundInfo(uid)
    _hdInfoList = [tmp for tmp in _hdinfo if tmp['hdid'] == _hdid]
    if len(_hdInfoList) <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('monthfund_open_-1')
        return _res
    _hdInfoList = _hdInfoList[0]['data']
    _rdata = g.m.monthfund.getOpenData(uid, _hdid)
    _res["d"] = {'info': _hdInfoList, 'myinfo': _rdata}
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    # _r = doproc(g.debugConn, [170])
    # print _r
    g.mdb.update('blacklist',{'a.1':3},{'$push': {"a.$.3":30}})
