#!/usr/bin/python
#coding:utf-8

'''
法师塔相关公共方法
'''
import g

# 获取玩家通关信息
def getFashitaInfo(uid):
    _w = {'uid': uid}
    return g.mdb.find1('fashita', _w,fields=['_id'])

# 获取法师塔的配置
def getFashitaCon(fid):
    return g.GC['fashita'][str(fid)]


# 添加录像信息
def addRecording(uid, layernum, fightdata, zhanli):
    _list = g.mdb.find('fashitalog',{'layernum':layernum,'zhanli':{'$lt':zhanli}},fields={'_id':1})
    if  len(_list) < 3:
        _recording = []

        _data = {'fightdata':fightdata,'zhanli':zhanli,'layernum':layernum}
        _data.update({'uid':uid,'ctime':g.C.NOW()})
        g.mdb.insert('fashitalog',_data)

        # _tidList = map(lambda x:x['_id'], _list)
        # # 删除其余的录像
        # g.mdb.delete('fashitalog', {'_id':{'$nin': _tidList},'layernum':layernum})


# 更新法师塔信息
def updateFashitaInfo(uid, data):
    _w = {'uid': uid}
    g.mdb.update('fashita', _w, data)

# 获取最大结晶数量
def getMaxJieJingNum(uid):
    _maxNum = g.GC['fashitacom']['maxnum']
    return _maxNum


# 获取结晶数量
# getcd是否获取freetime时间，freetime为0时为无cd状态
# isset是否写入数据
def getJieJingNum(uid, getcd=0, isset=0):
    _key = 'fashita_crystal'
    _where = {'ctype': _key}
    _con = g.GC['fashitacom']
    _maxNum = getMaxJieJingNum(uid)
    _cdSize = _con['cd']
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
                _num = _num+ _addNum if _num+_addNum<_maxNum else _maxNum
                _freeTime += _addNum * _cdSize

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
    _data = getJieJingNum(uid, 1, 1)
    _num = _data['num']
    _cd = _data['freetime']
    _cdSize = g.GC['fashitacom']['cd']
    _maxLDNum = getMaxJieJingNum(uid)
    _resNum = _num + addnum
    if ischk and (_resNum < 0 or (_resNum >= _maxLDNum and addnum <= 0)):
        # 不可为负数
        return

    _res = {'num': _resNum, 'freetime': _cd}
    if _resNum == _maxLDNum:  _res['freetime'] = 0
    _setData = {}
    _setData['v'] = _resNum
    if _cd == 0 and _resNum < _maxLDNum:
        _nt = g.C.NOW()
        _setData['freetime'] = _nt
        _res['freetime'] = _nt + _cdSize

    _key = 'fashita_crystal'
    g.setAttr(uid, {'ctype': _key}, _setData)
    return _res


if __name__ == '__main__':
    uid = g.buid("26")
    print g.mdb.update('hero',{'uid':'0_5b951530e138232ebe30a18f'},{'atk':200000,'def':20000})