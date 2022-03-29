#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 穿戴雕纹
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
    # 英雄的tid
    _tid = data[1]
    # 插槽位置
    _position = str(data[2])
    # 插槽位置不对
    if _position not in ('1', '2', '3'):
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id'])
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 该雕纹已使用
    if 'isuse' in _data:
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_wear_-4')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,star,hid,extbuff')
    # 不存在
    if _heroInfo is None:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _glyph = _heroInfo.get('glyph', {})
    _con = g.GC['glyph'][_data['gid']]
    # 已穿戴同类型雕纹
    if _data['type'] in [_glyph[i]['type'] for i in _glyph if i != _position]:
        _res['s'] = -3
        _res['errmsg'] = g.C.STR(g.L('glyph_wear_-3'), _con['type'])
        return _res

    _data['isuse'] = _tid
    _send = {}
    _send['glyph'] = {_gid: _data}
    _extbuff = _heroInfo.get('extbuff', {})

    # 穿装备
    if _position not in _glyph:
        # 超过雕文插槽
        if len(_glyph) >= g.GC['herostarup'][_heroInfo['hid']][str(_heroInfo['star'])]['diaowenchacao']:
            _res['s'] = -5
            _res['errmsg'] = g.L('glyph_wear_-5')
            return _res
    else:
        # 如果是替换雕纹 雕鏪和技能
        _preGid = _glyph[_position]['gid']
        _preGlyph = g.m.glyphfun.getGlyphInfo(uid, _preGid, fields={'_id':0,'isuse':0,'lasttime':0,'ctime':0})
        # 删除之前的雕纹buff
        if _preGlyph['buff'] in _extbuff.get('glyph', []):
            _extbuff['glyph'].remove(_preGlyph['buff'])

        g.m.glyphfun.setGlyphInfo(uid, _preGid, {'$unset': {'isuse': 1}})
        _send['glyph'].update({_preGid: {'isuse': ''}})

    _extbuff['glyph'] = _extbuff.get('glyph', []) + [_data['buff']]
    _glyph[_position] = {'type': _con['type'], 'gid': _gid, 'extbuff':_data.get('extbuff',[])}
    # 如果有技能
    if 'extskill' in _data:
        _glyph[_position]['extskill'] = _data['extskill']

    _set = {'extbuff.glyph': _extbuff['glyph'],'glyph': _glyph}

    g.m.herofun.updateHero(uid, _tid, _set)
    _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, ['glyph','bdskillbuff'])
    _heroData[_tid].update({'glyph': _glyph, 'extbuff': _extbuff})
    _send['hero'] = _heroData
    g.sendChangeInfo(conn, _send)

    g.m.glyphfun.setGlyphInfo(uid, _gid, {'isuse': _tid, 'lasttime': g.C.NOW()})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5c29d94fc0911a17b0d6937a", "5c29d452c0911a34f049d808", 1])