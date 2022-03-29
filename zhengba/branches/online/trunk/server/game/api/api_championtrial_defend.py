# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append(".\game")

import g
'''
冠军的试练 - 查看录像
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 三组站位信息   列表
    _teamData = data[0]
    # 队伍不够
    if len(_teamData) < 3:
        _res['s'] = -2
        _res['errmsg'] = g.L('championtrial_defend_res_-2')
        return _res

    _team1Data = _teamData[0].values()
    _team2Data = _teamData[1].values()
    _team3Data = _teamData[2].values()
    # 有重复的英雄
    if set(_team1Data)&set(_team2Data)\
        or set(_team1Data)&set(_team3Data)\
        or set(_team3Data)&set(_team2Data):
        _res['s'] = -1
        _res['errmsg'] = g.L('championtrial_defend_res_-1')
        return _res

    _zhanli = 0
    for i in _teamData:
        _chkFightData = g.m.fightfun.chkFightData(uid, i)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res
        _zhanli += _chkFightData['zhanli']

    # 设置上阵英雄
    g.m.championfun.setUserJJC(uid,{'defhero': _teamData,'zhanli':_zhanli})
    return _res

if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    _data = [{'1':'5b20741ce13823338d9337d5'},{'1':'5b20741ce13823338d9337da'},{'1':'5b20741ce13823338d9337db'}]
    print doproc(g.debugConn, data=[_data])