#!/usr/bin/python
#coding:utf-8

'''
超级礼包购买
'''


import sys
sys.path.append('..')

import g

def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    #购买的奖励下标
    _buyidx = int(data[0])
    _con = g.GC['chongzhihd']['chaozhilibao'][_buyidx]
    #标识key
    _chkKey = _con['chkkey']
    #过期类型
    _ctype = _con['ctype']
    #可操作方式
    _act = _con['act']
    if not g.m.chongzhihdfun.chkCanGet(uid,_chkKey) or _act != 'buy':
        #无法购买重置礼包
        _res["s"]=-2
        _res["errmsg"] = g.L("czlb_buy_res_-2")
        return _res
    
    _need = list(_con['need'])
    # 检查世界树果实是否充足
    _chk = g.chkDelNeed(uid, _need)
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    #特权id
    _tqid = None
    if 'tq' in _con:
        _tqid = _con['tq']

    # 英雄和冒险者礼包刷新悬赏任务小号次数
    if _buyidx in (2, 3):
        g.setAttr(uid, {'ctype':'task_rmbrefresh'},{'v': 0})

    g.m.chongzhihdfun.setPassTime(uid,_chkKey,_ctype,_tqid)
    _delData = g.delNeed(uid, _need,issend=0,logdata={"act":"czlb_buy"})
    g.sendChangeInfo(conn, _delData)
    _prize = list(_con['prize'])
    _prizeData = g.getPrizeRes(uid, _prize,{'act':'czlb_buy','idx':_buyidx,'need':_need})
    g.sendChangeInfo(conn, _prizeData)
    _resData = {'prize':_prize}
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid('lsq13')
    g.debugConn.uid = uid
    print g.minjson.write(doproc(g.debugConn,[2]))