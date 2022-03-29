#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
群英集结 - 领取奖励
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要领取的宝箱索引
    _idx = abs(int(data[0]))
    # 等级不够
    if not g.chkOpenCond(uid, 'tuanduifuben'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _copyData = g.crossDB.find1('allhero_together',{g.C.STR('user.{1}',uid):{"$exists":1}})
    # 数据不存在
    if not _copyData:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 不是本团的
    if uid not in _copyData['user']:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['tuanduifuben']['base']
    # 奖励超出上限
    if _idx >= _con[_copyData['type']]['num_limit']:
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _recData = _copyData.get('rec_data', {})
    # 当前宝箱已被领取
    if str(_idx) in _recData:
        _res['s'] = -6
        _res['errmsg'] = g.L('qyjj_recprize_-6')
        return _res

    # 还没到结束时间
    if g.C.NOW() < _copyData['ctime'] + _con['group'][_copyData['type']]['duration']:
        _res['s'] = -3
        _res['errmsg'] = g.L('qyjj_recprize_-3')
        return _res

    # 不能重复领取
    if uid in map(lambda x:_recData[x]['uid'], _recData):
        _res['s'] = -7
        _res['errmsg'] = g.L('qyjj_recprize_-7')
        return _res

    _setData = {}
    # 如果是第一个领取  挑选一个幸运uid
    if len(_recData) == 0:
        _copyData['lucky'] = _setData['lucky'] = g.m.qyjjfun.getLuckyUidList(_copyData['user'].keys())

    # 如果是幸运uid就随机好的掉落组
    if uid in _copyData['lucky']:
        _boxPrize = g.m.diaoluofun.getGroupPrize(_con['baoxiang']['gooddlz'])
    else:
        _boxPrize = g.m.diaoluofun.getGroupPrize(_con['baoxiang']['baddlz'])
    gud = g.getGud(uid)
    _recData[str(_idx)] = {'name': gud['name'], 'prize':_boxPrize, 'uid':uid}
    _setData['rec_data'] = _recData
    g.crossDB.update('allhero_together',{'_id':_copyData['_id']}, _setData)

    # 获取挂机奖励  参团时间减去数据生成时间  除以 cd
    _prize = list(_con[_copyData['type']]['once_prize'])
    for i in _prize:
        i['n'] *= (_copyData['user'][uid]['time']-_copyData['ctime']) // _con[_copyData['type']]['cd']

    _prize += _boxPrize
    _sendData = g.getPrizeRes(uid, _prize, {'act':'qyjj',"time":_copyData['user'][uid]['time']-_copyData['ctime']})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[-4])