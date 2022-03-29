#!/usr/bin/python
# coding:utf-8

'''
守望者秘境相关功能
'''
import g

# 获取配置信息
def getWatcherCon(layer):
    return g.GC['watcher'][str(layer)]

# 刷新的数据 层数倒退30
def refreshWatcherData(uid, data, heroList, zhanli=0):
    _con = g.GC['watchercom']['base']
    _layer = data['toplayer'] - _con['backlayer'] if data['toplayer'] > _con['backlayer'] else 1
    _npc = g.GC['watcher'][str(_layer)]['npc']
    _bossFightData = g.m.fightfun.getNpcFightData(_npc)
    _bossFightData['herolist'][0].update({'enlargepro': 1.5})
    # 获取之前的层数所有奖励
    _allPrize = getAllPrize(_layer)
    if 'mixture' in _allPrize:
        heroList = useMixture(heroList, _allPrize['mixture'])

    _setData = {'$unset': {x: 1 for x in ['status','reclist','box','trader','mixture','supply','flop'] if x not in _allPrize}}
    _setData.update({'$set':{
        'herolist':heroList,
        'layer': _layer,
        # 'target': getWatcherTarget(_layer),
        'winnum':0,
        'npc': _bossFightData,
        'ctime': g.C.NOW(),
        'rebirthtime':g.C.ZERO(g.C.NOW() + 2*24*3600),
        "zhanli":zhanli
    }})
    _setData['$set'].update(_allPrize)

    g.mdb.update('watcher',{'uid':uid}, _setData)
    return _setData['$set']

# 获取之前的关卡所有奖励
def getAllPrize(layer):
    _prize = {'box':[],'mixture':{},'trader':[],'supply':{}}
    _mixture = {}
    for i in xrange(1, layer):
        _prizeDict = getWinPrize(_mixture, 1)
        if _prizeDict['key'] == 'box':
            _prize['box'] += _prizeDict['val']
        elif _prizeDict['key'] == 'trader':
            _prize['trader'] = _prize['trader']+_prizeDict['val']
        else :
            _prize[_prizeDict['key']][_prizeDict['val'][0]['id']] = _prize[_prizeDict['key']].get(_prizeDict['val'][0]['id'], 0) + 1
        _mixture = _prize['mixture']

    _res = g.C.dcopy(_prize)
    for i in _prize:
        if not _prize[i]:
            _res.pop(i)

    if 'box' in _res:
        _res['box'] = g.fmtPrizeList(_res['box'])

    _prize = []
    # 所有字段合并成atn格式给前端显示
    for i in _res:
        # 商店的数据不放在一起
        if i == 'trader':
            continue

        if i == 'box':
            _prize.extend(_res['box'])
        else:
            for _id in _res[i]:
                _prize.append({'a':'item','t':i +_id,'n':_res[i][_id]})

    if _prize:
        _res['prize'] = _prize
    return _res

# 获取玩家的目标信息
def getWatcherTarget():
    _con = g.GC['watchercom']['base']
    _targetLayer = _con['target']
    _targetNum = _con['targetnum']
    return range(_targetLayer,(_targetNum+1)*_targetLayer,_targetLayer)

# 获取阵亡英雄个数
def getDeadHeroNum(status):
    _res = 0
    for i in status:
        if 'hp' in i and i['hp'] <= 0:
            _res += 1
    return _res

# 获取一个随机奖励
def getWinPrize(mixture,refresh=0):
    _con = g.GC['watchercom']['base']
    # 如果每个合剂达到上限 合剂不参与随机
    _limitNum, _mixtureList = 0, []
    for i in _con['mixture']:
        if i['limit'] <= mixture.get(i['id'], 0):
            _limitNum += 1
        else:
            _mixtureList.append(i)

    if _limitNum == len(_con['mixture']):
        _arr = [i for i in _con['winprize'] if i['kind'] != 'mixture']
    else:
        _arr = _con['winprize']
    # 如果是扫荡 就不增加翻牌奖励
    if refresh == 1:
        _arr = [i for i in _arr if i['kind'] != 'flop']

    _base = sum(map(lambda x:x['p'], _arr))
    _temp = g.C.RANDARR(_arr, _base)
    _prize = []
    # 宝物商人
    if _temp['kind'] == 'trader':
        _prizeList = []
        _shopItemCon = g.GC['pre_shopitem']
        for _idx, i in enumerate(_con['trader']):
            _itemCon = _shopItemCon[str(i)]
            _prizeItem = g.C.RANDARR(_itemCon['items'], _itemCon['base'])
            _prizeList.append(_prizeItem)
        _base = sum(map(lambda x:x['p'], _prizeList))
        _prize.append(g.C.RANDARR(_prizeList, _base))
    # 补给品
    elif _temp['kind'] == 'supply':
        _arr = [_con['supply'][i] for i in _con['supply']]
        _base = sum(map(lambda x:x['p'], _arr))
        _prize.append(g.C.RANDARR(_arr, _base))
    # 合剂
    elif _temp['kind'] == 'mixture':
        _base = sum(map(lambda x:x['p'], _mixtureList))
        _prize.append(g.C.RANDARR(_mixtureList, _base))
    # 宝箱奖励
    elif _temp['kind'] == 'box':
        _prize = g.m.diaoluofun.getGroupPrizeNum(_con['box'])
    # 翻牌奖励
    elif _temp['kind'] == 'flop':
        _con = g.GC['watchercom']['base']['flop']
        _prize = g.m.diaoluofun.getGroupPrize(_con['dlz'])
        _prize = [{'prize': _prize[i], 'p':_con['p'][i]} for i in xrange(len(_con['p']))]

    _res = {'key': _temp['kind'], 'val': _prize}
    return _res

