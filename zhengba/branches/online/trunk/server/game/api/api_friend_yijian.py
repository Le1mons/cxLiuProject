# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——一键发送和领取
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
    _con = g.GC['friend']['base']
    # 每天最大接受印记数量
    _recMaxNum = _con['acceptnum']
    _giftMaxNum = _con['giftnum']

    _ctype = 'friend_yinji'
    # 已接受的印记和赠送的印记
    _yinjiInfo = g.m.friendfun.getGiftAndAccept(uid)
    _giftList = _yinjiInfo['gift']
    _acceptList = _yinjiInfo['accept']
    # 可以接受印记的列表
    _yinjiList = g.m.friendfun.getCanReceiveYinji(uid)
    _friendList = g.m.friendfun.getFriendList(uid)
    _prize = []

    #发送操作是否有错误，0成功，1发送到上限,2无人可发
    _sendAct = 0
    _accAct = 0
    # 获取好友发的友情印记
    if not _yinjiList:
        _accAct = 2
    else:
        _accNum = len(_acceptList)
        # 最多只能领取30个
        _recNum = _recMaxNum - _accNum
        if _recNum > 0:
            _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*len(_yinjiList)} for i in g.GC['friend']['base']['prize']]
            _sendData = g.getPrizeRes(uid, _prize,act='friend_yijian')
            g.sendChangeInfo(conn, _sendData)

            _lastList = _yinjiList[_recNum:]
            # 添加进已接受列表 拉出可接受印记列表
            _acceptList += _yinjiList[:_recNum]
            g.setAttr(uid,where={'ctype':'friend_canreceive'},data={'v':_lastList})
        else:
            _accAct = 1

    # 给好友赠送印记
    _num = 0
    if not _friendList:
        _sendAct = 2
    else:
        # 如果存在并且是同一天
        _sendNum = len(_giftList)
        if _sendNum < _giftMaxNum:
            for i in _friendList:
                # 过滤掉已发送的
                if i in _giftList:
                    continue
                _num += 1
                _giftList.append(i)
                g.setAttr(i,{'ctype': 'friend_canreceive'},{'$push': {'v': uid}})
                if _sendNum + _num >= _giftMaxNum: break
            if _num == 0:
                _sendAct = 2
            else:
                #       监听赠送友情印记
                g.event.emit('dailytask', uid, 5, _num)
                # g.m.taskfun.chkTaskHDisSend(uid)
                g.event.emit('FriendYinji', uid, _num)

                # 开服狂欢第一天 赠送好友印记
                g.event.emit('kfkh', uid,12,1,_num)
        else:
            _sendAct = 1

    g.setAttr(uid,{'ctype':_ctype},{'$set': {'giftlist': _giftList,'v':_acceptList},'$inc':{'sendnum':_num}})
    _resAct = str(_sendAct) + str(_accAct)
    _res['d'] = {'prize': _prize,'act':_resAct}
    return _res



if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])