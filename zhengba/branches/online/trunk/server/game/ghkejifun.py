#!/usr/bin/python
#coding:utf-8

'''
公会科技相关方法
'''

import g

#公会attr属性表
GHATTR = g.BASEDB(g.mdb,'gonghuiattr','gonghuiattr')

#获取已学习的科技信息
def getKjData(uid,job):
    _where = {'ctype':'keji_data','k':str(job)}
    _data = g.getAttrOne(uid,_where)
    if _data == None:
        return {}
    return _data['v']

#设置科技信息
def setKjData(uid,job,data):
    _where = {'ctype':'keji_data','k':str(job)}
    g.setAttr(uid,_where,data)


#重置科技
def clearKeJi(uid,job):
    _where = {'ctype':'keji_data','k':str(job)}
    g.delAttr(uid,_where)
    
#获取对应职业的科技返还奖励
def getPrizeByJobKeJi(uid,job):
    _kjData = getKjData(uid,job)
    _prize = []
    if len(_kjData) == 0:
        return _prize
    
    _con = g.GC['gonghui']['base']['skill']
    for kjid,kjlv in _kjData.items():
        _tmpCon = _con[kjid]
        for i in xrange(1, kjlv+1):
            lv = kjlv - i
            if lv < 0:
                continue
            _need = list(_tmpCon['need'])
            for d in _need:
                d['n'] = eval(d['n'])
                _prize.append(d)
                
    _prize = g.mergePrize(_prize)
    return _prize

#获取科技战力
def getKeJiZhanLi(uid):
    _ctype = 'keji_zhanli'
    _res = {}
    _data = g.getAttrOne(uid,{'ctype':_ctype})
    if _data:
        _res = _data['v']
        
    return _res

#设置科技战力
def setKeJiZhanLi(uid,job,zhanli):
    _ctype = 'keji_zhanli'
    _setData = {}
    _setData[g.C.STR("v.{1}",job)] = zhanli
    g.setAttr(uid,{'ctype':_ctype},_setData)

#重置buff
def reSetBuff(uid,job):
    _kjData = getKjData(uid,job)
    _buff = []
    _zhanli = 0
    if len(_kjData) > 0:
        for kjid,lv in _kjData.items():
            _tmpBuff = g.GC['gonghui']['base']['skill'][kjid]['buff']
            _tmpZhanLi = g.GC['gonghui']['base']['skill'][kjid]['zhanli']
            _zhanli += _tmpZhanLi * lv
            for k,v in _tmpBuff.items():
                _tmp = {}
                _tmp[k] = eval(v)
                _buff.append(_tmp)

    _key = g.C.STR('buff.keji.{1}',job)
    g.m.userfun.setCommonBuff(uid,{_key:_buff})
    #设置战力
    setKeJiZhanLi(uid,job,_zhanli)
    return _buff

if __name__=='__main__':
    uid = g.buid('lsq13')
    print reSetBuff(uid,1)
    #print reSetBuff(uid,2)