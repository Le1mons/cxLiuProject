#!/usr/bin/python
# coding:utf-8
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
玩家 - 查看玩家详情
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _touid = str(data[0])
    # 玩家信息
    _userInfo = {}
    # 小兵信息
    _armyInfo = []
    # 获取机器人的信息
    if _touid == 'NPC':
        _r = g.getAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")})
        if _r == None:
            _res['s'] = -1
            _res['errmsg'] = g.L("crosszb_jifen_userdetails_-1")
            return _res

        _r = _r[0]['v']
        # print _r
        for ele in _r:
            # print "ele",ele
            if ele['uid'] == _touid:
                _info = ele
                _userInfo['name'] = _info['name']
                _userInfo['lv'] = _info['lv']
                _userInfo['vip'] = _info['vip']
                _userInfo['head'] = _info['head']
                _userInfo['zhanli'] = _info['zhanli']
        # 如果没找到NPC信息
        if len(_userInfo) == 0:
            _res['s'] = -2
            _res['errmsg'] = g.L("crosszb_jifen_userdetails_-2")
            return _res

        _rData = {"userinfo": _userInfo}

    # 获取玩家的详细信息
    else:
        _rData = g.crossDB.find1("jjcdefhero", {"uid": _touid}, fields=['_id'])
        if not _rData:
            _res['s'] = -2
            _res['errmsg'] = g.L("crosszb_jifen_userdetails_-2")
            return _res
        _rData['headdata']['servername'] = g.m.crosscomfun.getSNameBySid(_rData['sid'])
    _res["d"] = _rData
    return (_res)


if __name__ == "__main__":
    g.debugConn.uid = "0_574b07e7f9daf804304edcda"
    print doproc(g.debugConn, ['NPC'])