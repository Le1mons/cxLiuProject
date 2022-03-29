#!/usr/bin/python
#coding:utf-8

'''
群英集结模块
'''
import g

# 跨服attr表
def CATTR():
    return g.BASEDB(g.crossDB, 'playattr', 'crossplayattr')

# 获取剩余参团次数
def getCanJoinNum(uid):
    _max = g.GC['tuanduifuben']['base']['limit_num']
    # 获取使用过得次数
    _usedNum = g.getPlayAttrDataNum(uid, 'qyjj_usedjoinnum')
    return _max - _usedNum

# 获取该类型的带领次数
def getLeadNumByType(uid, _type):
    _data = CATTR().getAttrOne(uid, {'ctype': 'qyjj_leadnum'}) or {'num': {}}
    return _data['num'].get(_type, 0)

# 获取玩家副本信息
def getCopyData(uid, k=None, **kwargs):
    _w = {'uid': uid}
    if k:
        _w.update({'type': k})
    return g.crossDB.find1('allhero_together', _w, **kwargs)

# 发送过期邮件
def sendExpireEmail(array):
    if g.crossMC.get('tuandui_fuben'):
        return
    g.crossMC.set('tuandui_fuben', 1, 2)

    _con = g.GC['tuanduifuben']['base']
    _emailList = []
    _emailData = {
        "etype": 1,
        "ctime": g.C.NOW(),
        "passtime": g.C.NOW() + 15 * 24 * 3600,
        "isread": 0,
        "getprize": 0,
        'ttltime': g.C.TTL(),
        "title": _con['email']['title'],
        "content":_con['email']['content']
    }
    _idList = []
    for i in array:
        _recList = map(lambda x:i['rec_data'][x]['uid'], i.get('rec_data', {}))
        _uid = i['user'].keys()
        _uidList = list(set(_uid) ^ set(_recList))
        if not _uidList:
            continue
        _luckyList = i['lucky'] if i.get('lucky') else getLuckyUidList(_uid)
        for uid in _uidList:
            _temp = _emailData.copy()
            _prize = g.m.diaoluofun.getGroupPrize(
                _con['baoxiang']['gooddlz'] if uid in _luckyList else _con['baoxiang']['baddlz']
            )
            _temp.update({'uid': uid, 'prize': _prize})
            _emailList.append(_temp)
        _idList.append(i['_id'])
    if _emailList:
        g.mdb.insert('email', _emailList)
    return _idList

# 获取可以拿幸运奖励的uid 列表
def getLuckyUidList(uidList):
    _con = g.GC['tuanduifuben']['base']
    _luckyNum = filter(lambda x: x[0][0] <= len(uidList) <= x[0][1], _con['baoxiang']['goodnum'])[0][1]
    return g.C.RANDLIST(uidList, _luckyNum)

# 获取团队副本红点
def getTeamCopyHD(uid):
    if not g.chkOpenCond(uid, 'tuanduifuben'):
        return 0

    _data = g.crossDB.find1('allhero_together', {g.C.STR('user.{1}', uid): {'$exists': 1}}, fields=['_id','ctime','rec_data','type'])
    _con = g.GC['tuanduifuben']['base']['group']
    if not _data or _data['ctime']+_con[_data['type']]['duration']>g.C.NOW() or uid in _data.get('rec_data', {}):
        return 0
    else:
        return 1



if __name__ == '__main__':
    print getTeamCopyHD(g.buid('xuzhao'))