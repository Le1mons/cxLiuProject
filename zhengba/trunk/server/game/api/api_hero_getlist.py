#!/usr/bin/python
#coding:utf-8
'''
英雄 - 获取英雄列表
'''

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'jjchero'竞技场防守英雄: [u'5d2d9dc20ae9fe3a600679a8'],
               'list'英雄列表: {'5d2d9dc20ae9fe3a600679a8': {u'atk'攻击: 158,
                                                             u'atkdrop': 0,
                                                             u'atkpro': 1000,
                                                             u'baojidrop': 0,
                                                             u'baojipro': 0,
                                                             u'baoshangdrop': 0,
                                                             u'baoshangpro': 0,
                                                             u'bd1skill': [u'25075111',
                                                                           u'25075121',
                                                                           u'25075131'],
                                                             u'bd2skill': [u'25075214'],
                                                             u'bd3skill': [u'25075314'],
                                                             u'bdskillopendjlv': [2, 3, 5],
                                                             u'ctime': 1563270594,
                                                             u'def': 62,
                                                             u'defdrop': 0,
                                                             u'defpro': 1000,
                                                             u'dengjie': 0,
                                                             u'dengjielv': 0,
                                                             u'dpsdrop': 0,
                                                             u'dpspro': 0,
                                                             u'fkdpspro': 0,
                                                             u'gedangdrop': 0,
                                                             u'gedangpro': 0,
                                                             u'growid': u'25075',
                                                             u'hid': u'25075',
                                                             u'hp': 808,
                                                             u'hpdrop': 0,
                                                             u'hppro': 1000,
                                                             u'islock': 0,
                                                             u'jianshangpro': 0,
                                                             u'jingzhundrop': 0,
                                                             u'jingzhunpro': 0,
                                                             u'job': 5,
                                                             u'lasttime': 1563270594,
                                                             u'lv': 1,
                                                             u'miankongdrop': 0,
                                                             u'miankongpro': 0,
                                                             u'name': u'\u5965\u79d8\u7ba1\u7406\u5458',
                                                             u'normalskill': u'7',
                                                             u'pinglunid': u'2507',
                                                             u'pojiadrop': 0,
                                                             u'pojiapro': 0,
                                                             u'pvpdpspro': 0,
                                                             u'pvpundpspro': 0,
                                                             u'skilldpsdrop': 0,
                                                             u'skilldpspro': 0,
                                                             u'speed': 199,
                                                             u'speeddrop': 0,
                                                             u'speedpro': 1000,
                                                             u'star': 5,
                                                             u'staratkpro': 1000,
                                                             u'starhppro': 1000,
                                                             'tid': '5d2d9dc20ae9fe3a600679a8',
                                                             u'uid': u'0_5d2d985b0ae9fe3a6006791d',
                                                             u'unbaojipro': 0,
                                                             u'undotdpspro': 0,
                                                             u'undpsdrop': 0,
                                                             u'undpspro': 0,
                                                             u'xpskill': u'25075012',
                                                             u'zhanli': 354,
                                                             u'zhongzu': 2}}},
         's': 1}
    """

    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    #2019-7-17 检测皮肤过期
    _skinData = chkSkinPassData(uid)
    _heroList = g.m.herofun.getMyHeroList(uid)
    _jjcHeros = g.m.zypkjjcfun.getDefendHero(uid)
    _jjcHeros = [_jjcHeros[i] for i in _jjcHeros if i.isdigit()]
    _kMap = {}
    for ele in _heroList:
        _tid = str(ele["_id"])
        del ele["_id"]
        ele.update({'tid': _tid})
        _kMap[_tid] = ele


    _res["d"] = {"list":_kMap,"jjchero":_jjcHeros,'skin':_skinData}
    return _res

#检测皮肤过期时间
def chkSkinPassData(uid):
    _list = g.mdb.find('skin', {'uid': uid}, fields=['id','wearer','expire'])
    _delId = []
    _reSetHeroTid = []
    _rData = {}
    for i in _list:
        if i['expire'] != -1 and g.C.NOW() > i['expire']:
            _delId.append(i['_id'])
            if 'wearer' in i:
                _reSetHeroTid.append(g.mdb.toObjectId(i['wearer']))
        else:
            i['_id'] = str(i['_id'])
            _rData[i['_id']] = i
            
    if _reSetHeroTid:
        g.mdb.update('hero', {'uid':uid,'_id':{'$in':_reSetHeroTid}}, {'$unset':{'skin': 1}})
        g.m.herofun.reSetAllHeroBuff(uid, {'_id':{'$in':_reSetHeroTid}})
    
    # 删除过期的
    if _delId:
        g.mdb.delete('skin', {'uid':uid,'_id':{'$in': _delId}})
        
    return _rData


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = []

    from pprint import pprint

    rest = doproc(g.debugConn, data)
    pprint(rest)

    tidlist = [tid for tid in rest['d']['list']]
    print tidlist
