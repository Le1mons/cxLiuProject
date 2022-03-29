# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——同意好友
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str]
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
    # 要添加的玩家的uid
    _toUid = data[0]
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data:
        _apply = []
        _friends = []
        _shields = []
    else:
        _apply = _data.get('apply',[])
        _friends = _data.get('friend',[])
        _shields = _data.get('shield',[])

    # 对方已在好友列表里
    if _toUid in _friends:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_agree_res_-2')
        return _res

    _friendmaxnum = g.GC['friend']['base']['friendmaxnum']
    # 好友数量已达到上限
    if len(_friends) >= _friendmaxnum:
        _res['s'] = -3
        _res['errmsg'] = g.L('friend_agree_res_-3')
        return _res

    # 已被屏蔽
    if _toUid in _shields:
        _res['s'] = -4
        _res['errmsg'] = g.L('friend_agree_res_-4')
        return _res

    _set = {'$addToSet':{'friend':_toUid},'$pull':{'apply':_toUid}}
    # 本服的
    if g.m.crosscomfun.chkIsThisService(_toUid):
    # if False:
        # 对方不在申请列表里
        if _toUid not in _apply:
            _res['s'] = -1
            _res['errmsg'] = g.L('friend_agree_res_-1')
            return _res

        _otherFriends = g.m.friendfun.getFriendList(_toUid)
        # 对方好友数量已达到上限
        if len(_otherFriends) >= _friendmaxnum:
            # 删除这条申请
            g.mdb.update('friend',{'uid':uid},{'$pull':{'apply': _toUid}})
            _res['s'] = -6
            _res['errmsg'] = g.L('friend_agree_res_-6')
            return _res

        _otherShieldList = g.m.friendfun.getShieldList(_toUid)
        # 被对方屏蔽
        if _toUid in _otherShieldList:
            _res['s'] = -5
            _res['errmsg'] = g.L('friend_agree_res_-5')
            return _res

        g.mdb.update('friend', {'uid': _toUid}, {'$addToSet': {'friend': uid}, '$pull': {'apply': uid}}, upsert=True)

    else:
        # 加上跨服的
        _r = g.crossDB.update('cross_friend', {'uid': uid}, {'$pull': {'apply': _toUid}})
        # pull 不成功
        if not _r['nModified']:
            _res['s'] = -7
            _res['errmsg'] = g.L('friend_agree_res_-1')
            return _res

        g.crossDB.update('cross_friend', {'uid': _toUid}, {'$addToSet': {'agree': uid}})

    g.mdb.update('friend',{'uid':uid},_set,upsert=True)

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = '90_5cd29d509dc6d6730af92cc0'
    _nt = g.C.NOW()
    _stime = 1630425600
    _day = g.C.getTimeDiff(_nt, _stime)
    print _day