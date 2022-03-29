#!/usr/bin/python
#coding:utf-8
'''
公会 - 兑换金币
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    # 没有公会
    if not gud['ghid']:
        _res["s"]=-1
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res

    # 等级不符
    if not g.chkOpenCond(uid, 'guild_exchnage'):
        _res["s"]=-2
        _res["errmsg"]=g.L('global_limitlv')
        return _res

    _data = g.getAttrByDate(uid, {'ctype':"guild_exchange"})
    # 今天已经兑换
    if _data:
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_argserr')
        return _res

    _lv = gud['lv']
    _con = g.GC['gonghui']['base']['exchange']
    _need = [{'a':i['a'],'t':i['t'],'n':eval(i['n'])} for i in _con['need']]
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    g.setAttr(uid, {'ctype':"guild_exchange"}, {'v': 1})

    _sendData = g.delNeed(uid, _need,logdata={'act': 'gonghui_exchange','lv':_lv})
    _prize = [{'a':i['a'],'t':i['t'],'n':eval(i['n'])} for i in _con['prize']]

    _send = g.getPrizeRes(uid, _prize, {'act':"gonghui_exchange",'lv':_lv})
    g.mergeDict(_sendData, _send)
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('lj4444')
    print g.debugConn.uid
    _data = ['5b94cb79c0911a319c42d910']
    print doproc(g.debugConn,_data)