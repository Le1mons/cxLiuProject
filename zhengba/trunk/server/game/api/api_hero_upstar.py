# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
英雄——升星
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: ["5d2db17c0ae9fe3a60067ac2"升星英雄tid, {"0": ["5d2db8120ae9fe3a60067bbc"材料英雄tid],
                                                         "1": ["5d2db8120ae9fe3a60067bbb"],
                                                         "2": ["5d2db8120ae9fe3a60067bbd"],
                                                         "3": ["5d2db8120ae9fe3a60067bbe"]}]
    :return:
    ::

        {'d'升星返还的培养材料: [], 's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄唯一id
    tid = str(data[0])
    # tid字典，key是升星条件(extneed)的索引，value是tid列表
    _tidDict = data[1]
    # 替代品  代替九星英雄
    _tidai = {}
    if len(data) >= 3:
        _tidai = data[2]

    _hero_info = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄不存在就返回
    if not _hero_info:
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_hecheng_res_-1')
        return _res

    # 获取hero要升的的星级
    _hero_star = _hero_info['dengjielv'] + 1
    # 英雄等阶不足  暂时不开放12星
    if _hero_info['dengjielv'] < g.GC['herocom']['maxdengjie'] or _hero_info['dengjielv'] >= 15:
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_upstar_res_-2')
        return _res

    # 升星还未开放
    if str(_hero_star) in g.GC['herocom']['serverstar2day'] and g.getOpenDay() < g.GC['herocom']['serverstar2day'][str(_hero_star)]:
        _res['s'] = -22
        _res['errmsg'] = g.L('hero_upstar_res_-22')
        return _res

    _heroComCon = g.GC['herocom']['star2cond']
    # 14星需要达成任务
    if str(_hero_star) in _heroComCon:
        _task = g.getAttrByCtype(uid, 'hero_starupgrade', bydate=False, default={})
        # 任务没达成
        if _task.get(str(_hero_star), 0) < _heroComCon[str(_hero_star)]['pval']:
            _res['s'] = -20
            _res['errmsg'] = g.L('hero_upstar_res_-20')
            return _res

    # 英雄已达到最大星级
    _hid =  _hero_info['hid']
    _star_conf = g.GC['herostarup'][_hid]
    if str(_hero_star) not in _star_conf:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_upstar_res_-3')
        return _res

    _upstar_conf = _star_conf[str(_hero_star)]
    _need_item = list(_upstar_conf['need'])
    # 替代9星得消耗
    if _tidai:
        _tidaiNeed = [{'a':'item','t':k,'n':v} for k,v in _tidai.items()]
        _need_item += _tidaiNeed

    _alt_res = g.chkDelNeed(uid, _need_item)
    # 判断消耗品是否充足
    if not _alt_res['res']:
        if _alt_res['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _alt_res['t']
        else:
            _res["s"] = -104
            _res[_alt_res['a']] = _alt_res['t']
        return _res

    _tidList = []
    for i in _tidDict:
        _tidList.extend(_tidDict[i])
    _heroList = g.m.herofun.getMyHeroList(uid,where={'_id':{'$in':map(g.mdb.toObjectId, _tidList)}},keys='zhongzu,star,hid,lv,dengjie,weardata,skin,jiban,wuhun,baoshijinglian')
    _alt_hero = g.m.herofun.ChkHero({'delhero':list(_upstar_conf['extneed'])}, g.GC['hero'][_hero_info['hid']], _heroList,ishecheng=0,tidai=_tidai)
    # 有材料条件不足
    if not _alt_hero['res']:
        _res['s'] = -4
        _res['errmsg'] = g.L('hero_upstar_res_-4')
        return _res

    #检测删除英雄是否有皮肤
    g.event.emit("chkdelhero_skin",uid,_heroList)
    _delTidlist = map(lambda x: x['_id'], _alt_hero['herolist'])
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, _delTidlist, conn, herodata=_heroList)

    _send_data = g.delNeed(uid, _need_item, issend=False, logdata={'act': 'hero_upstar','del':_heroList})
    #  删除英雄的逻辑
    g.mdb.delete('hero', {'_id': {'$in': map(lambda x:x['_id'], _alt_hero['herolist'])},'uid':uid})

    _prize_list = g.m.herofun.getFenjiePrize(uid, _alt_hero['herolist'],isfenjie=False)
    _delHero = {str(x['_id']): {'num':0} for x in _alt_hero['herolist']}

    # 通过穿戴信息修改数据库
    _Send = {'shipin':{},'equip':{}}
    for sp in _prize_list['shipin']:
        _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
        _Send['shipin'].update(_data)

    for equip in _prize_list['equip']:
        _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
        _Send['equip'].update(_data)

    _prizeData = g.getPrizeRes(uid, _prize_list['prize'],
                               {'act':'hero_upstar','prize':_prize_list,'get':_hid,'delete':map(lambda x:x['hid'], _heroList)})
    g.sendChangeInfo(conn, _prizeData)

    # 获取星级对应的被动技能
    _bdSkill = {'bd{}skill'.format(i):_upstar_conf['bd{}skill'.format(i)] for i in xrange(1,4)}
    _bdSkill.update({'dengjielv': _hero_star, 'star': _hero_star, 'staratkpro':_upstar_conf.get('staratkpro',0)+1000, 'starhppro':_upstar_conf.get('starhppro',0)+1000})
    g.m.herofun.updateHero(uid, tid, _bdSkill)
    _send_data['hero'] = {tid: {'dengjielv': _hero_star, 'star': _hero_star}}

    # 历史最高战力改变,防止分解其中一个给另一个升星  导致最高战力继续上涨
    _data = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
    if _data:
        for _tid in _tidList:
            if _tid in _data['tid2zhanli']:
                g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')
                break

    # 重置英雄buff
    _hero_buff = g.m.herofun.reSetHeroBuff(uid, tid, ['bdskillbuff'])
    _hero_buff[tid]['star'] = _hero_star
    _hero_buff[tid]['dengjielv'] = _hero_star
    # 返回进阶后的英雄buff以及下一阶的buff与需要物品
    _send_data.update({'hero': _hero_buff})
    _send_data['hero'].update(_delHero)
    _send_data['shipin'] = _Send['shipin']
    _send_data['equip'] = _Send['equip']

    g.sendChangeInfo(conn, _send_data)
    gud = g.getGud(uid)
    if _hero_star >= 7:
        #跑马灯
        _heroCon = g.GC['hero'][_hid]
        g.m.chatfun.sendPMD(uid, 'herostarup', *[gud['name'],_heroCon['name'],_hero_star])

    # 英雄升星成就任务
    g.event.emit('hero_star_up',uid,tid)
    # g.m.taskfun.chkTaskHDisSend(uid)
    _resPrize = []
    for i in _prize_list:
        _resPrize += _prize_list[i]

    _r = {'prize': _resPrize}
    # 统御
    g.event.emit("hero_tongu", uid, _hero_info['hid'], _hero_star)

    # 针对十星英雄在hid后面加上_1,  '25065_1'
    if _hero_star == 10:
        g.event.emit("adduserhead", uid, [_hero_info['hid'] + '_1'])
    if _hero_star >= 10:
        # 战旗任务
        g.event.emit("FlagTask", uid, '301')
    g.event.emit('JJCzhanli', uid, tid)
    g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _hero_star)
    g.event.emit('trial', uid, '1', cond=_hero_star)
    g.event.emit('STAR_UPGRADE', uid, _hero_star)
    # 检查羁绊
    g.event.emit("chkjiban", uid, tid, _hero_star,  _hero_info['hid'])

    g.event.emit('herotheme_star', uid, _hero_info['hid'], val=_hero_star)
    # 检测共鸣
    _con = g.GC['herocom']['resonance']
    if 'resonance' not in gud and _hero_star == _con['star'] and g.mdb.count('hero',{'uid':uid,'star':{'$gte': _con['star']}}) >= _con['num']:
        gud['resonance'] = 1
        g.gud.setGud(uid, gud)
        g.m.userfun.updateUserInfo(uid, {'resonance': gud['resonance']})
        g.sendChangeInfo(conn, {'attr': {'resonance': gud['resonance']}})

    if _hero_star >= 13:
        _r['task'] = g.getAttrByCtype(uid, 'hero_starupgrade', bydate=False, default={})
    _res['d'] =  _r
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = [u'5f64d9999dc6d62152d285bd', {u'0': [u'5f633cfebbc6daf23faa5984', u'5f633d02bbc6daf23faa5a70', u'5f633cfebbc6daf23faa5967', u'5f633d02bbc6daf23faa5a53']}, {}]
    from pprint import pprint

    pprint(doproc(g.debugConn, data))
