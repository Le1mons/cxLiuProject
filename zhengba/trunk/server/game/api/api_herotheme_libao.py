#!/usr/bin/python
# coding:utf-8
'''
英雄主题 - 免费礼包领奖
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

    _id = str(data[0])
    _hd = g.m.huodongfun.getHDinfoByHtype(80, "etime")
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


    _con = g.m.herothemefun.getCon()
    _libaoCon = _con['libao'][_id]
    _data = g.m.herothemefun.getData(uid, _hd['hdid'])
    # 任务没有完成
    if _libaoCon["proid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

        # 任务没有完成
    if _data['libao'].get(_id, 0) >= _libaoCon['buynum']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData



    # 判断消耗
    _need = _libaoCon["need"]
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
    _con = g.m.herothemefun.getCon()
    _libaoCon = _con['libao'][_id]


    _data = _chkData["data"]
    _useNum = _chkData["usenum"]

    _prize = _libaoCon["prize"]
    _need2 = _libaoCon["need"]

    _need = []
    _need.extend(_need2)

    _setData = {}


    _data["libao"][_id] = _data["libao"].get(_id, 0) + 1
    _setData["libao"] = _data["libao"]
    # # 扣除奖励
    _send = g.delNeed(uid, _need, 0, {'act': 'herotheme_libao', 'id': _id})
    g.sendChangeInfo(conn, _send)

    # 设置任务领奖
    g.m.herothemefun.setData(uid, _chkData['hdid'],_setData)
    _send = g.getPrizeRes(uid, _prize, {'act': 'herotheme_libao', 'id':_id})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize}

    _res['d']['myinfo'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['zhounianRmb', 1])