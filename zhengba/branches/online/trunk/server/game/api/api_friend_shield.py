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

    if not _isCancel:
        _friendData = g.mdb.find1('friend',{'uid':uid})
        if not _friendData:
            _shield = []
            _friends = []
        else:
            _shield = _friendData.get('shield', [])
            _friends = _friendData.get('friend', [])

        _shieldmaxnum = g.GC['friend']['base']['shieldmaxnum']
        # 超过最大屏蔽数量
        if len(_shield) >= _shieldmaxnum:
            _res['s'] = -1
            _res['errmsg'] = g.L('friend_shield_res_-1')
            return _res

        # 该玩家已经在屏蔽列表中
        if _toUid in _shield:
            _res['s'] = -2
            _res['errmsg'] = g.L('friend_shield_res_-2')
            return _res

        g.mdb.update('friend',{'uid':uid},{'$push':{'shield': _toUid},'$pull': {"friend": _toUid,'apply':_toUid}})
        # 如果该玩家是好友
        if _toUid in _friends:
            # 删除双方的好友信息
            g.mdb.update('friend', {'uid': _toUid}, {'$pull': {"friend": uid,'apply':_toUid}})
            # 清楚双方印记信息
            g.setAttr(uid, {'ctype': 'friend_canreceive'}, {'$pull': {"v": _toUid}})
            g.setAttr(_toUid, {'ctype': 'friend_canreceive'}, {'$pull': {"v": uid}})
    else:
        g.mdb.update('friend',{'uid':uid},{'$pull':{'shield': _toUid}})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,['0_5aec54eb625aee6374e25e02',1])