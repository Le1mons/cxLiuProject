#!/usr/bin/python
#coding:utf-8

'''
NPC相关方法
'''
import g


#获取npc配置
'''
npcdata:npc信息
extdata:额外添加属性
'''
def fmtNpc(npcdata,extdata=None):
    #英雄hid
    _hid = str(npcdata['hid'])
    #等级
    _lv = npcdata['lv']
    #阶段等级
    _dengjielv = npcdata['dengjielv']
    _head = npcdata['head']
    #属性计算的倍率
    _buffpro = npcdata['buffpro']
    #站位
    _pos = npcdata['pos']
    _heroCon = g.m.herofun.getHeroCon(_hid)
    _heroData = {}
    _heroData.update(_heroCon)
    _heroData['lv'] = _lv
    _heroData['dengjielv'] = _dengjielv
    _buffData = g.m.herofun.makeHeroBuff(_heroData)
    _heroData.update(_buffData)
    _heroData['zhanli'] = g.m.herofun.getHeroZhanLi(_heroData)
    _heroData['side'] = 1
    _heroData['star'] = _dengjielv if _dengjielv > _heroData['star'] else _heroData['star']
    _heroData['pos'] = _pos
    for k,v in _buffpro.items():
        if k  not in _heroData:
            continue
        
        _heroData[k] = int(_heroData[k] * v)
            
    _resData = g.m.fightfun.fmtFightData(_heroData,{'head':_head,'enlargepro':npcdata['enlargepro']})
    return  _resData

#根据npcid获取NPC
def getNpcById(npcid):
    _res = []
    _npcCon = list(g.GC['npc'][str(npcid)])
    for d in _npcCon:
        _tmp = fmtNpc(d)
        _res.append(_tmp)
        
    return _res

def getNpcZhanli(heros):
    _res = 0
    for i in heros:
        # 基础属性i
        _zhanli = g.m.herofun.getHeroZhanLi(i)
        _res += _zhanli
    return _res


if __name__=='__main__':
    print getNpcById('10497')