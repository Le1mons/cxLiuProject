#!/usr/bin/python
# coding:utf-8
'''
神殿基金 - 领取奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [类型type:str (sdjj 神殿基金  djjj 等级基金), 领取阶段proid:str, 索引:int]
    :return:
    ::

        {"d": {
            'prize': [],
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _type = data[0]
    _proid = data[1]
    _idx = abs(int(data[2]))

    _con = g.GC[_type]['data'][_proid]

    if _type == 'sdjj':
        _fashita = g.mdb.find1('fashita', {'uid': uid},fields=['_id','layernum']) or {'layernum': 0}
        _val = _fashita['layernum']
    else:
        _val = g.getGud(uid)['lv']

    # 条件不足
    if _idx >= len(_con['arr']) or _val < _con[_idx]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _data = g.getAttrOne(uid, {'ctype': 'fund_{}'.format(_type)}, keys='_id,v') or {'v': {}}
    _prize = []
    _set = {'$push': {}}
    # 付费奖励
    if _data['v'].get(_proid, {}).get('pay') and _idx not in _data['v'].get(_proid, {}).get('paid', []):
        _prize += _con['arr'][_idx]['paid']
        _set['$push']['v.{}.paid'.format(_proid)] = _idx

    if _idx not in _data['v'].get(_proid, {}).get('free', []):
        _prize += _con['arr'][_idx]['free']
        _set['$push']['v.{}.free'.format(_proid)] = _idx

    # 奖励已领取
    if not _prize:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_algetprize')
        return _chkData

    _chkData['prize'] = _prize
    _chkData['set'] = _set
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.setAttr(uid, {'ctype': 'fund_{}'.format(data[0])}, _chkData['set'])

    _send = g.getPrizeRes(uid, _chkData['prize'], {'act':'sdjj_receive','idx':data})
    g.sendChangeInfo(conn, _send)


    _res['d'] = {'prize': _chkData['prize']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xiaoxiannv")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['djjj', "dengjijijin_2", 2])