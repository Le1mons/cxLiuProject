#!/usr/bin/python
# coding:utf-8
'''
神殿地牢 - 领取阶段奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [哪条路:str]
    :return:
    ::

        {'d': {'prize': [],
                },
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要领取哪条路
    _type = str(data[0])
    _comCon = g.GC['dungeoncom']['base']
    # 参数错误
    if _type not in _comCon['road']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 等级不足
    if not g.chkOpenCond(uid, 'dungeon'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _data = g.mdb.find1('dungeon',{'uid': uid},fields=['_id','layer','recdict']) or {'layer':{}}
    _idx = _data.get('recdict', {}).get(_type, 0)
    # 奖励已领完
    if _idx >= len(_comCon['aimsprize'][_type]):
        _res['s'] = -4
        _res['errmsg'] = g.L('dungeon_recprize_-4')
        return _res

    # 没有达成目标
    if _data['layer'].get(_type, 0) < _comCon['aimsprize'][_type][_idx][0]:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_valerr')
        return _res

    g.mdb.update('dungeon',{'uid':uid},{'recdict.{}'.format(_type): _idx + 1, 'lasttime':g.C.NOW()})

    _sendData = g.getPrizeRes(uid, _comCon['aimsprize'][_type][_idx][1], {'act':'dungeon','type':_type,'idx':_idx})
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _comCon['aimsprize'][_type][_idx][1]}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [2])