#!/usr/bin/python
# coding:utf-8
'''
七夕活动 - 援助鹊桥
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(76,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _num = int(data[0])

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _helpneed = g.m.qixifun.getCon()['helpneed']
    _data = g.m.qixifun.getData(uid, _hd['hdid'])

    _need = _helpneed * _num
    _need = g.mergePrize(_need)
    # 判定消耗是否满足
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chkRes['t']
        else:
            _chkData["s"] = -104
            _chkData[_chkRes['a']] = _chkRes['t']
        return _chkData
    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    _chkData["need"] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _num = int(data[0])


    _data = _chkData["data"]
    _need = _chkData["need"]
    _con = g.m.qixifun.getCon()


    # 扣除消耗
    _sendData = g.delNeed(uid, _need, logdata={'act': 'qixi_help', "num": _num})
    g.sendChangeInfo(conn, _sendData)

    _prize = list(_con["helpprize"])
    _prize = _prize * _num
    _prize = g.mergePrize(_prize)

    _data["val"] += _num
    _setData = {}
    _setData["val"] = _data["val"]
    # 设置数据
    g.m.qixifun.setData(uid, _chkData['hdid'], _setData)

    # 设置跨服数据
    _add = _con["addjifen"] * _num
    g.m.crosscomfun.CATTR().setAttr(uid, {'ctype': "qixi_toupiaonum", "k": _chkData["hdid"]}, {"$inc":{"v":_add}, "$set":{"sid":g.getHostSid()}})

    # 设置总的进度
    _ctype = 'qixi_allval'
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _chkData["hdid"]}, {"$inc": {"v": _add}})

    _send = g.getPrizeRes(uid, _prize, {'act': 'qixi_help', 'num':_num})
    g.sendChangeInfo(conn, _send)

    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _chkData['hdid']})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res["d"]["prize"] = _prize
    _res["d"]["allval"] = _allval


    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[100])