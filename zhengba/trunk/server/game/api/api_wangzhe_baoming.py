#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-报名接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


def proc(conn, data):
    """

    :param conn:
    :param data: [三队阵容:[{阵容}]]
    :return:
    ::

        {'d': {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 获取用户id
    uid = conn.uid
    # 获取当前时间
    _nt = g.m.crosswzfun.now()
    # 时间限制 2019.6.5之后开的区并且小于22天
    if g.getOpenTime() >= 1559664000 and g.getOpenDay() < 31:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 31 - g.getOpenDay())
        return _res

    # 计算报名时间段（0:00-22:00）
    if g.m.crosswzfun.getWangZheStatus() != 1:
        # 当前不是报名时间
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_baoming_-1')
        return _res

    # 获取本地玩家数据
    gud = g.getGud(uid)
    # 验证报名条件
    con = g.GC['crosswz']
    if gud['lv'] < con['bmneed']['lv']:
        # 等级不足
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 22 - g.getOpenDay())
        return _res

    if data:
        # 获取之前的缓存
        _teamData = g.mc.get('crosswz_baoming_{}'.format(uid)) or []
        _teamData.append(data[0])
        if len(_teamData) < 3:
            g.mc.set('crosswz_baoming_{}'.format(uid), _teamData, 60)
            return _res

        g.mc.delete('crosswz_baoming_{}'.format(uid))
        data[0] = _teamData[-3:]

    # 获取当前周数
    _dkey = g.m.crosswzfun.getDKey()
    # 获取玩家报名信息
    _userData = g.crossDB.find1('wzbaoming', {'uid': uid}, fields=['_id', 'uid', 'dkey', 'herodata', 'zhanli', 'curzhanli'])
    # 存在不能报名
    if _userData and _userData['dkey'] == _dkey:
        # 已经报名
        _res['s'] = -3
        _res['errmsg'] = g.L('wangzhe_baoming_-3')
        return _res

    _team2zhanli = []
    _fightData = []
    _zhanli = 0
    _currentZhanli = 0
    if _userData:
        _fightData = _userData['herodata']
        _zhanli = _userData['zhanli']
        _currentZhanli = _userData['curzhanli']
        _team2zhanli = _userData.get('team2zhanli', [])
    else:
        if (not data) or len(data[0]) < 3:
            _res['s'] = -4
            _res['errmsg'] = g.L('wangzhe_baoming_nodef')
            return _res

        if not g.m.crosswzfun.chkHeroRepeatRes(data[0]):
            _res['s'] = -5
            _res['errmsg'] = g.L('global_argserr')
            return _res

        for fgroup in data[0]:
            if not (fgroup and [t for t in fgroup if t != 'sqid']):
                _res['s'] = -5
                _res['errmsg'] = g.L('wangzhe_baoming_nodef')
                return _res

            _chkRes = g.m.fightfun.chkFightData(uid, fgroup)
            if _chkRes['chkres'] < 1:
                _res['s'] = _chkRes['chkres']
                _res['errmsg'] = g.L(_chkRes['errmsg'])
                return _res
            _zhanli += _chkRes['zhanli']
            _team2zhanli.append(_chkRes['zhanli'])
            _tmpFightData = g.m.fightfun.getUserFightData(uid, _chkRes['herolist'], 0, sqid=fgroup.get('sqid'))
            _fightData.append(_tmpFightData)
        _currentZhanli = _zhanli

    # 不存在，创建报名数据
    _data = {
        'uid': uid,
        'dkey': _dkey,
        'ctime': _nt,
        'zhanli': _zhanli,
        'team2zhanli': _team2zhanli,
        'curzhanli': _currentZhanli,
        'jifen': 0,
        'herodata': _fightData,
        'fightdata': [],
        'openday': g.m.crosswzfun.getDOpenDay(),
        'renum': 0,
        'sid': str(g.getSvrIndex()),
        'ttltime': g.C.UTCNOW()
    }
    # 将玩家信息上传至跨服服务器
    g.m.crosswzfun.uploadUserData(uid, zldata={'zhanli': _currentZhanli, 'maxzhanli': _zhanli})
    # 写入报名数据
    g.crossDB.insert('wzbaoming', _data)
    # 发送报名奖励
    if 'bmprize' in con and con['bmprize']:
        _prize = con['bmprize']
        _r = g.getPrizeRes(uid, _prize, act='wzbaoming')
        # 向客户端发送改变信息
        g.sendChangeInfo(conn, _r)
        _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid('wqew12334')
    _dkey = g.m.crosswzfun.getDKey()
    _cacheKey = g.C.STR("WANGZHEBAOMINGNUM_{1}",_dkey)
    g.crossMC.delete(_cacheKey)
    g.m.gud.reGud(uid)
    g.debugConn.uid = uid
    tmp = doproc(g.debugConn, [])
    print tmp
