#!/usr/bin/python
# coding:utf-8
'''巅峰王者'''
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'iszdbm':是否自动报名}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    gud = g.getGud(uid)
    con = g.GC['crosswz']
    _con = con['bmneed']
    if gud['lv'] < _con['lv']:
        # 等级不足
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 31 - g.getOpenDay())
        return _res

    if gud['vip'] < _con['vip']:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_autobm_-2')
        return _res

    # 时间限制 2019.6.5之后开的区并且小于22天
    if g.getOpenTime() >= 1559664000 and g.getOpenDay() < 31:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 31 - g.getOpenDay())
        return _res

    if data:
        # 获取之前的缓存
        _teamData = g.mc.get('crosswz_autobm_{}'.format(uid)) or []
        _teamData.append(data[0])
        if len(_teamData) < 3:
            g.mc.set('crosswz_autobm_{}'.format(uid), _teamData, 60)
            return _res

        g.mc.delete('crosswz_autobm_{}'.format(uid))
        data[0] = _teamData[-3:]

    # 获取玩家自动报名状态
    _status = g.m.crosswzfun.getAutoBMStatus(uid)
    _nowStatus = not _status
    g.m.crosswzfun.setAutoBMStatus(uid, _nowStatus)

    if _nowStatus:
        # 获取阶段时间
        _sTime = g.m.crosswzfun.getStatusTime(0)
        _nt = g.m.crosswzfun.now()
        dkeyTime = _nt
        # 只有在状态1或者状态1的前60s报名
        if _sTime['stime'] - 60 <= _nt <= _sTime['etime']:
            if _nt <= _sTime['stime']:
                dkeyTime += 60
        else:
            dkeyTime += 7 * 3600 * 24
        _dkey = g.C.getWeekNumByTime(dkeyTime)

        _userData = g.crossDB.find1('wzbaoming', {'uid': uid}, fields=['_id', 'uid', 'dkey', 'herodata', 'zhanli', 'curzhanli'], sort=[['ctime', -1]])
        if not _userData or (_userData['dkey'] != _dkey and _userData['dkey'] != g.C.getWeekNumByTime(_nt)):
            _team2zhanli = []
            _fightData = []
            _zhanli = 0
            _curZhanli = 0
            if _userData:
                _fightData = _userData['herodata']
                _zhanli = _userData['zhanli']
                _curZhanli = _userData['curzhanli']
                _team2zhanli = _userData.get('team2zhanli', [])
            else:
                if (not data) or len(data[0]) < 3:
                    _res['s'] = -4
                    _res['errmsg'] = g.L('wangzhe_baoming_nodef')
                    return _res

                if not g.m.crosswzfun.chkHeroRepeatRes(data[0]):
                    _res['s'] = -50
                    _res['errmsg'] = g.L('global_argserr')
                    return _res

                for fgroup in data[0]:
                    if not (fgroup and [t for t in fgroup if t not in ('sqid','pet')]):
                        _res['s'] = -5
                        _res['errmsg'] = g.L('wangzhe_baoming_nodef')
                        return _res

                    _chkRes = g.m.fightfun.chkFightData(uid, fgroup)
                    if _chkRes['chkres'] < 1:
                        _res['s'] = _chkRes['chkres']
                        _res['errmsg'] = g.L(_chkRes['errmsg'])
                        return _res
                    _zhanli += _chkRes['zhanli']
                    _tmpFightData = g.m.fightfun.getUserFightData(uid, _chkRes['herolist'], 0, sqid=fgroup.get('sqid'))
                    _team2zhanli.append(_chkRes['zhanli'])
                    _fightData.append(_tmpFightData)
                _curZhanli = _zhanli

            # 玩家没有报名，此处执行报名逻辑
            _data = {
                'uid': uid,
                'dkey': _dkey,
                'ctime': g.m.crosswzfun.now(),
                'team2zhanli':_team2zhanli,
                'zhanli': _zhanli,
                'curzhanli': _curZhanli,
                'jifen': 0,
                'herodata': _fightData,
                'fightdata': [],
                'openday': g.m.crosswzfun.getDOpenDay(dkeyTime),
                'renum': 0,
                'sid': str(g.getSvrIndex()),
                'ttltime': g.C.UTCNOW()
            }
            # 将玩家信息上传至跨服服务器
            g.m.crosswzfun.uploadUserData(uid, zldata={'zhanli': _curZhanli, 'maxzhanli': _zhanli})
            # 写入报名数据
            if not _userData:
                g.crossDB.insert('wzbaoming', _data)
            else:
                _data.pop('ctime')
                _data = {'$set':_data,'$unset':{'ugid':1}}
                g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': _userData['dkey']}, _data)
            # 发送奖励邮件
            if 'bmprize' in con and con['bmprize']:
                _prize = con['bmprize']
                _emailTxt = g.m.crosswzfun.getCon()['email']['dldbaoming']
                g.m.emailfun.sendEmail(uid, 1, _emailTxt['title'], _emailTxt['content'], _prize)
    _res['d'] = {'iszdbm': int(_nowStatus)}
    return _res
