#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 雕纹熔炼
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [雕纹tid:str]
    :return:
    ::

        {'d':{'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的tid
    _gid = data[0]
    _data = g.mdb.find1('glyph',{'_id':g.mdb.toObjectId(_gid), 'uid': uid},fields=['isuse','gid','lv','color','lock'])
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 不能吞噬正在使用的雕纹
    if 'isuse' in _data or _data.get('lock'):
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_melt_-4')
        return _res

    _con = g.GC['glyph']
    # 只能熔炼特定品质雕纹
    if _data['color'] < g.GC['glyphcom']['base']['melt']['color']:
        _res['s'] = -2
        _res['errmsg'] = g.L('glyph_melt_-2')
        return _res

    # 只能熔炼特定品质雕纹
    if _con[_data['gid']]['colorlv'] != 0:
        _res['s'] = -20
        _res['errmsg'] = g.L('glyph_melt_-2')
        return _res

    _need = g.GC['glyphcom']['base']['melt']['need']
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

    _sendData = g.delNeed(uid, _need, logdata={'act': 'glyph_melt'})
    g.sendChangeInfo(conn, _sendData)

    g.mdb.delete('glyph',{'_id':_data['_id'], 'uid': uid})

    _glyphs = filter(lambda x:_con[x]['color']==_data['color'] and _con[x]['type']!=_con[_data['gid']]['type'] and _con[x]['colorlv']==_con[_data['gid']]['colorlv'], _con)
    _glyphId = g.C.RANDLIST(_glyphs)
    # 获取培养的消耗
    _prize = []
    for i in xrange(_data['lv']):
        _prize += g.GC['glyphcom']['base']['lvdata'][str(i)]['need']

    _prize.append({'a': 'glyph', 't': _glyphId[0], 'n': 1})
    _prize = g.fmtPrizeList(_prize)

    _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_melt','lv':_data['lv']})
    # 塞入tid到prize
    for i in _prize:
        if i['a'] == 'glyph':
            i['tid'] = _sendData['glyph'].keys()[0]
            break

    g.mergeDict(_sendData, {'glyph': {_gid: {'num': 0}}})
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("guide001")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5cdfb9599dc6d670557693fb'])