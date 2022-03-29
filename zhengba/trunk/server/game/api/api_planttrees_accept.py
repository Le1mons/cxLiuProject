#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 接受和一键接受 all,
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

      :param conn:
      :param 参数1: 必须参数	类型: <type 'str'>	说明:  _fromUid  如果是单独领奖就传uid， 如果是一键就是all
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
    _fromUid = data[0]
    _hd = g.m.huodongfun.getHDinfoByHtype(71,ttype="etime")
    _nt = g.C.NOW()
    # 活动还没开
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _data = g.m.planttreesfun.getData(uid, _hd['hdid'])
    # 获取援助列表
    _helpList = g.m.planttreesfun.getHelpData(uid, _hd['hdid'])
    # 配置
    _con = g.m.planttreesfun.getCon()
    _accept = _data["accept"]
    _maxNum = _con["acceptmaxnum"]
    # 超过赠送上限
    if len(_accept) >= _maxNum:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-5')
        return _chkData

    # 如果是一键
    if _fromUid == "all":
        _addUid = []
        # 循环加入
        for _friend in _helpList:
            if _friend in _accept:
                continue
            if len(_addUid) + len(_accept) >= _maxNum:
                break
            _addUid.append(_friend)
        # 如果没有可以添加的
        if not _addUid:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('planttrees_res_-6')
            return _chkData
    else:
        if _fromUid in _accept:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('planttrees_res_-6')
            return _chkData

        _addUid = [_fromUid]

    _chkData['hdid'] = _hd['hdid']
    _chkData["data"] = _data
    _chkData["adduid"] = _addUid
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData


    _addUid = _chkData["adduid"]
    _hdid = _chkData['hdid']
    _data = _chkData["data"]

    _con = g.m.planttreesfun.getCon()
    _addVal = len(_addUid) * _con["acceptval"]


    _setData = {}
    _data["accept"] += _addUid
    _setData["accept"] = _data["accept"]
    _lessAdd = _addVal
    _addData = {"p":-1, "add": _addVal}
    for pos in xrange(8):
        pos = str(pos)
        info = _data["posinfo"][pos]
        if info["p"] != -1:
            continue
        _posColor = info["color"]
        if info["v"] + _lessAdd >= _con["maxval"]:
            _pColor = g.C.getRandArrNum(_con["pos"][str(_posColor)]["dlz"], 1)[0]["color"]
            _lessAdd = info["v"] + _lessAdd - _con["maxval"]
            _data["posinfo"][pos]["p"] = _pColor
            _data["posinfo"][pos]["v"] = 0

            _addData["p"] = _pColor
        else:
            _data["posinfo"][pos]["v"] += _lessAdd
            _lessAdd = 0
        if _lessAdd <= 0:
            break
    # 如果循环完还是有剩余的能量
    if _lessAdd:
        _setData["allv"] = _data["allv"] = _data["allv"] + _lessAdd

    _setData["posinfo"] = _data["posinfo"]
    _setData["val"] = _data["val"] = _data["val"] + _addVal

    # 设置数据
    g.m.planttreesfun.setData(uid, _chkData['hdid'], _setData)


    _resData = {}
    _resData["addinfo"] = _addData
    _resData["myinfo"] = _data
    _res["d"] = _resData

    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["all"])