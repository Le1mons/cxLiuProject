#!/usr/bin/env python
#coding:utf-8
'''
    巅峰王者 - 竞猜打开接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'userlist':[{headdata:头像信息,uid:'',guessmoney:金额,guessnum:次数}],
                'myguess':我猜的名字,
                'guessuid':我猜的玩家uid,
                'totalmoney':奖金池,
                'canguess':是否能精彩
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s' : 1}
    uid = conn.uid
    gud = g.getGud(uid)

    # 本周活动未开启
    groupList = g.m.crosswzfun.isWangZheOpen()
    if not groupList:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    # 检测是否可竞猜
    _status = g.m.crosswzfun.getWangZheStatus()
    if _status < 6:
        _res['s'] = -1
        _res['errmsg'] = g.L('crosswz_guess_-1')
        return _res

    _wzuserlist = []
    # 获取自己组别
    # openDay = g.m.crosswzfun.getDOpenDay(uid=uid)
    ugid = g.m.crosswzfun.getUgid(uid)
    _mcKey = 'crosswz_wzfight_guess_data_{}'.format(ugid)
    _mcData = g.mc.get(_mcKey)
    if _mcData:
        _wzuserlist = _mcData
    else:
        _dkey = g.m.crosswzfun.getDKey()
        _where = {'dkey': _dkey, 'deep': {'$gte': 4}}
        if ugid == 3:
            _where['$or'] = [{'ugid': {'$exists': 0}}, {'ugid': ugid}]
        else:
            _where['ugid'] = ugid
        _wzuserlist = g.crossDB.find('wzfight', _where, fields=['_id','uid','deep'])
        # 缓存跨服数据
        g.mc.set(_mcKey, _wzuserlist, time=60)

    # 获取上届4强
    _wzquarterKey = 'crossswz_wzquarter_lasteddata'
    _prewzquarter = g.mc.get(_wzquarterKey)
    if _prewzquarter == None:
        _round = g.crossDB.count('wzquarterwinner', {})
        _prewzquarter = g.crossDB.find1('wzquarterwinner', {'round': _round}, fields=['_id', 'ranklist'])
        # 缓存跨服数据
        if _prewzquarter:
            _prewzquarter = _prewzquarter['ranklist']
            if isinstance(_prewzquarter, dict):
                if str(ugid) in _prewzquarter:
                    _prewzquarter = _prewzquarter[str(ugid)]
                else:
                    _prewzquarter = []
        else:
            _prewzquarter = []
        _prewzquarter = {t['uid']: t['deep'] for t in _prewzquarter}
        g.mc.set(_wzquarterKey, _prewzquarter, time=60)

    _userlist = []
    uidList = [t['uid'] for t in _wzuserlist]
    _allUsrInfo = g.m.crosswzfun.getUserData({'$in': uidList}, ['info', 'uid'])
    uidToInfo = {t['uid']: t['info'] for t in _allUsrInfo}
    for _user in _wzuserlist:
        _userdata = uidToInfo[_user['uid']]
        _tmp = _userdata['headdata']
        _tmp['uid'] = _user['uid']
        _guessData = g.m.crosswzfun.getGuessDataByUid(_user['uid'])
        _tmp['guessmoney'] = _guessData['ext_guessmoney']
        _tmp['guessnum'] = _guessData['ext_guessnum']
        # _tmp['guessmoney'], _tmp['guessnum'] = g.m.crosswzfun.getGuessDataByUid(_user['uid'])
        if 7 > _status >= 6:
            if _user['uid'] in _prewzquarter:
                _tmp['predeep'] = _prewzquarter[_user['uid']]
        if _status > 7: _tmp['deep'] = _user['deep']
        _userlist.append(_tmp)

    _ifCanGuess = g.m.crosswzfun.chkIfCanGuess()
    _canGuess = 0
    _myguessname = g.m.crosswzfun.getMyGuessName(uid)
    _totalmoney = g.m.crosswzfun.getTotalGuessMoney()
    if not _myguessname and _ifCanGuess: _canGuess = 1
    _res['d'] = {
        'userlist': _userlist,
        'myguess': _myguessname,
        'guessuid': g.m.crosswzfun.getMyGuessUid(uid),
        'totalmoney': _totalmoney,
        'canguess': _canGuess
    }
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('0')
    print doproc(g.debugConn,['','1'])
