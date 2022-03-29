#!/usr/bin/python
# coding: utf-8
'''
好友——开启探宝界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

def getMaxHpByZF(_zf, hero):
    # maxhp需要计算阵法
    _zfBuff = g.m.fightfun.getBuffByZF(_zf)
    hero = g.m.fightfun.caleHeroBuffByZhenFa(hero, _zfBuff)
    return hero['hp']

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [名字:str]
    :return:
    ::

        {'d':{'myinfo':
                {'freetime': 下次探宝时间, 'tiliinfo':{'num':体力数量,'freetime':下次体力恢复时间}
                or
                {'freetime':-1, 'boss': {
                                    "curhp": boss当前血量,
                                    'maxhp': 最大血量,
                                    'headdata': {},
                                    'elite':是否精英boss
                },
                'data': [{
                    'boss': {'curhp': 他人的boss的当前血量, 'maxhp': 最大血量, 'headdata': {}},
                    'headdata': 玩家headdata,
                    'elite': 是否精英怪
                }]
        }
        }}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    #级别不足
    if not g.chkOpenCond(uid,'gonghui'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    gud = g.getGud(uid)
    _ghid = gud['ghid']
    _allUid = []
    # 有公会
    if _ghid:
        _ghUsers = g.mdb.find('gonghuiuser',{'ghid':_ghid,'uid':{'$ne':uid}},fields=['_id','uid'])
        _allUid.extend(map(lambda x:x['uid'], _ghUsers))

    # 获取体力信息
    _tiliInfo = g.m.friendfun.getTiliNum(uid, getcd=1)

    _friendInfo = g.mdb.find1('friend',{'uid':uid},fields=['_id','friend','treasure'])
    # 不存在或者没有探宝过 或者没有boss信息
    if not _friendInfo:
        _res['d'] = {'myinfo': {'freetime': 0, 'tiliinfo': _tiliInfo}}
    elif not _friendInfo.get('treasure',{}) or 'boss' not in _friendInfo.get('treasure',{}):
        _res['d'] = {'myinfo': {'freetime': _friendInfo.get('treasure',{}).get('freetime', 0),'tiliinfo':_tiliInfo}}
        _allUid.extend(_friendInfo.get('friend', []))
    else:
        _bossData = _friendInfo['treasure']['boss']
        _fightLess = _bossData.get('fightless',{})
        _hpList, _maxHpList = [], []
        _zf = g.m.fightfun.getZhenFaBuffId(_bossData['fightdata']['herolist'])
        for i in _bossData['fightdata']['herolist']:
            if str(i['pos']) in _fightLess:
                _hpList.append(_fightLess[str(i['pos'])])
                _maxHpList.append(getMaxHpByZF(_zf, i))
            else:
                _hpList.append(i['hp'])
                _maxHpList.append(i['maxhp'])

        _bossData['headdata'] =  g.m.userfun.getShowHead(uid)

        _res['d'] = {'myinfo': {'freetime': -1,'boss':{'curhp': sum(_hpList),'maxhp': sum(_maxHpList),'headdata':_bossData['fightdata']['headdata']},'tiliinfo':_tiliInfo,
                                'headdata':g.m.userfun.getShowHead(uid),'elite':_bossData.get('elite', 0)}}

        _allUid.extend(_friendInfo.get('friend', []))


    _resList = []
    # 所有有探讨boss的
    _friendInfo = g.mdb.find('friend', {'uid': {'$in': _allUid}, 'treasure.boss':{'$exists': 1}}, fields=['_id', 'uid', 'treasure'])
    for x in _friendInfo:
        _bossData = {}
        _freeTime = 0
        # _bossData = x['treasure']['boss']
        _fightLess = x['treasure']['boss'].get('fightless',{})
        _zf = g.m.fightfun.getZhenFaBuffId(x['treasure']['boss']['fightdata']['herolist'])
        _hpList,_maxHpList = [], []
        for i in x['treasure']['boss']['fightdata']['herolist']:
            if str(i['pos']) in _fightLess:
                _hpList.append(_fightLess[str(i['pos'])])
                _maxHpList.append(getMaxHpByZF(_zf, i))
            else:
                _hpList.append(i['hp'])
                _maxHpList.append(i['maxhp'])

        _bossData['boss'] = {'curhp': sum(_hpList),'maxhp': sum(_maxHpList)}
        _bossData['boss']['headdata'] =  x['treasure']['boss']['fightdata']['headdata']
        _bossData['headdata'] =  g.m.userfun.getShowHead(x['uid'])
        _bossData['elite'] =  x['treasure']['boss'].get('elite', 0)
        _resList.append(_bossData)

    # 消除每日登陆一次得红点
    g.setAttr(uid, {'ctype': 'treasure_openonce'}, {'v': 1})

    _res['d'].update({'data': _resList})
    return _res

if __name__ == '__main__':
    uid = g.buid("lj5555")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[uid])