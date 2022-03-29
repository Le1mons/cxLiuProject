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
    """

    :param conn:
    :param data: [uid:str, 阵容:dict{占位:英雄tid}]
    :return:
    ::

        {"fightres":{}
        's': 1}

    """
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
    # f不能和自己切磋
    if _rivalUid == uid:
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_discuss_res_-2')
        return _res

    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 如果是本服的
    if g.m.crosscomfun.chkIsThisService(_rivalUid):
        _rivalData = g.m.zypkjjcfun.getDefendHero(_rivalUid)
        # 对方阵容不存在
        if not _rivalData:
            _res['s'] = -1
            _res['errmsg'] = g.L('friend_discuss_res_-1')
            return _res

        _rivalChkData = g.m.fightfun.chkFightData(_rivalUid,_rivalData, side=1)
        if  _rivalChkData['chkres'] < 1:
            _res['s'] = _rivalChkData['chkres']
            _res['errmsg'] = g.L(_rivalChkData['errmsg'])
            return _res

        _rivalFightData = g.m.fightfun.getUserFightData(_rivalUid, _rivalChkData['herolist'], 1,sqid=_rivalData.get('sqid'))
        _headdata = _rivalChkData['headdata']
    else:
        _data = g.crossDB.find1('jjcdefhero', {'uid': _rivalUid},fields=['_id','headdata','fightdata'])
        _rivalFightData = _data['fightdata'] if _data else []
        _headdata = _data['headdata'] if _data else {}

    #玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid,_chkFightData['herolist'],0, sqid=_fightData.get('sqid'))
    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _rivalFightData).start()

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _headdata]

    # 设置战斗日志缓存 mc最大只能存1M的战斗数据，
    _UUID = g.C.getUniqCode()
    _key = g.C.STR("fightlog{1}", _UUID)
    g.crossMC.set(_key, 1, time=1800)
    _setData = {}
    _setData["uuid"] = _key
    _setData["fightres"] = _fightRes
    _setData["ttltime"] = g.C.getTTLTime()
    g.crossDB.insert("chat_video", _setData)

    _res['d'] = {'fightres': _fightRes, "fightkey": _key}
    return _res


if __name__ == '__main__':
    uid = g.buid("jingqi_1908130153303745")
    uid = "23600_5d5770074005a0473cd2fe14"
    g.debugConn.uid = uid
    print doproc(g.debugConn,["17920_5d04d790644a61123f95caa2",{"1":"614f75481526677db82b1e65","2":"61ba04cf1526675ed7aa8101","3":"614328441526676871f4376b","4":"61c7b0df1526677d09b1dc1b","5":"60d878231526676bc058de71","6":"61bb77bf1526672adc1ce08b"}])