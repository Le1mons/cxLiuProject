#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 摘果子
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

      :param conn:
      :param 参数1: 必须参数	类型: <type 'str'>	说明: pos 领取的对应槽位id
      :param 参数2: 必须参数	类型: <type 'int'>	说明:
      :return:
      ::

          {'d': {'addinfo': {"p":-1, "add": 100},  这次收取了能量和是否获得了果子， "p"表示获得了果子的颜色，add表示获取的能量数量
        'myinfo': {u'accept': [],     当前已经收取过能量的uid列表
                   u'allshifeinum': 0,  活动期间总共施肥次数
                   u'allv': 0,       溢出的能量，前端不用关
                   u'commonprize': [],   绿化率奖励领取此路
                   u'date': '2021-03-03',
                   u'duihuan': {u'1': 1},  兑换
                   u'fruitrec': {},    不同颜色的果子获取次数
                   u'fuli': {},         福利
                   u'gift': [],        已经帮忙浇水的uid列表
                   u'lasttime': 1614700654,
                   u'libao': {},   礼包
                   u'posinfo': {u'0': {u'color': 3, u'p': -1, u'v': 0},  槽位。 color表示槽位颜色
                                u'1': {u'color': 3, u'p': -1, u'v': 0},  ，p如果不为-1表示结出了果子，通过p值读配置fruit
                                u'2': {u'color': 3, u'p': -1, u'v': 0},   v 表示当前槽位的能量进度
                                u'3': {u'color': 3, u'p': -1, u'v': 0},
                                u'4': {u'color': 3, u'p': -1, u'v': 0},
                                u'5': {u'color': 3, u'p': -1, u'v': 0},
                                u'6': {u'color': 3, u'p': -1, u'v': 0},
                                u'7': {u'color': 3, u'p': -1, u'v': 0}},
                   u'shifeinum': 0,   今日施肥次数
                   u'task': {'data': {'1': 1}, 'rec': []},  任务。data里面表示对应id的任务进度，rec里面表示领取记录
                   u'val': 0}},   活动期间总共获得能量数量
         's': 1}

      """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    # 接受印记来自的uid
    _pos = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(71,ttype="etime")

    _con = g.m.planttreesfun.getCon()
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.planttreesfun.getData(uid, _hd['hdid'])
    if _data["posinfo"][_pos]["p"] == -1:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData

    _prize = _con["fruit"][str(_data["posinfo"][_pos]["p"])]["prize"]

    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    _chkData["prize"] = _prize

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _prize = _chkData["prize"]
    _hdid = _chkData['hdid']
    _data = _chkData["data"]

    _pos = str(data[0])
    _con = g.m.planttreesfun.getCon()

    _pColor = _data["posinfo"][_pos]["p"]

    _data["fruitrec"][str(_pColor)] = _data["fruitrec"].get(str(_pColor), 0) + 1
    _setData = {}
    _data["posinfo"][_pos]["p"] = -1
    _data["posinfo"][_pos]["color"] = 4
    _data["posinfo"][_pos]["v"] += _data["allv"]
    _data["allv"] = 0
    # 如果大于最大值
    if _data["posinfo"][_pos]["v"] >= _con["maxval"]:
        _data["allv"] += _data["posinfo"][_pos]["v"] - _con["maxval"]
        _posColor = 4
        _data["posinfo"][_pos]["p"] = g.C.getRandArrNum(_con["pos"][str(_posColor)]["dlz"], 1)[0]["color"]
        _data["posinfo"][_pos]["v"] = 0


    _setData["allv"] =_data["allv"]
    _setData["posinfo"] = _data["posinfo"]
    _setData["fruitrec"] = _data["fruitrec"]

    # 设置数据
    g.m.planttreesfun.setData(uid, _chkData['hdid'], _setData)

    # 判断八个果子加一点世界绿化率
    _getNum = g.getAttrByCtype(uid, "planttrees_5num", k=_hdid, bydate=False, default=0)
    # 增加世界积分
    if _getNum + 1 >= 8:
        # 设置总绿化率
        _ctype = 'planttrees_allval'
        g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"$inc": {"v": 1}})

        # 设置玩家今天的获取苹果次数
        g.setAttr(uid, {"ctype":"planttrees_5num"}, {"k":_hdid, "v": 0})
    else:
        g.setAttr(uid, {"ctype": "planttrees_5num"}, {"$inc": {"v": 1}, "$set": {"k": _hdid}})

    # 加入全服排行
    if int(_pColor) == 5:
        # 增加玩家金果子数量
        _ctype = "planttrees_5num"
        _crossRes = g.m.crosscomfun.CATTR().setAttr(uid, {'ctype': _ctype, "k": _hdid}, {"$inc": {"v": 1}, "$set": {"sid":  g.getHostSid()}})

    _send = g.getPrizeRes(uid, _prize, {'act': 'planttreeshd_getprize', 'pos': _pos})
    g.sendChangeInfo(conn, _send)

    _resData = {}
    _resData["myinfo"] = _data
    _resData["prize"] = _prize
    _res["d"] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["0"])