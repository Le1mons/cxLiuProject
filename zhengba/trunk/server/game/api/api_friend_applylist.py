# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
好友界面——查看申请列表
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"applylist": [{headdata}]
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _applyList = g.m.friendfun.getApplyList(uid, False)
    _applyList = map(g.m.userfun.getShowHead, _applyList)

    _crossApply = g.crossDB.find1('cross_friend', {'uid': uid}, fields=['_id', 'apply'])
    if _crossApply:
        _allApply = g.crossDB.find('cross_friend',{'uid': {'$in': [i for i in _crossApply['apply']]}, 'head': {'$exists': 1}},fields=['_id', 'head'])
        for i in _allApply:
            _applyList.append(i['head'])

    _res['d'] = {'applylist': _applyList}
    return _res


if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    print doproc(g.debugConn, ["0_5b54c57de1382312f766903c"])
