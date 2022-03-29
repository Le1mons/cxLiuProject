#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 翻牌奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [是否全部领取:bool]
    :return:
    ::

        {'d': {
            'prize':[],
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
    # 是否一次性全部领取
    _allRec = int(data[0])
    _info = g.getAttrOne(uid, {'ctype': 'watcher_flopprize'},keys='_id,v')
    # 数据不存在
    if not _info:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 奖励已经领完
    if not _info['v']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['watchercom']['base']['flop']
    # 一次性全部领取
    if _allRec:
        _need = g.fmtPrizeList([x for i in _con['need'] for x in _con['need'][i]])
        # 记录余下得奖励
        _prize = map(lambda x:x['prize'], _info['v'])
        _info['v'] = []
    else:
        _times = len(_con['p']) - len(_info['v']) + 1
        _need = _con['need'][str(_times)]
        _prize = g.C.RANDARR(_info['v'], sum(i['p'] for i in _info['v']))
        _info['v'].remove(_prize)
        _prize = [_prize['prize']]

    if _need:
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

        _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'watcher_getflopprize'})
        g.sendChangeInfo(conn, _sendData)

    if not _info['v']:
        g.mdb.delete('playattr',{'uid': uid, 'ctype': 'watcher_flopprize'})
    else:
        g.setAttr(uid, {'ctype': 'watcher_flopprize'}, {'v': _info['v']})

    _sendData = g.getPrizeRes(uid, _prize, {'act':'watcher'})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('lyf2009')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [0,'2',1])