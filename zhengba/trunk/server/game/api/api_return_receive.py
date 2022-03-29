#!/usr/bin/python
# coding:utf-8
'''
王者归来 - 领取奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [领取类型:str(login, return, daily, recharge), 下标:int]
    :return:
    ::

        {"d": {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 领取类型
    _type = data[0]
    _idx = abs(int(data[1]))

    # 参数错误
    if _type not in ('login', 'return', 'daily', 'recharge'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _kingData = g.m.userfun.getKingsRerurnData(uid)
    # 已经过期了
    if _kingData['v'] < g.C.NOW():
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = g.GC['returnhome'][_type]
    # 登陆奖励
    if _type == 'login':
        # 条件不足
        if _kingData[_type] < _idx:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('global_valerr')
            return _chkData

        # 奖励已领取
        if _idx in _kingData['receive'][_type]:
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('global_algetprize')
            return _chkData

        _prize = _con[str(_idx)]
        _set = {'$push': {'receive.login': _idx}}
    # 回归奖励
    elif _type == 'return':
        # 奖励已领取
        if _kingData['receive'][_type]:
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('global_algetprize')
            return _chkData

        _lv = g.getGud(uid)['lv']
        _need = _con[str(_idx)]['need']
        _prize = _kingData['prize'][str(_idx)]

        if _need:
            _chk = g.chkDelNeed(uid, _need)
            # 材料不足
            if not _chk['res']:
                if _chk['a'] == 'attr':
                    _chkData['s'] = -100
                    _chkData['attr'] = _chk['t']
                else:
                    _chkData["s"] = -104
                    _chkData[_chk['a']] = _chk['t']
                return _chkData

            _chkData['need'] = _need

        _set = {'$set': {'receive.return': 1}}
    else:
        # 条件不足
        if _con[_idx]['pval'] > _kingData[_type]:
            _chkData['s'] = -8
            _chkData['errmsg'] = g.L('global_valerr')
            return _chkData

        # 奖励已领取
        if _idx in _kingData['receive'][_type]:
            _chkData['s'] = -9
            _chkData['errmsg'] = g.L('global_algetprize')
            return _chkData

        _prize = _con[_idx]['prize']
        _set = {'$push': {'receive.{}'.format(_type): _idx}}

    _chkData['prize'] = _prize
    _chkData['set'] = _set
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = {}
    if 'need' in _chkData:
        _sendData = g.delNeed(uid, _chkData['need'], 0,{'act':'return_recieve_del'})
        g.mergeDict(_send, _sendData)

    g.setAttr(uid, {'ctype': 'kings_return'}, _chkData['set'])
    _prize = _chkData['prize']
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'return_recieve','type': data[0],'val':data[1]})
    g.mergeDict(_send, _sendData)
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['login', 0])