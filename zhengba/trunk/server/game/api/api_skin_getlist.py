#!/usr/bin/python
#coding:utf-8
'''
皮肤--获取所有皮肤
'''


import sys
sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
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
    _list = g.mdb.find('skin', {'uid': uid}, fields=['id','wearer','expire'])
    _rData = {}
    _delId = []
    for i in _list:
        if i['expire'] != -1 and g.C.NOW() > i['expire']:
            _delId.append(i['_id'])
        else:
            i['_id'] = str(i['_id'])
            _rData[i['_id']] = i
    # 删除过期的
    if _delId:
        g.mdb.delete('skin', {'uid':uid,'_id':{'$in': _delId}})

    _res['d'] = {'list': _rData}
    return _res

if __name__ == '__main__':
    uid = g.buid('lyf')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn,['1026', '84']))