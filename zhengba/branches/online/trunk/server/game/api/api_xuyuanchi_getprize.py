#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g

'''
许愿池--获取次数目标奖励
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 宝箱的索引
    _idx = int(data[0])
    # 许愿池的名字   普通或者高级
    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _cishuInfo = g.getAttrOne(uid, {'ctype':'xuyuanchi_cishu','k':_dKey},keys='_id,v,reclist')
    # 参数有误
    if not _cishuInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['xuyuanchi']['common']['passprize']
    # 次数不足
    if _cishuInfo['v'] < _con[_idx][0][0]:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_valerr')
        return _res

    _recList = _cishuInfo.get('reclist', [])
    # 已领取
    if _idx in _recList:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_noprize')
        return _res

    _recList.append(_idx)
    g.setAttr(uid,{'ctype':'xuyuanchi_cishu','k':_dKey},{'reclist':_recList})

    _prize = _con[_idx][1]
    _sendData = g.getPrizeRes(uid, _prize)
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res



if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['0'])
