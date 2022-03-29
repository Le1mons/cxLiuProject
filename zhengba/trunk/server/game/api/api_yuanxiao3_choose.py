#!/usr/bin/python
# coding:utf-8
'''
元宵活动3 - 礼包奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:  参数[id]  购买的礼包id
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

    _idx = int(data[0])
    _choose = dict(data[1])


    _hd = g.m.huodongfun.getHDinfoByHtype(83, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('zahuopu_buy_res_-3')
        return _chkData

    _con = g.m.yuanxiao3fun.getCon()['libao'][_idx]
    for _idx2pos, _idx3p in _choose.items():
        if int(_idx2pos) >= len(_con['choose']) or int(_idx3p) >= len(_con['choose'][int(_idx2pos)]):
            # 索引越界
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_argserr')
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

    _idx = int(data[0])
    _choose = dict(data[1])
    _con = g.m.yuanxiao3fun.getCon()['libao'][_idx]

    _setData = {}
    for _idx2pos, _idx3p in _choose.items():
        _setData['choose.{}.{}'.format(_idx, _idx2pos)] = _idx3p
    # 设置任务领奖
    g.m.yuanxiao3fun.setData(uid, _chkData['hdid'], _setData)
    _res['d'] = {}
    _res['d']['myinfo'] = g.m.yuanxiao3fun.getData(uid, _chkData['hdid'])

    return _res

if __name__ == '__main__':
    uid = g.buid("ysr2")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['0', {"0":"0", "1":"0"}])