#!/usr/bin/python
# coding:utf-8
'''
展览馆 - 出售文物
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [品质:int]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    # 开区天数不足
    if g.getOpenDay() < g.GC['yjkg']['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _con, _wwCon = g.GC['yjkg']['exhibition'], g.GC['wenwuinfo']
    _ids = []
    _exhibition = g.m.yjkgfun.getExhibitionData(uid)
    for _color in data[0]:
        for step in _exhibition['data']:
            for idx,star in enumerate(_exhibition['data'][step]):
                if star >= 5 and _wwCon[_con[step]['data'][idx]]['color'] == _color:
                    _ids.append(_con[step]['data'][idx])

    # 没有此文物
    if not _ids:
        _res["s"] = -2
        _res["errmsg"] = g.L('wenwu_sale_-3')
        return _res

    _wenwu = g.mdb.find('wenwu',{'uid':uid,'wid':{'$in':_ids}},fields=['num','wid'])
    # 没有文物可以出售
    if not _wenwu:
        _res["s"] = -3
        _res["errmsg"] = g.L('wenwu_sale_-3')
        return _res

    _res['data'] = _wenwu
    _res['con'] = _wwCon
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _wwSend = {}
    _prize = []
    _del = []
    _con = g.GC['yjkg']['sale']
    for i in _chkData['data']:
        _prize += [{'a':x['a'],'t':x['t'],'n':x['n']*i['num']} for x in _con[str(_chkData['con'][i['wid']]['color'])]]
        _wwSend[str(i['_id'])] = {'num': 0}
        _del.append(i['_id'])

    # 删除文物
    g.mdb.delete('wenwu',{'uid':uid,'_id':{'$in':_del}})

    _prize = g.fmtPrizeList(_prize)
    _send = g.getPrizeRes(uid, _prize, {'act':'wenwu_sale','item':_chkData['data']})
    _send['wenwu'] = _wwSend
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('lsq222')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[[3]])
