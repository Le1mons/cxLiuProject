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
# 合成类英雄
STYPE.HeChengHero = '4'
# 头像框 或者 聊天框
STYPE.BorderProp = '6'


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
        # 节日掉落
        _hdInfo = g.mdb.find1('hdinfo', {'htype': 19,'etime': {'$gte': _nt},'stime':{'$lte': _nt}}, fields=['_id', 'etime'])
        if _hdInfo:
            #2018.10.25 改成活动结束后再过一天消失
            _data['etime'] = _hdInfo['etime'] + 24*3600*1
        else:
            # 活动不存在默认十天
            _data['etime'] = _nt + 24 * 3600 * 10

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
def useItem(uid,itemid,num,tid='',iteminfo=None,args=None):
    _con = getItemCon(itemid)
    _info = iteminfo
    if _info==None:
        _info = getItemInfo(uid, itemid, keys='', where={"tid":tid})
    
    _res = {"s":1}
    #根据stype使用不同物品
    _stype = str(_info["usetype"])
    _stype2Method = {
        # 礼包使用类型物品
        STYPE.LiBaoDaoJu:useOrdinaryCard,
        # 合成使用类型物品
        STYPE.HeChengDaoJu: useHechengItem,
        # 合成英雄类道具
        STYPE.HeChengHero: useHechengItem,
        # 使用头像框 或者聊天框
        STYPE.BorderProp: useBorderItem
    }
    if _stype in _stype2Method:
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

# 使用头像框或者聊天框道具
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
        _time[_con['arg'][1]] = _con['arg'][2] * num + _time.get(_con['arg'][1], g.C.NOW())
        _set['time'] = _time

    g.setAttr(uid,{'ctype': _con['arg'][0] + '_list'},_set)

    g.m.userfun.updateUserInfo(uid,{_con['arg'][0]:_con['arg'][1]},{'act':'itemuse'})
    _data = changeItemNum(uid, itemid, -num)
    return {"rinfo": {'attr': {_con['arg'][0]:_con['arg'][1]},'item':_data}, "p": []}


# 礼包使用类型物品
def useOrdinaryCard(uid,itemid,num,con,tid='',iteminfo=None, args=None):
    _grp = con["dlp"]
    _addAttr = []
    for i in xrange(num):
        _prize = g.m.diaoluofun.getGroupPrize(_grp)
        _addAttr.extend(_prize)
    _addPrize = g.fmtPrizeList(_addAttr)
    _res = g.getPrizeRes(uid, _addPrize, act='useOrdinaryCard')
    _data = changeItemNum(uid, itemid, -num)
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
                _color = g.GC['shipin'][_Id]['color']
                if _color >= 4:
                    _heroCon = g.GC['shipin'][_Id]
                    g.m.chatfun.sendPMD(uid, 'hechengshipin', *[gud['name'], _heroCon['name'], _color])
            else:
                _heroCon = g.GC['hero'][_Id]
                _star = _heroCon['star']
                if _star >= 6:
                    g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _star, _heroCon['name']])
                # 养成礼包
                if _star in (5, 6):
                    g.event.emit('yangcheng', uid, _star)
                    # 统御
                    g.event.emit("hero_tongu", uid, _Id, _star)
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
        g.event.emit("hero_tongu", uid, _hcHero)

        _star = g.GC['pre_hero'][_hcHero]['star']
        # 养成礼包
        if _star in (5, 6):
            g.event.emit('yangcheng', uid, _star)

        if _star>=6:
            _heroCon = g.GC['hero'][_hcHero]
            g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _star , _heroCon['name']])
            
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
    uid = ''
    def test():
        #print g.mdb.toObjectId("55f132d785bf0637c49e3b1d")
        uid = g.buid('red6')
        #_res = changeItemNum(uid, '102', -1)
        #print _res
        #_res = getItemList(uid)
        #print _res
        #_res = getItemInfo(uid, '103')
        #print _res
        _res =  addItem(uid, '249',6000)
        _res =  addItem(uid, '250',6000)
        _res =  addItem(uid, '251',6000)
        _res =  addItem(uid, '252',6000)
        _res =  addItem(uid, '1004',6000)
        _res =  addItem(uid, '2001',6000)
        _res =  addItem(uid, '2002',6000)
        _res =  addItem(uid, '3001',6000)
        _res =  addItem(uid, '3002',6000)
        _res =  addItem(uid, '4001',6000)
        _res =  addItem(uid, '4002',6000)


        #print _res
        # _con = getItemCon()
        # for k in _con:
        #     if k =="comment":continue
        #     _res =  addItem(uid,k,g.m.common.random.randint(1000,5000))
        #     print _res

        #_res = delItem(uid, where={"_id":{"$ne":"1"}})
        #_res = getItemPrize(uid, {"item":[{"t":"101","n":3},{"t":"102","n":5}]})
        #print _res
        #for ele in _res["result"]:
            #_result = ele["retval"]
            
            #print ele["itemid"],_result
        
        #_res = updateItemInfo(uid, '101', {"color":4})
        #_res = delItem('0_2', where={"_id":g.mdb.toObjectId('55ed4beff9daf83b0cb10d11')})
        #_res = delItem(uid,itemid='101')
        #g.tw.reactor.stop()
    
    test()
    g.tw.reactor.run()