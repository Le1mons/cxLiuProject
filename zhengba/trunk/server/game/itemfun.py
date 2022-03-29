#!/usr/bin/python
#coding:utf-8

'''
物品管理模块
'''

import g,copy

STYPE = g.Const()
# 使用礼包类型道具
STYPE.LiBaoDaoJu = '1'
# 合成类道具
STYPE.HeChengDaoJu = '3'
# 头像框 或者 聊天框
STYPE.BorderProp = '6'
# 自选宝箱
STYPE.ChooseSelf = '9'
# 皮肤
STYPE.Accessories = '11'
# 合成类英雄
STYPE.HeChengHero = '12'
# 变羊术
STYPE.Guinsoo = '13'
# 经验卡
STYPE.ExpCard = '14'
# 自选标签宝箱
STYPE.ChooseSelfTab = '15'
# 随机条件宝箱
STYPE.RandomPrize = '16'
# 开启目标条件宝箱
STYPE.TargetPrize = '17'

#获取物品配置,itemid为空时获取所有配置
def getItemCon(itemid=''):
    itemid = str(itemid)
    if itemid!='':
        return g.GC["item"][itemid]
    else:
        return g.GC["item"]


#获取物品数量
def getItemNum(uid,itemid):
    _r = getItemInfo(uid, itemid, keys='num')
    _num = 0
    if _r!=None:
        _num = int(_r["num"])

    return _num
        
#获取单个物品信息
#keys 表示所需的key 示例:'type,name'
#背包中没有该物品信息则返回None
def getItemInfo(uid,itemid,keys='',where=None):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {"uid":uid}
    if itemid!='':
        _w["itemid"] = itemid
        
    if where!=None:
        for k,v in where.items():
            if k == "tid" and len(v)>0:
                _w["_id"] = g.mdb.toObjectId(v)
            else:
                _w[k] = v
                
    _res = g.mdb.find("itemlist",_w,**_options)
    if len(_res)>0:
        _res = _res[0]
    else:
        _res = None

    return _res


#获取个人物品列表
#返回 list 
def getItemList(uid,keys='',where=None,itemid=''):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {"uid":uid}
    if itemid!='':
        _w["itemid"] = itemid
        
    if where!=None:
        for k,v in where.items():
            if k == "tid" and len(v)>0:
                k["tid"] = g.mdb.toObjectId(v)

        _w.update(where)

    _res = g.mdb.find("itemlist",_w,**_options)

    return _res

#添加单个物品
def addItem(uid,itemid,num=1,datas=''):
    _con = getItemCon(itemid)
    #是否可叠加物品
    _isMutil = _con["ismutil"]
    _w = {"uid":uid,"itemid":itemid}
    _nt = g.C.NOW()
    #道具基础属性
    _data = {
        #使用类型
        "usetype":_con["usetype"],
        #道具名
        "name":_con["name"],
        #背包类型
        "bagtype":_con["bagtype"],
        #道具颜色品质，白绿蓝紫橙红-012345
        "color":_con["color"],
        #道具数量
        "num":num,
        #创建时间
        "ctime":_nt,
        #最后修改时间
        "lasttime":_nt,
    }
    # 如果usetype为5
    if _con["usetype"] == '5':
        # 对应的活动
        _hdInfo = g.mdb.find1('hdinfo', {'htype': int(_con['htype']),'etime': {'$gte': _nt},'stime':{'$lte': _nt}}, fields=['_id', 'etime'])
        if _hdInfo:
            #2018.10.25 改成活动结束后再过一天消失
            _data['etime'] = _hdInfo['etime']
        elif int(_con['htype']) == 77:
            _data['etime'] = _nt + 24 * 3600 * 15
        else:
            # 活动不存在默认十天a
            _data['etime'] = _nt + 24 * 3600 * 10
    elif _con["usetype"] == '8':
        # 节日狂欢
        _hdInfo = g.m.huodongfun.getHDinfoByHtype(45)
        if _hdInfo and 'rtime' in _hdInfo:
            #2018.10.25 改成活动结束后再过一天消失
            _data['etime'] = _hdInfo['rtime'] + 24*3600*1
        else:
            # 活动不存在默认十天
            _data['etime'] = _nt + 24 * 3600

    # 变样术特权
    elif _con["usetype"] == '13':
        _data['etime'] = g.C.NOW() + 24*3600*7

    if type(datas)==dict:
        _data.update(datas)
    _itemInfo = getItemInfo(uid,itemid)
    #可叠加物品且物品存在
    if _isMutil and _itemInfo!=None:
        #叠加物品数量加num个
        #_tdata = {"$inc":{"num":num},"$set":{"lasttime":_nt}}
        #updateItemInfo(uid, itemid, _tdata)
        _tid = str(_itemInfo['_id'])
        changeItemNum(uid, itemid, num,itemInfo=_itemInfo)
        if '_id' in _itemInfo:
            del _itemInfo['_id']
            
        _res = {_tid:{'num':_itemInfo['num'] + num,'lasttime':_nt}}
    else:
        #非叠加物品还需要一个唯一编号
        addData = []
        _data.update(_w)
        if not _isMutil:
            _data['num'] = 1
            for i in xrange(num):
                addData.append(g.C.dcopy(_data))

        else:
            addData.append(_data)

        _tids = g.mdb.insert("itemlist", addData)
        _res = {str(i): {'num': 1,'lasttime':_nt} for i in _tids}

    return _res


