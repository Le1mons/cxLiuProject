#!/usr/bin/python
# coding:utf-8
'''
征讨令 - 重置
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d':{
            'lv': 战旗等级,
            'endtime': 结束时间,
            'prize':{"第一天":{‘base’:[基础奖励],'jinjie':[进阶奖励]}},
            'exp': 战旗经验,
            'receive':{'base':[已领取的等级],'jinjie':[已领取进阶奖励的等级]},
            'buytime':可以购买经验得时间戳,
            'jinjie':是否进阶了
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _res = {}
    _con = g.GC['zhengtao']['base']
    # 开区8天后才能进来
    if g.getOpenDay() < _con['openday']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res
    # 判断是否达到重置逻辑
    _flag = g.m.zhengtaofun.getZhengtaoData(uid)
    # 判断今天是第几天
    _nt = g.C.NOW()
    _ctime = _flag["ctime"]
    _day = g.C.getDateDiff(_ctime, _nt) + 1
    _resetNum = _con["resetnum"]
    if _flag and _day < _resetNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_valerr')
        return _res

    _res['flag'] = _flag

    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData


    # 重置
    _flag = g.m.zhengtaofun.getZhengtaoData(uid, 1)
    _flag['paycon'] = g.m.payfun.getPayCon("paycon")[g.getGameVer()]['zhengtao_128']
    _res['d'] = _flag
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])