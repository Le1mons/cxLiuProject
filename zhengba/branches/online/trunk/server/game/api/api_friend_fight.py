# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——一键发送和领取
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
from ZBFight import ZBFight

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 助战的好友的uid
    _toUid = data[0]
    # 玩家的站位信息
    _fightData = data[1]
    # 设置0.5秒的缓存
    _memcache = g.mc.get(str('friend_boss_' + _toUid))
    if _memcache:
        _res['s'] = -10
        _res['errmsg'] = g.L('friend_fight_res_-10')
        return _res
    g.mc.set(str('friend_boss_' + _toUid), {'v':1}, 1)

    _tiliNum = g.m.friendfun.getTiliNum(uid,isset=1)
    # 体力不足
    if _tiliNum <= 0:
        _res['s'] = -4
        _res['errmsg'] = g.L('friend_fight_res_-4')
        return _res

    _bossData = g.m.friendfun.getBossData(_toUid)
    # Boss已死亡
    if not _bossData:
        _res['s'] = -1
        _res['errmsg'] = g.L('friend_fight_res_-1')
        return _res

    #战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid,_fightData)
    if  _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    #玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid,_chkFightData['herolist'],0, sqid=_fightData.get('sqid'))
    _bossFightData = _bossData['fightdata']
    # 剔除血量为0的boss
    _herolist = [i for i in g.C.dcopy(_bossFightData['herolist']) if i['hp'] > 0]

    f = ZBFight('pve')
    # f.initFightByData(_userFightData + _bossFightData['herolist'])
    f.initFightByData(_userFightData + _herolist)
    if 'fightless' in _bossData:
        f.setRoleHp(1,_bossData['fightless'])
    _fightRes = f.start()
    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]

    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    # 统计伤害
    _dps = _fightRes['dpsbyside'][0]
    # for i in _fightRes['roles']:
    #     # 如果是己方角色
    #     if _fightRes['roles'][i]['side'] == 0:
    #         _dps += _fightRes['signdata'][i]['dps']


    if _winside == 0:
        # 好友获取奖励
        _prize = _bossData['prize']
        _con = g.GC['friend']['base']
        _title = _con['email2']['title']
        _content = _con['email2']['content']
        g.m.emailfun.sendEmails([_toUid],1,_title,_content,_prize)
        # 获取击杀奖励
        _killPrize = _bossData['killprize']
        _title = _con['email3']['title']
        _content = g.C.STR(_con['email3']['content'], g.getGud(_toUid)['name'])
        g.m.emailfun.sendEmails([uid], 1, _title, _content, _killPrize)

        # 删除bos数据
        g.mdb.update('friend', {'uid': _toUid}, {'$unset': {'treasure.boss': 1}})
    else:
        # 记录对手的残余状态
        _fightLess = {}
        for k,v in _fightRes['fightres'].items():
            for i in xrange(len(_bossFightData['herolist'])):
                # 对方角色
                if v['side'] == 1 and v['pos'] == _bossFightData['herolist'][i]['pos']:
                    # _bossFightData['herolist'][i]['hp'] = v['hp']
                    # # 怒气还原成默认的50
                    # _bossFightData['herolist'][i]['nuqi'] = 50
                    _fightLess[str(v['pos'])] = v['hp'] if v['hp'] > 0 else 0
        # 进行容错处理
        _bossData = g.m.friendfun.getBossData(_toUid)
        if _bossData:
            g.mdb.update('friend',{'uid':_toUid},{'$set':{'treasure.boss.fightdata': _bossFightData,'treasure.boss.fightless': _fightLess},
                                                  '$inc':{'treasure.boss.dps.{}'.format(uid): _dps}},upsert=True)

    _bossLv = _bossFightData['headdata']['lv']
    # 根据等级和伤害获取积分
    _jifen = g.m.friendfun.getJifen(_dps, _bossLv)
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _preJifen = g.getAttrByCtype(uid, 'friend_jifen',k=_dKey,bydate=False)
    g.setAttr(uid,{'ctype':'friend_jifen'},{'v': _jifen + _preJifen,'k':_dKey})

    #减少体力
    g.m.friendfun.setTiliNum(uid, -1)

    _dlzId = _bossData['diaoluozu']
    _flopPrize = {'prize':[],'show':[]}
    for i in xrange(3):
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        if i == 0:
            _flopPrize['prize'] += _prize
            _sendData = g.getPrizeRes(uid, _prize, act={'act':'friend_fight','prize':_prize})
            g.sendChangeInfo(conn, _sendData)
        else:
            _flopPrize['show'] += _prize

    _resData.update({'flop': _flopPrize,'dps': _dps,'jifen':_jifen})

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    a = [uid,{u'1': u'5c29c0b7c0911a34646bae77', u'3': u'5c2c604bc0911a2c6c6ce85e', u'2': u'5c29c0b8c0911a34646baea5'}]
    print doproc(g.debugConn,data=a)