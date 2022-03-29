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

    _sTids = data[0]

    uid = conn.uid
    _skinList = g.mdb.find('skin', {'uid': uid, '_id': {"$in": map(g.mdb.toObjectId, _sTids)}, "wearer": {"$exists": 0}, "expire": -1}, fields=['id', 'wearer', 'expire', 'id'])
    # 皮肤不存在
    if len(_sTids) != len(_skinList):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res
    # # 判断是否是永久皮肤
    # if _skin["expire"] != -1:
    #     _res['s'] = -1
    #     _res['errmsg'] = g.L('skin_wear_-4')
    #     return _res
    # 判断是否有两个皮肤
    _id = _skinList[0]["id"]
    _num = g.mdb.count("skin", {'uid': uid, "id": _id, "expire": -1})
    if _num < len(_skinList) + 1:
        _res['s'] = -1
        _res['errmsg'] = g.L('skin_wear_-6')
        return _res

    _con = g.GC["accessories"][str(_id)]
    _prize = _con["fenjieprize"] * len(_skinList)
    _prize = g.mergePrize(_prize)
    # 删除饰品
    g.mdb.delete('skin', {'uid': uid, '_id': {"$in": map(g.mdb.toObjectId, _sTids)}})
    _send = {'skin': {_sTid: {'num': 0} for _sTid in _sTids}}
    g.sendChangeInfo(conn, _send)
    _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'skin_fenjie', "id": _id, "num": len(_skinList)})
    g.sendChangeInfo(conn, _prizeRes)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('zhy001')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn,[["611f0fe2d877b5f2f9ec4e46","611f0fe2d877b5f2f9ec4e47","611f0fe2d877b5f2f9ec4e44","611f0fe2d877b5f2f9ec4e45","611f0fe2d877b5f2f9ec4e42","611f0fe2d877b5f2f9ec4e40","611f0fe2d877b5f2f9ec4e41","611f0fe2d877b5f2f9ec4e3f","611f0fe2d877b5f2f9ec4e3e","611f0fe2d877b5f2f9ec4e3d","611f0fe2d877b5f2f9ec4e48","611f0fe2d877b5f2f9ec4e49","611f0fe2d877b5f2f9ec4e4a"]]))