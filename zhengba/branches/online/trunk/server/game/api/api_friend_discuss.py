# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——切磋
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
from ZBFight import ZBFight

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 对手的uid
    _rivalUid = data[0]
    # 己方的占位信息
    _fightData = data[1]
    _rivalData = g.m.zypkjjcfun.getDefendHero(_rivalUid)
    # f不能和自己切磋
    if _rivalUid == uid:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_discuss_res_-2')
        return _res

    # 对方阵容不存在
    if not _rivalData:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_discuss_res_-1')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid,_fightData)
    if  _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _rivalChkData = g.m.fightfun.chkFightData(_rivalUid,_rivalData)
    if  _rivalChkData['chkres'] < 1:
        _res['s'] = _rivalChkData['chkres']
        _res['errmsg'] = g.L(_rivalChkData['errmsg'])
        return _res

    #玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid,_chkFightData['herolist'],0, sqid=_fightData.get('sqid'))
    _rivalFightData = g.m.fightfun.getUserFightData(_rivalUid,_rivalChkData['herolist'],1, sqid=_rivalData.get('sqid'))
    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _rivalFightData).start()
    _fightRes['headdata'] = [_chkFightData['headdata'], _rivalChkData['headdata']]

    _res['d'] = {'fightres': _fightRes}
    return _res

if __name__ == '__main__':
    data = ["0_5b5695a8c0911a2a50c9cc75",{"1":"5b49b413c0911a35585fb8a5"}]
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,data)