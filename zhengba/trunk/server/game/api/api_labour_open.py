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

    {'d': {'info': {u'data': {},
                u'etime': 1620748800,
                u'hdid': 7302,
                u'rtime': 1620748800,
                u'stime': 1618156800},
       'myinfo': {'date': '2021-04-16',
                  'duihuan': {},  兑换
                  'extrec': [],  额外抽奖奖励
                  'fightnum': 0,  战斗次数
                  'libao': {},   礼包购买
                  'lottery': {},  抽奖数据
                  'task': {'data': {}, 'rec': []}, 任务data进度， rec领奖id
                  'topdps': 0}},   最高伤害
    's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(73, "etime")
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

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')

    _rankList = []
    _ckey = "labour_bossrank"
    _rankList = g.mc.get(_ckey) or []
    if not _rankList:
        _list = g.mdb.find("hddata", {"hdid": _chkData['hdid'], "topdps": {"$gt": 0}}, sort=[["topdps", -1]], fields=["_id", "topdps", "uid"])
        for i in _list:
            _data = {}
            _data["headdata"] = g.m.userfun.getShowHead(i["uid"])
            _data.update(i)
            _rankList.append(_data)
        if _rankList:
            g.mc.set(_ckey, _rankList, time=60)



    _res['d'] = {"myinfo":g.m.labourfun.getData(uid, _chkData['hdid']), "info": _chkData["hdinfo"], "ranklist": _rankList}

    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, data=['1', 1]))
