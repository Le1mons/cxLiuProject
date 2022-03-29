# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——拒绝好友
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
    # 是否全部拒绝
    _isAll = data[0]

    # 如果是全部删除
    if _isAll:
        g.mdb.update('friend',{'uid':uid},{'apply':[]})

        g.crossDB.update('cross_friend', {'uid': uid}, {'apply': []})
    else:
        # 要删除的uid
        _toUid = data[1]

        # 不是本服
        if not g.m.crosscomfun.chkIsThisService(_toUid):
            g.crossDB.update('cross_friend', {'uid': uid}, {'$addToSet': {'apply': _toUid}})
        else:
            _data = g.mdb.find1('friend', {'uid': uid}) or {}
            _applys = _data.get('apply', [])
            # 不再申请列表里
            if _toUid not in _applys:
                _res['s'] = -1
                _res['errmsg'] = g.L('friend_agree_res_-1')
                return _res

            g.mdb.update('friend',{'uid':uid},{'$pull':{'apply': _toUid}})

    return _res

if __name__ == '__main__':
    uid = g.buid("5")
    g.debugConn.uid = '9270_5c874834644a6105bbfdab67'
    print doproc(g.debugConn,[1,'0_5aea81d0625aee4a04a0146d'])