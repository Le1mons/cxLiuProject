#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 分解
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
    # 等级不符
    if not g.chkOpenCond(uid, 'glyphbreakdown'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['lv', 'isuse', 'buff','gid'])
    # 不存在 或者 没有达到红+
    if not _data or g.GC['glyph'][_data['gid']]['colorlv'] != 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['glyphcom']['base']
    _prize = list(g.GC['glyph'][_data['gid']]['fenjie'])
    for i in xrange(_data['lv']):
        _prize += _con['lvdata'][str(i)]['need']

    # 有英雄穿戴
    if 'isuse' in _data:
        # 英雄的tid
        _tid = _data['isuse']
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,extbuff.glyph')
        # 不存在
        if _heroInfo is None or 'glyph' not in _heroInfo:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        for k,v in _heroInfo['glyph'].items():
            if v['gid'] == _gid:
                del _heroInfo['glyph'][k]
                break

        _extBuff = _heroInfo.get('extbuff', {})
        if _data['buff'] in _extBuff.get('glyph', []):
            _extBuff['glyph'].remove(_data['buff'])

        g.m.herofun.updateHero(uid, _tid, {'$set':{'extbuff.glyph':_extBuff['glyph']},'$unset':{'glyph.{}'.format(k):1}})
        _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, 'glyph')
        _heroData['glyph'] = _heroInfo['glyph']
        g.sendChangeInfo(conn, {'hero': _heroData})

    g.mdb.delete('glyph', {'uid':uid,'_id':_data['_id']})

    _prize = g.fmtPrizeList(_prize)
    _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_reset','lv':_data['lv']})
    _sendData['glyph'] = {_gid: {"num": 0}}
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = '0_5e89e73d9dc6d64d2395cb0c'
    print doproc(g.debugConn, data=['5ebb52669dc6d662b871d781'])