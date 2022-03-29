#!/usr/bin/python
#coding:utf-8

import g

'''
商店功能
'''

#获取对应等级的炸货铺配置
def getShopCon(lv):
    _res = {}
    for d in g.GC['pre_zahuopu']:
        if lv < d['lv'][0] or lv > d['lv'][1]:
            continue
        
        _res.update(d['shops'])
        
    return _res

#获取当日刷新物品的记录
def getBlackData(uid):
    _ctype = 'zahuopu_blackdata'
    _res = {'blacksid':[],'sid2num':{}}
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if len(_data) > 0:
        _res = _data[0]['v']
        
    return _res

#获取杂货铺信息
#是否刷新：isref，默认否
def getZaHuoPuData(uid,isref=0):
    _data = g.mdb.find1('zahuopu',{'uid':uid})
    if _data == None or isref:
        _nt = g.C.NOW()
        _shopItem = createShop(uid)
        _data = {}
        _data['uid'] = uid
        _data['ctime'] = _nt
        _data['lastrftime'] = _nt
        _data['shopitem'] = _shopItem
        setZaHuoPuData(uid,_data)
        
    return _data


#设置杂货铺信息
def setZaHuoPuData(uid,data):
    g.mdb.update('zahuopu',{'uid':uid},data,upsert = True)

#设置当日刷新物品的记录
def setBlackData(uid,data):
    _ctype = 'zahuopu_blackdata'
    _w = {'ctype':_ctype}
    g.setAttr(uid,_w,data)

#生成商店信息
def createShop(uid):
    gud = g.getGud(uid)
    _con = getShopCon(gud['lv'])
    #过滤信息
    _blackData = getBlackData(uid)
    for sid in _blackData['blacksid']:
        if sid in _con:
            del _con[sid]

    _shopNum = 6
    _shopItem = []

    # 第一次打开杂货铺必定掉落先祖印记
    _temp = g.getAttrOne(uid,{'ctype':'zahuopu_firstopen'})
    if not _temp:
        # 先祖印记的配置
        _item = g.GC['zahuopu']['0_40']['1018']
        _shopItem.append(_item)
        _shopNum -= 1
        g.setAttr(uid, {'ctype': 'zahuopu_firstopen'},{'v': 0})
            
    #商店物品数量 TODO 可使用配置
    for i in xrange(_shopNum):
        if len(_con) == 0:
            #容错
            break
        _randData =  [v for k,v in _con.items()]
        _baseP = sum(map(lambda x: x['p'], _randData))
        _randRes = g.C.RANDARR(_randData,_baseP)
        if _randRes['rnum'] == -1:
            # 不计循环次数
            _shopItem.append(_randRes)
            continue

        _sid = str(_randRes['sid'])
        #记录被刷出的次数
        if _sid not in _blackData['sid2num']: _blackData['sid2num'][_sid] = 0
        _blackData['sid2num'][_sid] += 1
        #判断刷新次数是否到最大
        if  _blackData['sid2num'][_sid] >= _randRes['rnum']:
            _blackData['blacksid'].append(_sid)
            #删除循环的信息
            if _sid in _con: del _con[_sid]
            
        _shopItem.append(_randRes)
        
    #设置今日的刷新信息
    setBlackData(uid,{'v':_blackData})
    return _shopItem

# 设置免费刷新时间
def setFreeTime(uid, freetime):
    _w = {'uid':uid}
    data = {'freetime': freetime}
    g.mdb.update('zahuopu', _w, data)
    return freetime

# 获取免费刷新次数
# getcd是否获取freetime时间，freetime为0时为无cd状态
# isset是否写入数据
def getRfNum(uid, getcd=0, isset=0):
    _key = 'zahuopu_rfnum'
    _where = {'ctype': _key}
    _maxNum = 5
    _cdSize = 2*3600
    _data = g.getAttrOne(uid, _where)
    if not _data:
        # 初始数据
        _num = _maxNum
        _freeTime = 0
    else:
        # 当前数据，且计算cd增加数量
        _num = _data['v']
        _freeTime = _data['freetime']
        _nt = g.C.NOW()
        if _freeTime == 0:  _freeTime = _nt
        if _num < _maxNum:
            _defTime = _nt - _freeTime
            if _defTime >= _cdSize:
                _tmp = divmod(_defTime, _cdSize)
                _addNum = _tmp[0]
                for i in xrange(_addNum):
                    _num += 1
                    _freeTime += _cdSize
                    if _num >= _maxNum:
                        break
                # _num = _num+ _addNum if _num+_addNum<_maxNum else _maxNum

    # 修正数据
    if _num >= _maxNum:
        # _num = _maxNum
        _freeTime = 0

    # 写入数据
    if isset:
        g.setAttr(uid, _where, {'v': _num, 'freetime': _freeTime})

    _res = _num
    if getcd:
        # 需要cd的返回格式
        _res = {'freetime': _freeTime, 'num': _num}

    return _res


# 设置可挑战掠夺次数
def setJieJingNum(uid, addnum,ischk=1):
    _data = getRfNum(uid, 1, 1)
    _num = _data['num']
    _cd = _data['freetime']
    _maxLDNum = 5
    _resNum = _num + addnum

    _res = {'num': _resNum, 'freetime': _cd}
    if _resNum == _maxLDNum:  _res['freetime'] = 0
    _setData = {}
    _setData['v'] = _resNum
    _setData['freetime'] = _cd
    _nt = g.C.NOW()
    if _cd == 0 and _resNum < _maxLDNum:
        _setData['freetime'] = _nt
        _res['freetime'] = _nt
    # elif _resNum == 0:
    #     _setData['cd'] = _nt
    #     if _nt > _cd + 3*3600:
    #         _res['cd'] = _nt
    #     else:
    #         _setData['cd'] = _cd
    #         _res['cd'] = _cd

    _key = 'zahuopu_rfnum'
    g.setAttr(uid, {'ctype': _key}, _setData)
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print setJieJingNum(uid,-1)