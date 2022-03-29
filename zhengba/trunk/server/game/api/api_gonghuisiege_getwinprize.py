#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-领取每日奖励
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1: idx 必须参数	类型: <type 'str'>	说明: 领奖下标
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "attrchange": {
                    "rmbmoney": 100000999943060
                }
            }, 
            {
                "": {
                    "s": 1, 
                    "d": {
                        "prize": [
                            {
                                "a": "attr", 
                                "t": "rmbmoney", 
                                "n": 5
                            }
                        ], 
                        "winprize": [
                            1
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
    _idx = int(data[0])

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

    _task = _con["task"][_idx]
    # 获取今天胜场
    _winnum = g.m.gonghuisiegefun.getWinNum(uid)
    # 判断胜场数是否满足
    if _winnum < _task["pval"]:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gonghuisiege_getwinprize_res_-2')
        return _chkData

    # 今天领取的奖励下标
    _winprize = g.m.gonghuisiegefun.getWinPrize(uid)
    if _idx in _winprize:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('gonghuisiege_getwinprize_res_-3')
        return _chkData


    _chkData["winprize"] = _winprize
    _chkData["idx"] = _idx
    _chkData["task"] = _task
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

    _winprize = _chkData["winprize"]
    _idx = _chkData["idx"]
    _winprize.append(_idx)

    # 设置领奖记录
    g.m.gonghuisiegefun.setWinPrize(uid, _winprize)
    # 今天领取的奖励下标
    _resData["winprize"] = _winprize
    # 获取奖励
    _prize = _chkData["task"]["prize"]
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'gonghuisiege_getwinprize', 'idx': _idx})
    # 推送给前端
    g.sendChangeInfo(conn, _sendData)
    _resData["prize"] = _prize
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)