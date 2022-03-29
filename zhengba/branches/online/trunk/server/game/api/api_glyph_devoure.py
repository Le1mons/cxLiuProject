#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 雕纹吞噬
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的tid
    _gid = data[0]
    # 被吞噬的雕纹gid
    _dGid = data[1]
    # 要吞噬的属性
    _attri = data[2]
    # 只能吞噬指定的三种属性
    if not _attri or filter(lambda x:x not in ('buff','extbuff','extskill'), _attri):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _data = g.mdb.find('glyph',{'_id':{'$in':map(g.mdb.toObjectId, [_gid,_dGid])}, 'uid': uid})
    # 不存在
    if len(_data) != 2:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _toGlyph, _dGlyph = None, None
    for i in _data:
        i['_id'] = str(i['_id'])
        if _gid == i['_id']:
            _toGlyph = i
        else:
            _dGlyph = i

    # 不能吞噬正在使用的雕纹
    if 'isuse' in _dGlyph:
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_devoure_-4')
        return _res

    _con = g.GC['glyph']
    # 只可吞噬品质相同和类型的雕文
    if _toGlyph['color'] != _dGlyph['color'] or _con[_toGlyph['gid']]['type'] != _con[_dGlyph['gid']]['type']:
        _res['s'] = -2
        _res['errmsg'] = g.L('glyph_devoure_-2')
        return _res

    _need = g.GC['glyphcom']['base']['need']['devoured']
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

    _setData = {}
    for i in _attri:
        if i == 'buff':
            _setData['basebuff'] = _dGlyph['basebuff']
            _con = g.GC['glyphcom']['base']['lvdata']
            for x in _dGlyph['buff']:
                _dGlyph['buff'][x] = int(_dGlyph['basebuff'][x] * (1 + _con[str(_toGlyph['lv'])]['addition'] * 0.001))
            _setData[i] = _dGlyph['buff']
            continue
        _setData[i] = _dGlyph[i]

    # 有英雄穿戴 就要重算buff  非被吞噬的雕纹
    if 'isuse' in _toGlyph:
        # 英雄的tid
        _tid = _toGlyph['isuse']
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyph,extbuff')
        # 不存在
        if _heroInfo is None:
            _res['s'] = -3
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        _update = g.m.glyphfun.handleDevoureData(_heroInfo, _toGlyph,_dGlyph, _attri)
        g.m.herofun.updateHero(uid, _tid, _update)
        _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, ['glyph','bdskillbuff'])
        g.sendChangeInfo(conn, {'hero': _heroData})

    _toGlyph.update(_setData)

    _sendData = g.delNeed(uid, _need, logdata={'act': 'glyph_devoure'})
    g.sendChangeInfo(conn, _sendData)

    g.mdb.delete('glyph',{'_id':g.mdb.toObjectId(_dGid),'uid':uid})
    g.m.glyphfun.setGlyphInfo(uid, _gid, _setData)
    g.sendChangeInfo(conn, {'glyph': {_gid: _toGlyph, _dGid: {'num': 0}}})
    # 升级消耗的材料
    _prize = g.m.glyphfun.getPrizeByLv(_dGlyph['lv'])
    if _prize:
        _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_devoure','lv':_dGlyph['lv']})
        g.sendChangeInfo(conn, _sendData)
        _res['d'] = {'prize': _prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5c24ba13c0911a30a0345dc3','5bd75c81cc20f32f18048cc5',['buff']])