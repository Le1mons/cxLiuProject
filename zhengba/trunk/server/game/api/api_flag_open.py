#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int]
    :return:
    ::

        {'d':{
            'lv': 战旗等级,
            'endtime': 结束时间,
            'prize':{"第一天":{‘base’:[基础奖励],'jinjie':[进阶奖励]}},
            'exp': 战旗经验,
            'receive':{'base':[已领取的等级],'jinjie':[已领取进阶奖励的等级]},
            'addtime':增加经验的周期数,
            'jinjie':是否进阶了
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 开区时间在规定之后
    if g.getGud(uid)['ctime'] >= g.GC['flag']['base']['timestamp']:
        if g.getOpenDay() < 8:
            _res['s'] = -30
            _res['errmsg'] = g.L('global_noopen')
            return _res
    else:
        # 等级不足
        if not g.chkOpenCond(uid, 'flag'):
            _res['s'] = -3
            _res['errmsg'] = g.L('global_limitlv')
            return _res

    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv','endtime','prize','exp','receive','addtime','jinjie'])
    # 没有就根据建号时间 或者 功能上新生成
    _ctime = g.C.ZERO(g.C.NOW())
    if not _flag:
        _flag = g.m.flagfun.updateFlagData(uid, _ctime)
    # 重新轮回一次
    elif g.C.NOW() >= _flag['endtime']:
        # 发送未领取的奖励
        g.m.flagfun.sendEmail(uid, _flag)
        _flag = g.m.flagfun.updateFlagData(uid, _ctime, 1)

    _flag['paycon'] = g.m.payfun.getPayCon("paycon")[g.getGameVer()]['flag_198']
    _flag['rec'] = g.C.getWeekNumByTime(g.C.NOW()) != _flag.get('addtime', '')
    _flag['cd'] = g.C.getTimeDiff(_flag['endtime'], g.C.NOW(),0)
    _res['d'] = _flag
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])