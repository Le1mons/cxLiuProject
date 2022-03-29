#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn: 
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "myinfo": {
                            "libao": {}, 礼包数据
                            "task": {
                                "rec": {
                                    "pt": [], 普通奖励领取情况
                                    "tq": []   特权奖励领取情况
                                }, 
                                "data": {
                                    "1": 1  任务进度
                                }
                            },
                            "tq": 0,  特权
                            "date": "2021-02-23", 
                            "niudan": {   扭蛋数据
                                "1": {
                                    "1": 2, 
                                    "0": 1, 
                                    "3": 3, 
                                    "2": 2, 
                                    "5": 5, 
                                    "4": 4
                                }, 
                                "2": {
                                    "1": 2, 
                                    "0": 1, 
                                    "3": 2, 
                                    "2": 2, 
                                    "5": 2, 
                                    "4": 1
                                }
                            }, 
                            "duihuan": {}  兑换数据
                        }
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

    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _res['d'] = {"myinfo":g.m.niudanfun.getData(uid, _chkData['hdid']), "info": _chkData["hdinfo"]}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = []
    g.debugConn.argv = _data
    g.debugConn.run()