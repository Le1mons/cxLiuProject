#!/usr/bin/python
# coding:utf-8
'''
英雄 - 融魂
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: ['atk','5d2db17c0ae9fe3a60067ac2',10]  data[0]:融魂种类 atk：攻击  def：防御 data[1]:融魂英雄tid data[2]:融魂次数
    :return:
    ::

        {'d': {'crit'融魂暴击系数: 2,
               'hero'英雄属性: {'5d2db17c0ae9fe3a60067ac2': {u'atk': 7994,
                                                     u'atkdrop': 0,
                                                     u'atkpro': 1000,
                                                     u'baojidrop': 0,
                                                     u'baojipro': 0,
                                                     u'baoshangdrop': 0,
                                                     u'baoshangpro': 0,
                                                     u'def': 971,
                                                     u'defdrop': 0,
                                                     u'defpro': 1000,
                                                     u'dpsdrop': 0,
                                                     u'dpspro': 0,
                                                     'extbuff': {u'meltsoul': [{u'atk': 200}]},
                                                     u'fkdpspro': 0,
                                                     u'gedangdrop': 0,
                                                     u'gedangpro': 300,
                                                     'hid': u'25076',
                                                     u'hp': 62620,
                                                     u'hpdrop': 0,
                                                     u'hppro': 1200,
                                                     u'jianshangpro': 0,
                                                     u'jingzhundrop': 0,
                                                     u'jingzhunpro': 0,
                                                     'meltsoul': 1,
                                                     u'miankongdrop': 0,
                                                     u'miankongpro': 0,
                                                     u'pojiadrop': 0,
                                                     u'pojiapro': 0,
                                                     u'pvpdpspro': 0,
                                                     u'pvpundpspro': 0,
                                                     u'skilldpsdrop': 0,
                                                     u'skilldpspro': 0,
                                                     u'speed': 853,
                                                     u'speeddrop': 0,
                                                     u'speedpro': 1000,
                                                     u'staratkpro': 1000,
                                                     u'starhppro': 1000,
                                                     u'unbaojipro': 0,
                                                     u'undotdpspro': 0,
                                                     u'undpsdrop': 0,
                                                     u'undpspro': 0,
                                                     'zhanli': 17663}}},
         's': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 融魂的类型
    _type = data[0]
    # 英雄的tid
    tid = data[1]
    # 融魂的次数
    _num = int(data[2])
    # 玩家等级不足
    if not g.chkOpenCond(uid, 'meltsoul'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 玩家等级不足
    if _num != 1 and not g.chkOpenCond(uid, 'meltsoulnum'):
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_meltsoul_-1')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, tid, keys='_id,lv,hid,meltsoul,extbuff,star')
    # 玩家等级不足
    if not _heroInfo:
        _res['s'] = -8
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['meltsoul'][_heroInfo['hid']]
    _comcon = g.GC['meltsoulcom']['base']
    # 英雄等级不够
    if _heroInfo['lv'] < _comcon['limitlv']:
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_meltsoul_-2')
        return _res

    _extbuff = _heroInfo.get('extbuff',{})
    _curNum = 0
    if 'meltsoul' in _extbuff:
        for i in _extbuff['meltsoul']:
            if _type == i.keys()[0]:
                _curNum = i.values()[0]

    _curLv = str(_heroInfo.get('meltsoul',1))
    # 已经达到上限
    if _curLv not in _con:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_maxlv')
        return _res

    # 已经达到上限
    if _curNum >= _con[_curLv]['upperlimit'][_type]:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_meltsoul_-3')
        return _res

    _addNum = 0
    _crit = g.m.herofun.getBuffCrit()
    for i in xrange(_num):
        _curNum += int(_con[_curLv]['buff'][_type] * _crit)
        _addNum += 1
        if _curNum >= _con[_curLv]['upperlimit'][_type]:
            # 修正数据  不能超过上限
            _curNum = _con[_curLv]['upperlimit'][_type]
            break

    if _type == 'atk':
        _need = _comcon['atkneed'][_curLv]
    else:
        _need = _comcon['hpneed'][_curLv]
    _need = [{'a':i['a'],'t':i['t'],'n':int(i['n']*_addNum)} for i in _need]
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

    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'hero_meltsoul','need':_need,'hid':_heroInfo['hid']})
    g.sendChangeInfo(conn, _sendData)

    # 记录消耗 过滤经验
    _allNeed = g.getAttrByCtype(uid,'meltsoul_cost',bydate=False,default=[],k=tid)
    _resNeed = []
    for i in _need:
        if i['t'] == 'useexp':
            continue
        _resNeed.append(i)
    _resPrize = g.fmtPrizeList(_resNeed + _allNeed)
    g.setAttr(uid, {'uid':uid,'ctype':'meltsoul_cost','k':tid}, {'v':_resPrize,'hero':_heroInfo})
    # 增加日志
    g.m.dball.writeLog(uid, 'hero_meltsoul',{'hero': _heroInfo,'tid':tid,'prize':_resPrize})
    # 增加extbuff里的对应属性
    _extbuff = g.m.herofun.addExtbuffVal(_extbuff, {'meltsoul':[{_type:_curNum}]}, isinc=0)
    g.m.herofun.updateHero(uid, tid, {'extbuff': _extbuff})
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid)
    _heroBuff[tid].update({'extbuff': _extbuff,'meltsoul':_heroInfo.get('meltsoul',1)})
    g.sendChangeInfo(conn, {'hero': _heroBuff})
    _res['d'] = {'hero':_heroBuff,'crit':_crit}
    return _res


if __name__ == '__main__':
    uid = g.buid('lk2')
    g.debugConn.uid = uid
    data="atk","611bb6779dc6d62903839a62",10

    from pprint import pprint
    for i in xrange(50):
        pprint(doproc(g.debugConn, data))
