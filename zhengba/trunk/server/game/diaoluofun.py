#!/usr/bin/python
#coding:utf-8

#掉落相关方法

import g

#获取掉落等级配置
def getDiaoLuoLv(gid):
    gid = str(gid)
    if not gid in g.GC["diaoluolv"]:
        return
    
    return g.GC["diaoluolv"][gid]

#格式化奖励配置
#gid:物品分组编号，可为数字多个分组编号
#lv: 根据级别限制掉落组
def getGroupPrizeLv(gid,lv):
    _con = g.GC["diaoluolv"]
    _res = []
    _gidArr = [gid]
    if isinstance(gid,tuple) or isinstance(gid,list):_gidArr = gid
    for k in _gidArr:
        _dlCon = getDiaoLuoLv(k)
        if _dlCon == None:continue
        #检测级别是否满足
        for _rCon in _dlCon:
            if _rCon["lv"][0] <= lv < _rCon["lv"][1]:
                _res+=getGroupPrize(_rCon["p"])

    return _res

#格式化奖励配置
#gid:物品分组编号，可为数字多个分组编号
def getGroupPrize(gid, delp=1):
    _res = []
    _gidArr = [gid]
    if isinstance(gid,tuple) or isinstance(gid,list):_gidArr = gid
    for k in _gidArr:
        _tmpArr = getDiaoLuo(k)
        if _tmpArr == None:
            continue
        _base = _tmpArr['base']
        _list =_tmpArr['list']
            
        _tmpItem = g.Dict(g.C.getRandArr(_list,_base))
        if _tmpItem == None or _tmpItem['t'] == '':
            continue

        if delp:
            del _tmpItem["p"]
        _res.append(_tmpItem)
    return _res

# 从特定掉落组里获取指定数量的物品
def getGroupPrizeNum(gid, num=1):
    _res = []
    _tmpArr = getDiaoLuo(gid)
    if not _tmpArr: return _res
    _list = _tmpArr['list']
    _r = g.C.getRandArrNum(_list, num)
    for ele in _r:
        if not ele or ele['t'] == '':
            continue

        # del ele['p']
        _tmpele = {
            'a': ele['a'],
            't': ele['t'],
            'n': ele['n']
        }
        _res.append(_tmpele)

    return _res
    
#获取掉落信息
def getDiaoLuo(gid):
    _gid = str(gid)
    if not _gid in g.GC.diaoluo2:
        return
    
    return g.GC.diaoluo2[_gid]


if __name__=="__main__":
    uid = "0_55f132d785bf0637c49e3b1d"
    print getGroupPrizeNum('4025')