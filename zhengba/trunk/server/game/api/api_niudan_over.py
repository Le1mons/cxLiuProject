#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 结束扭蛋
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

    _nid = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.niudanfun.getData(uid, _hd['hdid'])
    # 判断是否之前
    if not _data["niudan"].get(_nid, {}):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    # 判断扭蛋是否已经结束
    if _data["over"].get(_nid, 0):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_none')
        return _chkData


    # 判断是否已经达到结束条件
    niudan = _hd["data"]["niudan"][_nid]
    _goodIdx = -1
    for idx, v in enumerate(niudan):
        if v["good"] == 1:
            _goodIdx = idx
            break

    # 如果没有抽到终极大奖
    if str(_goodIdx) not in _data["niudan"][_nid]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_none')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    _chkData["nid"] = _nid
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _nid = str(data[0])
    _data = _chkData["data"]
    _data["over"][_nid] = 1

    # 设置任务领奖
    g.m.niudanfun.setData(uid, _chkData['hdid'], {'over': _data["over"]})

    _res['d'] = {"myinfo":g.m.niudanfun.getData(uid, _chkData['hdid'])}

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = [2]
    g.debugConn.argv = _data
    g.debugConn.run()