#更新物品信息
#oldInfo 保留字段,可能通知需要
def updateItemInfo(uid,itemid,newInfo,where=None,oldInfo=None):
    #默认where条件为itemid
    _w = {"uid":uid,"itemid":itemid}
    if where!=None:
        _w.update(where)
    
    _res = g.mdb.update("itemlist",_w,newInfo)
    return _res

#根据tid修改物品数量，全目录搜索过，没地方用过
#def changeItemByTid(uid,tid,num):
    ##_data = {"$inc":{"num":num},"$set":{"lasttime":g.C.NOW()}}
    #if num == 0:
        #return
    
    #_actWhere = {'uid':uid,'tid':tid}
    #_res = getItemInfo(uid, '', keys='num,itemid',where=_actWhere)
    #itemid = str(_res['itemid'])
    #dbnum = int(_res["num"])
    
    #_data = {"num":dbnum+num,"lasttime":g.C.NOW()}
    
    #if num < 0:
        #if _res==None:
            #return
        
        #if dbnum + num <0:
            #return

        ##加完为0，删除
        #if dbnum + num == 0:
            #_res = delItem(uid,'',{'_id':g.mdb.toObjectId(tid)})
            #return _res
        
    #if 'tid' in _actWhere:
        #_actWhere['_id'] = g.mdb.toObjectId(_actWhere['tid'])
        #del _actWhere['tid']
        
    #_res = g.mdb.update("itemlist",_actWhere,_data)
    #return _res

#加减物品数量,负数为扣除物品
#如果为扣除物品则需要数据库中的道具个数,请自行判断
def changeItemNum(uid,itemid,num,itemInfo=None):
    
    if itemInfo!=None:
        _itemInfo = copy.deepcopy(itemInfo)
    else:
        _itemInfo = getItemInfo(uid, itemid)
        
    _tid = str(_itemInfo['_id'])
    dbnum = int(_itemInfo["num"])
    
    del _itemInfo['_id']
    #_data = {"$inc":{"num":num},"$set":{"lasttime":g.C.NOW()}}
    _data = {"num":dbnum+num,"lasttime":g.C.NOW()}
    
    _errRes = None
    #减物品需要判断是否删除物品
    if num == 0:
        return _errRes
    
    if num<0:
        if _itemInfo==None:
            return _errRes
        
        if dbnum + num <0:
            return _errRes
        
        #加完为0，删除
        if dbnum + num == 0:
            delItem(uid,itemid=itemid)
            g.m.dball.writeLog(uid, '_changeItemNum',{'itemid': itemid, 'beforechange': {"num": dbnum}, 'adterchange': {"num": 0}})
            return {_tid: {'num':0}}
    _itemInfo['num'] += num
    updateItemInfo(uid, itemid, _data)
    g.m.dball.writeLog(uid, '_changeItemNum', {'itemid': itemid,'beforechange':{"num":dbnum},'adterchange':{"num":_data['num']}})
    
    return {_tid: _itemInfo}
    
