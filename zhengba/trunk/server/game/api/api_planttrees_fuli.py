#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 福利
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

      :param conn:
      :param 参数1: 必须参数	类型: <type 'str'>	说明:  idx领取的
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
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _idx = str(data[0])
    _con = g.m.planttreesfun.getCon()['fuli'][int(_idx)]
    _data = g.m.planttreesfun.getData(uid, _hd['hdid'])

    # 判断是达到条件
    if _con["type"] == 1:
        _val = _data["val"]
    else:
        _val = _data["fruitrec"].get(str(_con["cond"][0]))
    # 判断条件是否满足
    if _val < _con["val"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-1')
        return _chkData

    # 任务没有完成
    if _data['fuli'].get(str(_idx), 0):
        _chkData['s'] = -2
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

    _idx = str(data[0])
    _con = g.m.planttreesfun.getCon()['fuli'][int(_idx)]
    _prize = list(_con['prize'])
    _data = _chkData["data"]


    # 记录任务领奖
    _data["fuli"][_idx] = _data["fuli"].get(_idx, 0) + 1
    # 设置任务领奖
    g.m.planttreesfun.setData(uid, _chkData['hdid'], {'fuli': _data["fuli"]})

    _send = g.getPrizeRes(uid, _prize, {'act': 'planttreeshd_fuli', 'id':_idx})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['0', 1])