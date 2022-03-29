#!/usr/bin/python
# coding:utf-8
'''
双11 - 奖池抽奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int, 数量:int]
    :return:
    ::

        {"d": {'prize':[],'data':open数据}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开  过了抽奖的时间
    if not _hd or 'hdid' not in _hd or not g.m.double11fun.CanLottery(_hd):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _idx = abs(int(data[0]))
    _num = abs(int(data[1]))
    _con = g.m.double11fun.getCon()['prizepool'][_idx]
    _data = g.crossDB.find1('crossconfig', {'ctype':'double11_pool','k':_hd['hdid']},fields=['_id','v']) or {'v':{}}
    # 已经超过了临界值
    if _data['v'].get(str(_idx),{}).get(uid,0)+_num > (sum(_data['v'].get(str(_idx), {'1':0}).values())//_con['jindu']+1)*_con['jindu']*_con['modulus']/100.0:
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('global_numerr')
        return _chkData

    _data['v'].setdefault(str(_idx),{})[uid] = _data['v'].get(str(_idx),{}).get(uid,0) + _num
    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in g.m.double11fun.getCon()['poolneed']]
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
    _chkData['data'] = _data['v']
    _chkData['hd'] = _hd
    _chkData['need'] = _need
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _con = g.m.double11fun.getCon()
    # 扣除消耗
    g.sendChangeInfo(conn, g.delNeed(uid,_chkData['need'],0,{'act': 'double11_lottery'}))

    _set = {
        '$inc':{'v.{0}.{1}'.format(data[0],uid): data[1]},
        '$push':{'log':{'$each':[{'name':g.getGud(uid)['name'],'ctime':g.C.NOW(),'args':data}],'$slice':-20}},
        '$set':{'rtime':_chkData['hd']['rtime']}
    }
    g.crossDB.update('crossconfig',{'ctype':'double11_pool','k':_chkData['hdid']},_set,upsert=True)
    _prize = [{'a':'item','t':_con['poolreturn'],'n':data[1]}]

    _send = g.getPrizeRes(uid, _prize, {'act':'double11_lottery'})
    g.sendChangeInfo(conn, _send)
    _res['d'] = {'prize': _prize, 'data': _chkData['data']}
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[0,5])