#删除物品
def delItem(uid,itemid='',where=None):
    _w = {"uid":uid}
    if itemid != '':
        _w['itemid'] = itemid

    if where != None:
        _w.update(where)

    _res = g.mdb.delete("itemlist",_w)
    
    g.m.dball.writeLog(uid, '_delItem', {'where': repr(_w)})
    return _res

#使用物品
def useItem(uid,itemid,num,tid='',iteminfo=None,args=None,**kwargs):
    _con = getItemCon(itemid)
    _info = iteminfo
    if _info==None:
        _info = getItemInfo(uid, itemid, keys='', where={"tid":tid})
    
    _res = {"s":1}
    #根据stype使用不同物品
    _stype = str(_con["usetype"])
    _stype2Method = {
        # 礼包使用类型物品
        STYPE.LiBaoDaoJu:useOrdinaryCard,
        # 合成使用类型物品
        STYPE.HeChengDaoJu: useHechengItem,
        # 合成英雄类道具
        STYPE.HeChengHero: useHechengItem,
        # 使用头像框 或者聊天框
        STYPE.BorderProp: useBorderItem,
        # 自选英雄
        STYPE.ChooseSelf: useChooseSelf,
        # 达到条件使用道具随机获得道具
        STYPE.RandomPrize: useRandomPrize,
        # 变羊术
        STYPE.Guinsoo: useGuinsoo,
        # 皮肤
        STYPE.Accessories: useAccessories,
        # 经验卡
        STYPE.ExpCard: useExpCard,
        # 标签自选宝箱
        STYPE.ChooseSelfTab: useChooseSelfTab,
        # 开启目标条件宝箱
        STYPE.TargetPrize: useTargetPrize,
    }
    if _stype in _stype2Method:
        # 标签自选
        if _stype == "15":
            _rdata = _stype2Method[str(_stype)](uid, itemid, num, _con, tid, iteminfo, args, kwargs['tab'])
        else:
            _rdata = _stype2Method[str(_stype)](uid,itemid,num,_con,tid,iteminfo,args)
        if 's' in _rdata:
            _res = _rdata
        else:
            _res['d'] = _rdata
    else:
        #无法使用该类型物品
        _res["s"]=-3
        _res["errmsg"] =g.L("useitem_res_-3")
    
    return _res

# 开启目标条件宝箱
def useTargetPrize(uid, itemid, num, _con, tid, iteminfo, args):
    _allPrize = []
    _targetCon = _con['arg'][0]['target']
    _ctype = 'itemuse' + str(itemid)
    _useNum = g.m.statfun.getMyStat(uid, _ctype)
    _group = _con['dlp']
    # 开启宝箱
    for i in range(num):
        _prize = g.m.diaoluofun.getGroupPrize(_group)
        # 抽到保底重置计数
        if _prize[0]['a'] == _con['arg'][0]['targetprize'][0]['a'] and _prize[0]['t'] == _con['arg'][0]['targetprize'][0]['t']:
            _useNum = 0
        _th = False
        # 开启宝箱次数目标
        if 'use' in _targetCon:
            _targetNum = _targetCon['use']
            _useNum += 1
            if _useNum >= _targetNum:
                _useNum = 0
                _th = True
                _prize = _con['arg'][0]['targetprize']
        _allPrize.extend(_prize)
    # 记录开启次数
    g.m.statfun.setStat(uid, _ctype, {'v': _useNum})
    _allPrize = g.mergePrize(_allPrize)
    _res = g.getPrizeRes(uid, _allPrize, act='useTargetPrize')
    _data = changeItemNum(uid, itemid, -num)
    _res['item'].update(_data)

    _retVal = {"rinfo": _res, "p": _allPrize}
    return _retVal

# 标签自选
def useChooseSelfTab(uid,itemid,num,_con,tid,iteminfo,args, tab):
    _prize = [{'a':_con['arg'][args]["prize"][tab]['a'], 't':_con['arg'][args]["prize"][tab]['t'], 'n':_con['arg'][args]["prize"][tab]['n']*num}]
    _res = g.getPrizeRes(uid, _prize, act='useChooseSelfTab')
    _data = changeItemNum(uid, itemid, -num)
    _res['item'].update(_data)
    _retVal = {"rinfo":_res,"p": _prize}
    return _retVal

