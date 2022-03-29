#!/usr/bin/python
# coding:utf-8
'''
宝石--重铸
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'d': {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 英雄的tid
    tid = data[0]

    _w = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    _heroInfo = g.mdb.find1('hero', _w, fields=['weardata', "baoshijinglian"]) or {}
    _wearData = _heroInfo.get("weardata", {})
    _jinglian = _heroInfo.get("baoshijinglian", 0)

    # 没有此英雄装备宝石
    if not _wearData or not _wearData.get('6'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _lv = int(_wearData['6'].keys()[0])
    # 一级宝石不需要重铸
    if _lv <= 1:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_recast_-1')
        return _res

    _need = [{'a':'attr','t':'rmbmoney','n':100}]
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

    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'baoshi_recast','tid':tid})
    _prize = g.m.baoshifun.getRecastPrize(_lv)
    # 精炼
    _baoshiBuffNum = _wearData["6"].values()[0]
    _jinglianCon = g.GC["baoshijinglian"]
    for jllv in xrange(_jinglian):
        _prize.extend(_jinglianCon[str(_baoshiBuffNum)][str(jllv)]["need"])
    _prize = g.mergePrize(_prize)

    _pData = g.getPrizeRes(uid, _prize, {'act': 'baoshi_recast','lv':tid})
    g.mergeDict(_sendData, _pData)
    g.sendChangeInfo(conn, _sendData)

    # 随机取一个buff组里的数字
    _buffNum = g.C.RANDLIST(g.GC['baoshi']['1']['buff'].keys())[0]
    # 增加extbuff里的对应属性
    g.m.herofun.updateHero(uid, tid, {'weardata.6': {'1': _buffNum}, "baoshijinglian":0})
    _wearData['6'] = {'1': _buffNum}
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid, ['baoshi'])
    _heroBuff[tid]['weardata'] = _wearData
    _heroBuff[tid]["baoshijinglian"] = 0
    g.sendChangeInfo(conn, {'hero': _heroBuff})
    _res['d'] = {'prize':_prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['60e37f29611cd0b2c2856e08'])