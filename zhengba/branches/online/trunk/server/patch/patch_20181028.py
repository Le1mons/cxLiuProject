#!/usr/bin/env python
# coding:utf-8

import sys

sys.path.append('game')

import g

'''
    更新装备
'''
print 'start..................'
# _dkey = '2018-43'
# _allUser = g.crossDB.find('crosszb_zb', {'dkey': _dkey}, fields=['_id','uid'])
# for i in _allUser:
#     sid = i['uid'].split('_')[0]
#     # 给每一条数据加上一个 sid 区分
#     g.crossDB.update('crosszb_zb', {'uid': i['uid']}, {'sid': int(sid)})


# a = g.mdb.find1('gameconfig',{'ctype':'crosszb_zbprize','k':'2018-43'})
# # 如果存在并且长度大于0   说明本服已经发送了奖励  反之没发
# if a and len(a['v']) != 0:
#     sid = int(g.getSvrIndex())
#     # 将本区服的跨服数据的rankprize unset
#     _uidList = map(lambda x:x.keys()[0], a['v'])
#     _con = g.m.crosszbfun.getCon()
#     _title = _con['zhengba']['email']['title']
#     _content = _con['zhengba']['email']['content']
#     _all = g.crossDB.find('crosszb_zb', {'dkey': _dkey, 'sid':sid}, fields=['_id', 'uid','rank'])
#     for i in _all:
#         if i['uid'] not in _uidList:
#             _prize = g.m.crosszbfun.getCrossZBRankPrizeCon(i['rank'])
#             g.m.emailfun.sendEmails([i['uid']], 1, _title, g.C.STR(_content, i['rank']), _prize)

# item = g.mdb.find('itemlist',{'itemid':{'$in':['52046','63026']}})
# g.mdb.delete('itemlist',{'itemid':{'$in':['52046','63026']}},RELEASE=1)
# _res = {}
# for i in item:
#     _res[i['uid']] = _res.get(i['uid'],0) + i['num']
#
# _prize = [{'a':'item','t':'2000','n':100}]
# t = u'竞技场兑换返还'
# c = u'由于错误配置导致兑换的英雄碎片则算成荣誉返还'
# for uid,num in _res.items():
#     g.m.emailfun.sendEmails(uid, 1, t, c, g.fmtPrizeList(_prize*num))
#
# _all = g.mdb.find('gonghui')
# for _ghData in _all:
#     _ghlv = baseLv = _ghData['lv'] if _ghData['lv'] != 0 else 1
#     _maxUserNum = _ghData['maxusernum']
#     # 公会当前经验
#     _ghexp = _ghData['exp']
#     _gcon = g.GC['gonghui']['base']
#     _maxExp = _gcon['lv2conf'][str(_ghlv)]['exp']
#     # 检测升级还是降级
#     _loopNum = len(_gcon['lv2conf']) + 1
#     for i in xrange(1, _loopNum):
#         _tmpCon = _gcon['lv2conf'][str(i)]
#         _chkExp = _tmpCon['exp']
#         if _ghexp < _chkExp:
#             _ghlv = i
#             _maxUserNum = _tmpCon['member']
#             break
#
#     if _ghlv != baseLv:
#         _setData = {}
#         _setData['lv'] = _ghlv
#         _setData['maxusernum'] = _maxUserNum
#         g.mdb.update('gonghui', {'_id': g.mdb.toObjectId(str(_ghData['_id']))}, _setData,RELEASE=1)
# _all = g.mdb.find('playattr',{'ctype': {"$regex":'^yueka_'},'v.lqnum':{'$lt':29}})
# for i in _all:
#     print i['ctype']
#     print i['uid']
g.mdb.update('playattr',{'ctype':'shizijun_data'},{'status':{}},RELEASE=1)

print 'ok...............'