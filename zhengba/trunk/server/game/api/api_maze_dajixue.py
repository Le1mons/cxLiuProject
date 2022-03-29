#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 打鸡血
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['mazecom']['base']

    _need = _con['dajixue']['need']
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

    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','status','trace','cd'])
    # 数据已存在
    if not _maze or g.C.NOW() >= _maze['cd'] or 'status' not in _maze or not _maze['status']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 当前无需使用女神之泪
    if len(_maze['trace']) == _con['level'] and _maze['trace'][str(_con['level'])]['finish']:
        _res['s'] = -3
        _res['errmsg'] = g.L('maze_dajixue_-3')
        return _res

    _status = _maze.get('status', {})
    # 所有的英雄
    _tidList = g.m.mazefun.getUserTidList(uid)
    _num = 0
    for i in _tidList:
        if i in _status and _status[i]['hp'] >= 100 and _status[i]['nuqi'] >= 100:
            _num += 1
        else:
            _status[i] = {'hp':_con['dajixue']['hppro'], 'nuqi':max(_con['dajixue']['nuqi'], _status.get(i,{}).get('nuqi',100))}

    # 当前无需使用女神之泪
    if _num == len(_tidList):
        _res['s'] = -4
        _res['errmsg'] = g.L('maze_dajixue_-3')
        return _res

    _sendData = g.delNeed(uid, _need,logdata={'act': 'maze_dajixue'})
    g.sendChangeInfo(conn, _sendData)

    g.mdb.update('maze',{'uid':uid},{'$set':{'status': _status,'lasttime':g.C.NOW()},'$inc':{'dajixue':1}})
    return _res

if __name__ == '__main__':
    uid = g.buid('design1986')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])