#!/usr/bin/python
# coding:utf-8
'''
玩家 - 打木桩
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")
import g
from ZBFight import ZBFight




def proc(conn, data):
    """

    :param conn:
    :param data: [要打得位置:[int], 阵容]
    :return:
    ::

        {'d': {'fightres':{}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要打得位置
    _pos = data[0]
    # 阵容
    _fightData = data[1]

    # 参数错误
    if not _pos:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    _npcList = g.m.npcfun.getNpcById('90000')
    _bossFightData = {'herolist': [], 'headdata': {}}
    for i in _pos:
        _npc = _npcList[0].copy()
        _npc['pos'] = i
        _bossFightData['herolist'].append(_npc)
    _bossFightData['headdata']['name'] = g.m.herofun.getHeroCon(_npcList[0]['hid'])['name']
    _bossFightData['headdata']['lv'] = _npcList[0]['lv']
    _bossFightData['headdata']['head'] = _npcList[0]['head']
    _bossFightData['headdata']['dengjielv'] = _npcList[0]['dengjielv']

    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]

    _res['d'] = {'fightres': _fightRes}
    return _res

if __name__ == '__main__':
    uid = g.buid("rzh")

    g.debugConn.uid = uid
    print (doproc(g.debugConn, data=[[1,2,3],{"1":"5f9af5cb9dc6d64138dc15ff","2":"60baf6d79dc6d6232a0f44d4"}]))