# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——打开主界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("game")
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
    _friendList = g.m.friendfun.getFriendList(uid)
    # 获取助战信息
    _bossList = g.mdb.find('friend',{'uid':{'$in': _friendList},'treasure.boss':{'$exists':1}},fields=['_id','uid'])
    _bossList = [i['uid'] for i in _bossList]
    _userList = g.mdb.find('userinfo',{'uid':{"$in":_friendList}})
    _friendList = []
    for i in _userList:
        _fmtDict = {}
        _fmtDict['headdata'] = g.m.userfun.getShowHead(i['uid'])
        _fmtDict['lasttime'] = i['lasttime']
        _friendList.append(_fmtDict)

    _tiliInfo = g.m.friendfun.getTiliNum(uid,getcd=1)
    _yinjiList = []
    _yinjiInfo = g.m.friendfun.getGiftAndAccept(uid)
    _yinjiList = g.m.friendfun.getCanReceiveYinji(uid)
    _received = _yinjiInfo['accept']
    _giftList = _yinjiInfo['gift']

    _res['d'] = {'friend': _friendList,'tiliinfo':_tiliInfo,'accept': _yinjiList,'gift':_giftList,'received':_received,'boss':_bossList}
    return _res


if __name__ == '__main__':
    uid = g.buid("jiang1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5b2da991c0911a1f786e0b24",["5b2c5aedc0911a3074cf21a6","5b2b58d8c0911a1728ff8189","5b2b58d8c0911a1728ff8189"]]
)
