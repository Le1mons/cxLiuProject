#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-战斗日志列表
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
                        "loglist": [
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176808
                            ], 
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176829
                            ], 
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176876
                            ], 
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176877
                            ], 
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176996
                            ], 
                            [
                                "3", 
                                "temp_b8c8c1b4", 
                                "大汉朝廷", 
                                "城池守卫", 
                                1591176997
                            ]
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

    # 今天领取的奖励下标
    _resData["loglist"] = g.m.gonghuisiegefun.getLog(uid)

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)