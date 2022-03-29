#!/usr/bin/python
# coding:utf-8

import g
from random import shuffle
'''
祭坛通用方法
'''


# 获取开启界面
def getOpenInfo(uid):
    _nt = g.C.NOW()
    _ptFreeCd = _nt
    _gjFreeCd = _nt
    _putongNum = getFreeNumByType(uid, '1')
    if not _putongNum: _ptFreeCd = g.C.ZERO(_nt + 3600 * 24)
    _gaojiNum = getFreeNumByType(uid, '3')
    if not _gaojiNum: _gjFreeCd = g.C.ZERO(_nt + 3600 * 24)
    _res = {'putong': {'freenum': _putongNum, 'freecd': _ptFreeCd},
            'gaoji': {'freenum': _gaojiNum, 'freecd': _gjFreeCd}}
    return _res


# 获取可以使用的免费次数
def getFreeNumByType(uid, _type):
    _max = getCanFreeNum(_type)
    _useNum = getUseFreeNum(uid, _type)
    _res = _max - _useNum
    if _res < 0: _res = 0
    return _res


# 获取已经使用的免费次数
def getUseFreeNum(uid, _type):
    _ctype = g.C.STR('jitan_freenum_{1}', _type)
    _useNum = g.getPlayAttrDataNum(uid, _ctype)
    return _useNum


# 添加使用免费次数
def setFreeNum(uid, _type):
    _ctype = g.C.STR('jitan_freenum_{1}', _type)
    return g.setPlayAttrDataNum(uid, _ctype)


# 获取最大免费次数
def getCanFreeNum(_type):
    _con = getJitanCon(_type)
    _freeNum = _con['freenum']
    return _freeNum


# 获取祭坛的配置
def getJitanCon(_type):
    return g.GC['jitan'][_type]


# 增加积分
def addJifen(uid, num):
    _w = {'uid': uid, 'ctype': 'jitan_type_jifen'}
    data = {'$inc': {'v': num}}
    g.mdb.update('playattr', _w, data, upsert=True)


# 获取积分
def getJitanJifen(uid):
    _w = {'uid': uid, 'ctype': 'jitan_type_jifen'}
    _info = g.mdb.find1('playattr', _w)
    if not _info:
        return 0
    return _info['v']


# 开始随机一个英雄
def getRandPrize(uid, _type):
    _con = getJitanCon(_type)
    # 一连抽  或者十连抽
    _choukaNum = _con['number']
    _res = []
    gid = _con['groupa']
    # 判断第几次抽卡 ， 默认第一次
    _num = 0
    _jitanType = _type
    if int(_type) % 2 == 0: _jitanType = int(_type) - 1
    _w = {'uid': uid, 'ctype': 'jitan_type_{}'.format(_jitanType)}
    _info = g.mdb.find1('playattr', _w)
    # 如果信息不存在就说明是第一次抽奖
    if not _info:
        # 从掉落组c中抽取奖励
        gid = _con['groupc'] if _con['groupc'] else _con['groupa']
    else:
        _num = _info['v']

    _heroCon = g.GC['pre_hero']
    _5StarNum, _baodi = 0, 0

    # 增加保底计数 超过100必抽五星 分数重记
    _count = g.getAttrByCtype(uid, 'jitan_guarantee',bydate=False)
    for i in xrange(_choukaNum):
        # 如果是特殊的抽奖次数
        if _num in _con['diaoluo']:
            _count = 0
            gid = _con['groupb']
        elif _count >= 228 and _type in ('3', '4'):
            _count = 0
            gid = _con['groupb']
            _baodi = 1
        # 如果全是三星 就加一个四星
        elif _type == '4' and map(lambda x: _heroCon[x['t']]['star'], _res).count(3) == 9:
            gid = '100013'
        elif _num > 1:
            gid = _con['groupa']
        _prizeList = g.GC['diaoluo'][gid]
        _base = sum([i['p'] for i in _prizeList])
        # 超过3个五星英雄就不再随机五星的
        if _5StarNum >= 3 and _num not in _con['diaoluo']:
            _base = sum([i['p'] for i in _prizeList if _heroCon[i['t']]['star'] < 5])
            _prizeList = [i for i in _prizeList if _heroCon[i['t']]['star'] < 5]
        if _baodi == 1:
            _5StarNum = 3

        _prize = g.C.RANDARR(_prizeList, _base)
        _res += [_prize]
        _num += 1

        _hid = _prize['t']
        _star = _heroCon[_hid]['star']
        # 监听获取英雄成就任务
        if _star >= 4:
            g.event.emit("gethero", uid, _hid)

        # 养成礼包
        if _star == 5:
            g.event.emit('yangcheng', uid, _star)
            _5StarNum += 1
            _count = 0
            # 统御
            g.event.emit("hero_tongu", uid, _hid)
        else:
            # 没抽中五星就加三分
            _count = _count + 12 if _type == '4' else _count + 9
            
    # 开服狂欢
    if _type in ('3', '4'):
        g.event.emit('kfkh',uid,14,2,val=_choukaNum)
        # 神器任务
        g.event.emit('artifact', uid, 'gaojizhaohuan', val=_choukaNum)
    if _type in ('3', '4'):
        # 设置数据库信息  只设置先祖保底
        g.setAttr(uid, {'ctype':'jitan_guarantee'},{'v':_count})
    setJitanInfo(uid, _type, {'v': _num})
    addJifen(uid, _con['jifen'])

    shuffle(_res)
    return _res


# 设置数据库信息
def setJitanInfo(uid, _type, data):
    _jitanType = _type
    if int(_type) % 2 == 0: _jitanType = int(_type) - 1
    _w = {'uid': uid, 'ctype': 'jitan_type_{}'.format(_jitanType)}
    g.mdb.update('playattr', _w, data, upsert=True)


# 获取积分兑换英雄
def getJifenPrize(uid):
    _con = getJitanCon('7')
    _dlzId = _con['groupa']
    _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
    return _prize


if __name__ == '__main__':
    uid = g.buid('rs25')
    from openpyxl import load_workbook, Workbook
    path = 'D:\zhengba25.xlsx'
    keys = ['ip']

    wb = Workbook()
    ws = wb.active
    _first = ['十连抽',3,4,5]
    _a = {3:0,4:0,5:0}
    ws.append(_first)
    c = 0
    _con = g.GC['hero']
    for i in xrange(100000):
        d = {3:0,4:0,5:0,}
        c += 1
        a = getRandPrize(uid, '3')
        hid = map(lambda x:x['t'], a)
        hid = ','.join(hid)
        for x in a:
            d[_con[x['t']]['star']] += 1
        ws.append([c,d[3],d[4],d[5],hid])
        print c

    wb.save(filename=path)