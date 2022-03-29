# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———保存觉醒技能
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [饰品id:str, 英雄tid:str, 是否取消:bool]
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
    _data = g.getAttrByCtype(uid,'shipin_awake',bydate=0,default={})

    # 数据不存在
    if data[0] not in _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res


    # 如果有英雄
    if not data[2] and 'hero' in _data[data[0]]:
        _hero = g.m.herofun.getHeroInfo(uid, data[1], keys='weardata,_id')
        # 英雄不存在
        if not _hero or '5' not in _hero['weardata'] or _hero['weardata']['5'] != data[0]:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_heroerr')
            return _res
        _res['hero'] = _hero

    _res['data'] = _data
    return _res



@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _rData = {}
    if not data[2]:
        _sid = '{0}_{1}'.format(data[0].split('_')[0], _chkData['data'][data[0]]['id'])
        # 如果有英雄
        if 'hero' in _chkData['data'][data[0]]:
            g.m.herofun.updateHero(uid, _chkData['data'][data[0]]['hero'], {'weardata.5': _sid})

            _chkData['hero']['weardata']['5'] = _sid
            g.sendChangeInfo(conn, {'hero': {_chkData['data'][data[0]]['hero']: {'weardata': _chkData['hero']['weardata']}}})

            _rData['spid'] = _sid
        else:
            _send = g.m.shipinfun.changeShipinNum(uid, data[0], -1)

            _prize = [{'a':'shipin','t':_sid, 'n': 1}]
            _pSend = g.getPrizeRes(uid, _prize, {'act':'shipin_save','args':data})
            _rData['tid'] = _pSend['shipin'].keys()[0]

            g.mergeDict(_pSend, {'shipin': _send})


            g.sendChangeInfo(conn, _pSend)

    g.setAttr(uid, {'ctype': 'shipin_awake'}, {'$unset': {'v.{}'.format(data[0]): 1}})
    del _chkData['data'][data[0]]
    _rData['awake'] = _chkData['data']
    _res['d'] = _rData
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['613602',]
    _r = doproc(g.debugConn, data)
    print _r