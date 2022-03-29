#!/usr/bin/python
# coding:utf-8
'''
夏日庆典 - 小游戏
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {
            task:{data:{任务id:完成次数}, rec:[已领奖任务id]}
            val: 积分
            jinfenrec: 积分奖励领取记录
            duihuan':{},  兑换
            shop:{},  商店购买次数
            libao:{},  礼包购买次数
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _jifen = int(abs(data[0]))
    _num = int(data[1])

    _youxiprize = g.GC["xiariqingdian"]["youxiprize"]

    _prize = []
    for info in _youxiprize:
        if info["val"][0] <= _jifen <= info["val"][1]:
            _prize = info["prize"]
    if not _prize:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('xiariqingdian_res_-1')
        g.m.dball.writeLog(uid,"xiariqingdian_err",{"jifen":_jifen,"num":_num})
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(75, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData
    _con = g.GC["xiariqingdian"]

    _data = g.m.xiariqingdianfun.getData(uid, _hd['hdid'])

    _needItem = _con["youxiitemneed"]
    _needRmb = _con["youxizuanshineed"]
    # 先消耗道具，判断道具是否存在
    _itemInfo = g.mdb.find1("itemlist", {"uid":uid, "itemid": _needItem[0]["t"]})
    if _itemInfo and _itemInfo["num"] > 0:
        _need = g.mergePrize(_needItem * _num)
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
        _chkData["type"] = 0
    else:
        # 判断是否拥有购买次数
        _buyNum = _con["buynum"]

        _chkData["type"] = 1
        if _data["zuanshinum"] + _num > _buyNum:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('dianjin_lingqu_res_-3')
            return _chkData

        _need = g.mergePrize(_needRmb * _num)
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




    _chkData['hdid'] = _hd['hdid']
    _chkData["need"] = _need
    _chkData["data"] = _data
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _jifen = int(abs(data[0]))
    _num = int(data[1])

    _need = _chkData["need"]

    _data = _chkData["data"]
    _youxiprize = g.GC["xiariqingdian"]["youxiprize"]

    _prize = []
    for info in _youxiprize:
        if info["val"][0] <= _jifen <= info["val"][1]:
            _prize = info["prize"]

    _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'xiariqingdian_xiaoyouxi'})
    g.sendChangeInfo(conn, _delData)
    _setData = {}
    # 判断是否是砖石抽奖
    if _chkData["type"]:
        _data['zuanshinum'] += _num
        _setData["zuanshinum"] = _data["zuanshinum"]
    if _jifen > _data["val"]:
        _setData["val"] = _jifen

        _data["val"] = _jifen
    if _setData:
        g.m.xiariqingdianfun.setData(uid, _chkData['hdid'], _setData)
    if _prize:
        _prize = g.mergePrize(_prize * _num)
        _send = g.getPrizeRes(uid, _prize, {'act': 'xiariqingdian_xiaoyouxi', 'jifen': _jifen, "num": _num})
        g.sendChangeInfo(conn, _send)

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _res['d'] = {"myinfo":_data, "prize":_prize}

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    from pprint import pprint

    g.m.dball.writeLog(uid, "xiariqingdian_err", {"jifen": 1, "num": 1})