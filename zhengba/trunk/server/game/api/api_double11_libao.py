#!/usr/bin/python
# coding:utf-8
'''
双11 - 兑换
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int]
    :return:
    ::

        {"d": {'prize':[],'data':open数据所有的}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开  过了抽奖的时间
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _idx = abs(int(data[0]))
    _con = g.m.double11fun.getCon()['libao'][_idx]
    # 不能用钻石购买
    if _con['needrmbmoney'] == 0:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _myData = g.m.double11fun.getData(uid, _hd['hdid'])
    # 数量不足
    if _myData['libao'].get(str(_idx), 0) >= _con['num']:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _myData['libao'][str(_idx)] = _myData['libao'].get(str(_idx), 0) + 1

    _need = [{'a':'attr','t':'rmbmoney','n':_con['needrmbmoney']}]
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
    _chkData['con'] = _con
    _chkData['data'] = _myData
    _chkData['need'] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _num = 0
    if _chkData['con']['allowance'] > 0:
        _item = g.mdb.find1('itemlist',{"uid":uid,'itemid':g.GC['double11']['allowance']},fields=['num','_id'])
        if _item:
            _num = min(_chkData['con']['allowance'], _item['num'])
            _chkData['need'].append({'a':'item','t':g.GC['double11']['allowance'],'n':_num})

    _chkData['data']['allowance'][str(data[0])] = _chkData['data']['allowance'].get(str(data[0]), 0) + _num
    # 扣除消耗
    g.sendChangeInfo(conn, g.delNeed(uid,_chkData['need'],0,{'act': 'double11_libao'}))

    g.m.double11fun.setData(uid, {'$inc': {'libao.{}'.format(data[0]): 1, 'allowance.{}'.format(data[0]): _num}}, _chkData['hdid'])
    _prize = _chkData['con']['prize']

    _send = g.getPrizeRes(uid, _prize, {'act':'double11_libao','args':data[0]})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': _chkData['data']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0,1])