#!/usr/bin/python
#coding:utf-8

'''
预处理
'''

import g,copy

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
    print "process fmtJiBan"
    fmtJiBan()
    print "process fmtEquip"
    fmtEquip()
    print "process fmtNPC"
    fmtNPC()
    print "process fmtGpjjc"
    fmtGpjjc()
    print "process fmtShiPin"
    fmtShiPin()
    print "process fmtShiLianZhiTABuff"
    fmtShiLianZTBuff()

def fmtHero():
    _res = {}
    #默认会初始显示的头像
    _res_defaultShowHead = []
    _hero_pinglun = {}
    _keys = ['zhongzu','normalskill','pinglunid','xpskill','star','bdskillopendjlv','job','bd1skill','bd2skill','bd3skill','hid','growid','name']
    for hid,val in g.GC['hero'].items():
        _tmp = {}
        for k in _keys:
            _tmp[k] = val[k]
            
        _res[hid] = _tmp
        if val['star'] <= 3:
            _res_defaultShowHead.append(hid)
        if val["pinglunid"] not in _hero_pinglun: _hero_pinglun[val["pinglunid"]] = {}
        _hero_pinglun[val["pinglunid"]].update({hid: val["color"]})
    g.GC._cache["pre_hero.json"] = _res
    g.GC._cache["pre_defshowhead.json"] = _res_defaultShowHead
    g.GC._cache["pre_hero_pinglun.json"] = _hero_pinglun

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
    
        
# 格式化武将列传配置
def fmtJiBan():
    _heroList = []
    _con = g.GC["jiban"]
    _plCon = g.GC["pre_hero_pinglun"]
    for d in _con.values():
        for plid in d["chkhero"]:

            hidData = _plCon[str(plid)]
            _heroList += [hid for hid, color in hidData.items() if color >= 4]

    g.GC._cache["jibanhid.json"] = _heroList



# 格式化装备
def fmtEquip():
    _typeEquip = {}
    _con = g.GC["equip"]
    _jobEquip = {}
    for d in _con.values():
        if d["colorlv"] == 1:
            if d["job"] not in _jobEquip:_jobEquip[d["job"]] = []
            _jobEquip[d["job"]].append(d)
            continue
        if d["type"] not in _typeEquip: _typeEquip[d["type"]] = []
        _typeEquip[d["type"]].append(d)

    _res = {}
    for type, list in _typeEquip.items():
        list.sort(key=lambda x: int(x['id']))
        _res[type] = list

    g.GC._cache["pro_typeequip.json"] = _typeEquip
    g.GC._cache["pro_gpjjc_jobequip.json"] = _jobEquip
    return _res

# 格式化npc
def fmtNPC():
    if g.conf['VER'] in ('debug', 'cross'):
        return

    g.GC['npc']

# 格式化公平竞技场配置
def fmtGpjjc():
    _heroStarCon = g.GC["herostarup"]
    _heroCon = g.GC["hero"]
    gpjjc_hero = []
    # 设置配置
    for hid, info in _heroStarCon.items():
        if "10" not in info or _heroCon[hid]["zhongzu"] == 7:
            continue
        gpjjc_hero.append(hid)


    gpjjcplayerlv = {}
    _lvCon = g.GC["gpjjcplayerlv"]
    _lvlist = sorted(_lvCon.items(), key=lambda x: int(x[0]), reverse=False)

    _shipinlist = []
    _baoshilist = []
    for data in _lvlist:
        _shipinlist += data[1]["shipin"]
        _baoshilist += data[1]["baoshi"]
        _shipin = copy.copy(_shipinlist)
        _baoshi = copy.copy(_baoshilist)
        gpjjcplayerlv[data[0]] = {"baoshi": _baoshi, "shipin": _shipin}



    g.GC._cache["pro_gpjjc_hero.json"] = gpjjc_hero
    g.GC._cache["pro_gpjjcplayerlv.json"] = gpjjcplayerlv

# 格式化饰品配置
def fmtShiPin():
    _con = g.GC["shipin"]
    _pingfenCon = {}
    for id, info in _con.items():
        if info["fenshu"] not in _pingfenCon:_pingfenCon[info["fenshu"]] = []
        _pingfenCon[info["fenshu"]].append(id)
    g.GC._cache["pro_pingfen_shipin.json"] = _pingfenCon

def fmtShiLianZTBuff():
    _con = g.GC["shilianztbuff"]
    _proCon = {}
    for id, info in _con.items():
        if info["parameter"]["color"] not in _proCon:
            _proCon[info["parameter"]["color"]] = {}
        if info["parameter"]["stype"] not in _proCon[info["parameter"]["color"]]:
            _proCon[info["parameter"]["color"]][info["parameter"]["stype"]] = []
            _proCon[info["parameter"]["color"]][info["parameter"]["stype"]].append(id)
    g.GC._cache["pro_shilianztbuff.json"] = _proCon


fmtConfig()
