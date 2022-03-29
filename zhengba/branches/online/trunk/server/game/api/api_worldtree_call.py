#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
世界树--召唤
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄的种族
    _zhongzu = str(data[0])

    _worldtreeCon = g.m.worldtreefun.getWorldTreeCon()
    _need = _worldtreeCon['callneed']
    # 检查世界树果实是否充足
    _chk = g.chkDelNeed(uid, _need)
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _delData = g.delNeed(uid, _need,issend=0,logdata={'act': 'worldtree_call'})
    _prize = _worldtreeCon['prize']
    _dlzId = _worldtreeCon['calldlz'][_zhongzu]
    _dlPrize = g.m.diaoluofun.getGroupPrize(_dlzId)
    _dlPrize += _prize

    _sendData = g.getPrizeRes(uid, _dlPrize, act={'act':'worldtree_call','prize':_dlPrize})
    _sendData['item'].update(_delData['item'])
    g.sendChangeInfo(conn, _sendData)

    # g.setAttr(uid,{'ctype':'worldtree_call'},{'$inc':{'v':1}})
    g.event.emit("WorldTree",uid)

    _res['d'] = {'prize': _dlPrize}
    return _res


if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['2'])