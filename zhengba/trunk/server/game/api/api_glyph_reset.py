#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 等级重置
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

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的_id
    _gid = data[0]
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id', 'lv', 'isuse', 'basebuff', 'buff'])
    # 不存在
    if not _data or _data['lv'] <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['glyphcom']['base']
    _need = _con['need']['reset']
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

    _prize = []
    for i in xrange(_data['lv']):
        _prize += _con['lvdata'][str(i)]['need']

    _setData = {'lv': 0}
    _setData['buff'] = _data['basebuff']
    _preLv = _data['lv'] = 0

    # 有英雄穿戴
    if 'isuse' in _data:
        # 英雄的tid
        _tid = _data['isuse']
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,extbuff.glyph')
        # 不存在
        if _heroInfo is None:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        _extBuff = _heroInfo.get('extbuff', {})
        if _data['buff'] in _extBuff.get('glyph', []):
            _extBuff['glyph'].remove(_data['buff'])

        _extBuff['glyph'].append(_data['basebuff'])
        g.m.herofun.updateHero(uid, _tid, {'extbuff.glyph':_extBuff['glyph']})
        _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, 'glyph')
        g.sendChangeInfo(conn, {'hero': _heroData})

    _sendData = g.delNeed(uid, _need, logdata={'act': 'glyph_reset'})
    g.sendChangeInfo(conn, _sendData)

    g.m.glyphfun.setGlyphInfo(uid, _gid, _setData)

    _prize = g.fmtPrizeList(_prize)
    _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_reset','lv':_preLv})
    _sendData['glyph'] = {_gid: _data}
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = '0_5e8d955c9dc6d64d2395dcc9'
    print doproc(g.debugConn, data=['5e8ec1e78da101853434283d'])