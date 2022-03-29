#!/usr/bin/python
# coding:utf-8
'''
开服狂欢 - 领取完成度奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g



def proc(conn, data):
    """

    :param conn:
    :param data: [索引：int]
    :return:
    ::

        {"d": {'recprize':[领取的索引]}
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
    #活动已结束
    if not _chkRes:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_hdnoopen')
        return _res

    _idx = int(data[0])
    #开服狂欢进度奖励配置
    _con = g.GC['kaifukuanghuan_extend']['base']['stageprize']
    if _idx < 0 or _idx >= len(_con):
        #领取参数有误
        _res["s"]=-1
        _res["errmsg"]=g.L('global_argserr')
        return _res

    #已经领取的奖励
    _uRecprize = g.m.kfkhfun.getFinishProPrize(uid)
    if _idx in _uRecprize:
        #奖励已领取
        _res["s"]=-2
        _res["errmsg"]=g.L('global_algetprize')
        return _res

    #完成度
    _uFinfshPro = g.m.kfkhfun.getFinishNum(uid)
    # _uFinfshPro = 100
    _recCon = _con[_idx]
    _needPro = _recCon[0]
    if _uFinfshPro < _needPro:
        #完成进度未达成
        _res["s"]=-3
        _res["errmsg"]=g.L('kfkh_recproprize_-3')
        return _res

    #设置已领取奖励
    _uRecprize.append(_idx)
    g.m.kfkhfun.setFinishProPrize(uid,_uRecprize)
    _prize = _recCon[1]
    _prizeMap = g.getPrizeRes(uid,_prize,{"act":"kfkh_recproprize","prize":_prize,'idx':_idx})
    g.sendChangeInfo(conn,_prizeMap)
    _rData = {}
    _rData['recprize'] = g.m.kfkhfun.getFinishProPrize(uid)
    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[3,1])