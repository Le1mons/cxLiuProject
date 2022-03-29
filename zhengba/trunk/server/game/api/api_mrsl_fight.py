#!/usr/bin/python
# coding:utf-8
'''
每日试练——挑战
'''

import sys

sys.path.append('..')

import g
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str('hero','exp','jinbi'), 难度:str, 战斗阵容, npcid:str]
    :return:
    ::

        {"d": {'fightres': {},
                'prize':[],
                'lessnum':剩余次数
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
    _type = str(data[0])
    _win = bool(data[2])

    # 玩家等级小于开放等级
    if not g.chkOpenCond(uid, 'meirishilian'):
        _res['s'] = -3
        _res['errmsg'] = g.L('mrsl_fight_res_-3')
        return _res

    _difficulty = str(data[1])
    gud = g.getGud(uid)
    # 10星难度需要判断等级
    if int(_difficulty) >= 10 and ((_type=='jinbi' and gud['lv']<220) or (_type=='exp' and gud['lv']<230) or (_type=='hero' and gud['lv']<240)):
        _res['s'] = -20
        _res['errmsg'] = g.L('global_limitlv')
        return _res


    _con = g.GC['meirishilian']
    # 不存在的类型
    if _type not in _con:
        _res['s'] = -2
        _res['errmsg'] = g.L('mrsl_fight_res_-2')
        return _res

    # # 只有最新关卡需要判定
    # if difficulty == str(len(_con[_type])) and _difficulty not in g.getAttrByCtype(uid,'dailytrain_sweeping',bydate=False,default={}).get(_type,[]):
    #     _res['s'] = -21
    #     _res['errmsg'] = g.L('global_argserr')
    #     return _res

    _lessNum = g.m.mrslfun.getLessNum(uid, _type)
    # 剩余次数小于0
    if _lessNum <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('mrsl_fight_res_-1')
        return _res


    _resData = {}

    if _win == True:
        # 设置扫荡信息
        g.setAttr(uid, {'ctype': 'dailytrain_sweeping'}, {'$addToSet': {'v.{}'.format(_type): _difficulty}})

    if _win:
        g.m.mrslfun.addPkNum(uid, _type)
        _prize = g.m.mrslfun.getMrslCon(_type, _difficulty)['prize']
        # 暴击概率
        _proba = g.m.mrslfun.getCritProba(_type)
        # 趣味成就
        if _proba >= 2:
            g.event.emit('quweichengjiu', uid, '7', 1)

        _prize *= _proba
        _sendData = g.getPrizeRes(uid, _prize,act='mrsl_fight')
        g.sendChangeInfo(conn, _sendData)

        _resData.update({'prize': _prize})
        # 监听每日试炼完成
        g.event.emit('mrsl_fight', uid)
        # # g.m.taskfun.chkTaskHDisSend(uid)
        # 神器任务
        g.event.emit('artifact', uid, 'meirishilian')
        g.event.emit("dailytask", uid, 11)
        _lessNum -= 1

        # 王者招募任务监听
        g.event.emit("wzzmtask", uid, "104")

    _resData.update({'lessnum':_lessNum})
    # 51活动
    g.event.emit("labour", uid, "5")
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '4')
    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['7001', '7002', '7003', '7004']})

    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    a = {1: "5b6d2c7dc0911a0d84d65a7a", 2: "5b6cef9cc0911a2d786f2f71", 3: "5b6d3774c0911a1cb46bb713", 'sqid': 1}
    data = ["jinbi","10",1]
    print doproc(g.debugConn, data)