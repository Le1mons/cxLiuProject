#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 征讨首领
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    if int(g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)) <= 60:
        # 必须打通关60关副本
        _res['s'] = -20
        _res['errmsg'] = g.L('gonghui_golbal_fberr')
        return _res

    _con = g.GC['gonghui_teamtask']['base']
    # 官员以上才能征讨
    if gud['ghpower'] > _con['taskcond']['power']:
        _res['s'] = -2
        _res['errmsg'] = g.L('teamtask_condemn_-2')
        return _res

    _boss = g.mdb.find1('gonghuiattr', {'ghid': _ghid, 'ctype': 'teamtask_leader'}, sort=[['k', -1]],fields=['_id','ctime','k','ispass'])
    # boss已存在
    if _boss and 'ispass' not in _boss:
        _res['s'] = -3
        _res['errmsg'] = g.L('teamtask_condemn_-3')
        return _res


    # 最新的首领关卡
    _leaderId = str(_boss['k'] + 1) if _boss else '1'
    if _leaderId == '61': _leaderId = '60'
    _supplyInfo = g.m.teamtaskfun.GHATTR.getAttrOne(_ghid, {'ctype':'teamtask_supply'},fields=['_id','v']) or {'v':0}
    # 补给值不足
    if _supplyInfo['v'] < _con['boss'][_leaderId]['opencontri']:
        _res['s'] = -4
        _res['errmsg'] = g.L('teamtask_condemn_-4')
        return _res

    if _boss:
        _passTime = g.C.ZERO(_boss['ctime']) + 2 * 24 * 3600 - g.C.NOW()

        # 距离上次boss两天后才能征讨
        if _passTime > 0:
            _res['s'] = -5
            _res['errmsg'] = g.C.STR(g.L('teamtask_condemn_-5') %(_passTime//3600,_passTime%3600//60,_passTime%60))
            return _res

    g.m.teamtaskfun.GHATTR.setAttr(_ghid, {'ctype':'teamtask_supply'}, {'$inc': {'v': -_con['boss'][_leaderId]['opencontri']}})
    # 增加首领
    g.m.teamtaskfun.GHATTR.setAttr(_ghid, {'ctype':'teamtask_leader','k':int(_leaderId)}, {'v': _leaderId})

    return _res

    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq222')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)