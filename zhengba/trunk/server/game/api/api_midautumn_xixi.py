#!/usr/bin/python
# coding:utf-8
'''
中秋节 - 月兔嬉戏
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [步数:int]
    :return:
    ::

        {"d": {
            prize: []
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.midautumnfun.getData(uid, _hd['hdid'], _hd['data'].get('con','midautumn'))
    # 已经嬉戏过了
    if _data['xixi']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['data'] = _data
    _chkData['hd'] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.m.midautumnfun.setData(uid, _chkData['hdid'], {'xixi':True,'xixinum':data[0]})

    # 记录排行榜   排序只取前5个
    _set = {'$push':{'v':{'$slice':5,'$sort':{'num':1,'ctime':1},'$each':[{'num':data[0],'name':g.getGud(uid)['name'],'ctime':g.C.NOW()}]}}}
    g.mdb.update('gameconfig', {'ctype': 'midautumn_xixi','k':g.C.DATE()}, _set)

    _prize = g.m.diaoluofun.getGroupPrize(g.m.midautumnfun.getCon(_chkData['hd']['data']['con'])['xixi']['dlz'])
    _prize += g.m.midautumnfun.getCon(_chkData['hd']['data']['con'])['xixi']['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': 'midautumn_xixi'})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])