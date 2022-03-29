#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 雕纹升级
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的_id
    _gid = data[0]
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields={'_id':0,'lasttime':0,'ctime':0})
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['glyphcom']['base']
    # 已升至最大等级
    if _data['lv'] >= _con['lvlimit']:
        _res['s'] = -2
        _res['errmsg'] = g.L('glyph_lvup_-2')
        return _res

    _need = _con['lvdata'][str(_data['lv'])]['need']
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

    _gCon = g.GC['glyph'][_data['gid']]

    _setData = {}
    _delBuff = _data['buff'].copy()
    _setData['lv'] = _data['lv'] = _data['lv'] + 1
    # 增加基本属性加成
    for i in _gCon['buff']:
        _data['buff'][i] = int(_data['basebuff'][i] * (1 + _con['lvdata'][str(_data['lv'])]['addition'] * 0.001))
    _setData['buff'] = _data['buff']

    # 有英雄穿戴
    if 'isuse' in _data:
        # 英雄的tid
        _tid = _data['isuse']
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,extbuff')
        # 不存在
        if _heroInfo is None:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        _glyphBuff = _heroInfo.get('extbuff', {}).get('glyph', [])
        for i in _glyphBuff:
            if i == _delBuff:
                _glyphBuff.remove(i)
                _glyphBuff.append(_data['buff'])
                break

        g.m.herofun.updateHero(uid, _tid, {'extbuff.glyph': _glyphBuff})
        _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, 'glyph')
        g.sendChangeInfo(conn, {'hero': _heroData})

    _sendData = g.delNeed(uid, _need,logdata={'act': 'glyph_lvup'})
    _sendData['glyph'] = {_gid: _data}
    g.sendChangeInfo(conn, _sendData)
    g.m.glyphfun.setGlyphInfo(uid, _gid, _setData)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=['5c29c0d7c0911a34646baeab'])
    print g.C.getWeekNumByTime(g.C.NOW())