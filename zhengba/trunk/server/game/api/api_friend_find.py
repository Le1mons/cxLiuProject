# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——查找好友
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [名字:str]
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
    # 要查找的名字
    _name = data[0]
    _info = g.mdb.find1('userinfo',{'name':_name})
    # 查找的好友不存在
    if not _info:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_find_res_-1')
        return _res

    # 不能查找自己
    if _info['uid'] == uid:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_find_res_-2')
        return _res

    _applys = g.m.friendfun.getApplyList(_info['uid'])
    # 不能重复申请
    if uid in  _applys:
        _res['s'] = -3
        _res['errmsg'] = g.L('friend_find_res_-3')
        return _res

    _userUid = _info['uid']
    _headData = g.m.userfun.getShowHead(_userUid)
    _res['d'] = {'headdata': _headData}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[u'挂机喷队友'])