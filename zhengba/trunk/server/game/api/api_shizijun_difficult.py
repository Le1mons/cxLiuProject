# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
十字军远征 ——— 难度选择
'''
from __future__ import division



if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [难度:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 难度
    _diff = str(data[0])
    if _diff not in g.GC['shizijun']['base']['zhanlixishu']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 等级不足
    if not g.chkOpenCond(uid, 'shizijun_{}'.format(_diff)):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 至少打通上一_diff难度
    if _diff != '1' and len(g.getAttrByCtype(uid,'shizijun_difficult',bydate=False,default=[]))+1 < int(_diff):
        _res['s'] = -4
        _res['errmsg'] = g.L('shizijun_difficult_-{}'.format(_diff))
        return _res

    _data = g.getAttrOne(uid, {'ctype': 'shizijun_data'})
    # 不能重复触发
    if _data and g.C.DATE(_data['lasttime']) == g.C.DATE(g.C.NOW()):
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _rivalNum = int(len(_data.get('passlist', [])) * 0.6) if _data and g.getGud(uid)['lv']>=80 else 0

    _con = g.GC['shizijun']['base']
    _passList, _v, _black, _prize = [], {}, [uid], []

    _taskVal = -1
    for i in xrange(_rivalNum + 1):
        if i == _rivalNum:
            _rival = g.m.shizijunfun.getRivalList(uid, i, _black, _diff)
            _v[str(i)] = _rival[str(i)]
        elif _data:
            _v[str(i)] = _data['v'][str(i)]
            try:
                _black.append(_data['v'][str(i)]['headdata']['uid'])
            except:
                pass
        elif i > 0:
            _v[str(i - 1)]['rival'] = [{'hid': x['hid'],'dengjielv':x['dengjielv'],'lv':x['lv']} for x in _v[str(i-1)]['rival'] if 'hid' in x]

        if i > 0:
            _passList.append(i-1)
            # 获取通关奖励
            _prize += _con['passprize'][_diff][str(i-1)]
            _prize += g.m.diaoluofun.getGroupPrizeNum(_con['diaoluozu'])
        _taskVal += 1

    if _prize:
        _prize = g.fmtPrizeList(_prize)
        _sendData = g.getPrizeRes(uid, _prize, act={'act': 'shizijun_difficult', 'diff': _diff, 'val':_taskVal})
        g.sendChangeInfo(conn, _sendData)

    g.event.emit("Shilianwin", uid, val=_taskVal)
    # 十字军活动
    if _taskVal > 0 and g.m.huodongfun.chkZCHDopen('shizijun'):
        g.m.huodongfun.setZCHDval(uid, 'shizijun', _taskVal)

    # 日常任务监听
    g.event.emit('dailytask', uid, 14, val=_taskVal)

    _data = {
        'v':_v,
        'prizelist':[],
        'passlist':_passList,
        'black':_black,
        'status':{},
        'fightless':{},
        'diff':_diff,
        'from':_rivalNum > 0
    }
    g.setAttr(uid,{'ctype':'shizijun_data'},_data)

    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = [1]
    _r = doproc(g.debugConn, data)
    print _r