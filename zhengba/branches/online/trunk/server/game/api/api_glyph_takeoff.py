#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 卸下雕纹
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的 插槽位置
    _position = str(data[0])
    # 英雄的tid
    _tid = data[1]
    # 插槽位置不对
    if _position not in ('1', '2', '3'):
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,extbuff')
    # 不存在
    if _heroInfo is None:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _glyph = _heroInfo.get('glyph')
    # 没有穿戴同类型雕纹
    if not _glyph or _position not in _glyph:
        _res['s'] = -5
        _res['errmsg'] = g.L('glyph_takeoff_-5')
        return _res

    _gid = _glyph[_position]['gid']
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id','isuse','buff','gid'])
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 该雕纹没有使用
    if 'isuse' not in _data:
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_takeoff_-4')
        return _res

    _con = g.GC['glyph'][_data['gid']]
    del _glyph[_position]
    _data['isuse'] = ''
    if _data['buff'] in _heroInfo['extbuff']['glyph']:
        _heroInfo['extbuff']['glyph'].remove(_data['buff'])

    g.m.herofun.updateHero(uid, _tid, {'$set':{'glyph': _glyph, 'extbuff.glyph': _heroInfo['extbuff']['glyph']}})
    _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, ['glyph','bdskillbuff'])
    _heroData[_tid].update({'extbuff': _heroInfo['extbuff'],'glyph':_glyph})
    g.sendChangeInfo(conn, {'hero': _heroData, 'glyph': {_gid: _data}})

    g.m.glyphfun.setGlyphInfo(uid, _gid, {'$unset':{'isuse': 1}, '$set':{'lasttime': g.C.NOW()}})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1',u'5c29c0b7c0911a34646bae77'])