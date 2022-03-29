#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公会争锋 - 领取段位奖励
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要领取的段位
    _segment = str(data[0])
    # 要领取的索引
    _idx = int(data[1])
    # 参数有误
    if _idx < 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    gud = g.getGud(uid)

    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _temp = g.getAttrOne(uid, {'ctype':g.C.STR('competing_prize_{1}',_segment),'k':_dKey},keys='_id,uid')
    # 加入新公会也不能重复领取
    if _temp is not None:
        _res['s'] = -10
        _res['errmsg'] = g.C.STR(g.L('ghcompeting_recsegmentprize_-10'), g.GC['guildcompeting']['base']['segment'][str(_segment)]['name'])
        return _res

    _data = g.m.gonghuifun.GHATTR.getAttrOne(gud['ghid'], {'k': _dKey, 'ctype':g.C.STR('segmentprize_{1}', _segment)},fields=['_id'])
    # 奖励不存在
    if not _data:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_noprize')
        return _res

    # 领取达到上限
    if _idx >= _data['maxnum']:
        _res['s'] = -4
        _res['errmsg'] = g.L('ghcompeting_recsegmentprize_-4')
        return _res

    _pData = _data.get('prizedata', {})
    # 该编号奖励已领取
    if _idx in _pData:
        _res['s'] = -5
        _res['errmsg'] = g.L('ghcompeting_recsegmentprize_-5')
        return _res

    # 两秒缓存
    _cache = g.mc.get(g.C.STR('segmentprize_{1}_{2}', gud['ghid'], _segment))
    if _cache:
        _res['s'] = -2
        _res['errmsg'] = g.L('ghcompeting_recsegmentprize_-2')
        return _res

    g.mc.set(g.C.STR('segmentprize_{1}_{2}', gud['ghid'], _segment), 1, 1)

    _uidList = []
    for i in _pData:
        _uidList.append(_pData[i]['uid'])

    # 该玩家已领取奖励
    if uid in _uidList:
        _res['s'] = -6
        _res['errmsg'] = g.L('ghcompeting_recsegmentprize_-6')
        return _res

    g.setAttr(uid, {'ctype': g.C.STR('competing_prize_{1}', _segment)}, {'v':1,'k': _dKey})

    _uidList.append(uid)

    _dlz = g.GC['guildcompeting']['base']['segment'][_segment]['segment_dlz']
    _przie = g.m.diaoluofun.getGroupPrizeNum(_dlz)
    _sendData = g.getPrizeRes(uid, _przie, {'act':'ghcompeting','segment':_segment,'idx':_idx,'p':_przie})
    g.sendChangeInfo(conn, _sendData)

    _pData[str(_idx)] = {'uid':uid, 'prize':_przie}
    g.m.gonghuifun.GHATTR.setAttr(gud['ghid'], {'k':_dKey, 'ctype': g.C.STR('segmentprize_{1}', _segment)}, {'prizedata':_pData})

    _res['d'] = {'prize': _przie}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','1'])