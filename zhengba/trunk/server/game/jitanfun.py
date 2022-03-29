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
    _res = []

    _countType = {'1': '1', '2': '1', '3': '3', '4': '3', '5': '5', '6': '5'}
    # _num = g.getAttrByCtype(uid, 'jitan_type_{}'.format(_countType[_type]), bydate=False, default=_con['startcount']-1)
    _num = g.getAttrByCtype(uid, 'jitan_type_{}'.format(_countType[_type]), bydate=False)

    _lt40num = None
    # 小于40级需要处理
    if g.getGud(uid)['lv'] < 40 and _type in ('3', '4'):
        _lt40num = g.getAttrByCtype(uid, 'jitan_lt40num', bydate=False)

    _heroCon = g.GC['pre_hero']
    _5StarNum, _baodi = 0, 0

    # 总共的抽奖次数
    if g.getGud(uid)['lv'] < 10 and _type in ('3', '4'):
        _allNum = g.getAttrByCtype(uid, 'jitan_allnum', bydate=False)


    _dlCon = g.GC['diaoluo']
    # 战旗计数
    _flagNum = 0
    for i in xrange(_con['number']):
        # 如果信息不存在就说明是第一次抽奖  从掉落组c中抽取奖励
        gid = _con['groupa'] if _num else _con['groupc']

        # 橙色超过N个就不随机橙色了
        if map(lambda x: _heroCon[x['t']]['color'], _res).count(4) >= 100:
            # print 'jitan*****'
            # print _res
            gid = ''
            print "超过橙色次数"
        # 高级抽 第十次 第20次
        if str(_num) in _con['specialgroup']:
            gid = _con['specialgroup'][str(_num)]

        # 总共的抽奖次数
        if g.getGud(uid)['lv'] < 10 and _type in ('3', '4'):
            if _allNum == 1:
                gid = '100013'
            _allNum += 1

        _prize = g.C.RANDARR(_dlCon[gid], sum(i['p'] for i in _dlCon[gid]))
        _hid = _prize['t']
        _star = _heroCon[_hid]['star']
        if _lt40num is not None and _star >= 5:
            _lt40num += 1
            if str(_lt40num) in _con['5stargroup']:
                _prize = g.m.diaoluofun.getGroupPrize(_con['5stargroup'][str(_lt40num)])[0]

        _res.append(_prize)
        # 监听获取英雄成就任务
        if _star >= 4:
            g.event.emit("gethero", uid, _hid)

        # 养成礼包
        if _star == 5:
            g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _star)
            _5StarNum += 1
            _count = 0
            # # 统御
            # g.event.emit("hero_tongu", uid, _hid)

        if _star == 5 and _type in ('3', '4'):
            _flagNum += 1

        # 趣味成就
        if _hid == '64025':
            g.event.emit('quweichengjiu', uid, '16')
        elif _hid == '52055':
            g.event.emit('quweichengjiu', uid, '17')

        if _num >= _con['maxcount']:
            _num = 1
            continue

        # 引导首抽后  高级抽直接加10次
        _num = _con['startcount'] if not _num else _num + 1

    # 开服狂欢
    if _type in ('3', '4'):
        g.event.emit('kfkh', uid, 14, 2, val=_con['number'])
        # 神器任务
        g.event.emit('artifact', uid, 'gaojizhaohuan', val=_con['number'])
        # 战旗任务
        if _flagNum:
            g.event.emit("FlagTask", uid, '202', _flagNum)

        # 总共的抽奖次数
        if g.getGud(uid)['lv'] < 10:
            g.setAttr(uid, {'ctype': 'jitan_allnum'}, {'v': _allNum})
    elif _type in ('1', '2') and _5StarNum > 0:
        # 趣味成就
        g.event.emit('quweichengjiu', uid, '9', _5StarNum)

    # 十连 连续
    if _type == '4':
        _val = 1 if map(lambda x: _heroCon[x['t']]['star'], _res).count(5) >= 2 else -1
        g.event.emit('quweichengjiu', uid, '1', _val)

    if _lt40num is not None:
        g.setAttr(uid, {'ctype': 'jitan_lt40num'}, {'v': _lt40num})

    g.setAttr(uid, {'ctype': 'jitan_type_{}'.format(_countType[_type])}, {'v': _num})

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
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.append(['第几次', '3星次数', '4星次数', '5星次数'])
    _prize = getRandPrize(g.buid('xuzhao'), '4')
    _num = 0
    _con = dict(g.GC['hero'])
    for x in xrange(2):
        _res = {}
        for i in _prize:
            _res[_con[i['t']]['star']] = _res.get(_con[i['t']]['star'], 0) + 1
        _num += 1
        ws.append([_num, _res.get(3, 0), _res.get(4, 0), _res.get(5, 0)])
    wb.save(filename='F:\zhengba.xlsx')
