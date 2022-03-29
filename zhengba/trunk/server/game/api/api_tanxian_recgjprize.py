#!/usr/bin/python
# coding: utf-8
'''
探险——领取挂机奖励
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d":{
            'prize':[]
        }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    #挂机时间
    _gjData = g.m.tanxianfun.getGuaJiTimeData(uid)
    #获取挂机奖励
    _gjPrize = g.m.tanxianfun.getGuaJiPrize(uid,_gjData,1)
    if len(_gjPrize) == 0:
        #无挂机奖励
        _res['s'] = -1
        _res['errmsg'] = g.L('tanxian_recgjprize_-1')
        return _res
    
    #挂机奖励领取积分不能超过上限
    _maxJiFen = g.GC['tanxiancom']['base']['maxjifen'] + g.m.vipfun.getTeQuanNumByAct(uid,'MAXJIFEN')
    gud = g.getGud(uid)
    _prize = []
    for d in _gjPrize:
        if d['a'] == 'attr' and d['t'] == 'jifen':
            _defJiFen = _maxJiFen - gud['jifen']
            if _defJiFen <= 0:
                continue
            #增加值不能超过最大差值
            if _defJiFen < d['n']:d['n'] = _defJiFen
            _prize.append(d)
            continue

        _prize.append(d)

    _prize = g.m.tanxianfun.getXSHDprize(_prize, _gjData)

    #清空已挂机时长
    g.m.tanxianfun.clearGuaJiTime(uid)
    #获取奖励
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'tanxian_recgjprize'})
    _r = g.sendChangeInfo(conn,_prizeRes)
    # 监听探险收益
    g.event.emit('dailytask', uid, 10)
    # g.m.taskfun.chkTaskHDisSend(uid)
    _resData = {}
    _resData['prize'] = _prize
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("jingqi_2109091623529074")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5aec5828625aee63808d3114"])