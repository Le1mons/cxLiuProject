#!/usr/bin/python
# coding:utf-8
'''
宝石 - 升级宝石
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
    # 是否锁定升级
    _locked = int(data[1])
    _userwear = g.m.herofun.getUserwearInfo(uid, tid)
    _bsType = '6'
    # 如果宝石没有穿戴
    if not _userwear or not _userwear.get(_bsType):
        _res['s'] = -3
        _res['errmsg'] = g.L('baoshi_lvup_res_-3')
        return _res

    _userwearBs = _userwear[_bsType]
    _lv, _baoshiBuffNum = _userwearBs.items()[0]
    _baoshiCon = g.m.baoshifun.getBaoshiCon()

    # 加一级后超过20级
    if str(int(_lv)+1) not in _baoshiCon:
        _res['s'] = -1
        _res['errmsg'] = g.L('baoshi_lvup_res_-1')
        return _res

    _baoshiCon = _baoshiCon[_lv]
    _need = _baoshiCon['lvupneed']

    # 如果锁了
    if _locked:
        _need += _baoshiCon['lockneed']
    else:
        # 随机取一个buff组里的数字
        _buffList = _baoshiCon['buff'].keys()
        _baoshiBuffNum = g.C.RANDLIST(_buffList)[0]

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

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'baoshi_lvup'})
    g.m.dball.writeLog(uid, 'baoshi_lvup', {'delete': _need})
    _baoshiData = g.m.herofun.setUserWearInfo(uid, tid, _bsType, {str(int(_lv)+1): _baoshiBuffNum})
    _sendData['hero'] = g.m.herofun.reSetHeroBuff(uid, tid,['baoshi'])
    _sendData['hero'][tid].update(_baoshiData)
    g.sendChangeInfo(conn, _sendData)
    g.event.emit('JJCzhanli', uid, tid)
    # 开服狂欢活动
    g.event.emit('kfkh',uid,21,6,cond=int(_lv)+1)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = "0_5ea808849dc6d67b109ae3a7"
    print doproc(g.debugConn, data=['60e37f29611cd0b2c2856e08',1])