# 经验卡
def useExpCard(uid,itemid,num,_con,tid,iteminfo,args):
    _mapid = g.getGud(uid)['maxmapid']
    _temp = {'jinbi':'GuaJiExtJinBi','exp':'GuaJiExtUserExp','useexp':'GuaJiExtHeroExp'}
    _num = g.GC['tanxianmap'][str(_mapid)]['gjprize'][_con['arg'][0]] * _con['arg'][1] * 0.2 * num
    _num *= g.m.vipfun.getTeQuanNumByAct(uid,_temp[_con['arg'][0]]) * 0.01 + 1
    _prize = [{'a':'attr', 't': _con['arg'][0], 'n':_num}]
    _send = g.getPrizeRes(uid, _prize, {'act': 'useExpCard','num': num})
    _data = changeItemNum(uid, itemid, -num)
    _send['item'].update(_data)
    _retVal = {"rinfo":_send,"p": _prize}
    return _retVal

# 变羊术
def useGuinsoo(uid,itemid,num,_con,tid,iteminfo,args):
    # 未来时间
    _time = g.getAttrByCtype(uid, 'guinsoo_expire', bydate=False)
    if _time < g.C.NOW():
        _time = g.C.NOW()
    g.setAttr(uid, {'ctype': 'guinsoo_expire'}, {'v': _time + _con['arg'][0]})

    _data = changeItemNum(uid, itemid, -1)
    _retVal = {"rinfo":{'item': _data},"p": []}
    return _retVal

# 皮肤
def useAccessories(uid,itemid,num,_con,tid,iteminfo,args):
    # 数量不足
    if iteminfo['num'] < num:
        _res = {}
        _res["s"] = -1
        _res["errmsg"] = g.L("global_argserr")
        return _res

    _aId = _con['arg'][0]
    # 皮肤数据
    _insert = {
        "uid":      uid,
        "id":       _aId,
        "expire":   g.C.NOW() + _con['arg'][1] if _con['arg'][1] > 0 else -1,
        "ctime":    g.C.NOW()

    }
    _insert = [_insert.copy() for i in xrange(num)]
    g.mdb.insert('skin', _insert)
    _send = {'skin': {str(i.pop('_id')): i for i in _insert}}
    # 设置buff
    if _con['arg'][1] == -1:
        #永久皮肤才生效
        _haveID = g.getAttrByCtype(uid, 'user_haveskin', bydate=False, default=[])
        if _aId not in _haveID:
            g.setAttr(uid, {'ctype': 'user_haveskin'}, {'$addToSet': {'v': _aId}})
            _haveID.append(_aId)
            _skinNum = len(_haveID)
            _landCon = g.GC['accessoriescom']['base']['landmark']
            _buff = {}
            for d in _landCon:
                _chkNum = d['num']
                if _chkNum > _skinNum:
                    break
                
                _buff = d['buff']
    
            g.mdb.update('buff',{'uid':uid,'ctype':'common'},{'buff.{}'.format('skin'): [_buff]},upsert=True)
            _res = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}}) or {}
            #设置头像
            g.m.userfun.setNewHead(uid, [_aId])
            g.mergeDict(_send, {'hero':_res})

    _itemData = changeItemNum(uid, itemid, -num)

    # 记录曾经获得过雕文
    gud = g.getGud(uid)
    if 'isskin' not in gud:
        gud['isskin'] = 1
        g.gud.setGud(uid,gud)
        g.m.userfun.updateUserInfo(uid, {'isskin': 1})
        _send['attr'] = {'isskin': 1}

    g.mergeDict(_send, {'item':_itemData})
    #_retVal = {"rinfo":_send, "p": [{'a':'skin', 't': _aId, 'n': num}]}
    _retVal = {"rinfo":_send, "p": []}
    return _retVal


