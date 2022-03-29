#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-势力转盘日志
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'str'>	说明:
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "zhuanpanlog": [
                            {
                                "uid": "0_5ec48aad9dc6d640cc8ef26b", 
                                "prize": [
                                    {
                                        "a": "attr", 
                                        "t": "rmbmoney", 
                                        "n": 5
                                    }
                                ], 
                                "name": "temp_b8c8c1b4", 
                                "time": 1591105096
                            }
                        ]
                    }
                }
            }
        ]
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # # 判断是否在活动持续时间段内
    # if not g.m.gonghuisiegefun.chkOpen():
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-2')
        return _chkData

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 玩家数据
    _zhuanPanLog = g.m.gonghuisiegefun.getZhuanPanLog(uid)
    _resData["zhuanpanlog"] = _zhuanPanLog

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)