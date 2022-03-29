#!/usr/bin/python
# coding:utf-8
'''
神殿基金 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [类型type:str (sdjj 神殿基金  djjj 等级基金)]
    :return:
    ::

        {"d": { 默认是 {}
            "proid":{
                'free':免费领取的列表,
                'paid':付费领取的列表,
                'pay':有没有付费,
            }
            'val': 当前层数,
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _type = data[0]

    _rData = {}
    _data = g.getAttrOne(uid, {'ctype': 'fund_{}'.format(_type)}) or {'v': {}}

    for k, v in g.GC[_type]['data'].items():
        _rData[k] = {
            'free': _data['v'].get(k, {}).get('free', []),
            'paid': _data['v'].get(k, {}).get('paid', []),
            'pay': _data['v'].get(k, {}).get('pay', False),
        }

    _res['d'] = _rData
    if _type == 'sdjj':
        _fashita = g.mdb.find1('fashita', {'uid': uid},fields=['_id','layernum']) or {'layernum': 0}
        _res['d']['val'] = _fashita['layernum']
    else:
        _res['d']['val'] = g.getGud(uid)['lv']

    return _res

if __name__ == '__main__':
    uid = g.buid("xiaoxiannv")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['sdjj','proid1',0])