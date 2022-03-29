#!/usr/bin/python
# coding:utf-8
'''
王者天梯 - 分享
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [日志id:str, 分享的类型:0是世界，1是跨服]
    :return:
    ::

        {'d': {
            'star': 星数，
            'win': 连胜次数，
            ‘fight’：今日挑战次数,
            'buy':今日购买次数,
            'receive':[已领取奖励索引],
            'num': 剩余匹配次数,
            'freetime':上次恢复次数的时间戳
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['ladder']
    # 开区天数不足
    if g.getOpenDay() < _con['day'] or g.getGud(uid)['lv'] < _con['lv']:
        _res["s"] = -1
        _res["errmsg"] = g.L('ladder_open_-1')
        return _res

    _log = g.mdb.find1('ladder_log', {'_id': g.mdb.toObjectId(data[0])}, fields=['_id'])
    # 没有日志
    if not _log:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _res['d'] = _log
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _id = g.crossDB.insert('ladder_log', _chkData['d'])

    _nt = g.C.NOW()
    gud = g.getGud(uid)

    _fdata = {"uid": gud["uid"],
              "name": gud["name"],
              "lv": gud["lv"],
              "vip": gud.get("vip", 0),
              "ctime": _nt,
              "head": gud["head"],
              "sendType": 0,
              "sid": gud["sid"],
              "headborder": gud["headborder"],
              "chatborder": gud["chatborder"],
              "chenghao": gud["chenghao"],
              # "hidevip": _chkData["hidevip"],
              'svrname': g.m.crosscomfun.getSNameBySid(gud["sid"]),
              "fightlog": str(_id),
              "mode": _chkData['d']['mode']
              }

    _mtype = int(data[1])
    _content = ""
    # 如果是世界消息
    if _mtype == 2:
        g.m.chatfun.sendMsg(_content, _mtype, data=_fdata)
    else:
        _fdata["m"] = _content
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': _content, 'mtype': _mtype, 'fdata': _fdata, "extarg":{}})

    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('wlx')
    g.debugConn.uid = uid
    print doproc(g.debugConn,['5f0ac46bfb81a5e2c3ee15f9', 1])
