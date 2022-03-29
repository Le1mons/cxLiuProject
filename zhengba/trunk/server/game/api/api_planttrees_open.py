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
     :return:
     ::

         {'d': {'allval': 600,  绿化率
       'helplist': [],        当前可以收取能量uid列表
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

    _chkData['hdid'] = _hd['hdid']
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _ctype = 'planttrees_allval'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _chkData['hdid']})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]
    _res['d'] = {"myinfo":g.m.planttreesfun.getData(uid, _chkData['hdid']), "allval": _allval, "helplist": g.m.planttreesfun.getHelpData(uid, _chkData['hdid'])}

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=[10]))