#!/usr/bin/python
# coding:utf-8
'''
探险 - 好友map
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'reclist': [领取列表], 'step': 层数, 'trader':[已经购买的商人list]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 要取的层数
    _min = abs(int(data[0]))
    _max = abs(int(data[1]))

    gud = g.getGud(uid)
    # 好友列表
    _friends = g.m.friendfun.getFriendList(uid)
    # 势力成员
    if gud['ghid']:
        _userList = g.mdb.find('gonghuiuser', {'ghid': gud['ghid'], 'uid':{'$ne': uid}}, fields=['_id','uid'])
        for i in _userList:
            _friends.append(i['uid'])

    _data = g.crossDB.find('tanxian',{'uid': {'$in': _friends},'mapid': {'$lte': _max,'$gte':_min}},fields={'_id':0})
    _rData = {}
    for i in _data:
        _step = str(i.pop('mapid'))
        if _step not in _rData:
            _rData[_step] = []
        _rData[_step].append(i)

    # 我的层数
    _myStep = gud['mapid']

    for step in _rData:
        reverse = False if int(step) >= _myStep else True
        _rData[step].sort(key=lambda x:x['zhanli'], reverse=reverse)

    _res['d'] = _rData
    return _res


if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','240'])