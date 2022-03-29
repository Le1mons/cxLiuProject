#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
领取爵位月礼包每日奖励
'''


def proc(conn,data):
    '''

    :param conn:
    :param data: [tid:str]:tid:英雄tid
    :param key:
    :return: dict
    ::

       {'s': 1}

    '''

    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    gud = g.getGud(uid)
    _titleLv = gud["title"]
    _ctime = gud["ctime"]
    # 获取当前零点时间戳
    # _nt = g.C.NOW()
    # _zt = g.C.ZERO(_nt)
    # 购买个数
    _num = abs(int(data[0]))

    # 获取创建账号的是零点时间戳
    # _czt = g.C.ZERO(_ctime)
    # 判断玩家是否满足了创建账号22天后开启的条件
    if g.getOpenDay() < 22:
        # 不满足开启条件
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('title_lvup_res_-1')
        return _chkData

    _con = g.GC["titlecom"]["buydata"]

    _maxBuyNum = _con["maxbuynum"]
    _buyNum = g.m.titlefun.getDayBuyNum(uid)
    # 购买个数
    _nextBuyNum = _num + _buyNum
    # 判断是否超过今天最大的购买次数
    if _nextBuyNum > _maxBuyNum:
        # 不满足开启条件
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('title_buynum_res_-1')
        return _chkData

    _need = []
    for i in xrange(_buyNum, _nextBuyNum):
        _need += (_con["buyneed"][i])
    _need = g.mergePrize(_need)

    # 判定消耗是否满足
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chkRes['t']
        else:
            _chkData["s"] = -104
            _chkData[_chkRes['a']] = _chkRes['t']
        return _chkData

    _chkData["need"] = _need
    _chkData["buynum"] = _nextBuyNum
    _chkData["prize"] = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _con['prize']]

    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    gud = g.getGud(uid)


    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _buyNum = _chkData["buynum"]
    _need = _chkData["need"]
    _prize = _chkData["prize"]

    # 删除消耗
    _delData = g.delNeed(uid, _need, logdata={'act': 'title_buyxunzhang'})

    # 设置购买次数
    g.m.titlefun.setDayBuyNum(uid, _buyNum)

    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'title_buyxunzhang'})

    # 合并事件
    _sendData = g.mergeChangeInfo(_sendData, _delData)
    # 推送前端
    g.sendChangeInfo(conn, _sendData)

    _res["d"] = {"buynum": _buyNum}
    return _res


if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # g.getPrizeRes(uid, [{"a":"attr", "t": "jinbi", "n": 100000000000}])
    gud = g.getGud(uid)
    data = [5]

    _r = doproc(g.debugConn, data)
    pprint(_r)
    if 'errmsg' in _r: print _r['errmsg']