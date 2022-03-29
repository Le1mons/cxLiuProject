#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
雕纹 - 雕纹重铸
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
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id'])
    # 不存在
    if not _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['glyph'][_data['gid']]
    # 只有红色品质的雕纹才能重铸
    if not _con['recast']:
        _res['s'] = -2
        _res['errmsg'] = g.L('glyph_recast_-2')
        return _res

    _need = g.GC['glyphcom']['base']['need']['recast']
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

    _preSkill = _data['extskill']
    _data['extskill'] = g.m.glyphfun.getRandomExtra('extskill',recast=1)[0]
    # 有英雄穿戴
    if 'isuse' in _data:
        _tid = _data['isuse']
        # 英雄的tid
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,glyphskill,glyph,hid')
        # 不存在
        if _heroInfo is None:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        # 指定英雄获得额外技能
        _glyphskill = _heroInfo.get('glyph', {})
        for i in _heroInfo.get('glyph', {}):
            if _heroInfo['glyph'][i]['gid'] == _gid:
                _heroInfo['glyph'][i]['extskill'] = _data['extskill']

        g.m.herofun.updateHero(uid, _tid, {'glyph': _heroInfo['glyph']})
        _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, ['glyph','bdskillbuff'])
        _heroData[_tid].update({'glyph': _heroInfo['glyph']})
        g.sendChangeInfo(conn, {'hero': _heroData})

    _sendData = g.delNeed(uid, _need,logdata={'act': 'glyph_recast','old': _preSkill,'new':_data['extskill']})
    _sendData.update({'glyph': {_gid: _data}})
    g.sendChangeInfo(conn, _sendData)
    g.m.glyphfun.setGlyphInfo(uid, _gid, {'extskill': _data['extskill']})
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5c24ba13c0911a30a0345dc3','5bd75c81cc20f32f18048cc5'])