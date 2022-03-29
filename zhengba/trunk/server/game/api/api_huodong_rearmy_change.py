#!/usr/bin/python
#coding:utf-8
'''
魔镜置换 - 更换小兵
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g



def proc(conn,data):
    """

    :param conn:
    :param data: [英雄tid:str, [作为材料的英雄tid:str]]
    :return:
    ::

        {"d": {"prize": []}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def doproc(conn,data):
    _res = {"s":1}
    if not hasattr(conn,"uid"):
        _res["s"]=-102
        _res["errmsg"]=g.L('global_unlogin')
        return _res

    uid = conn.uid
    # if g.getGud(uid)['ctime'] >= g.GC['flag']['base']['timestamp'] and g.C.getDateDiff(g.getGud(uid)['ctime'], g.C.NOW()) < 7:
    #     _res["s"] = -10
    #     _res["errmsg"] = g.L('global_noopen')
    #     return _res

    _tid = str(data[0])
    _changeTids = data[1]
    _changeTids = list(set(_changeTids))
    # 获取已开启的活动列表
    # _hdList = g.m.huodongfun.getOpenList(uid,1)
    # # 活动未开放无法获取列表
    # if hdid not in _hdList:
    #     _res["s"]=-1
    #     _res["errmsg"]=g.L('global_nohuodong')
    #     return _res

    #判断是否上阵
    defhero = set()
    _rivalInfo = g.mdb.find1('zypkjjc', {'uid': uid})
    if _rivalInfo:
        _def = _rivalInfo.get('defhero', {})
        _def.pop('pet', None)
        defhero = set(_def[t] for t in _def)

    if _tid in defhero or (set(_changeTids) & defhero):
        #上阵或助阵佣兵不可参与转换
        _res["s"]=-4
        _res["errmsg"]=g.L('huodong_rearmy_change_-4')
        return _res

    #主佣兵
    _baseArmy = g.m.herofun.getMyHeroList(uid, '_id', {'_id': g.mdb.toObjectId(_tid), 'star': {'$gte': 7}})
    _baseArmy[0]["_id"] = g.mdb.toObjectId(_tid)
    if not _baseArmy:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_armyerr')
        return _res

    _baseArmy = _baseArmy[0]
    if 'islock' in _baseArmy and _baseArmy['islock'] == 1:
        _res["s"]=-4
        _res["errmsg"]=g.L('huodong_rearmy_change_-4')
        return _res

    _hdInfo = g.GC['mjzh']
    if _baseArmy['star'] not in _hdInfo['data']['canswap']:
        # 暂不开放10星以上置换
        _res['s'] = -6
        _res['errmsg'] = g.L('huodong_rearmy_change_-6')
        return _res

    # 获取活动数据
    # _hdInfo = g.m.huodongfun.getHuodongInfoById(hdid)
    _hdData = _hdInfo['data']
    _needInfo = {tmp['val']: tmp['needrate'] for tmp in _hdData['arr']}
    _rate = _needInfo[_baseArmy['star']]
    if len(_changeTids) != _rate:
        #需要放入5个相同祭品才可转换噢
        _res["s"]=-3
        _res["errmsg"]=g.L('huodong_rearmy_change_-3')
        return _res

    _objTid = [g.mdb.toObjectId(t) for t in _changeTids]
    _armyList = g.m.herofun.getMyHeroList(uid, 'dengjie,lv,star,dengjielv,weardata,hid,skin,jiban,wuhun,baoshijinglian', {"_id": {"$in": _objTid}, "zhongzu": _baseArmy['zhongzu'], 'star': 5})
    if len(_armyList) != _rate:
        #5个相同佣兵，未升级且未进化才能参与转换
        _res["s"]=-5
        _res["errmsg"]=g.L('huodong_rearmy_change_-5')
        return _res

    _cHid = set(t['hid'] for t in _armyList)
    if len(_cHid) >= 2:
        _res["s"]=-5
        _res["errmsg"]=g.L('huodong_rearmy_change_-5')
        return _res

    _cHid = list(_cHid)
    _needRMB = {tmp['val']: tmp['need'] for tmp in _hdData['arr']}
    _need = _needRMB[_baseArmy['star']]

    #转换的数据
    _changeData = {}
    _changeData['dengjielv'] = _baseArmy['dengjielv']
    _changeData['dengjie'] = _baseArmy['dengjie']
    _changeData['lv'] = _baseArmy['lv']
    _changeData['star'] = _baseArmy['star']
    _changeData['extbuff'] = {'glyph': _baseArmy.get('extbuff', {}).get('glyph',[])}
    _changeData['glyph'] = _baseArmy.get('glyph', {})
    if 'weardata' in _baseArmy:
        _changeData['weardata'] = _baseArmy['weardata']

    #扣除永恒置换精华
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chkRes['t']
        else:
            _res["s"] = -104
            _res[_chkRes['a']] = _chkRes['t']
        return _res

    _delInfo = g.delNeed(uid, _need, 0, {'act': 'huodong_rearmy_delitemneed', 'changedata': _changeData, 'getarmy': _cHid[0], 'delarmy': _baseArmy['hid']})
    #删除吞噬佣兵
    _objTid.append(g.mdb.toObjectId(_tid))
    #检测删除英雄是否有皮肤
    _chkHeroList = g.C.dcopy(_armyList)
    _chkHeroList.append(_baseArmy)
    g.event.emit("chkdelhero_skin",uid,_chkHeroList)
    g.mdb.delete('hero', {'uid': uid, '_id':{'$in': _objTid}})

    _msPrize = g.getAttrByCtype(uid, 'meltsoul_cost', bydate=False, default=[], k=_tid)
    g.mdb.delete('playattr', {'uid': uid, 'ctype': 'meltsoul_cost', 'k': _tid})
    # 返还奖励
    _prize = g.m.herofun.getFenjiePrize(uid, _armyList, isfenjie=False, isyulan=False)
    _resPrize = []
    for i in _prize:
        _resPrize += _prize[i]
    _resPrize += _msPrize

    # 加上主英雄得wuhun奖励
    _resPrize += g.m.herofun.getFenjiePrize(uid, [_baseArmy], isfenjie=False)['wuhun']

    # 通过穿戴信息修改数据库
    _Send = {'shipin':{},'equip':{}}
    for sp in _prize['shipin']:
        _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
        _Send['shipin'].update(_data)

    for equip in _prize['equip']:
        _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
        _Send['equip'].update(_data)

    #增加佣兵
    _delArmy = [str(t) for t in _objTid]
    _changeInfo = g.getPrizeRes(uid, _prize['prize'] + _msPrize, {'act': 'huodong_rearmy_reback', 'changedata': _changeData, 'getarmy': _cHid[0], 'delarmy': _baseArmy['hid']})
    for k, v in _delInfo.items():
        if k not in _changeInfo:
            _changeInfo[k] = v
        else:
            _changeInfo[k].update(v)

    _changeInfo['shipin'].update(_Send['shipin'])
    _changeInfo['equip'].update(_Send['equip'])
    _baseCon = g.m.herofun.getHeroCon(_cHid[0])
    _newHid = _baseCon['pinglunid'] + '6'

    # 被动技能,等各种buff
    _star_conf = g.GC['herostarup'][_newHid]
    _upstar_conf = _star_conf[str(_changeData['star'])]
    _bdSkill = {'bd{}skill'.format(i):_upstar_conf['bd{}skill'.format(i)] for i in xrange(1,4)}
    _changeData.update(_bdSkill)
    # 十一星的buff
    _changeData['staratkpro'] = 1000 + _star_conf[str(_changeData['star'])]['staratkpro']
    _changeData['starhppro'] = 1000 + _star_conf[str(_changeData['star'])]['starhppro']

    _newHero = g.m.herofun.addHero(uid, _newHid, data=_changeData)
    _newTid = _newHero['tid']
    # 雕纹信息
    if _baseArmy.get('glyph'):
        g.mdb.update('glyph',{'uid':uid,'_id':{'$in':map(g.mdb.toObjectId, map(lambda x:_baseArmy['glyph'][x]['gid'], _baseArmy['glyph']))}}, {'isuse': _newTid})

    # 历史最高战力改变,防止分解其中一个给另一个升星  导致最高战力继续上涨
    _data = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
    if _data and _tid in _data['tid2zhanli']:
        g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')

    _heroData = g.m.herofun.reSetHeroBuff(uid, _newTid)
    # _newHero['maxzhanli'] = _heroData[_newTid]['zhanli']
    _newHero['herodata'].update(_heroData[_newTid])
    # g.m.userfun.setMaxZhanli(uid,_newHero['maxzhanli'])
    _armyChange = {a: {'num': 0} for a in _delArmy}
    _newHero['herodata']['tid'] = _newTid
    _armyChange[_newTid] = _newHero['herodata']
    if 'hero' in _changeInfo:
        _changeInfo['hero'].update(_armyChange)
    else:
        _changeInfo['hero'] = _armyChange
    # 统御
    g.event.emit("hero_tongu", uid, _newHid, _changeData['star'])
    g.sendChangeInfo(conn, _changeInfo)
    if _baseArmy['star'] >= 10:
        _newHid += '_1'
    g.event.emit("adduserhead", uid, [_newHid])
    # _resPrize += [{'a': 'hero', 't': _newHid, 'n': 1}]
    _res['d'] = {'prize': _resPrize}
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, _objTid, conn, herodata=_chkHeroList)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    a = [u'5ebcfc0e2fd57c06615ef243', [u'5ebcfb7c2fd57c06615ef1bc', u'5ebcfb7c2fd57c06615ef1bb']]
    print doproc(g.debugConn, a)