#!/usr/bin/python
# coding:utf-8
'''
劳动节活动 - 主界面
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

        {'d': {'allnum': 0,   参与活动的总人数
           'info': {u'data': {},
                    u'etime': 1621612800,
                    u'hdid': 1621303915,
                    u'rtime': 1621612800,
                    u'stime': 1621180800},
           'myinfo': {'date': '2021-05-19',
                      'duihuan': {}, 兑换情况
                      'info': {},
                      'libao': {},  礼包情况
                      'num': 0,    今日投票数量
                      'select': '',   选择的龙舟id
                      'task': {'data': {'1': 1}, 'rec': []}}},  任务完成情况
    's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(74, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData["hdinfo"] = _hd
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _dkey = g.C.getDate()
    _ctype = 'HUODONG_LONGZHOU_NUM'
    _chkInfo = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _chkData['hdid'], "dkey": _dkey})
    _allNum = {}
    if _chkInfo:
        _allNum = _chkInfo[0]["v"]

    # 获取每个龙舟的投票数量
    _allNum = g.m.longzhoufun.getAllNum(_chkData['hdid'])

    # 获取比赛结果
    _result = g.m.longzhoufun.getLongZhouRes(_chkData['hdid'])
    _nt = g.C.NOW()
    if _nt >= _chkData["hdinfo"]["rtime"]:
        g.setAttr(uid, {"ctype": "longzhou_huodong"}, {"v":1, "k": _chkData['hdid']})

    _res['d'] = {"myinfo":g.m.longzhoufun.getData(uid, _chkData['hdid']), "info": _chkData["hdinfo"], "allnum": _allNum, "jieguo": _result["jieguo"], "old": _result["old"]}

    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=['1', 1]))
