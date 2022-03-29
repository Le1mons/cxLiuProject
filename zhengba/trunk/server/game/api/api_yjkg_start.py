#!/usr/bin/python
# coding:utf-8
'''
遗迹考古-开始考古
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [区域:str, 是否加速:bool]
    :return:
    ::

        {'d': {
            'supply': 所有补给，
            ‘ctime’：考古开始时间,
            'mapid': 地图id,
            'speed': 考古速度,
            'exp': 每米获得经验
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}

    _con = g.GC['yjkg']
    # 开区天数不足
    if g.getOpenDay() < _con['day']:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_noopen')
        return _res

    _qyId = str(data[0])  # 区域id
    _isJiasu = bool(data[1])  # 是否使用轻骑马车
    _isdouble = bool(data[2])  # 是否开启双倍考古

    # 没有该区域
    if _qyId not in _con["map"]:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _myData = g.m.yjkgfun.getMyData(uid, fields="_id,data,unlockmap,yiqi,skill".split(','))
    # 结束当前考古才能开始下次考古
    if _myData["data"]:
        _res["s"] = -3
        _res["errmsg"] = g.L('yjkg_start_-3')
        return _res

    # 该区域未解锁
    if _qyId not in _myData["unlockmap"]:
        _res["s"] = -4
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _dayKgNum = g.getPlayAttrDataNum(uid, "yjkg_daynum")
    # 今日考古次数已达上限
    if _dayKgNum >= _con["daykgnum"]:
        _res["s"] = -5
        _res["errmsg"] = g.L('global_numerr')
        return _res

    _need = []
    # 使用了马车，判断消耗
    if _isJiasu:
        _jiasuneed = _con["jiasuneed"][0]
        if _isdouble:
            _jiasuneed *= 2
            _jiasuneed = g.mergePrize(_jiasuneed)
        # 优先检测1级消耗。没有取2级小号
        _chk = g.chkDelNeed(uid, _jiasuneed)
        if not _chk['res']:
            _jiasuneed = _con["jiasuneed"][1]
            if _isdouble:
                _jiasuneed *= 2
                _jiasuneed = g.mergePrize(_jiasuneed)
        _need.extend(_jiasuneed)


    # # 判断是否有双倍
    # if _isdouble:
    #     _doubleneed = _con["doubleneed"][0]
    #     _chk = g.chkDelNeed(uid, _doubleneed)
    #     if not _chk['res']:
    #         _doubleneed = _con["doubleneed"][1]
    #     _need.extend(_doubleneed)
    if _need:
        _need = g.mergePrize(_need)
        _chk = g.chkDelNeed(uid, _need)
        # 消耗不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _res['need'] = _need


    _res['map'] = _qyId
    _res['data'] = _myData
    _res['jiasu'] = _isJiasu
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1, "d": {}}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _isJiasu = bool(data[1])
    _isdouble = bool(data[2])
    # 扣除加速消耗
    if 'need' in _chkData:
        _delData = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'yjkg_start', "isjiasu": _isJiasu, "isdouble": _isdouble})
        g.sendChangeInfo(conn, _delData)

    # 增加每日考古次数
    g.setPlayAttrDataNum(uid, "yjkg_daynum")

    # 开始考古
    _kgData = g.m.yjkgfun.initKgData(uid, _chkData['map'], _chkData['data'],_chkData['jiasu'], _isdouble)
    g.mdb.update('yjkg',{'uid':uid},{'data': _kgData})

    _res["d"] = _kgData
    return _res


if __name__ == '__main__':
    uid = g.buid('9')
    g.debugConn.uid = uid
    print doproc(g.debugConn,["1",True,1])
