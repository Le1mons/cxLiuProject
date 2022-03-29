#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 战旗购买经验
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

    _num = int(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(80, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData


    _con = g.m.herothemefun.getCon()
    _upflagexp = _con["upflagexp"]
    _flagPrize = _con['flagprize']
    _data = g.m.herothemefun.getData(uid, _hd['hdid'])

    _lv = int(_data["flag"]["exp"] / _con["upflagexp"]) + 1
    # 判断等级是否存在
    if str(_lv + 1) not in _flagPrize:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    # 判断消耗
    _need = g.mergePrize(_con["buyexpneed"] * _num)

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chk['t']
        else:
            _chkData["s"] = -104
            _chkData[_chk['a']] = _chk['t']
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

    _con = g.m.herothemefun.getCon()

    _data = _chkData['data']
    _need = _chkData["need"]

    _upflagexp = _con["upflagexp"]
    # 添加免费次数
    _data["flag"]["exp"] += _upflagexp * _num
    _setData = {}
    _setData["flag"] = _data["flag"]

    # 删除数据
    _sendData = g.delNeed(uid, _need, logdata={'act': 'herotheme_buyflaglv', "num": _num})
    g.sendChangeInfo(conn, _sendData)
    # 设置任务领奖
    g.m.herothemefun.setData(uid, _chkData['hdid'], _setData)

    _resData = {}
    _resData["myinfo"] = _data
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[5])