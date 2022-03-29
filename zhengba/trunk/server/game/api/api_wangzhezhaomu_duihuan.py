#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-兑换商店
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
def proc(conn, data,key=None):
    """

    :param conn:
    :param data: ["idx": int, "num":int] 领取下标， 购买次数
    :param key:
    :return: buyinfo:购买的商品。k是idx，v是购买过的数量
            {'d': {'boss': {'buyinfo': {}, 'jifen': 40, 'num': 2, 'reclist': [0]},
       'prize': [{u'a': u'attr', u'n': 50, u't': u'jinbi'}]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _idx = int(data[0])
    _num = int(data[1])

    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    # 任务信息
    _con = _hdinfo["data"]["openinfo"]["boss"]["duihuan"][_idx]
    _info = g.m.wangzhezhaomufun.getBossInfo(uid, _hdinfo)
    # 购买数量不足
    if _info["buyinfo"].get(str(_idx), 0) + _num > _con["val"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('wangzhezhaomu_duihuan_res_-2')
        return _chkData

    _need = _con["need"] * _num
    # 合并
    _need = g.mergePrize(_need)
    # 判断是否满足条件
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chkRes['t']
        else:
            _chkData["s"] = -104
            _chkData[_chkRes['a']] = _chkRes['t']
        return _chkData

    _chkData["idx"] = _idx
    _chkData["info"] = _info
    _chkData["hdinfo"] = _hdinfo
    _chkData["con"] = _con
    _chkData["need"] = _need
    _chkData["num"] = _num
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _hdinfo = _chkData["hdinfo"]
    _info = _chkData["info"]
    _idx = _chkData["idx"]
    _con = _chkData["con"]
    _need = _chkData["need"]
    _num = _chkData["num"]

    _info["buyinfo"][str(_idx)] = _info["buyinfo"].get(str(_idx), 0) + _num
    _setData = {}
    _setData["buyinfo"] = _info["buyinfo"]
    g.m.wangzhezhaomufun.setBossInfo(uid, _hdinfo, _setData)

    _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'wangzhezhaomu_duihuan'})
    g.sendChangeInfo(conn, _delData)

    _prize = _con["prize"] * _num
    # 合并
    _prize = g.mergePrize(_prize)
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_duihuan', 'idx': _idx, "prize": _prize,
                                                "need": _need, "num": _num})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['boss'] = _info
    _resData["prize"] = _prize

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('wlx')
    g.debugConn.uid = uid
    data = [0, 1]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'