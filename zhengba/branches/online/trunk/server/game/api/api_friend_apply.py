# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——申请好友
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
    # 要添加的uid
    _toUid = data[0]
    
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data:
        # _applyList = []
        _friends = []
        _shieldList = []
    else:
        # _applyList = _data.get('apply',[])
        _friends = _data.get('friend',[])
        _shieldList = _data.get('shield',[])

    _maxNum = g.GC['friend']['base']['friendmaxnum']

    # 不能添加自己
    if _toUid == uid:
        _res['s'] = -6
        _res['errmsg'] = g.L('friend_apply_res_-6')
        return _res

    # 好友数量已达到上限
    if len(_friends) >= _maxNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_apply_res_-1')
        return _res

    # 双方已经是好友
    if _toUid in _friends:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_apply_res_-2')
        return _res

    _otherShieldList = g.m.friendfun.getShieldList(_toUid)
    # 被对方屏蔽
    if uid in _otherShieldList:
        _res['s'] = -3
        _res['errmsg'] = g.L('friend_apply_res_-3')
        return _res

    # 已屏蔽对方
    if _toUid in _shieldList:
        _res['s'] = -4
        _res['errmsg'] = g.L('friend_apply_res_-4')
        return _res

    _applyList = g.m.friendfun.getApplyList(_toUid)
    # 不可重复申请
    if uid in _applyList:
        _res['s'] = -5
        _res['errmsg'] = g.L('friend_apply_res_-5')
        return _res

    # 添加进对方申请列表
    g.mdb.update('friend',{'uid':_toUid},{'$push':{"apply":uid}},upsert=True)
    g.mdb.update('friend',{'uid':uid},{'$pull':{"tuijian":_toUid}},upsert=True)
    g.event.emit('addfriend', _toUid)
    # g.m.taskfun.chkTaskHDisSend(uid)

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,["0_5b54c57de1382312f766903c"])