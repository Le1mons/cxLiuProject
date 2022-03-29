#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-open
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'str'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "cityinfo": {   城市特殊掉落道具
                            "1": {
                                "a": "item", 
                                "t": "1042"
                            }
                        },
                        "assisted": "1",   集火的城市id
                        "winnum": 0,     今天胜场数
                        "winprize": []  领取奖励下标
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

    # 判断是否正在结算中
    _nt = g.C.NOW()
    _weekFirstTime = g.C.getWeekFirstDay(_nt)
    if _weekFirstTime + 0 <= _nt <= _weekFirstTime + 300:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gonghuisiege_fight_res_-1')
        return _chkData

    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('chat_global_nogonghui')
        return _chkData

    # 判断是否有防守阵容
    _zypkjjc = g.m.zypkjjcfun.getUserJJC(uid)
    if not _zypkjjc:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-3')
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
    # 获取城市特产数据
    _cityInfo = g.m.gonghuisiegefun.getCityInfo()
    # 玩家数据
    _myinfo = g.m.gonghuisiegefun.getUserData(uid)
    # 城市特产信息
    _resData["cityinfo"] = _cityInfo
    # 当前集火的城市
    _resData["assisted"] = g.m.gonghuisiegefun.getAssistedCity(uid)
    # # 玩家数据
    # _resData["myinfo"] = _myinfo
    # 今天胜场数
    _resData["winnum"] = g.m.gonghuisiegefun.getWinNum(uid)
    # 今天领取的奖励下标
    _resData["winprize"] = g.m.gonghuisiegefun.getWinPrize(uid)

    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    g.debugConn.uid = g.buid('0')
    print g.debugConn.uid
    _data = ['0_5aec54eb625aee6374e25dff']
    print doproc(g.debugConn,_data)