# 自选英雄
def useChooseSelf(uid,itemid,num,_con,tid,iteminfo,args):
    _prize = [{'a':_con['arg'][args]['a'], 't':_con['arg'][args]['t'], 'n':_con['arg'][args]['n']*num}]
    _res = g.getPrizeRes(uid, _prize, act='useChooseSelf')
    _data = changeItemNum(uid, itemid, -num)
    _res['item'].update(_data)
    _retVal = {"rinfo":_res,"p": _prize}
    return _retVal

# 达到条件，开启随机奖励
def useRandomPrize(uid,itemid,num,_con,tid,iteminfo,args):
    # 判断是否满足条件
    if not chkOpenCond(uid, _con):
        _res = {}
        _res["s"] = -1
        _res["errmsg"] = g.L("global_argserr")
        return _res

    _prize = g.C.RANDLIST(_con['arg'])

    # _prize = [{'a': _con['arg'][args]['a'], 't':_con['arg'][args]['t'], 'n':_con['arg'][args]['n']*num}]
    _res = g.getPrizeRes(uid, _prize, act='useRandomPrize')
    _data = changeItemNum(uid, itemid, -num)
    _res['item'].update(_data)
    _retVal = {"rinfo":_res,"p": _prize}
    return _retVal


# 检查某个功能的开启条件
def chkOpenCond(uid, _con):
    _retVal = False

    gud = g.getGud(uid)
    # 检查开启条件
    _main = True  # 必要条件，必须达成
    for k, v in _con["opencond"]['main'].items():
        # 单个条件的判断
        if k in ('lv', 'opencityid', 'vip') and gud[k] < int(v):
            _main = False
            break
        elif k == 'lvrange' and (gud['lv'] < v[0] or gud['lv'] > v[1]):
            _main = False
            break

    if _main:
        _retVal = True

    return _retVal



# 使用头像框或者聊天框或者称号道具
def useBorderItem(uid,itemid,num,_con,tid,iteminfo,*args):
    _data = g.getAttrOne(uid, {'ctype': _con['arg'][0] + '_list'}, keys='_id,time,v')
    _set = {}
    if _data:
        _list = _data['v']
        if _con['arg'][1] not in _list:
            _list.append(_con['arg'][1])

        _set['v'] = _list
    else:
        _set['v'] = [_con['arg'][1]]
        _data = {}

    # 设置一个过期时间
    if _con['arg'][2] != 0:
        _time = _data.get('time', {})
        _startTime = g.C.NOW()
        if _con['arg'][1] in _time and _time[_con['arg'][1]] > g.C.NOW():
            _startTime = _time[_con['arg'][1]]
        _time[_con['arg'][1]] = _con['arg'][2] * num + _startTime
        _set['time'] = _time

    g.setAttr(uid,{'ctype': _con['arg'][0] + '_list'},_set)
    # 头像框  激活13 14 15 16  就可以激活星辰勇者
    if _con['arg'][0] == 'headborder' and len({'13','14','15','16'}&set(_set['v'])) == 4:
        g.setAttr(uid,{'ctype': 'chenghao_list'}, {'$push': {'v': '1'}})

    if _con['arg'][0] == 'chenghao':  # 合成称号不需要穿戴
        _data = changeItemNum(uid, itemid, -num)
        return {"rinfo": {'item': _data}, "p": []}

    g.m.userfun.updateUserInfo(uid,{_con['arg'][0]:_con['arg'][1]},{'act':'itemuse'})
    _data = changeItemNum(uid, itemid, -num)
    return {"rinfo": {'attr': {_con['arg'][0]:_con['arg'][1]},'item':_data}, "p": []}


# 礼包使用类型物品
def useOrdinaryCard(uid,itemid,num,con,tid='',iteminfo=None, args=None):
    _grp = con["dlp"]
    _needNum = 1 * num if not con['hcnum'] else int(con['hcnum']) * num
    #合成所需数量不足
    if iteminfo["num"] < _needNum:
        _res = {}
        _res["s"] = -1
        _res["errmsg"] = g.L("useitem_hc_res_-1")
        return _res

    _addAttr = []
    for i in xrange(num):
        _prize = g.m.diaoluofun.getGroupPrize(_grp)
        _addAttr.extend(_prize)
    _addPrize = g.fmtPrizeList(_addAttr)
    # 消耗物品的数量
    _data = changeItemNum(uid, itemid, -_needNum)
    _res = g.getPrizeRes(uid, _addPrize, act='useOrdinaryCard')
    _res['item'].update(_data)
    _retVal = {"rinfo":_res,"p":_addPrize}
    return _retVal

