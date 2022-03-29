#!/usr/bin/python
# coding:utf-8
'''
周年庆 - 下棋
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """
start
    :param conn:
    :param data: [任务id:str]
    :return:
    ::

        {"d": {
            'prize':[]
            'trace':[]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 等级不符
    if not g.chkOpenCond(uid, 'anniversary'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    _con = g.m.anniversaryfun.getCon()

    _need = _con['chess']['need']
    # 检测最多能下多少次
    _item = g.mdb.find1('itemlist',{'uid':uid,'itemid':_need[0]['t']},fields=['_id','num'])
    # 数量不足
    if not _item or _item['num'] <= 0:
        _chkData['s'] = -104
        _chkData['item'] = _need[0]['t']
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _con
    _chkData['num'] = min(abs(int(data[0])), _item['num'])
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _con = _chkData['con']
    _myData = g.m.anniversaryfun.getData(uid, _chkData['hdid'])

    _prize, _need, _trace = g.m.anniversaryfun.chess(_myData, _chkData['num'])
    _fmtprize = []
    for i in _prize:
        if isinstance(i, (list,tuple)):
            _fmtprize.append(i[0])
        else:
            _fmtprize.append(i)



    _send = g.delNeed(uid, _need,0, logdata={'act': 'anniversary_chess_need'})
    g.sendChangeInfo(conn, _send)

    g.m.anniversaryfun.setData(uid, _myData, _chkData['hdid'])
    _send = g.getPrizeRes(uid, _fmtprize, {'act':'anniversary_chess','num':data[0],'hdid':_chkData['hdid']})
    g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _fmtprize, 'trace':_trace, 'data': g.m.anniversaryfun.getData(uid, _chkData['hdid'])}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.getPrizeRes(uid, [{'a':"item",'t':'5051','n':10}])
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])