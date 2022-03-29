#!/usr/bin/python
#coding:utf-8
'''
公会 - 副本详情
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

        {"d": {"pknum":战斗次数,"ranklist":[{"headdata":{},"dps":伤害,"power":职位}],"maxhp":最大次数,"hp":当前血量}
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
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res
    
    _con = g.GC['gonghui_fuben']['base']
    #副本id
    _fbid = str(data[0])
    if _fbid not in _con['fuben']:
        #副本信息不存在
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghuifuben_fbdata_res_-2')
        return _res
    
    _chkFBid = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    if int(_fbid) > int(_chkFBid):
        #当前副本未开放
        _res['s'] = -3
        _res['errmsg'] = g.L('gonghuifuben_fbdata_res_-3')
        return _res

    _resData = {}
    _resData['pknum'] = g.m.gonghuifun.getPkNum(uid)
    _resData['ranklist'] = []
    #副本信息
    _fubenData = g.m.gonghuifun.getFuBenData(_ghid,_fbid)
    if len(_fubenData) > 0:
        #还未有记录
        _resData['maxhp'] = _fubenData['maxhp']
        _resData['hp'] = sum(_fubenData['pos2hp'].values())
        if _resData['hp'] > _resData['maxhp']:_resData['hp'] = _resData['maxhp']
        if 'ispass' in _fubenData:
            #已通关的排行榜
            _resData['ranklist'] = _fubenData['dpsrank']
        else:
            _dpsData = _fubenData['uid2dps']
            _rankData = g.C.dicSortByVal(_dpsData)
            _resData['ranklist'] = []
            for d in _rankData:
                _tmp = {}
                gud = g.getGud(d[0])
                _tmp['showhead'] = g.m.userfun.getShowHead(d[0])
                _tmp['dps'] = d[1]
                _tmp['power'] = gud['ghpower']
                _resData['ranklist'].append(_tmp)
                    
    _res['d'] = _resData
    return _res
        
    
    
if __name__ == '__main__':
    uid = '0_5aec54eb625aee6374e25e0c'
    g.debugConn.uid = uid#g.buid('tk1')
    print g.debugConn.uid
    _data = [1,{"1":"5b335d1ce1382356f3f27449","3":"5b336a65e1382336faa977aa"}]
    print doproc(g.debugConn, data=_data)