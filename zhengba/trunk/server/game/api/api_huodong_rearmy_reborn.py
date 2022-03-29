#!/usr/bin/python
#coding:utf-8
'''
魔镜置换 - 重生
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g



def proc(conn,data):
    """

    :param conn:
    :param data: [英雄tid:str, 是否预览模式:bool]
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
    # 英雄的id
    _tid = str(data[0])
    # 是否预览模式
    _isyulan = int(data[1])

    # 主佣兵
    _baseArmy = g.m.herofun.getHeroInfo(uid, _tid, keys='weardata,glyph,star,extbuff,skin,jiban,wuhun,lv,dengjie,hid,zhongzu,baoshijinglian')
    if not _baseArmy:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_armyerr')
        return _res

    if 'islock' in _baseArmy and _baseArmy['islock'] == 1:
        _res["s"]=-4
        _res["errmsg"]=g.L('huodong_rearmy_change_-4')
        return _res

    _hdData = g.GC['mjzh']['data']
    if _baseArmy['star'] not in _hdData['canreborn']:
        # 暂不开放12星以上重生
        _res['s'] = -6
        _res['errmsg'] = g.L('huodong_rearmy_reborn_-6')
        return _res

    # 获取活动数据
    # _hdInfo = g.m.huodongfun.getHuodongInfoById(hdid)
    _needRMB = {tmp['val']: tmp['rebornneed'] for tmp in _hdData['arr']}
    star2con = [tmp for tmp in _hdData['arr'] if tmp['val'] == _baseArmy['star']][0]
    _need = _needRMB[_baseArmy['star']]

    # 如果不是预览
    if not _isyulan:
        _chkRes = g.chkDelNeed(uid, _need)
        if not _chkRes['res']:
            if _chkRes['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chkRes['t']
            else:
                _res["s"] = -104
                _res[_chkRes['a']] = _chkRes['t']
            return _res

        _baseArmy.update({'act': 'huodong_rearmy_reborn'})
        _delInfo = g.delNeed(uid, _need, 0, _baseArmy)

    _prize = g.m.herofun.getFenjiePrize(uid, [_baseArmy], isfenjie=False, isyulan=_isyulan)
    # 如果穿戴的有雕纹
    if 'glyph' in _baseArmy:
        _idList = map(lambda x: _baseArmy['glyph'][x]['gid'], _baseArmy['glyph'])

    _heroCon = g.GC['hero']
    # 加上配置的特殊奖励
    # 本体奖励
    _prize['prize'].append({'a':'hero','t':[i for i,j in _heroCon.items() if j['pinglunid']==_heroCon[_baseArmy['hid']]['pinglunid'] and (j['star']==(5 if _baseArmy['star']>5 else _baseArmy['star']))][0], 'n':star2con['self']})
    # 傀儡羊奖励
    for star, num in star2con['klynum'].items():
        _prize['prize'].append({'a':'item','t':_hdData['klyinfo'][star][str(_baseArmy['zhongzu'])], 'n':num})

    _prize['prize'] += _hdData['rebornprize'][str(_baseArmy['star'])]
    # 加上主英雄得wuhun奖励
    _prize['wuhun'] = g.m.herofun.getFenjiePrize(uid, [_baseArmy], isfenjie=False, isyulan=_isyulan)['wuhun']
    if not _isyulan:
        for sp in _prize['shipin']:
            _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
            g.mergeDict(_delInfo, {'shipin': _data})

        for equip in _prize['equip']:
            _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
            g.mergeDict(_delInfo, {'equip': _data})

        _sendData = g.getPrizeRes(uid, _prize['prize'], act='rearmy_reborn')
        g.mergeDict(_delInfo, _sendData)

        #检测删除英雄是否有皮肤
        g.event.emit("chkdelhero_skin",uid,[_baseArmy])
        # 删除英雄
        g.mdb.delete('hero', {'uid': uid, '_id': _baseArmy['_id']})
        _cacheKey = 'USER_TOPZHANLIHERO'
        _data = g.m.sess.remove(uid, _cacheKey)


        g.mergeDict(_delInfo, {'hero': {_tid: {'num': 0}}})
        # 检查是否有羁绊buff
        g.m.jibanfun.chkJiBanHero(uid, [str(_baseArmy['_id'])], conn, herodata=[_baseArmy])

        # 如果穿戴的有雕纹
        if 'glyph' in _baseArmy:
            g.mdb.update('glyph', {'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _idList)}},{'$unset': {'isuse': 1}})
            _delInfo['glyph'] = {i: {'isuse': ''} for i in _idList}

        g.sendChangeInfo(conn, _delInfo)

    # 如果穿戴的有雕纹
    if 'glyph' in _baseArmy:
        _prize['prize'] += [{"a": 'glyph', 't': i['gid'], 'n': 1} for i in g.mdb.find('glyph', {'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _idList)}},fields=['_id', 'gid'])]


    _resPrize = []
    for i in _prize:
        _resPrize += _prize[i]
    _res['d'] = {'prize': g.fmtPrizeList(_resPrize)}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, ["5f0274a29dc6d67aec2764f6",1])