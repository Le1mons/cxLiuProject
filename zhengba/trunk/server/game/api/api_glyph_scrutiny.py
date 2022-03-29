#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 雕纹洗练
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [雕纹tid:str, 锁定的buff索引列表: [int, int]]
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
    # 锁定的buff
    _lockBuff = data[1]
    _data = g.m.glyphfun.getGlyphInfo(uid, _gid, fields=['_id','extbuff','isuse','lock'])
    # 不存在
    if not _data or _data.get('lock'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _extbuff = _data['extbuff']
    # 不存在
    if len(_extbuff) == 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('glyph_scrutiny_-2')
        return _res

    _need = g.GC['glyphcom']['base']['need']['lock'][len(_lockBuff)]
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

    _data['extbuff'] = g.m.glyphfun.scrutinyBuff(_extbuff, _lockBuff)
    _sendData = {'glyph': {_gid: _data}}
    # 有英雄穿戴
    if 'isuse' in _data:
        _tid = _data['isuse']
        _heroInfo = g.m.herofun.getHeroInfo(uid, _tid, keys='_id,extbuff,glyph')
        # 不存在
        if _heroInfo is None:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        # 重算附加属性改变的buff
        for i in _heroInfo['glyph']:
            if _heroInfo['glyph'][i]['gid'] == _gid:
                g.m.herofun.updateHero(uid, _tid, {g.C.STR('glyph.{1}.extbuff', i): _data['extbuff']})
                _heroData = g.m.herofun.reSetHeroBuff(uid, _tid, 'glyph')
                _sendData.update({'hero': _heroData})
                break

    _delData = g.delNeed(uid, _need, logdata={'act': 'glyph_scrutiny','locknum':len(_lockBuff)})
    _sendData.update(_delData)
    g.sendChangeInfo(conn, _sendData)
    g.m.glyphfun.setGlyphInfo(uid, _gid, {'extbuff':_data['extbuff'],'lasttime':g.C.NOW()})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5c29d94fc0911a17b0d6937a", [1,2,3,4,5,6,7,8]])