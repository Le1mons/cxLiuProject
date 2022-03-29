#!/usr/bin/python
# coding:utf-8
'''
展览馆 - 升星
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [层数:str, 索引:int]
    :return:
    ::

        {}
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

    _step = str(data[0])
    _idx = abs(int(data[1]))

    _wid = g.GC['yjkg']['exhibition'][_step]['data'][_idx]
    _con = g.GC['wenwu'][_wid]
    _exhibition = g.m.yjkgfun.getExhibitionData(uid)
    # 已达到最大星级
    if str(_exhibition['data'][_step][_idx] + 1) not in _con:
        _res["s"] = -2
        _res["errmsg"] = g.L('wenwu_upgrade_-2')
        return _res

    _need = _con[str(_exhibition['data'][_step][_idx])]['need']
    _exhibition['data'][_step][_idx] += 1
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

    _res['need'] = _need
    _res['data'] = _exhibition['data']
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = g.delNeed(uid, _chkData['need'], 0, {'act':'wenwu_upgrade'})

    g.mdb.update('exhibition',{'uid':uid},{'$inc':{'data.{0}.{1}'.format(*data): 1}})

    # 设置buff
    _buff, _con, _eCon = {}, g.GC['wenwu'], g.GC['yjkg']['exhibition']
    for step in _chkData['data']:
        _actNum = 0
        for idx, star in enumerate(_chkData['data'][step]):
            if star <= 0:
                continue
            _actNum += 1
            for k,v in _con[_eCon[step]['data'][idx]][str(star)]['buff'].items():
                _buff[k] = _buff.get(k, 0) + v
        if _actNum >= 5:
            g.mergeDict(_buff, _eCon[step]['buff'], 1)

    # 设置公共buff
    g.m.userfun.setCommonBuff(uid, {'buff.exhibition': [_buff]})
    # 更新所有英雄buff
    _send['hero'] = g.m.herofun.reSetAllHeroBuff(uid, {"lv": {"$gt": 1}})
    g.sendChangeInfo(conn, _send)

    return _res


if __name__ == '__main__':
    uid = g.buid('lsq222')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['1', 0])
