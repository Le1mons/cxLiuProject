#!/usr/bin/env python
#coding:utf-8
'''
    巅峰王者 - 竞猜接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [玩家uid:str, 竞猜类型:str(1,2,3)]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s' : 1}
    uid = conn.uid
    gud = g.getGud(uid)
    touid = str(data[0])
    gtype = str(data[1])

    # 本周活动未开启
    groupList = g.m.crosswzfun.isWangZheOpen()
    if not groupList:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    # 检测是否可竞猜
    _ifCanGuess = g.m.crosswzfun.chkIfCanGuess()
    if not _ifCanGuess:
        _res['s'] = -1
        _res['errmsg'] = g.L('crosswz_guess_-1')
        return _res

    _userlist = []
    _mcKey = 'crosswz_wzfight_guess_data'
    _mcData = g.mc.get(_mcKey)
    if _mcData:
        _userlist = _mcData
    else:
        # 获取自己组别
        # openDay = g.m.crosswzfun.getDOpenDay(uid=uid)
        ugid = g.m.crosswzfun.getUgid(uid)
        _dkey = g.m.crosswzfun.getDKey()
        _where = {'dkey': _dkey, 'deep': {'$gte': 4}}
        if ugid == 3:
            _where['$or'] = [{'ugid': {'$exists': 0}}, {'ugid': ugid}]
        else:
            _where['ugid'] = ugid
        _userlist = g.crossDB.find('wzfight', _where, fields=['_id','uid'])
        # 缓存跨服数据
        g.mc.set(_mcKey, _userlist, time=60)

    _uidlist = [x['uid'] for x in _userlist]
    if touid not in _uidlist:
        _res['s'] = -5
        _res['errmsg'] = g.L('crosswz_guess_-3')
        return _res

    # 已竞猜不可重复
    _r = g.m.crosswzfun.getMyGuessName(uid)
    if _r:
        _res['s'] = -2
        _res['errmsg'] = g.L('crosswz_guess_-2')
        return _res

    _con = g.m.crosswzfun.getCon()
    if gtype not in _con['guess']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 是否符合竞猜条件
    if gud['vip'] < _con['guess'][gtype]['needvip']:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_limitvip')
        return _res

    # 检查消耗
    _needMap = {'rmbmoney': -_con['guess'][gtype]['addmoney']}
    _altRes = g.m.userfun.altNum(uid, _needMap)
    if _altRes[0]!=True:
        _res['s'] = -100
        _res['attr'] = _altRes[1]
        return _res

    g.m.userfun.updateUserInfo(uid,_needMap, {'act':'crosswz_guess'})
    _needChangeInfo = {'attr': _needMap}
    # 发奖



    _prize = _con['guess'][gtype]['prize']
    _changeInfo = g.getPrizeRes(uid, _prize, {'act':'crosswz_guessprize'})
    g.mergeDict(_changeInfo, _needChangeInfo)
    # 设置数据
    g.m.crosswzfun.addGuessData(uid, gtype,touid)
    g.sendChangeInfo(conn, _changeInfo)
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('gch')
    print doproc(g.debugConn,['2100_58194944fc40d841bf1033ff', '1'])
