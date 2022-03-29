#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 任务领取
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

      :param conn:
      :param 参数1: 必须参数	类型: <type 'str'>	说明: 任务id
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

    _hd = g.m.huodongfun.getHDinfoByHtype(71,ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _taskID = str(data[0])

    _con = g.m.planttreesfun.getCon()['task'][_taskID]
    _data = g.m.planttreesfun.getData(uid, _hd['hdid'])
    # 任务没有完成
    if _data['task']['data'].get(_taskID, 0) < _con['pval']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData

    # 奖励已领取
    if _taskID in _data['task']['rec']:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('planttrees_res_-2')
        return _chkData

    _chkData['data'] = _data
    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _taskID = str(data[0])
    _con = g.m.planttreesfun.getCon()
    _taskCon = _con['task'][_taskID]


    _prize = list(_taskCon['prize'])
    _data = _chkData["data"]

    # 记录任务领奖
    _data["task"]["rec"].append(_taskID)


    _setData = {}
    _setData["task"] = _data["task"]
    _addVal = _taskCon["addval"]
    _lessAdd = _addVal
    _addData = {"p": -1, "add": _addVal}
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
            _lessAdd = 0
            break
    # 如果循环完还是有剩余的能量
    if _lessAdd:
        _setData["allv"] = _data["allv"] = _data["allv"] + _lessAdd


    _setData["posinfo"] = _data["posinfo"]
    _setData["val"] = _data["val"] = _data["val"] + _addVal


    # 设置数据
    g.m.planttreesfun.setData(uid, _chkData['hdid'], _setData)
    # _send = g.getPrizeRes(uid, _prize, {'act': 'planttreeshd_recieve', 'val':_data["val"]})
    # g.sendChangeInfo(conn, _send)

    _res['d'] = {}
    _res['d']['myinfo'] = _data
    _res["d"]["addinfo"] = _addData

    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1'])