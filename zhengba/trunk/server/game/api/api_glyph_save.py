#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 重铸保存
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
    # 雕纹的tid
    _gid = data[0]
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id'])
    # 不存在
    if not _data or _data.get('lock') or 'recastskill' not in _data:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _data['extskill'] = _data.pop('recastskill')
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

    _data['recastskill'] = None
    g.sendChangeInfo(conn, {'glyph': {_gid: _data}})
    g.m.glyphfun.setGlyphInfo(uid, _gid, {'$set':{'extskill': _data['extskill']},'$unset':{'recastskill':1}})
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5e3d03d29dc6d64732d55c05','5bd75c81cc20f32f18048cc5'])