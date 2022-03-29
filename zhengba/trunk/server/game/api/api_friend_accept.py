# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——接受印记
'''

import sys

if __name__ == "__main__":
    sys.path.append("game")
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str]
    :return:
    ::

        {'d': {'prize':[]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 接受印记来自的uid
    _fromUid = data[0]
    _canList = g.m.friendfun.getCanReceiveYinji(uid)
    # 没有印记可以接受
    if not _canList or _fromUid not in _canList:
        _res['s'] = -3
        _res['errmsg'] = g.L('friend_accept_res_-3')
        return _res

    # 获取已接受的好友列表
    _giftInfo = g.m.friendfun.getGiftAndAccept(uid)
    _filterList = _giftInfo['accept']
    _giftList = _giftInfo['gift']
    # 印记已接受
    if _fromUid in _filterList:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_accept_res_-2')
        return _res

    _num = len(_filterList)
    _acceptNum = g.GC['friend']['base']['acceptnum']
    # 超过最大领取次数
    if _num >= _acceptNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_accept_res_-1')
        return _res

    # g.setAttr(uid,where={'ctype':'friend_received'},data={'$push':{'v': _fromUid}})
    _filterList.append(_fromUid)
    g.setAttr(uid,where={'ctype':'friend_yinji'},data={'v': _filterList,'giftlist':_giftList})
    g.setAttr(uid,where={'ctype':'friend_canreceive'},data={'$pull':{'v': _fromUid}})

    _prize = g.GC['friend']['base']['prize']

    _sendData = g.getPrizeRes(uid, _prize, act={'act':'friend_accept','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,["0_5b8e4c62e13823154adf4122"])