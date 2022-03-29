#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

      :param conn:
      :param 参数1: 必须参数	类型: <type 'str'>	说明:
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

    _con = g.m.planttreesfun.getCon()
    _freeNum = _con["freenum"]
    _maxNum = _con["shifeimaxnum"]
    _shifeineed = _con["shifeineed"]
    _data = g.m.planttreesfun.getData(uid, _hd['hdid'])
    # 如果施肥次数大于最大次数
    if _data["shifeinum"] >= _maxNum:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('planttrees_res_-5')
        return _chkData
    _chk = 0
    # 判断是否有可以提升的
    for pos in xrange(8):
        pos = str(pos)
        info = _data["posinfo"][pos]
        # 判断是否提升
        if info["p"] == -1:
            if str(int(info["color"]) + 1) not in _con["pos"]:
                continue
            _chk = 1
            break
        else:
            if str(int(info["p"]) + 1) not in _con["fruit"]:
                continue
            _chk = 1
            break

    if not _chk:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('planttrees_res_-7')
        return _chkData

    # 判断是否是免费次数
    _need = []
    if _data["shifeinum"] >= _freeNum:

        # 判断消耗
        _need = _shifeineed
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
    _chkData['data'] = _data
    _chkData["need"] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _need = _chkData["need"]
    _hdid = _chkData['hdid']
    _data = _chkData["data"]

    _con = g.m.planttreesfun.getCon()

    # 删除道具
    if _need:
        _send = g.delNeed(uid, _chkData['need'], 0, {'act': 'planttreeshd_shifei'})
        g.sendChangeInfo(conn, _send)

    _setData = {}
    # 记录任务领奖
    _data["allshifeinum"] += 1
    _data["shifeinum"] += 1
    _setData["allshifeinum"] = _data["allshifeinum"]
    _setData["shifeinum"] = _data["shifeinum"]

    _luckPos = -1
    # 如果施肥次数达到了目标次数，触发保底
    if _data["allshifeinum"] % _con["targetnum"] == 0 and _data["allshifeinum"] != 0:
        _luckPos = str(g.C.getRandNum(0,7))

    for pos in xrange(8):
        pos = str(pos)
        info = _data["posinfo"][pos]
        # 判断是否提升
        if info["p"] == -1:
            if str(int(info["color"]) + 1) not in _con["pos"]:
                continue
            _pro = _con["shifei"][str(info["color"])]["pro"]
            _randnum = g.C.getRandNum(1, 1000)
            if _randnum <= _pro or pos == _luckPos:
                _data["posinfo"][pos]["color"] = int(info["color"]) + 1
        else:
            if str(int(info["p"]) + 1) not in _con["fruit"]:
                continue
            _pro = _con["shifei"][str(info["p"])]["pro"]
            _randnum = g.C.getRandNum(1,1000)
            if _randnum <= _pro or pos == _luckPos:
                _data["posinfo"][pos]["p"] = int(info["p"]) + 1
    _setData["posinfo"] = _data["posinfo"]
    # 设置数据
    g.m.planttreesfun.setData(uid, _chkData['hdid'], _setData)
    _res["d"] = {}
    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])
