#!/usr/bin/python
# coding:utf-8
'''
龙舟活动 - 免费礼包领奖
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

    _id = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(76, "etime")
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


    _con = g.m.qixifun.getCon()['libao'][_id]
    _data = g.m.qixifun.getData(uid, _hd['hdid'])
    # 任务没有完成
    if _con["proid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

        # 任务没有完成
    if _data['libao'].get(_id, 0) >= _con['buynum']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData


    # 判断消耗
    _need = _con["need"]
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

    _id = str(data[0])
    _con = g.m.qixifun.getCon()['libao'][_id]


    _data = _chkData["data"]
    _prize = _con["prize"]
    _need = _con["need"]

    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'qixi_libao', 'id': _id})
    g.sendChangeInfo(conn, _send)

    # 设置任务领奖
    g.m.qixifun.setData(uid, _chkData['hdid'], {'$inc': {'libao.{}'.format(_id): 1}})
    _send = g.getPrizeRes(uid, _prize, {'act': 'qixi_libao', 'id':_id})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5', 1])