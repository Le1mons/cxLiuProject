# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——好友探宝
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str]
    :return:
    ::

        {'d': {
            'isboss': 是否boss,
            'treasure': {
                'prize': [探宝直接获得的奖励], 'freetime': 下次探宝的时间
                or
                'boss': {'bossid':bossid, 'prize':奖励, 'killprize':击杀奖励, 'fightmap': 战斗背景图}
            }}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'friendhelp'):
        _res['s'] = -2
        _res['errmsg'] = g.L('friend_treasure_res_-2')
        return _res

    _friendInfo = g.mdb.find1('friend',{'uid':uid})
    _nt = g.C.NOW()
    # 还没到免费时间 或者已有boss
    if _friendInfo and 'treasure' in _friendInfo and (('freetime' in _friendInfo['treasure']\
            and _friendInfo['treasure']['freetime'] > _nt) or 'boss' in _friendInfo['treasure']):
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_treasure_res_-1')
        return _res

    _con = g.GC['friend']['base']
    _treasure = g.m.friendfun.getTreasureData(uid)
    _baseP = sum(map(lambda x:x['p'], _treasure))
    _rand = g.C.RANDARR(_treasure, _baseP)
    # 第一次必出boss
    _first = g.getAttrOne(uid,{'ctype':"first_treasure"})
    if not _first:
        _rand = _treasure[0]
        g.setAttr(uid, {'ctype': "first_treasure"},{'v':1})

    _isBoss = _rand['isboss']
    _lv = g.getGud(uid)['lv']
    _resData = {}

    # 设置这次的随机信息 {'data':{'$each':[data],'$slice':-20}
    g.setAttr(uid, {'ctype': 'treasure_random'}, {'$push': {'v': {'$each': [_isBoss], '$slice': -4}}})
    if not _isBoss:
        _cd = _con['treasurecd']
        _freeTime = _cd + g.C.NOW()
        _dlz = _rand['diaoluozu']
        # 根据等级获取掉落组id
        for i in _dlz:
            _min, _max = i.split('_')
            if int(_min) <= _lv <= int(_max):
                _dlzId = _dlz[i]

        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        _sendData = g.getPrizeRes(uid, _prize, act={'act':'friend_treasure','prize':_prize})
        g.sendChangeInfo(conn, _sendData)
        _resData.update({'treasure':{'prize':_prize,'freetime':_freeTime}})
    else:
        _bossRand = g.C.RANDARR(_rand['boss'], sum(map(lambda x:x['p'], _rand['boss'])))
        # 小于限制等级的就没有精英boss
        if g.getGud(uid)['lv'] < _rand['lv']:
            _bossRand['elite'] = 0

        # 普通boss
        if _bossRand['elite'] == 0:
            _bossInfo = _con['common']
        else:
            _bossInfo = _con['elite']
        _data = {}
        for i in _bossInfo:
            _min, _max = i.split('_')
            if int(_min) <= _lv <= int(_max):
                _data['bossid'] = _bossInfo[i]['npc']
                _data['prize'] = _bossInfo[i]['prize']
                _data['killprize'] = _bossInfo[i]['killprize']
                _data['diaoluozu'] = _bossInfo[i]['diaoluozu']
                _data['fightmap'] = _bossInfo[i]['fightmap']
                break

        _data['elite'] = _bossRand['elite']
        _data['fightdata'] = g.m.fightfun.getNpcFightData(_data['bossid'])
        # 设置boss数据到数据库
        _resData.update({'treasure': {'boss': _data}})

        #监听好友探宝搜寻敌人
        g.event.emit("SearchFriend",uid)
        # g.m.taskfun.chkTaskHDisSend(uid)

    g.mdb.update('friend',{'uid':uid},_resData,upsert=True)
    _resData.update({'isboss': _isBoss})

    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['2002']})
    g.event.emit('yuanxiao3', uid, "3")

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])