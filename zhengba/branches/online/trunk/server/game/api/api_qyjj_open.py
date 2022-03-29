#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
群英集结 - 开团
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要开启的副本类型
    _type = str(data[0])
    _con = g.GC['tuanduifuben']['base']
    # 类型不对
    if _type not in _con['group']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    gud = g.getGud(uid)
    # 等级不足
    if gud['lv'] < _con['limit_lv']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # vip等级不足
    if gud['vip'] < _con['group'][_type]['vip_limit']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_limitvip')
        return _res

    # 已有副本
    if g.m.qyjjfun.getCopyData(uid):
        _res['s'] = -5
        _res['errmsg'] = g.L('qyjj_open_-5')
        return _res

    _need = _con['group'][_type]['need']
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
    _sendData = g.delNeed(uid, _need, 0,{'act': 'qyjj_open'})
    g.sendChangeInfo(conn, _sendData)
    # 增加对应类型的带领ci'shu 和积分
    g.setAttr(uid, {'ctype':"qyjj_leadnum"},{'$inc':{g.C.STR('num.{1}', _type): 1,'v':_con['group'][_type]['jifen']}})

    # 带领次数
    _leadNum = g.m.qyjjfun.getLeadNumByType(uid, _type)
    _myData = {'name': gud['name'], 'time': g.C.NOW(), 'svrname':gud['ext_servername']}
    g.crossDB.insert('allhero_together', {'type':_type,'user':{uid:_myData},'uid':uid,'ctime':g.C.NOW(),
                                          'leadnum':_leadNum,'model':gud.get('model', gud['head'])})

    _prize = _con['group'][_type]['open_prize']
    _sendData = g.getPrizeRes(uid, _prize, {'act':"qyjj_open",'type':_type})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[u'0_5bc01c47c0911a2c50550e5d'])