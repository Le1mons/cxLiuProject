#!/usr/bin/python
# coding:utf-8
'''
英雄--升级统御
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: ["25076"英雄id,["5d2db6470ae9fe3a60067bba"当做材料的英雄tid]]
    :return:
    ::

        {'s': 1, 'd': {'data': {u'mylv': 2, u'tyid': u'2507', u'maxlv': 5}, 'prize': [{u'a': u'attr', u't': u'destiny', u'n': 400}]}}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    hid = data[0]
    _tidList = data[1]
    # 判断是否可以提升统御
    _tyId = g.GC['pre_hero'][hid]['pinglunid']
    _con = g.GC['tongyu']['base']
    if _tyId not in _con['herozu'] or len(_tidList) != len(list(set(_tidList))) or not _tidList:
        _res['s'] = -10
        _res['errmsg'] = g.L('hero_tyupgrade_-10')
        return _res

    if not g.chkOpenCond(uid, 'tonyu'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find1('tongyu',{'uid':uid,'tyid':_tyId},fields=['_id','maxlv','mylv','tyid'])
    # 没有激活统御
    if not _data:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_tyupgrade_-3')
        return _res
    
    # 统御等级达到上限
    if _data['maxlv'] <= _data['mylv']:
        _res['s'] = -4
        _res['errmsg'] = g.L('hero_tyupgrade_-4')
        return _res
    
    tidList = map(g.mdb.toObjectId, _tidList)
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id':{'$in':tidList}},keys='zhongzu,hid,star,lv,dengjie,weardata,skin,jiban,wuhun,baoshijinglian')
    # 检查提升所需的英雄
    _heroChk = g.m.herofun.ChkHero(_con['need'][str(_data['mylv'] + 1)],g.GC['hero'][hid],_heroList,1 if _data['mylv'] < 4 else 0)
    # 统御提升英雄条件不符
    if not _heroChk['res']:
        _res['s'] = -5
        _res['errmsg'] = g.L('hero_tyupgrade_-5')
        return _res

    _data['mylv'] += 1
    _need = _con['need'][str(_data['mylv'])]['item']
    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res
    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'hero_tyupgrade','lv':_data['mylv']})
    g.sendChangeInfo(conn, _sendData)
    #检测删除英雄是否有皮肤
    g.event.emit("chkdelhero_skin",uid,_heroList)
    g.mdb.delete('hero',{'uid':uid,'_id':{'$in':tidList}})

    g.mdb.update('tongyu',{'uid':uid,'tyid': _tyId},{'lasttime':g.C.NOW(),'mylv': _data['mylv']})

    _befDestinyNum = g.getGud(uid).get('destiny', 0)
    # 增加天命
    _tmprize = _con['tmprize'][str(_data['mylv'])]
    # _sendData = g.getPrizeRes(uid, _prize)
    # 返回分解英雄的奖励信息
    _prize = g.m.herofun.getFenjiePrize(uid, _heroList,isfenjie=False)
    _prize['prize'] += list(_tmprize)

    # 通过穿戴信息修改数据库
    _logData = {'act':'hero_tyupgrade','prize':_prize,'deleteid':map(lambda x:str(x['_id']), _heroList),'delete':map(lambda x:x['hid'], _heroList)}
    _sendData = g.getPrizeRes(uid, _prize['prize'], act=_logData)
    for sp in _prize['shipin']:
        _sdata = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
        _sendData['shipin'].update(_sdata)

    for equip in _prize['equip']:
        _sdata = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
        _sendData['equip'].update(_sdata)

    _destinyPrize = g.m.herofun.getDestinyData(g.getGud(uid)['destiny'])
    _befDestinyPrize = g.m.herofun.getDestinyData(_befDestinyNum)
    _buff = _destinyPrize['buff']
    if _buff and _buff != _befDestinyPrize['buff']:
        # 历史最高战力改变
        _zlData = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
        if _zlData:
            for tid in _tidList:
                if tid in _zlData['tid2zhanli']:
                    g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')
                    break

        # 设置公共的天命buff
        g.mdb.update('buff',{'uid':uid,'ctype':'common'},{'buff.destiny':_buff},upsert=True)
        _heroData = g.m.herofun.reSetAllHeroBuff(uid)
        if _heroData != None:
            _sendData['hero'].update(_heroData)
    _sendData['hero'].update({i:{'num':0} for i in _tidList})
    g.sendChangeInfo(conn, _sendData)

    # 增加天命专属头像
    if _destinyPrize['avater']:
        g.m.userfun.setNewHead(uid, [_destinyPrize['avater']])

    # 增加天命专属称号
    if _destinyPrize['chenghao']:
        g.setAttr(uid, {'ctype': 'chenghao_list'}, {'$push': {'v': _destinyPrize['chenghao']}})

    _resPrize = []
    for i in _prize:
        _resPrize.extend(_prize[i])

    _res['d'] = {'prize':_resPrize,'data':_data}
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, tidList, conn, herodata=_heroList)

    return _res


if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["25076",["5d2db6470ae9fe3a60067bba"]])
