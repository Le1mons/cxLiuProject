#!/usr/bin/python
#coding:utf-8
'''
皮肤--删除过期皮肤
'''


import sys
sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [皮肤_id:str]
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
    # 皮肤tid
    _sTid = str(data[0])

    _skin = g.mdb.find1('skin', {'uid': uid, '_id': g.mdb.toObjectId(_sTid)},fields=['id','wearer','expire'])
    # 皮肤不存在
    if not _skin:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 皮肤还没过期
    if _skin['expire'] == -1 or g.C.NOW() < _skin['expire']:
        _res['s'] = -2
        _res['errmsg'] = g.L('skin_remove_-2')
        return _res

    _send = {'skin': {_sTid: {'num': 0}}}
    # 皮肤已经有佩戴者
    if 'wearer' in _skin:
        g.mdb.update('hero', {'uid':uid,'_id':g.mdb.toObjectId(_skin['wearer'])}, {'$unset':{'skin':1}})
        _r = g.m.herofun.reSetHeroBuff(uid, _skin['wearer'], ['herobase'])
        _r[_skin['wearer']]['skin'] = 0
        g.mergeDict(_send, {'hero':_r})

        g.m.zypkjjcfun.updateCrossData(uid, _skin['wearer'])

    g.mdb.delete('skin', {'uid': uid, '_id': g.mdb.toObjectId(_sTid)})
    g.sendChangeInfo(conn, _send)
    return _res

if __name__ == '__main__':
    uid = g.buid('tk9527')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn,['5d2eda9a625aee58282c123b']))