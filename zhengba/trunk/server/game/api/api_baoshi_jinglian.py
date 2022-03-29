#!/usr/bin/python
# coding:utf-8
'''
宝石 - 精炼
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str, 是否锁定:int(0, 1)]
    :return:
    ::

        {'d': {'buffid':'1'}
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
    _userwear = _heroInfo.get("weardata", {})
    _jinglian = _heroInfo.get("baoshijinglian", 0)

    _bsType = '6'
    # 如果宝石没有穿戴
    if not _userwear or not _userwear.get(_bsType):
        _res['s'] = -3
        _res['errmsg'] = g.L('baoshi_lvup_res_-3')
        return _res

    _userwearBs = _userwear[_bsType]
    _lv, _baoshiBuffNum = _userwearBs.items()[0]
    _baoshiCon = g.m.baoshifun.getBaoshiCon()

    _maxLv = max([int(lv) for lv in _baoshiCon.keys()])
    # 加一级后超过20级
    if int(_lv) != _maxLv:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_lvup_res_-1')
        return _res
    # 获取宝石精炼的配置
    _jinglianCon = g.GC["baoshijinglian"]
    # 判断是否还能精炼
    if str(_baoshiBuffNum) not in _jinglianCon or str(_jinglian) not in _jinglianCon[str(_baoshiBuffNum)]:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_lvup_res_-1')
        return _res

    _need = _jinglianCon[str(_baoshiBuffNum)][str(_jinglian)]["need"]
    # 检查消耗是否满足
    _chk = g.chkDelNeed(uid, _need)
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'baoshi_jinglian'})

    # 宝石精炼
    _jinglian += 1
    g.m.herofun.updateHero(uid, tid, {'baoshijinglian': _jinglian})
    _sendData['hero'] = g.m.herofun.reSetHeroBuff(uid, tid, ['baoshi'])
    _sendData['hero'][tid].update({'baoshijinglian': _jinglian})
    g.sendChangeInfo(conn, _sendData)
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['60e37f29611cd0b2c2856e08',1])