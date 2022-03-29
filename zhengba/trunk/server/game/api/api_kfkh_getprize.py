#!/usr/bin/python
# coding:utf-8
'''
开服狂欢 - 领取奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("game")
    sys.path.append("..")
import g



def proc(conn, data):
    """

    :param conn:
    :param data: [天数:int, 活动的id:int]
    :return:
    ::

        {"d": {"finipro": 完成数量百分比}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkRes = g.m.kfkhfun.checkIsOpen(uid)
    # 活动已结束
    if not _chkRes:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_hdnoopen')
        return _res

    _day = int(data[0])
    _hdid = int(data[1])
    # 没有达到可领取的天数
    if _day > g.m.kfkhfun.getKfkhDay(uid):
        _res["s"] = -1
        _res["errmsg"] = g.L('global_hdnoopen')
        return _res

    # 首充单独处理
    if _day > g.m.kfkhfun.getKfkhDay(uid) and _hdid == 2:
        _res["s"] = -6
        _res["errmsg"] = g.L('kfkh_getprize_res_-6')
        return _res

    # 获取开服狂欢数据
    _kfkhData = g.m.kfkhfun.getKfkhData(uid, where={"hdid": _hdid})
    # 没有数据,无法领取
    if len(_kfkhData) == 0:
        _res["s"] = -2
        _res["errmsg"] = g.L('kfkh_getprize_res_-2')
        return _res

    # 获取配置
    _hdCon = g.m.kfkhfun.getKFKHcon(_day, _hdid)
    _kfkhData = _kfkhData[0]
    # 未达成条件,无法领取
    if _kfkhData["nval"] < _hdCon["pval"]:
        _res["s"] = -3
        _res["errmsg"] = g.L('kfkh_getprize_res_-3')
        return _res

    # 已完成过无法重复完成
    if _kfkhData["finish"] == 1:
        _res["s"] = -4
        _res["errmsg"] = g.L('kfkh_getprize_res_-4')
        return _res

    gud = g.getGud(uid)
    # vip不足,无法领取
    if gud["vip"] < _hdCon["needvip"]:
        _res["s"] = -5
        _res["errmsg"] = g.L('kfkh_getprize_res_-5')
        return _res

    # 检测消耗
    if len(_hdCon["need"]) > 0:
        _need = list(_hdCon["need"])
        _sale = _hdCon["needsale"]
        if _sale == 0: _sale = 10
        for ele in _need:
            ele['n'] *= _sale * 0.1

        _chkRes = g.chkDelNeed(uid, _need)
        if not _chkRes['res']:
            if _chkRes['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chkRes['t']
            else:
                _res["s"] = -104
                _res[_chkRes['a']] = _chkRes['t']
            return _res

        # 扣除消耗
        _sendData = g.delNeed(uid, _need,logdata={'act':'kfkh_getprize'})
        g.sendChangeInfo(conn, _sendData)


    # 设置数据
    g.m.kfkhfun.setKfkhData(uid, {"hdid": _hdid}, {"finish": 1})
    # 设置统计数据  方便kfkh排行显示
    _count = g.mdb.count('kfkhdata',{'uid':uid,'finish':1})
    g.m.statfun.setStat(uid,'kfkh_count',{'v':_count})
    # 获取奖励
    _prizeRes = g.getPrizeRes(uid, _hdCon["p"], {"act": "kfkhget", "day": _day, "hdid": _hdid})
    g.sendChangeInfo(conn, _prizeRes)
    _finishNum = g.m.kfkhfun.getFinishNum(uid)
    _res["d"] = {"finish": 1, 'finipro': _finishNum}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2,13])