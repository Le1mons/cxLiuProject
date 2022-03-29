# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——发送
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
    # 要发送的玩家uid
    _toUid = data[0]
    _con = g.GC['friend']['base']
    # 每天最大接受印记数量
    _giftNum = _con['giftnum']

    # 获取已发送印记的好友列表
    _ctype = 'friend_yinji'
    _giftInfo = g.m.friendfun.getGiftAndAccept(uid)
    _filterList = _giftInfo['gift']
    _num = len(_filterList)
    # 发送次数已达上限
    if _num >= _giftNum:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_gift_res_-1')
        return _res

    if _toUid not in _filterList:
        # 赠送印记
        g.setAttr(_toUid, {'ctype': 'friend_canreceive'}, {'$push': {'v': uid}})
        # 添加行动到giftlist
        _filterList.append(_toUid)
        g.setAttr(uid, {'ctype': _ctype}, {'$set': {'giftlist': _filterList,'v':_giftInfo['accept']},'$inc':{'sendnum':1}})

    # 开服狂欢第一天 赠送好友印记
    g.event.emit('kfkh',uid,12,1,_num)
    # 监听赠送友情印记
    g.event.emit('dailytask', uid, 5)
    g.event.emit('FriendYinji', uid)
    # g.m.taskfun.chkTaskHDisSend(uid)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,['0_5aec54eb625aee6374e25e0c'])