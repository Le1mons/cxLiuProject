#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-周卡领奖
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [num:int] 招募次数
    :param key:
    :return:
            {'d': {'prize': [{'a': 'hero', 'n': 1, 't': '25066'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'},
                 {'a': 'hero', 'n': 1, 't': '25065'}],
        'zhaomu': {'num': 10, 'reclist': []}},
        's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1
    _num = int(data[0])

    if _num not in (1, 10):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('chat_dendvideo_res_-2')
        return _chkData
    _nt = g.C.NOW()
    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_nohuodong')
        return _chkData

    _con = _hdinfo["data"]["openinfo"]["zhaomu"]
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

    _chkData["need"] = _need
    _chkData["hdinfo"] = _hdinfo
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
    _need = _chkData["need"]
    _num = _chkData["num"]
    # 获取招募信息
    _info = g.m.wangzhezhaomufun.getZhaoMuInfo(uid, _hdinfo)
    _con = _hdinfo["data"]["openinfo"]["zhaomu"]

    # 随机奖励
    _prize = []
    for i in xrange(_num):
        _dlz = _con["ptdlz"]
        if _info["num"] > 0 and (_info["num"] + 1) % _con["tunenum"] == 0:
            _dlz = g.C.getRandArrNum(_con["gjdlz"], 1)[0]["dlz"]
        # 如果dlz在活动里面
        if _dlz == "mainhero":
            p = _con[_dlz][_info["choose"]]["prize"]
        else:
            if _dlz in _con:
                p = g.C.getRandArrNum(_con[_dlz], 1)[0]["prize"]
            else:
                p = g.m.diaoluofun.getGroupPrize(_dlz)
        _info["num"] += 1
        _prize += p

    # # 合并奖励
    # _prize = g.mergePrize(_prize)
    # 设置活动数据
    _setData = {}
    _setData["v"] = _info["num"]
    g.m.wangzhezhaomufun.setZhaoMuInfo(uid, _hdinfo, _setData)

    _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'wangzhezhaomu_zhaomu'})
    g.sendChangeInfo(conn, _delData)

    # for i in _prize:
    #     if i['a'] == 'hero':
            # g.event.emit("hero_tongu", uid, i['t'])

    g.C.SHUFFLE(_prize)
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'wangzhezhaomu_zhaomu', 'num': _num,'choose':_info["choose"]})
    g.sendChangeInfo(conn, _sendData)
    _resData = {}
    _resData['zhaomu'] = _info
    _resData["prize"] = _prize

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    data = [10]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'