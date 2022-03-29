# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——探宝战斗
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
from ZBFight import ZBFight

def proc(conn, data):
    """

    :param conn:
    :param data: [好友uid:str, 战斗阵容:dict]
    :return:
    ::

        {'d': {"fightres":{}, 'flop': {'prize':[翻牌真正获得的奖励], 'show': [翻牌显示的奖励]}, 'dps':伤害, 'jifen':积分}
        's': 1}

    """
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

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

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
    _con = g.GC['friend']['base']
    _toLv = g.getGud(_toUid)['lv']
    if _winside == 0:
        # 删除bos数据 如果失败了就说明已经被人打死了
        _r = g.mdb.update('friend', {'uid': _toUid}, {'$unset': {'treasure.boss': 1}})
        if _r['updatedExisting'] == False:
            _res['s'] = -11
            _res['errmsg'] = g.L('friend_fight_res_-1')
            return _res

        # 好友获取奖励
        _prize, _killPrize = g.m.friendfun.getBossPrize(_toLv, _con, elite=_bossData.get('elite', 0))

        _title = _con['email2']['title']
        _content = _con['email2']['content']
        g.m.emailfun.sendEmails([_toUid],1,_title,_content,_prize)
        # 获取击杀奖励
        # _killPrize = _bossData['killprize']
        _title = _con['email3']['title']
        _content = g.C.STR(_con['email3']['content'], g.getGud(_toUid)['name'])
        g.m.emailfun.sendEmails([uid], 1, _title, _content, _killPrize)
        # 趣味成就
        g.event.emit('quweichengjiu', uid, '2', 1)

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
    _jifen = int(g.m.friendfun.getJifen(_dps, _bossLv))
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _preJifen = g.getAttrByCtype(uid, 'friend_jifen',k=_dKey,bydate=False)
    g.setAttr(uid,{'ctype':'friend_jifen'},{'v': _jifen + _preJifen,'k':_dKey})

    #减少体力
    g.m.friendfun.setTiliNum(uid, -1)

    _dlzId = ''
    _bossCon = _con['elite'] if _bossData.get('elite', 0) else _con['common']
    for i in _bossCon:
        _min, _max = i.split('_')
        if int(_min) <= _toLv <= int(_max):
            _dlzId = _bossCon[i]['diaoluozu']
            break

    _flopPrize = {'prize':[],'show':[]}
    for i in xrange(3):
        _prize = g.m.diaoluofun.getGroupPrizeNum(_dlzId)
        if i == 0:
            _flopPrize['prize'] += _prize
            _sendData = g.getPrizeRes(uid, _prize, act={'act':'friend_fight','prize':_prize})
            g.sendChangeInfo(conn, _sendData)
        else:
            _flopPrize['show'] += _prize

    g.event.emit('yuanxiao3', uid, "3")
    _resData.update({'flop': _flopPrize,'dps': _dps,'jifen':_jifen})

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("lj5555")
    g.debugConn.uid = uid
    _lv = 50
    _dlz = [{"num": [0, 665], "p": 1}]
    if _lv >= 50:
        _dlz = [{"num": [666 ,999], "p": 40}, {"num": [1000, 1999], "p": 30},
                {"num": [2000, 2999], "p": 20}, {"num": [3000, 4999], "p": 6}, {"num": [5000, 7999], "p": 3},
                {"num": [8000, 9999], "p": 1}]
    for i in xrange(10000):
        _random = g.C.getRandArrNum(_dlz, 1)[0]
        _num = g.C.RANDINT(_random["num"][0], _random["num"][1])
        print _num