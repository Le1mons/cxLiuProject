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

    # 对方不在申请列表里
    if _toUid not in _apply:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_agree_res_-1')
        return _res

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

    _otherFriends = g.m.friendfun.getFriendList(_toUid)
    # 对方好友数量已达到上限
    if len(_otherFriends) >= _friendmaxnum:
        # 删除这条申请
        g.mdb.update('friend',{'uid':uid},{'$pull':{'apply': _toUid}})
        _res['s'] = -6
        _res['errmsg'] = g.L('friend_agree_res_-6')
        return _res

    # 已被屏蔽
    if _toUid in _shields:
        _res['s'] = -4
        _res['errmsg'] = g.L('friend_agree_res_-4')
        return _res

    _otherShieldList = g.m.friendfun.getShieldList(_toUid)
    # 被对方屏蔽
    if _toUid in _otherShieldList:
        _res['s'] = -5
        _res['errmsg'] = g.L('friend_agree_res_-5')
        return _res

    g.mdb.update('friend',{'uid':uid},{'$addToSet':{'friend':_toUid},'$pull':{'apply':_toUid}},upsert=True)
    g.mdb.update('friend',{'uid':_toUid},{'$addToSet':{'friend':uid},'$pull':{'apply':uid}},upsert=True)

    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    # print doproc(g.debugConn,['0_5aea81d0625aee4a04a0146d'])
    g.mdb.update('friend', {'uid': '0_5b7b7787e138236c0f9d87bb'}, {'$push': {'friend': 1}, '$pull': {'apply': 1}})