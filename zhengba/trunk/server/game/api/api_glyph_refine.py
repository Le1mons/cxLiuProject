#!/usr/bin/python
# coding:utf-8
'''
雕纹 - 雕纹精炼
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [多个雕纹tid:str]
    :return:
    ::

        {'d':{'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 雕纹的tid 多个
    _gids = data
    # 等级不符
    if not g.chkOpenCond(uid, 'glyphrefine'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 最多选择5个雕文
    if len(_gids) > g.GC['glyphcom']['base']['refinenum']:
        _res['s'] = -10
        _res['errmsg'] = g.L('glyph_refine_-10')
        return _res

    _data = g.mdb.find('glyph', {'uid':uid,'_id':{'$in':map(g.mdb.toObjectId, _gids)}},fields=['_id','lv','gid','isuse','lock'])
    # 不能重复
    if len(_gids) != len(_data):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['glyph']
    # 红+不能精炼
    if filter(lambda x:_con[x['gid']]['colorlv']>=1, _data):
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_refine_-4')
        return _res

    # 红+不能精炼
    if filter(lambda x:_con[x['gid']]['color']>=5, _data):
        _res['s'] = -4
        _res['errmsg'] = g.L('glyph_refine_-4')
        return _res

    # 正在使用的不能精炼
    if filter(lambda x:x.get('isuse'), _data) or filter(lambda x:x.get('lock'), _data):
        _res['s'] = -3
        _res['errmsg'] = g.L('glyph_refine_-3')
        return _res

    # 删除材料
    g.mdb.delete('glyph',{'uid':uid,'_id':{'$in':map(g.mdb.toObjectId, _gids)}})
    # 获取奖励以及升级的消耗
    _prize = g.m.glyphfun.refineGlyph(_data)
    # 增加精炼进度条
    g.m.glyphfun.addRefineNum(uid, len(_gids))

    _sendData = g.getPrizeRes(uid, _prize, {'act':'glyph_refine','p':_prize,'del':_data})
    _sendData['glyph'].update({i: {'num': 0} for i in _gids})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5c28a0e2c0911a34e403ac8e'])