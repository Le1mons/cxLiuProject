#!/usr/bin/python
# coding:utf-8
'''
英雄--分解
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: ['5d2d9dc20ae9fe3a600679a9']  分解英雄tid
    :return:
    ::

        {'d': {'prize'分解奖励: [{'a': u'item', 'n': 8029, 't': u'2001'},
                               {'a': u'item', 'n': 8760, 't': u'2004'},
                               {'a': u'attr', 'n': 132700, 't': u'useexp'},
                               {'a': u'attr', 'n': 294500, 't': u'jinbi'}]},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _tidList = data
    _heroTidList = [g.mdb.toObjectId(i) for i in _tidList]
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id':{'$in': _heroTidList},'star':{'$lt': 7}},keys='dengjie,lv,star,dengjielv,weardata,hid,skin,jiban,wuhun,baoshijinglian')
    # 有一个英雄不存在就返回
    if len(_tidList) != len(_heroList):
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_fenjie_res_-1')
        return _res

    _defHero = g.m.zypkjjcfun.getDefendHero(uid)
    _defHero.pop('pet', None)
    _jjcHero = _defHero.values()
    # 竞技场不能上阵
    if set(_tidList)&set(_jjcHero):
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_fenjie_res_-2')
        return _res

    #检测删除英雄是否有皮肤
    g.event.emit("chkdelhero_skin",uid,_heroList)
    # 删除需要分解的英雄
    g.mdb.delete('hero', {'uid': uid, '_id':{'$in': _heroTidList}})
    # 返回分解英雄的奖励信息
    _prize = g.m.herofun.getFenjiePrize(uid, _heroList)
    _resPrize = []
    for i in _prize:
        _resPrize += _prize[i]

    # 通过穿戴信息修改数据库
    _Send = {'shipin':{},'equip':{}}
    for sp in _prize['shipin']:
        _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
        _Send['shipin'].update(_data)

    for equip in _prize['equip']:
        _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
        _Send['equip'].update(_data)

    _sendData = g.getPrizeRes(uid, _prize['prize'], act={'act':'hero_fenjie','prize':_prize,'delete':map(lambda x:x['hid'], _heroList)})
    _resHero = {i:{'num':0} for i in data}
    _sendData['hero'].update(_resHero)
    _sendData['shipin'].update(_Send['shipin'])
    _sendData['equip'].update(_Send['equip'])
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _resPrize}
    # 监听分解英雄成就任务事件
    # g.setAttr(uid,{'ctype':'hero_fenjie'},{'v':len(_tidList)})
    g.event.emit('Fenjie', uid ,val=len(_tidList))
    g.event.emit('GJherofenjie', uid)
    # g.m.taskfun.chkTaskHDisSend(uid)
    # 神器任务
    g.event.emit('artifact', uid, 'fenjie')
    # 历史最高战力改变
    _data = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
    if _data:
        for tid in _tidList:
            if tid in _data['tid2zhanli']:
                g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')
                break
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, _heroTidList, conn, herodata=_heroList)
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = ['5e97327a065d74b9f452ed72']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
