#!/usr/bin/python
#coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")
    
import g

'''
积分赛刷新对手逻辑
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1,"d":{}}
    uid = conn.uid
    
    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res    
    
    #防止过快刷新导致压力过大
    _cacheKey = "crosszbjfref_" + str(uid)
    _cacheInfo = g.mc.get(_cacheKey)
    _nt = g.C.NOW()
    _cdTime = 3
    if _cacheInfo!=None and _nt - _cacheInfo<_cdTime:
        _res['s']=-5
        _res['errmsg'] = g.L("请"+ str(_cdTime-(_nt-_cacheInfo)) +"秒后再试噢")
        return _res
    g.mc.set(_cacheKey,_nt)

    _con = g.m.crosszbfun.getCon()

    _needMap = {}
    #获取当前已使用免费刷新次数
    _lessrefnum = g.m.crosszbfun.getJFLessRefNum(uid)
    _maxfreenum = _con['jifen']['freerefnum']
    _refnum = g.m.crosszbfun.getJFRefNum(uid)
    #如果有免费次数则直接刷新对手
    if _refnum > _maxfreenum:
        #如果没有刷新次数则读取消耗
        _need = _con['jifen']['refneed']
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

        _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'crosszb_jfrefmatch'})
        g.sendChangeInfo(conn, _sendData)
        #增加刷新购买次数
        g.m.crosszbfun.setJFBuyRefNum(uid)

    _r = g.m.crosszbfun.getJifenEnemy(uid,"manual")
    #增加刷新次数
    g.m.crosszbfun.setJFRefNum(uid)

    if _lessrefnum<1: _lessrefnum = 1

    _res['d'].update({"enemy":_r,"freerefnum":_lessrefnum-1})
    return _res

if __name__ == "__main__":
    uid = g.buid("lsq444")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])