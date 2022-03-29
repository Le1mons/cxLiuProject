#!/usr/bin/python
#coding:utf-8

'''
许愿池相关方法
'''
import g

# 获取许愿池配置
def getXYCcon(poolname=''):
    if not poolname:
        return g.GC['xuyuanchi']
    return g.GC['xuyuanchi'][poolname]

# 获取许愿池数据
def getXuyuanchiData(uid, poolname,isref=False,data=None):
    # 2018-11-23 普通许愿池增加进化版
    _xycData = g.getAttrByCtype(uid, 'xuyuanchi_super{}'.format(poolname), bydate=False)
    _xycData = {'shopitem': _xycData,'super':1,'freetime':0}
    if not _xycData['shopitem']:
        _w = {'ctype': 'xuyuanchi_{}'.format(poolname)}
        _xycData = g.getAttrByDate(uid, _w,fields=['_id'])

        # 如果数据不存在 或者过了凌晨
        if not _xycData or isref:
            _itemList = createXYCitems(uid, poolname)
            _rfTime = getRefreshTime(poolname)
            _xycData = {
                'freetime':_rfTime if _xycData else 0,
                'afternum': 0,
                'shopitem':_itemList,
            }
            if data: _xycData.update(data)

            g.setAttr(uid, _w, _xycData)

        else:
            _xycData = _xycData[0]
    return _xycData

# 增加抽奖次数
def getLotteryInfo(uid):
    _resData = {}
    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _data = g.getAttrOne(uid, {'ctype': 'xuyuanchi_cishu', 'k': _dKey}, keys='_id,v,reclist')
    if _data:
        _resData['v'] = _data['v']
        _resData['reclist'] = _data.get('reclist', [])
    else:
        _resData['v'] = 0
        _resData['reclist'] = []
        _resData['k'] = _dKey
        g.setAttr(uid,{'ctype': 'xuyuanchi_cishu'},_resData)
    return _resData


# 获取刷新时间
def getRefreshTime(poolname):
    _con = g.GC['xuyuanchi'][poolname]
    _rtimes = _con['rtimes']
    _nt = g.C.NOW()
    return _rtimes + _nt

# 生成许愿池物品数据
def createXYCitems(uid, poolname,super=None):
    _resList = []

    _groupItem, _groupp = getGroupItemByLv(uid, poolname,super=super)

    _dlzCon = g.GC['pre_shopitem']
    for idx,_groupId in enumerate(_groupItem):
        _dlz = _dlzCon[_groupId]

        _res = g.C.RANDARR(_dlz['items'], _dlz['base'])
        _res.update({'idx':idx,'p':_groupp[idx]})
        _resList.append(_res)

    return _resList

# 根据等级获取对应掉落组
def getGroupItemByLv(uid, poolname,super=None):
    _con = getXYCcon(poolname)
    _lvCon = _con['lv'] if not super else _con['super']
    gud = g.getGud(uid)
    _lv = gud['lv']
    for i in _lvCon:
        _lvList = i.split('_')
        if int(_lvList[0])<= _lv and int(_lvList[1]) >= _lv:
            _groupItem = _lvCon[i]['groupitem']
            _groupp = _lvCon[i]['groupp']
            return _groupItem, _groupp

# 更新许愿池信息
def updateXYCinfo(uid,poolname,data):
    _ctype = 'xuyuanchi_{}'.format(poolname)
    _w = {'ctype':_ctype}
    g.setAttr(uid, _w, data)


# 记录许愿池的中奖记录
def setXYCjilu(uid, poolname, prizelist):
    gud = g.getGud(uid)
    _name = gud['name']
    _nt = g.C.NOW()
    _dataList = []
    for i in prizelist:
        _data = {
            'username':_name,
            'ctime':_nt,
            'prize':i,
            'uid':uid,
            'poolname':poolname,
            'ttltime':g.C.TTL()
        }
        _dataList.append(_data)
    g.mdb.insert('xyclog', _dataList)

# 获取许愿池中奖记录信息
def getXYCjilu(_type,**kwargs):
    _maxJiluNum = getXYCcon()['maxjilunum']
    _res = g.mdb.find('xyclog',{'poolname':_type},sort=[['ctime',-1]],limit=_maxJiluNum,**kwargs)
    if not _res:
        _res = []
    # else:
    #     _tidList = map(lambda x:x['_id'], _res)
    #     g.mdb.delete('xyclog', {'_id':{'$nin':_tidList}})

    for i in _res:
        del i['_id']

    return _res


# 获取抽奖数据
def getLotteryData(uid, num, shopitem,afternum=None):
    _jiluList, _prizeList = [], []
    for i in xrange(num):
        # 获取shopitem中 buynum非0的数据
        _itemList = [{'p':x['p'],'idx':x['idx']} for x in shopitem if x['buynum'] != 0]

        _base = sum(map(lambda x:x['p'], _itemList))
        _randDLZ = g.C.RANDARR(_itemList, _base)
        _idx = _randDLZ['idx']

        _itemInfo = shopitem[_idx]
        _buyNum = _itemInfo['buynum']
        # 如果是无限制购买
        if _buyNum != -1:
            _buyNum -= 1
            shopitem[_idx]['buynum'] = _buyNum

        _prize =  shopitem[_idx]['item']
        # 监听许愿池获取5xing英雄成就任务
        _conItem = g.GC['item']
        if _prize['a'] == 'item' and _prize['t'] in _conItem \
                and _conItem[_prize['t']]['usetype'] == '12' and \
                int(_conItem[_prize['t']]['star']) == 5:
            g.event.emit("XycGetHero",uid)

        _isJilu = _itemInfo['isjilu']
        _prize['isjilu'] = _isJilu
        # 判断是否需要记录
        if _isJilu:
            _jiluList.append(_prize)
            if afternum == 0:
                g.event.emit('quweichengjiu', uid, '4', 1)

        _prizeList.append(_prize)

    return _prizeList, _jiluList

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    getXuyuanchiData(uid, 'common')