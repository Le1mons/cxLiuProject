#!/usr/bin/python
# coding:utf-8
'''
祭坛——积分兑换
'''

import sys

sys.path.append('..')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {"prize": []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _vip = gud.get('vip')
    # 减去的积分
    _delNum = 999

    if not _vip: _vip = 0
    # vip等级小于3
    if not g.m.vipfun.getTeQuanNumByAct(uid,'JiTanNLOpen'):
        _res['s'] = -2
        _res['errmsg'] = g.L('jitan_duihuan_res_-2')
        return _res

    _jifen = g.m.jitanfun.getJitanJifen(uid)
    # 积分小于1000
    if _jifen < _delNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('jitan_duihuan_res_-1')
        return _res

    # g.m.jitanfun.addJifen(uid,-_delNum)

    _r = g.setAttr(uid, {'ctype': 'jitan_type_jifen', 'v': {'$gte': _delNum}}, {'$inc': {'v': -_delNum}})
    # 积分不够
    if _r['updatedExisting'] == False:
        _res['s'] = -2
        _res['errmsg'] = g.L('jitan_duihuan_res_-1')
        return _res

    _prize = g.m.jitanfun.getJifenPrize(uid)

    # 跑馬燈
    _hid = _prize[0]['t']
    _star = g.GC['pre_hero'][_hid]['star']
    if _star >= 5:
        gud = g.getGud(uid)
        _heroCon = g.GC['hero'][_hid]
        g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao',_star)
        g.m.chatfun.sendPMD(uid, 'zhaohuanjitan', *[gud['name'], _star, _heroCon['name']])
        # # 统御
        # g.event.emit("hero_tongu", uid, _hid)
    # 监听获取英雄成就任务
    if _star >= 4:
        g.event.emit("gethero", uid, _hid)
    _sendData = g.getPrizeRes(uid, _prize,act='jitan_duihuan')
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])
