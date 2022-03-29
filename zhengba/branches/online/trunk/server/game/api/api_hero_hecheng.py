#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄--合成
'''
def proc(conn, data):
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
    _delHero = g.m.herofun.getMyHeroList(uid, where={'_id':{'$in': map(g.mdb.toObjectId, _tidDict['delhero'])}},keys='hid,zhongzu,star,islock,lv,deng,dengjie,weardata')
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
    _heroLocks = map(lambda x:x['islock'], _heroList)
    if 1 in _heroLocks:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_hecheng_res_-3')
        return _res

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
    }
    _newHero = g.m.herofun.addHero(uid, hid, data=data)
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

    # 跑马灯
    _heroStar = g.GC['pre_hero'][hid]['star']
    if _heroStar >= 6:
        gud = g.getGud(uid)
        _heroCon = g.GC['hero'][hid]
        g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _heroStar, _heroCon['name']])

    # 养成礼包
    if _heroStar in (5, 6):
        g.event.emit('yangcheng', uid, _heroStar)
        # 开服狂欢活动
        # 合成N星英雄
        g.event.emit('kfkh',uid,23,7,cond=_heroStar)
        # 开服狂欢获得N星英雄
        g.event.emit('kfkh', uid, 20, 5, cond=_heroStar)
        # 统御
        g.event.emit("hero_tongu", uid, hid)

    #监听获取英雄成就任务
    g.event.emit("gethero",uid,hid)

    g.event.emit('GJherofenjie', uid)
    # 神器任务
    g.event.emit('artifact', uid, 'ronghe',cond=_heroStar)

    #检测头像信息
    g.event.emit("adduserhead",uid,[str(hid)])
    _resPrize = []
    for i in _prize:
        _resPrize += _prize[i]

    _res['d'] = {'heroprize': {'a':'hero','t':hid,'n':1}, 'itemprize': _resPrize}
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    a = {u'main': u'5c14d1c5c0911a41180bd798', u'delhero': [u'5c14d1c7c0911a41180bd84e', u'5c2179c6c0911a1d68c7a0df', u'5c14d1c6c0911a41180bd824', u'5c14d1c4c0911a41180bd76e', u'5c2179c5c0911a1d68c7a0b5', u'5c14d1c5c0911a41180bd7b0', u'5c14d1c4c0911a41180bd70e', u'5c14d1c5c0911a41180bd7c4', u'5c2179c4c0911a1d68c7a053', u'5c14d1c6c0911a41180bd7d0', u'5c0b24d1e138230a272f25bd']}
    data=["32045",a]
    print doproc(g.debugConn, data=data)