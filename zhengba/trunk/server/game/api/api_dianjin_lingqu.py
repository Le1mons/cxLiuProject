#!/usr/bin/python
# coding:utf-8
'''
点金--获取
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str (1,2,3,4)]
    :return:
    ::

        {'d': {'cd': 时间戳, 'act':剩余次数, 'huodongtime': 点金活动的时间, 'prize': []},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin

def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 要点金的类型1,2,3
    _type = str(data[0])
    _con = g.GC['dianjin']['type2dianjin']
    # 类型不存在
    if _type not in _con:
        _res['s'] = -2
        _res['errmsg'] = g.L('dianjin_lingqu_res_-1')
        return _res

    _nt = g.C.NOW()
    _playattr = g.m.dianjinfun.getDjCD(uid)
    _cd = _playattr[0]
    #已领取的奖励记录
    _recData = _playattr[1]

    _need = _con[_type]['need']
    _chk = g.chkDelNeed(uid, _need)

    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    if _recData[_type] <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('dianjin_lingqu_res_-1')
        return _res

    _delData = g.delNeed(uid, _need,issend=False,logdata={'act': 'dianjin_lingqu'})

    _setData = {}
    if _cd == 0:
        _cd = _nt + g.GC['dianjin']['cd']
    _setData['cd'] = _cd

    _recData[_type] -= 1
    #容错处理
    if _recData[_type] < 0: _recData = 0
    _setData['act'] = _recData

    gud = g.getGud(uid)
    _lv = gud['lv']
    _prizeCon = g.m.dianjinfun.getDjPrize(uid, _lv, _type)
    #设置奖励时间和领取记录
    g.m.dianjinfun.setDjCD(uid, _setData)

    _prize = _prizeCon['vip']
    _sendData = g.getPrizeRes(uid, [_prize],act='dianjin_lingqu')
    _sendData['attr'].update(_delData['attr'])

    g.sendChangeInfo(conn, _sendData)
    # 周常活动红点
    if g.m.huodongfun.chkZCHDopen('dianjin'):
        g.event.emit('zchd_redpoint', uid)
    # 监听点金
    g.event.emit('dailytask', uid, 4)
    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "116")
    # 51活动
    g.event.emit("labour", uid, "2")
    # # g.m.taskfun.chkTaskHDisSend(uid)
    _res['d'] = {'prize': _prize, 'cd': _setData['cd']}
    #设置cd
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1])