# 合并shopitem列表
def mergeShopItemList(itemlist, item):
    for i in itemlist:
        if item['item'] == i['item'] and item['need'] == i['need'] and item['sale'] == i['sale']:
            i['buynum'] += 1
            break
    else:
        itemlist += [item]
    return itemlist

# 使用合剂
def useMixture(herolist, midDict):
    _con = g.GC['watchercom']['base']['mixture']
    _mixture = {i['id']:i for i in _con}
    for mid,val in midDict.items():
        buff = _mixture[mid]['buff']
        for k, v in buff.items():
            for i in herolist:
                if k == 'atk':
                    i[0][k] = int((1000 + v*val) / 1000.0 * i[0][k])
                else:
                    i[0][k] = v*val + i[0].get(k, 0)
                i[0]['hp'] = i[0]['maxhp']
    return herolist

# 获得挑战胜利后得物品
def getFightPrize(uid, _data, _prizeDict):
    _setData = {}
    # 如果是宝箱奖励  直接获得
    if _prizeDict['key'] == 'box':
        _sendData = g.getPrizeRes(uid, _prizeDict['val'], {'act':'watcher_fight_box','prize':_prizeDict['val']})
        g.sendUidChangeInfo(uid, _sendData)
    # 如果是合剂 立马使用 增加对应的buff属性
    elif _prizeDict['key'] == 'mixture':
        _buff = _prizeDict['val'][0]['buff']
        _mixtureId = _prizeDict['val'][0]['id']

        _mixtureInfo = _data.get('mixture', {})
        # 继承buffti
        _setData['herolist'] = _data['herolist'] = useMixture(_data['herolist'], {_mixtureId: 1})
        _mixtureInfo[_mixtureId] = _mixtureInfo.get(_mixtureId, 0) + 1
        _setData['mixture'] = _data['mixture'] = _mixtureInfo
    elif _prizeDict['key'] == 'supply':
        _supply = _data.get('supply', {})
        _supply[_prizeDict['val'][0]['id']] = _supply.get(_prizeDict['val'][0]['id'], 0) + 1
        _setData['supply'] = _data['supply'] = _supply

        # 如果是商店 就推送红点
        if _prizeDict['key'] == 'trader':
            g.m.mymq.sendAPI(uid, 'kfkh_redpoint', '1')
    elif _prizeDict['key'] == 'trader':
        _setData['trader'] = _data[_prizeDict['key']] = _data.get('trader', []) + _prizeDict['val']
    # 翻拍奖励
    else:
        # 记录余下得奖励
        g.setAttr(uid,{'ctype':'watcher_flopprize'},{'v': _prizeDict['val']})

    return _setData

# 使用补给品
def useSupply(_data, buff, _toHeroIdx):
    status = _data.get('status',{})
    _curHero = _data['herolist'][_toHeroIdx][0]
    for k, v in buff.items():
        if str(_toHeroIdx) in status:
            # 增加怒气
            if k == 'nuqi':
                status[str(_toHeroIdx)][k] = status[str(_toHeroIdx)].get(k, 50) + v
            # 增加血量
            else:
                _hp = status[str(_toHeroIdx)].get(k, _curHero['maxhp']) + int(_curHero['maxhp'] * v / 100.0)
                # 修正数据 不能超过满血
                if _hp > _curHero['maxhp']: _hp = _curHero['maxhp']
                status[str(_toHeroIdx)][k] = _hp
        # 如果是初始 啥都没有
        else:
            _temp = {}
            _temp['maxhp'] = _curHero['maxhp']
            _temp['nuqi'] = 50 + v if k == 'nuqi' else 50
            _temp['hp'] = _curHero['maxhp']
            status[str(_toHeroIdx)] = _temp

    _data['status'] = status

# 获取备战英雄信息
def getHeroInfo(uid, tidlist):
    _res = {'chk':True, 'herolist':[], 'zhanli': 0}
    for _tid in tidlist:
        # 默认站在后排
        _chkFightData = g.m.fightfun.chkFightData(uid, {'4':_tid}, pet=False)
        if _chkFightData['chkres'] < 1:
            _res['chk'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res
        _res['zhanli'] += _chkFightData['zhanli']
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0)
        _userFightData[0].update({'enlargepro':1.5})
        _res['herolist'].append(_userFightData)

    return _res

if __name__ == '__main__':
    # print getWinPrize({})
    print range(6,36,6)