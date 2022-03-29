#!/usr/bin/python
#coding:utf-8
'''
公会 - 公会副本主界面
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

        {"d": {"fuben":最新副本进度id,"pknum":战斗次数,"rec_data":没有领奖的副本}
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

    _resData = {}
    #最新副本进度
    _resData['fuben'] = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    #当日已经挑战的次数
    _resData['pknum'] = g.m.gonghuifun.getPkNum(uid)
    # 未领奖副本数据
    _resData['rec_data'] = list(set([str(i) for i in xrange(1, int(_resData['fuben']))]) - set(g.m.gonghuifun.getFuBenSendEmail(uid)))

    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['2004']})

    _res['d'] = _resData
    return _res
        
    
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq111')
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)