# 合成英雄类道具
def useHechengItem(uid,itemid,num,con,tid='',iteminfo=None, args=None):
    _hcNeedNum = int(con["hcnum"]) * num
    #合成所需数量不足
    if iteminfo["num"] < _hcNeedNum:
        _res = {}
        _res["s"] = -1
        _res["errmsg"] = g.L("useitem_hc_res_-1")
        return _res

    _hcHero = con['hchero']
    _useType = con['usetype']
    gud = g.getGud(uid)
    # 没有指定英雄的碎片
    if not con['hchero']:
        _dlzId = con['dlp'][0]
        _con = g.GC['diaoluo2'][_dlzId]
        _resPrize = []
        for i in xrange(num):
            _addPrize = g.randDataByWeight(_con)
            _resPrize.append(_addPrize)

            # 跑马灯
            _Id = _addPrize['t']
            if _addPrize['a'] == 'shipin':
                _color = g.m.shipinfun.getShipinCon(_Id)['color']
                if _color >= 4:
                    _heroCon = g.m.shipinfun.getShipinCon(_Id)
                    g.m.chatfun.sendPMD(uid, 'hechengshipin', *[gud['name'], _heroCon['name'], _color])
            elif _addPrize['a'] == 'hero':
                _heroCon = g.GC['hero'][_Id]
                _star = _heroCon['star']
                if _star >= 6:
                    g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _star, _heroCon['name']])
                # 养成礼包
                if _star in (5, 6):
                    g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _star)
                    # 统御
                    # g.event.emit("hero_tongu", uid, _Id, _star)
                if _star >= 4:
                    # 监听英雄获取
                    g.event.emit('gethero',uid,_Id)

    else:
        # 英雄碎片 并且有指定的英雄
        _resPrize = [{'a':'hero', 't': _hcHero, 'n': num}]
        _geziNum = g.m.userfun.getGeziNum(uid)
        _heros = g.m.herofun.getMyHeroList(uid)
        _heroNum = len(_heros)
        # 英雄数量超过了格子数量
        if _heroNum + num > _geziNum:
            _res = {}
            _res['s'] = -2
            _res['errmsg'] = g.L('useitem_hc_res_-2')
            return _res

        #监听获取英雄成就任务
        g.event.emit("gethero",uid,_hcHero,num)
        # 统御
        # g.event.emit("hero_tongu", uid, _hcHero)

        _star = g.GC['pre_hero'][_hcHero]['star']
        # 养成礼包
        if _star in (5, 6):
            g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _star)

        if _star>=6:
            _heroCon = g.GC['hero'][_hcHero]
            g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _star , _heroCon['name']])

    _resPrize = g.fmtPrizeList(_resPrize)
    _itemData = changeItemNum(uid, itemid, -_hcNeedNum)
    _res = g.getPrizeRes(uid,_resPrize, {"act":"useHechengItem","tid":tid,"num":num})
    _res['item'].update(_itemData)
    _retVal = {"rinfo":_res,"p":_resPrize}
    return _retVal


# 监听充值事件-监听充值会影响的活动
@g.event.on("chongzhi")
def onChongzhiSuccess(uid, act, money, orderid, payCon):
    '''_nt = g.C.NOW()
    where = {'uid': uid, 'stype': int(STYPE.ChongZhiDaoJu), 'passtime':{'$gte': _nt}}
    g.mdb.update('itemlist', where, {'$inc':{'paymoney': int(money)*10}})
    itemList = getItemList(uid,'num,paymoney', where)
    send_data = {'item':{}}
    for item in itemList:
        send_data['item'][str(item['_id'])] = {'num': item['num'], 'paymoney': item['paymoney']}

    g.sendUidChangeInfo(uid, send_data)'''
    return


if __name__=="__main__":
    uid = g.buid('xuzhao')
    useBorderItem(uid, '1044', 1,1,1,1,1,)