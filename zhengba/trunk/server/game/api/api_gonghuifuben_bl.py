#!/usr/bin/python
#coding:utf-8
'''
公会 - 公会副本补领
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [副本id:str]
    :return:
    ::

        {"d": {"prize": []}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    # 要领取的副本id
    _fbid = str(data[0])
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    _maxId = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    # 此boss还没打完
    if int(_fbid) >= int(_maxId):
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghuifuben_bl_-2')
        return _res

    _recList = g.m.gonghuifun.getFuBenSendEmail(uid)
    # 已经领过了
    if _fbid in _recList:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _con = g.GC['gonghui_fuben']['base']['fuben'][str(_fbid)]
    _need = [{'a':'attr','t':'rmbmoney','n': _con['blneed']}]
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
    # 将此副本id push已领取列表
    g.m.gonghuifun.setFuBenSendEmail(uid, _fbid)


    _deelData = g.delNeed(uid, _need, issend=0, logdata={'act': 'gonghuifuben_bl', 'fbid':_fbid})
    _prize = _con['blprize']
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'gonghuifuben_bl', 'fbid': _fbid})
    g.mergeDict(_sendData, _deelData)
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res
        
    
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = [37]
    print doproc(g.debugConn,_data)