#!/usr/bin/env python
#coding:utf-8

'''
    巅峰王者 - 上传玩家数据
'''

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [[{玩家阵容},{玩家阵容},{玩家阵容}]]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 本周活动未开启
    _ifopen = g.m.crosswzfun.isWangZheOpen()
    if not _ifopen:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
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

    # 检查是否可上传
    _chkIfCanUpload = g.m.crosswzfun.chkIfCanUpload(uid)
    if _chkIfCanUpload[0]!=True:
        _res['s'] = -1
        _res['errmsg'] = _chkIfCanUpload[1]
        return _res

    _zlData = {}
    if data:
        _userData = g.crossDB.find1('wzbaoming', {'uid': uid}, fields=['_id', 'zhanli', 'curzhanli'])
        _fightData = []
        # 阵型信息
        _format = data[0]
        if len(_format) < 3:
            _res['s'] = -4
            _res['errmsg'] = g.L('wangzhe_baoming_nodef')
            return _res

        # 检测玩家阵容是否有重复
        if not g.m.crosswzfun.chkHeroRepeatRes(_format):
            _res['s'] = -5
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _team2zhanli = []
        _zhanli = 0
        _oldZhanli = _userData['zhanli']
        for fgroup in _format:
            if not (fgroup and [t for t in fgroup if t not in  ('sqid', 'pet')]):
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
        _setData = {'herodata': _fightData, 'curzhanli': _zhanli, 'team2zhanli':_team2zhanli,'sid':str(g.getSvrIndex())}
        _zlData['zhanli'] = _zhanli
        if _zhanli > _oldZhanli:
            _setData['zhanli'] = _zhanli
            _zlData['maxzhanli'] = _zhanli
        else:
            _zlData['maxzhanli'] = _oldZhanli
        g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': g.m.crosswzfun.getDKey()}, _setData)

    g.setAttr(uid, {'ctype':'crosswz_uploadcd'}, {'v': g.C.NOW() + 600})

    # 将玩家信息上传至跨服服务器
    g.m.crosswzfun.uploadUserData(uid, zldata=_zlData)

    return _res
