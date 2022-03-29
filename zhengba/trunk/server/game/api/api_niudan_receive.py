#!/usr/bin/python
# coding:utf-8
'''
扭蛋活动 - 任务领取
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

    _taskID = str(data[0])

    _con = g.m.niudanfun.getCon()['task'][_taskID]
    _data = g.m.niudanfun.getData(uid, _hd['hdid'])
    # 任务没有完成
    if _data['task']['data'].get(_taskID, 0) < _con['pval']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 奖励已领取
    if _taskID in _data['task']['rec']["pt"] and _taskID in _data['task']['rec']["tq"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _taskID = str(data[0])
    _taskCon = g.m.niudanfun.getCon()
    _con = _taskCon['task'][_taskID]


    _otherP = []
    _yanhua = 0
    _data = _chkData["data"]

    _prize = []
    # 记录任务领奖
    if _taskID not in _data["task"]["rec"]["pt"]:
        _data["task"]["rec"]["pt"].append(_taskID)
        _prize += _con["ptprize"]

    if _taskID not in _data["task"]["rec"]["tq"] and _data["tq"]:
        _data["task"]["rec"]["tq"].append(_taskID)
        _prize += _con["tqprize"]

    # 设置任务领奖
    g.m.niudanfun.setData(uid, _chkData['hdid'], {'task': _data["task"]})
    _send = g.getPrizeRes(uid, _prize, {'act': 'niudanhd_recieve', 'taskid':_taskID})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    _data = [1]
    g.debugConn.argv = _data
    g.debugConn.run()