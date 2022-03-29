#!/usr/bin/python
#coding:utf-8
'''
皮肤--佩戴皮肤
'''


import sys
sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [英雄_id:str, 皮肤_id:str]
    :return:
    ::

        {"d":{"list": [{'expire':过期时间,'id':皮肤id,'wearer':佩戴者的_id}]}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s":1}
    uid = conn.uid
    # 英雄tid
    _hTid = data[0]
    # 皮肤tid
    _sTid = data[1]

    _skin = g.mdb.find1('skin', {'uid': uid, '_id': g.mdb.toObjectId(_sTid)},fields=['id','wearer','expire','id'])
    # 皮肤不存在
    if not _skin:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 皮肤已过期
    if _skin['expire'] != -1 and g.C.NOW() >= _skin['expire']:
        g.mdb.delete('skin',{'uid': uid, '_id': _skin['_id']})
        g.sendChangeInfo(conn, {'skin': {_sTid: {'num': 0}}})
        _res['s'] = -2
        _res['errmsg'] = g.L('skin_wear_-2')
        return _res

    _send = {'skin': {_sTid: {'wearer': _hTid}},'hero':{}}

    # 该英雄已经穿戴该皮肤
    if 'wearer' in _skin and  _skin['wearer'] == _hTid:
        _res['s'] = -3
        _res['errmsg'] = g.L('skin_wear_-3')
        return _res
        

    _hero = g.m.herofun.getHeroInfo(uid, _hTid, keys='_id,skin,hid')
    # 英雄不存在
    if _hero is None or _hero['hid'] not in g.GC['accessories'][str(_skin['id'])]['hid']:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    if 'wearer' in _skin:
        #如果已经有英雄穿戴皮肤
        _preSkinId = _sTid
        g.mdb.update('hero', {'uid':uid,'_id':g.mdb.toObjectId(_skin['wearer'])}, {'$unset':{'skin': 1}})
        _oldHero = g.m.herofun.reSetHeroBuff(uid, _skin['wearer'])
        _oldHero[_skin['wearer']]['skin'] = 0
        _send['hero'].update(_oldHero)


    # 如果已经佩戴了一个
    if 'skin' in _hero:
        # 不能穿戴同一个
        if _hero['skin']['tid'] == _sTid:
            _res['s'] = -5
            _res['errmsg'] = g.L('global_heroerr')
            return _res

        _preSkinId = _hero['skin']['tid']
        g.mdb.update('skin', {'uid':uid,'_id':g.mdb.toObjectId(_preSkinId)},{'$unset':{'wearer':1}})
        _send['skin'].update({_preSkinId: {'wearer': ''}})

    g.mdb.update('skin', {'uid':uid,'_id':g.mdb.toObjectId(_sTid)},{'$set':{'wearer':_hTid}})

    _hero['skin'] = {'tid': _sTid, 'expire': _skin['expire'], 'sid': _skin['id']}
    g.mdb.update('hero', {'uid':uid,'_id':g.mdb.toObjectId(_hTid)}, {'skin': _hero['skin']})
    _r = g.m.herofun.reSetHeroBuff(uid, _hTid)
    _r[_hTid]['skin'] = _hero['skin']
    _send['hero'].update(_r)
    #print 'wearsend======',_send
    #g.mergeDict(_send, _r)
    g.sendChangeInfo(conn, _send)
    # 更新跨服
    g.m.zypkjjcfun.updateCrossData(uid, _hTid)
    return _res

if __name__ == '__main__':
    uid = g.buid('test11')
    g.debugConn.uid = uid
    _data = ["5fc5bafd0c01694b0d135ad4", "6092604e0c0169739717600e"]
    print g.minjson.write(doproc(g.debugConn, _data))
