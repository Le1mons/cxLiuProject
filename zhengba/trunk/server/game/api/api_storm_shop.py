#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 消费
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [购买类型:str('number 购买次数', 'time 购买时间'), 购买时间才有 要塞信息:{area:'1', number:1}, 买多久:int]
    :return:
    ::

        {s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 购物的类型
    _type = str(data[0])
    # 参数有误
    if _type not in ('number', 'time'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    if g.mc.get('storm_shop_{0}'.format(uid)):
        _res['s'] = -20
        _res['errmsg'] = g.L('global_timeerr')
        return _res
    g.mc.set('storm_shop_{0}'.format(uid), 1, 1)

    _con = g.GC['storm']['base']
    # 购买次数
    if _type == 'number':
        _buyNum = g.getPlayAttrDataNum(uid, 'storm_buynum')
        # 已达到最大购买次数
        if str(_buyNum + 1) not in _con['energy']['num2need']:
            _res['s'] = -3
            _res['errmsg'] = g.L('storm_shop_-3')
            return _res

        # 超过最大精力
        if g.m.stormfun.getEnergeNum(uid) >= _con['energy']['num']:
            _res['s'] = -30
            _res['errmsg'] = g.L('storm_shop_-30')
            return _res

        # vip 不足
        if g.getGud(uid)['vip'] < _con['energy']['num2need'][str(_buyNum + 1)]['vip']:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_limitvip')
            return _res

        _need = _con['energy']['num2need'][str(_buyNum + 1)]['need']
    else:
        # 要塞的信息   {area:'1', number:1}
        _fortress = data[1]
        # 购买时间
        _target = int(data[2])

        _fortress['uid'] = uid
        _data = g.mdb.find1('storm', _fortress, fields=['buytime','color','stime','etime'])
        # 要塞不存在或者已经结束了
        if not _data or _data['etime'] < g.C.NOW() or str(_data.get('buytime',0)+_target) not in _con['timeneed']:
            _res['s'] = -5
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _diffTime = _target + (_data["etime"] - _data["stime"])
        if _diffTime not in [28800, 43200, 86400]:
            _res['s'] = -6
            _res['errmsg'] = g.L('global_argserr')
            return _res



        _need = _con['timeneed'][str(_target)]['item']
        _needNum = _con['timeneed'][str(_target)]['energy']

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

    _log = {'act': 'storm_shop','type':_type}
    # 购买次数旧增加次数
    if _type == 'number':
        g.setPlayAttrDataNum(uid, 'storm_buynum')
        g.m.stormfun.setEnergeNum(uid, 1)
    else:
        # 次数不足
        if g.m.stormfun.getEnergeNum(uid) < _needNum:
            _res['s'] = -6
            _res['errmsg'] = g.L('storm_shop_-6')
            return _res

        _log['buytime'] = _target
        g.m.stormfun.setEnergeNum(uid, -_needNum)
        g.mdb.update('storm', _fortress, {'$inc': {'buytime': _target,'etime':_target}, '$set':{'lasttime':g.C.NOW()}})

    _sendData = g.delNeed(uid, _need, issend=False, logdata=_log)
    g.sendChangeInfo(conn, _sendData)

    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('ysr1')
    print doproc(g.debugConn, data=["time",{"area":"11","number":3},14400])