#!/usr/bin/python
# coding:utf-8
'''
英雄--合成
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: data=["25076"合成对象的id,{u'main': u'5d2dab4f0ae9fe3a60067a90'当做主英雄的英雄tid, u'delhero'当做合成材料的英雄tid: ['5d2dab4f0ae9fe3a60067a8f',
                                                                                                                               '5d2dab4f0ae9fe3a60067a8d',
                                                                                                                               '5d2dab4f0ae9fe3a60067a8e',
                                                                                                                               '5d2dab4f0ae9fe3a60067a8c',
                                                                                                                               '5d2dab4f0ae9fe3a60067a91']}]
    :return:
    ::

        {'s': 1, 'd': {'heroprize'合成之后的英雄: {'a': 'hero', 't': '25076', 'n': 1}, 'defhero'自由竞技场防守英雄: {u'1': u'5d2da49d0ae9fe3a60067a83'}, 'itemprize'合成返还的培养材料: []}}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 合成的hero
    #["33026",{"main":"5c0b7ef0e1382319b816abac","delhero":["5c1e6970e138234c31b78aaa","5c1e6970e138234c31b78a92","5c1e696fe138234c31b78a04","5c1e696fe138234c31b78a34","5c1e696fe138234c31b78a2c"]}]
    hid = data[0] #合成的目标
    
    # 作为主材料的hero
    _tidDict = data[1]
    if len(set(_tidDict['delhero']+[_tidDict['main']])) != len(_tidDict['delhero']+[_tidDict['main']]):
        _res['s'] = -4
        _res['errmsg'] = g.L('hero_hecheng_res_-4')
        return _res

    _mainHero = g.m.herofun.getHeroInfo(uid, _tidDict['main'])
    _delHero = g.m.herofun.getMyHeroList(uid, where={'_id':{'$in': map(g.mdb.toObjectId, _tidDict['delhero'])}},keys='hid,zhongzu,star,islock,lv,deng,dengjie,weardata,skin,jiban,wuhun,baoshijinglian')
    # 有一个英雄不存在就返回
    if len(_delHero) != len(_tidDict['delhero']) or not _mainHero:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_heroerr')
            return _res

    _heroCon = g.m.herofun.getHeroCon(hid)
    
    #校验主英雄是否匹配
    _hechengConf = g.GC['herohecheng'][hid]
    if _mainHero['hid'] != _hechengConf['mainhero']['t']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_heroerr')
        return _res        
    
    # 校验可选辅助英雄是否匹配
    _chk = g.m.herofun.ChkHero(_hechengConf, _heroCon, _delHero)
    if not _chk['res']:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_hecheng_res_-3')
        return _res

    _heroList = _delHero + [_mainHero]
    # 判断英雄是否锁定
    _heroLocks = map(lambda x:x['islock'], _delHero)
    if 1 in _heroLocks:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_hecheng_res_-3')
        return _res

    #检测删除英雄是否有皮肤
    g.event.emit("chkdelhero_skin",uid,_heroList)
    # 删除主材料以及三个辅助材料
    _delHeroList =  map(lambda x:str(x['_id']), _heroList)
    g.mdb.delete('hero', {'uid':uid, '_id':{'$in': map(g.mdb.toObjectId, _delHeroList)}})

    # 返回分解英雄的奖励信息
    _prize = g.m.herofun.getFenjiePrize(uid, _delHero,isfenjie=False)

    # 通过穿戴信息修改数据库
    _logData = {'act':'hero_hecheng','prize':_prize,'deleteid':map(lambda x:str(x['_id']), _heroList),'get':hid,'delete':map(lambda x:x['hid'], _heroList)}
    _sendData = g.getPrizeRes(uid, _prize['prize'], act=_logData)
    for sp in _prize['shipin']:
        _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
        _sendData['shipin'].update(_data)

    for equip in _prize['equip']:
        _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
        _sendData['equip'].update(_data)

    _delHeroList = {i:{'num': 0} for i in _delHeroList}

    _wearData = _mainHero.get('weardata',{})

    _msInfo = _mainHero.get('extbuff', {}).get('meltsoul', [])
    data = {
        'lv':_mainHero['lv'],
        'dengjielv':_mainHero['dengjielv'],
        'dengjie':_mainHero['dengjie'],
        'weardata': _wearData,
        'extbuff': {'meltsoul': g.m.herofun.getMSbuff(hid, _msInfo, _mainHero.get('meltsoul',1))},
        'meltsoul': _mainHero.get('meltsoul',1),
        'islock':_mainHero['islock'],
        'jiban':_mainHero.get("jiban", "")
    }
    _newHero = g.m.herofun.addHero(uid, hid, data=data)

    # 判断是否有羁绊
    if _mainHero.get("jiban", ""):
        data = g.m.jibanfun.getJiBanData(uid, _mainHero["jiban"])
        _uphero = data["uphero"]
        gud = g.getGud(uid)
        _uphero[_newHero["tid"]] = {"pos": _uphero[_tidDict['main']]["pos"], "isext": 0, "star": _newHero["herodata"]["star"], "name": gud["name"], "hid": _newHero["herodata"]["hid"], "tid": _newHero["tid"]}
        del _uphero[_tidDict['main']]
        # 设置羁绊
        g.m.jibanfun.setJiBanData(uid, _mainHero["jiban"], {"uphero": _uphero})
        # 检查羁绊
        g.event.emit("chkjiban", uid, _newHero["tid"], _newHero["herodata"]["star"], _newHero["herodata"]["hid"])

     # 如果英雄在派遣列表就更新里面的数据
    _dispatchData, name = g.m.jibanfun.getDispatchHero(uid)
    if _tidDict['main'] in _dispatchData:
        # 获取旧英雄的数据
        _oldData = _dispatchData[_tidDict['main']]
        # 删除就英雄数据
        del _dispatchData[_tidDict['main']]
        # 更新英雄数据
        _oldData.update({"hid": hid, "tid": _newHero["tid"], "star": _newHero["herodata"]["star"]})
        _dispatchData[_newHero["tid"]] = _oldData
        g.m.jibanfun.setDispatchHero(uid, _dispatchData)


    g.m.userfun.setMaxZhanli(uid,_newHero['maxzhanli'])
    # 设置新英雄的信息
    # 历史最高战力改变,防止分解其中一个给另一个升星  导致最高战力继续上涨
    _zlData = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
    if _zlData:
        for tid in _delHeroList:
            if tid in _zlData['tid2zhanli']:
                g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')
                break

    _heroBuff = g.m.herofun.reSetHeroBuff(uid, _newHero['tid'])
    _heroBuff[_newHero['tid']].update(_wearData)
    _heroBuff[_newHero['tid']].update(_newHero['herodata'])
    _sendData['hero'].update(_delHeroList)
    _sendData['hero'].update(_heroBuff)
    g.sendChangeInfo(conn, _sendData)

    # 如果主英雄在竞技场就要替换
    _defHero = g.m.zypkjjcfun.getDefendHero(uid)
    for pos,_id in _defHero.items():
        if _id == _tidDict['main']:
            g.mdb.update('zypkjjc',{'uid':uid},{'defhero.{}'.format(pos):_newHero['tid']})
            _defHero[pos] = _newHero['tid']
            break

    # 继承主英雄的融魂消耗
    g.mdb.update('playattr', {'uid': uid, 'ctype': 'meltsoul_cost', 'k': _tidDict['main']}, {'k': _newHero['tid']})
    # 跑马灯
    _heroStar = g.GC['pre_hero'][hid]['star']
    if _heroStar >= 6:
        gud = g.getGud(uid)
        _heroCon = g.GC['hero'][hid]
        g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _heroStar, _heroCon['name']])

    # 养成礼包
    if _heroStar in (5, 6):
        g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _heroStar)
        # 开服狂欢活动
        # 合成N星英雄
        g.event.emit('kfkh',uid,23,7,cond=_heroStar)
        # 开服狂欢获得N星英雄
        g.event.emit('kfkh', uid, 20, 5, cond=_heroStar)
        # 统御
        g.event.emit("hero_tongu", uid, hid)

    # 增加名将绘卷列表
    g.event.emit("addmjhj", uid, hid, 1)

    #监听获取英雄成就任务
    g.event.emit("gethero",uid,hid)

    g.event.emit('GJherofenjie', uid)
    # 神器任务
    g.event.emit('artifact', uid, 'ronghe',cond=_heroStar)
    g.event.emit('trial', uid, '1', cond=_heroStar)

    g.event.emit('herotheme_star', uid, hid, val=_heroStar)
    #检测头像信息
    g.event.emit("adduserhead",uid,[str(hid)])
    _resPrize = []
    for i in _prize:
        _resPrize += _prize[i]

    _res['d'] = {'heroprize': {'a':'hero','t':hid,'n':1}, 'itemprize': _resPrize, 'defhero':_defHero}
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, _delHeroList, conn, herodata=_delHero)

    return _res


if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    a = {u'main': u'5d2dab4f0ae9fe3a60067a90', u'delhero': ['5d2dab4f0ae9fe3a60067a8f',
                                                            '5d2dab4f0ae9fe3a60067a8d',
                                                            '5d2dab4f0ae9fe3a60067a8e',
                                                            '5d2dab4f0ae9fe3a60067a8c',
                                                            '5d2dab4f0ae9fe3a60067a91' ]}
    data=["25076",{u'main': u'5d2dab4f0ae9fe3a60067a90', u'delhero': ['5d2dab4f0ae9fe3a60067a8f',
                                                                      '5d2dab4f0ae9fe3a60067a8d',
                                                                      '5d2dab4f0ae9fe3a60067a8e',
                                                                      '5d2dab4f0ae9fe3a60067a8c',
                                                                      '5d2dab4f0ae9fe3a60067a91' ]}]
    print doproc(g.debugConn, data=data)
