# coding:utf-8
'''
冠军的试练 - 上阵防守阵容
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [三组站位:list [{"1":英雄tid}]]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 三组站位信息   列表
    _teamData = data[0]

    # 获取之前的缓存
    _preTeam = g.mc.get('champion_defend_{}'.format(uid)) or []
    _preTeam.append(_teamData)
    if len(_preTeam) < 3:
        g.mc.set('champion_defend_{}'.format(uid), _preTeam, 60)
    else:
        # # 队伍不够
        # if len(_teamData) < 3:
        #     _res['s'] = -2
        #     _res['errmsg'] = g.L('championtrial_defend_res_-2')
        #     return _res
        _preTeam = _preTeam[-3:]
        g.mc.delete('champion_defend_{}'.format(uid))

        # 有重复的英雄
        if not g.m.championfun.checkRepeatHero(_preTeam):
            _res['s'] = -1
            _res['errmsg'] = g.L('championtrial_defend_res_-1')
            return _res

        _zhanli = 0
        for i in _preTeam:
            _chkFightData = g.m.fightfun.chkFightData(uid, i, side=1)
            if _chkFightData['chkres'] < 1:
                _res['s'] = _chkFightData['chkres']
                _res['errmsg'] = g.L(_chkFightData['errmsg'])
                return _res
            _zhanli += _chkFightData['zhanli']

        # 设置上阵英雄
        g.m.championfun.setUserJJC(uid,{'defhero': _preTeam,'zhanli':_zhanli})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    _data = [{'1':'5b20741ce13823338d9337d5'}]
    print doproc(g.debugConn, data=[_data])