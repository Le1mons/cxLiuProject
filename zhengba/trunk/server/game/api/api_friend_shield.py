# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——屏蔽好友
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str, 是否取消屏蔽:int]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 要屏蔽的玩家的uid
    _toUid = data[0]
    # 是否取消屏蔽
    _isCancel = int(data[1])

    _benfu = g.m.crosscomfun.chkIsThisService(_toUid)
    if not _isCancel:
        # 不能拉黑自己
        if uid == _toUid:
            _res['s'] = -11
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _friendData = g.mdb.find1('friend',{'uid':uid}) or {}
        _shield = _friendData.get('shield', [])
        _friends = _friendData.get('friend', [])

        _shieldmaxnum = g.GC['friend']['base']['shieldmaxnum']
        # 超过最大屏蔽数量
        if len(_shield) >= _shieldmaxnum:
            _res['s'] = -1
            _res['errmsg'] = g.L('friend_shield_res_-1')
            return _res

        # 不能拉黑自己
        if _toUid == uid:
            _res['s'] = -10
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 该玩家已经在屏蔽列表中
        if _toUid in _shield:
            _res['s'] = -2
            _res['errmsg'] = g.L('friend_shield_res_-2')
            return _res

        _set = {'$push':{'shield': _toUid},'$pull': {"friend": _toUid,'apply':_toUid}}
        # 来自跨服
        if not _benfu:
            g.crossDB.update('cross_friend', {'uid': _toUid},{'$addToSet': {'shield': uid}},upsert=True)

        g.mdb.update('friend',{'uid':uid}, _set,upsert=True)
        # 如果该玩家是好友
        if _toUid in _friends:
            if _benfu:
                # 删除双方的好友信息
                g.mdb.update('friend', {'uid': _toUid}, {'$pull': {"friend": uid,'apply':_toUid}})
                # 清楚双方印记信息
                g.setAttr(uid, {'ctype': 'friend_canreceive'}, {'$pull': {"v": _toUid}})
                g.setAttr(_toUid, {'ctype': 'friend_canreceive'}, {'$pull': {"v": uid}})
            else:
                g.m.crosscomfun.CATTR().setAttr(_toUid, {'ctype': 'friend_canreceive'}, {'$pull': {'v': uid}})
    else:
        g.mdb.update('friend',{'uid':uid},{'$pull':{'shield': _toUid}})
        if not _benfu:
            g.crossDB.update('cross_friend', {'uid': _toUid},{'$pull': {'shield': uid}},upsert=True)

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,['0_5aec54eb625aee6374e25e02',1])