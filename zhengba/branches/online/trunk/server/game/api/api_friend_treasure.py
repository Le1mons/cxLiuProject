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
    _treasure = _con['treasure']
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
        for i in _rand['boss']:
            _min, _max = i.split('_')
            if int(_min) <= _lv <= int(_max):
                _boss = _rand['boss'][i]['npc']
                _prize = _rand['boss'][i]['prize']
                _killPrize = _rand['boss'][i]['killprize']
                _dlz = _rand['boss'][i]['diaoluozu']
                _fightMap = _rand['boss'][i]['fightmap']
                break

        _bossFightData = g.m.fightfun.getNpcFightData(_boss)
        # 设置boss数据到数据库
        _data = {'fightdata':_bossFightData,'prize':_prize,'killprize':_killPrize,
                 'diaoluozu':_dlz,'bossid':_boss,'fightmap':_fightMap}
        _resData.update({'treasure': {'boss': _data}})

        #监听好友探宝搜寻敌人
        g.event.emit("SearchFriend",uid)
        # g.m.taskfun.chkTaskHDisSend(uid)

    g.mdb.update('friend',{'uid':uid},_resData,upsert=True)
    _resData.update({'isboss': _isBoss})

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("pjy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])