#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 雕纹重铸
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
    if not _data or _data.get('lock'):
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
    _data['recastskill'] = g.m.glyphfun.getRandomExtra('extskill',recast=1,high=_con['colorlv']>=1)[0]

    _sendData = g.delNeed(uid, _need,logdata={'act': 'glyph_recast','old': _preSkill,'new':_data['recastskill']})
    _sendData.update({'glyph': {_gid: _data}})
    g.sendChangeInfo(conn, _sendData)
    g.m.glyphfun.setGlyphInfo(uid, _gid, {'recastskill': _data['recastskill']})
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5e3d03d29dc6d64732d55c05'])