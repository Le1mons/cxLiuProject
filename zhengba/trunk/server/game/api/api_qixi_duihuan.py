#!/usr/bin/python
# coding:utf-8
'''
植树节活动 - 兑换
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(76,ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _id = str(data[0])
    _num = int(data[1])

    _con = g.m.qixifun.getCon()['duihuan'][_id]
    _data = g.m.qixifun.getData(uid, _hd['hdid'])
    # 任务没有完成
    if _data['duihuan'].get(_id, 0) + _num > _con['maxnum']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('planttrees_res_-3')
        return _chkData

    # 判断消耗
    _need = [{'a': i['a'], 't': i['t'], 'n': i['n'] * _num} for i in _con['need']]
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

    _chkData['hdid'] = _hd["hdid"]
    _chkData["data"] = _data
    _chkData["need"] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData
    _data = _chkData["data"]

    _id = str(data[0])
    _num = int(data[1])

    _con = g.m.qixifun.getCon()['duihuan'][_id]
    _prize = list(_con['prize'])
    _data = _chkData["data"]


    # 记录任务领奖
    _data["duihuan"][_id] = _data["duihuan"].get(_id, 0) + _num
    # 删除道具
    _send = g.delNeed(uid, _chkData['need'], 0, {'act': 'qixi_duihuan', 'id':_id})
    g.sendChangeInfo(conn, _send)

    _prize = g.mergePrize(_prize * _num)
    # 设置任务领奖
    g.m.qixifun.setData(uid, _chkData['hdid'], {'duihuan': _data["duihuan"]})

    _send = g.getPrizeRes(uid, _prize, {'act': 'qixi_duihuan', 'id':_id})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}
    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1', 1])