#!/usr/bin/python
#coding:utf-8
'''
皮肤--脱下皮肤
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
    '''
    _skin = g.mdb.find1('skin', {'uid': uid, '_id': g.mdb.toObjectId(_sTid)},fields=['id','wearer','expire','id'])
    # 皮肤不存在
    if not _skin:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res
        '''

    '''
    # 皮肤已过期
    if _skin['expire'] != -1 and g.C.NOW() >= _skin['expire']:
        g.mdb.delete('skin',{'uid': uid, '_id': _skin['_id']})
        g.sendChangeInfo(conn, {'skin': {_sTid: {'num': 0}}})
        _res['s'] = -2
        _res['errmsg'] = g.L('skin_wear_-2')
        return _res
        '''

    '''
    # 皮肤已经有佩戴者
    if 'wearer' in _skin:
        _res['s'] = -3
        _res['errmsg'] = g.L('skin_wear_-3')
        return _res
        '''

    _hero = g.m.herofun.getHeroInfo(uid, _hTid, keys='_id,skin')
    # 英雄不存在
    if _hero is None:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_heroerr')
        return _res
    
    if 'skin' not in _hero:
        #英雄没有穿戴皮肤
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _preSkinId = _hero['skin']['tid']
    _send = {'skin': {_preSkinId: {'wearer': ''}}}
    g.mdb.update('skin', {'uid':uid,'_id':g.mdb.toObjectId(_preSkinId)},{'$unset':{'wearer':1}})
    g.mdb.update('hero', {'uid':uid,'_id':g.mdb.toObjectId(_hTid)}, {'$unset':{'skin': 1}})
    _r = g.m.herofun.reSetHeroBuff(uid, _hTid)
    _r[_hTid]['skin'] = 0
    _send['hero'] = _r
    #g.mergeDict(_send, _r)
    #print 'downsend======',_send
    g.sendChangeInfo(conn, _send)

    # 更新跨服
    g.m.zypkjjcfun.updateCrossData(uid, _hTid)
    return _res

if __name__ == '__main__':
    uid = g.buid('test11')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn, ['5fc5bafd0c01694b0d135ad4']))