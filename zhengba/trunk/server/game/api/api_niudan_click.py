#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 点击
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "attrchange": {
                    "rmbmoney": 1000064411
                }
            }, 
            {
                "": {
                    "s": 1, 
                    "d": {
                        "myinfo": {
                            "libao": {}, 
                            "task": {
                                "rec": {
                                    "pt": [
                                        "1"
                                    ], 
                                    "tq": [
                                        "1"
                                    ]
                                }, 
                                "data": {
                                    "1": 1
                                }
                            }, 
                            "finishtask": {}, 
                            "tq": 0, 
                            "date": "2021-02-23", 
                            "niudan": {
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
                            "duihuan": {}
                        }, 
                        "prize": [
                            {
                                "a": "attr", 
                                "t": "rmbmoney", 
                                "n": 10
                            }, 
                            {
                                "a": "attr", 
                                "t": "rmbmoney", 
                                "n": 10
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
    _num = int(data[0])

    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _num = int(data[0])
    g.m.niudanfun.setData(uid, _chkData['hdid'],  {"$inc": {"click": _num}})

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = [1]
    g.debugConn.argv = _data
    g.debugConn.run()