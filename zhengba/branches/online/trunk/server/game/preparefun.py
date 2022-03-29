#!/usr/bin/python
#coding:utf-8

'''
预处理
'''

import g

def fmtConfig():
    print "process fmtHero"
    fmtHero()
    print "process fmtDiaoLuoCon"
    fmtDiaoLuoCon()
    print "process fmtZahuopuLv"
    fmtZahuopu()
    print "process fmtVipTequan"
    fmtVipTequanCon()
    print "process fmtShopItem"
    fmtShopItem()
    print "process fmtXsTask"
    fmtXsTask()
    print "process fmtTask"
    fmtTask()
    print "process fmtChongZhiHd"
    fmtChongZhiHd()



def fmtHero():
    _res = {}
    #默认会初始显示的头像
    _res_defaultShowHead = []
    _keys = ['zhongzu','normalskill','pinglunid','xpskill','star','bdskillopendjlv','job','bd1skill','bd2skill','bd3skill','hid','growid','name']
    for hid,val in g.GC['hero'].items():
        _tmp = {}
        for k in _keys:
            _tmp[k] = val[k]
            
        _res[hid] = _tmp
        if val['star'] <= 3:
            _res_defaultShowHead.append(hid)
        
    g.GC._cache["pre_hero.json"] = _res
    g.GC._cache["pre_defshowhead.json"] = _res_defaultShowHead

# 初始化掉落文件
def fmtDiaoLuoCon():
    _res = {}
    for k, v in g.GC.diaoluo.items():
        _res[k] = {}
        _tmpBase = 0
        for item in v:
            _tmpBase += int(item['p'])

        _res[k]['base'] = _tmpBase
        _res[k]['list'] = v

    g.GC._cache["diaoluo2.json"] = _res


# 初始化商店等级区间  [{'lv':{'min': 0, 'max':0}, 'items':[]}]
def fmtZahuopu():
    _res = []
    for k, v in g.GC.zahuopu.items():
        _lvData = k.split('_')
        _items = {}
        _items['lv'] = [int(_lvData[0]),int(_lvData[1])]
        _items['shops'] = v
        _res.append(_items)
    g.GC._cache["pre_zahuopu.json"] = _res


#格式化vip特权配置
def fmtVipTequanCon():
    _res = {}
    _nKey = g.GC["vip"].keys()
    _rawCon = dict(g.GC["vip"])
    _nKey = sorted(_nKey,lambda x,y:cmp(int(x),int(y)))
    for k in _nKey:
        v = _rawCon[k]
        _lKey = str(int(k) - 1)
        _nTq = v["tq"]
        if _lKey in _rawCon:
            _nTq = _rawCon[_lKey]["tq"] + v["tq"]
            _rawCon[k]["tq"] = _nTq
            
        if k not in _res:_res[k] = {}
        for ele in _nTq:
            _res[k].update({str(ele[0]):int(ele[1])})
        
    g.GC._cache["pre_vip_tequan.json"] = _res

# 格式化shopitem配置
def fmtShopItem():
    _res = {}
    for k, v in g.GC["shopitem"].items():
        _sumP = sum(map(lambda x: x['item']["p"], v))
        _itemList = []
        for i in v:
            i = g.C.dcopy(i)
            i['p']=(i['item']['p'])
            del i['item']['p']
            _itemList.append(i)

        _res[k] = {"base":_sumP,'items': _itemList,'data':v}
    g.GC._cache["pre_shopitem.json"] = _res

#  格式化悬赏task配置
def fmtXsTask():
    _res = {'list':[]}
    _base = 0
    _colorTask = {}
    for k, v in g.GC['xstask'].items():
        _res['list'].append(v)
        _base += v['p']
        _color = str(v['color'])
        if _color not in _colorTask: _colorTask[_color] = []
        _colorTask[_color].append(v)

    _res['base'] = _base
    g.GC._cache["pre_xstask.json"] = _res
    g.GC._cache['pre_color2xstaskid.json'] = _colorTask

# 格式化任务配置
def fmtTask():
    _res = {}
    for k, v in g.GC['task'].items():
        _type = str(v['type'])
        # 按照任务类型分类
        if _type in _res:
            _res[_type].update({k: v})
        else:
            _res[_type] = {k: v}
    # 最后格式   {1:{'1023':{id,cond}},2:{'2025':{id,cond}}}
    g.GC._cache["pre_task.json"] = _res

#格式化重置活动配置
def fmtChongZhiHd():
    #meirixiangou：每日限购
    #chaozhilibao：超值好礼
    _res = {}
    for d in g.GC['chongzhihd']['meirixiangou']:
        _key = d['chkkey']
        _hddata = {'hdtype':'mrxg'}
        _hddata.update(d)
        _res[_key] = _hddata
        
    for d in g.GC['chongzhihd']['chaozhilibao']:
        _key = d['chkkey']
        _hddata = {'hdtype':'czlb'}
        _hddata.update(d)
        _res[_key] = _hddata
        
    g.GC._cache["pre_chongzhihd.json"] = _res
    
        

fmtConfig()