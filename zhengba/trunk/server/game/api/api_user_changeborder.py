#!/usr/bin/python
# coding:utf-8
'''
玩家 - 更换头像框 聊天框
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [框的类型:str('headborder','chatborder'), 框的id:str]
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
    _type = data[0]
    # 玩家新框id
    _hbId = str(data[1])
    # 获取玩家头像列表
    _con = g.GC['zaoxing'][_type]
    if _hbId not in _con:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    gud = g.getGud(uid)
    # 头像一样
    if _hbId == gud.get(_type, '1'):
        _res['s'] = -3
        _res['errmsg'] = g.L('user_ghheadborder_-3')
        return _res

    if len(_con[_hbId]['cond']) == 2:
        if gud[_con[_hbId]['cond'][0]] < _con[_hbId]['cond'][1]:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_limit' + _con[_hbId]['cond'][0])
            return _res
    else:
        _hbInfo = g.getAttrOne(uid,{'ctype': _type + '_list'},keys='_id,v,time')
        if not _hbInfo:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 没有这个头像
        if _hbId not in _hbInfo['v']:
            _res['s'] = -5
            _res['errmsg'] = g.L('user_ghheadborder_-5')
            return _res

        _nt = g.C.NOW()
        # 头像过期
        if _hbInfo.get('time',{}).get(_hbId,_nt) < _nt:
            g.setAttr(uid, {'ctype': _type + '_list'}, {'$pull':{'v': _hbId},'$unset':{'time.{}'.format(_hbId): 1}})
            _res['s'] = -6
            _res['errmsg'] = g.L('user_ghheadborder_-6')
            return _res

    g.m.userfun.updateUserInfo(uid,{_type:_hbId},{'act':'user_ghheadborder'})
    g.sendChangeInfo(conn, {'attr': {_type:_hbId}})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = ['headborder','2']
    a = doproc(g.debugConn, data)
    print a