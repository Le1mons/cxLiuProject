# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——删除好友
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
    # 要删除的好友的uid
    _toUid = data[0]
    _friends = g.m.friendfun.getFriendList(uid)
    # 双方不是好友
    if _toUid not in _friends:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_delete_res_-1')
        return _res

    # 删除双方的好友信息
    g.mdb.update('friend', {'uid':uid}, {'$pull':{"friend": _toUid}})
    g.setAttr(uid,{'ctype':'friend_canreceive'}, {'$pull': {"v": _toUid}})
    # 如果是本服的
    if g.m.crosscomfun.chkIsThisService(_toUid):
        g.mdb.update('friend', {'uid':_toUid}, {'$pull':{"friend": uid}})
        # 清楚双方印记信息
        g.setAttr(_toUid,{'ctype':'friend_canreceive'}, {'$pull': {"v": uid}})
    else:
        g.crossDB.update('cross_friend', {'uid': _toUid}, {'$addToSet': {"del": uid}},upsert=True)
        g.crossDB.update('crossplayattr', {'uid': uid, 'ctype': 'friend_canreceive'},{'$pull': {"friend": uid}})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    data = ['0_5aec54eb625aee6374e25e0c']
    a = doproc(g.debugConn, data)
    print a