#!/usr/bin/python
# coding: utf-8
'''
探险——快速挂机
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [地图id:int]
    :return:
    ::

        {"d":{
            'prize':[]
            'freetxnum':可免费快速次数
            'txnum':花消耗购买次数
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
    _con = g.GC['tanxiancom']['base']
    _txNum = 0
    #可免费快速次数
    _freeNum = g.m.tanxianfun.getCanFreeNum(uid)
    if _freeNum <= 0:
        #没有免费次数,根据当日探险次数获取花费
        _txNum = g.m.tanxianfun.getTXNum(uid)
        _maxNum = g.m.tanxianfun.getMaxTxNum(uid)
        if _txNum >= _maxNum:
            #已达购买次数上限
            _res['s'] = -1
            _res['errmsg'] = g.L('tanxian_fasttx_-1')
            return _res
        
        _need = _con['buynumneed'][_txNum]
        _chk = g.chkDelNeed(uid, _need)
        # 消耗不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res
        
        _sendData = g.delNeed(uid, _need,logdata={'act': 'tanxian_fasttx'})
        g.sendChangeInfo(conn, _sendData)
        #设置探险次数，也是购买次数
        g.m.tanxianfun.setTXNum(uid)
        _txNum += 1
        
    #扣除免费次数
    if _freeNum > 0:
        g.m.tanxianfun.setFreeTXNum(uid)
        _freeNum -= 1
        
    gud = g.getGud(uid)
    #当前挂机地图
    _mapid = str(gud['mapid'])
    #挂机时长
    _gjTime = _con['fastgjtime']
    #_gjData = {_mapid:_gjTime}
    _gjPrize = g.m.tanxianfun.getGuaJiPrize(uid,_gjTime,1)
    # 获取限时活动的奖励
    _gjPrize = g.m.tanxianfun.getXSHDprize(_gjPrize, _gjTime)
    _prizeRes = g.getPrizeRes(uid,_gjPrize,{'act':'fasttxprize'})
    _r = g.sendChangeInfo(conn,_prizeRes)
    _resData = {}
    _resData['prize'] = _gjPrize
    _resData['freetxnum'] = _freeNum
    _resData['txnum'] = _txNum
    _res['d'] = _resData
    # 神器任务
    g.event.emit('artifact', uid, 'kuaisu')
    # 日常任务监听
    g.event.emit('dailytask', uid, 16)
    # 周常活动红点
    if g.m.huodongfun.chkZCHDopen('tanxian'):
        g.m.huodongfun.setZCHDval(uid, 'tanxian')

    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '15')

    # 刷新答题事件
    g.m.eventfun.getTopicData(uid, True)

    # 团队任务
    g.m.teamtaskfun.setTeamTaskVal(uid, '5')

    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "114")

    # 51活动
    g.event.emit("labour", uid, "1")
    # 龙舟活动监听
    g.event.emit('longzhou', uid, "4")
    # 周年庆
    g.event.emit('ANNIVERSARY', uid, '2')
    # 英雄人气冲榜
    g.event.emit('herohottask', uid, '4')

    # 植树节活动
    g.event.emit('planttreeshd', uid, '3')
    g.event.emit('qixihd', uid, "3")
    g.event.emit('zhounian3', uid, "4")
    # 任务监听
    g.m.huodongfun.event(uid, 'heropreheat', "4")
    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['6001', '6002', '6003', '6004'], 'liwu': ['6']})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    # 任务监听
    g.m.huodongfun.event(uid, 'heropreheat', "4")
    g.debugConn.uid = uid
    # a =  doproc(g.debugConn, data=["5aec5828625aee63808d3114"])
    # print a