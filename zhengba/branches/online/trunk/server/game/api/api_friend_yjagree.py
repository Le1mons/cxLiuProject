# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——一键同意好友
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
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data:
        _apply = []
        _friends = []
        _shields = []
    else:
        _apply = _data.get('apply',[])
        _friends = _data.get('friend',[])
        _shields = _data.get('shield',[])

    if not _apply:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_agree_res_-1')
        return _res

    _friendmaxnum = g.GC['friend']['base']['friendmaxnum']
    _addNum = 0
    # 提示语
    _hint = []
    _addList = []
    for _toUid in _apply:
        # 好友数量已达到上限
        if len(_friends) + _addNum >= _friendmaxnum:
            _hint.append(-3)
            break

        _otherFriends = g.m.friendfun.getFriendList(_toUid)
        # 对方好友数量已达到上限
        if len(_otherFriends) >= _friendmaxnum:
            _hint.append(-6)
            continue
        # 对方已在好友列表里
        if _toUid in _friends:
            _hint.append(-2)
            continue

        # 已被屏蔽
        if _toUid in _shields:
            _hint.append(-4)
            continue

        _otherShieldList = g.m.friendfun.getShieldList(_toUid)
        # 被对方屏蔽
        if _toUid in _otherShieldList:
            _hint.append(-5)
            continue

        g.mdb.update('friend',{'uid':_toUid},{'$addToSet':{'friend':uid},'$pull':{'apply':uid}},upsert=True)
        _addNum += 1
        _addList.append(_toUid)
    if _addNum > 0:
        g.mdb.update('friend',{'uid':uid},{'$addToSet':{'friend':{'$each':_addList}},'$set':{'apply':[]}},upsert=True)
    else:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_agree_res_' + str(_hint[0]))

    return _res

if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])