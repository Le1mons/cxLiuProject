#!/usr/bin/python
# coding: utf-8
'''
好友——开启探宝界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
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
        _hpList = []
        for i in _bossData['fightdata']['herolist']:
            if str(i['pos']) in _fightLess:
                _hpList.append(_fightLess[str(i['pos'])])
            else:
                _hpList.append(i['hp'])
        _maxHpList = [i['maxhp'] for i in _bossData['fightdata']['herolist']]
        _bossData['headdata'] =  g.m.userfun.getShowHead(uid)

        _res['d'] = {'myinfo': {'freetime': -1,'boss':{'curhp': sum(_hpList),'maxhp': sum(_maxHpList),'headdata':_bossData['fightdata']['headdata']},'tiliinfo':_tiliInfo,
                                'headdata':g.m.userfun.getShowHead(uid)}}

        _allUid.extend(_friendInfo.get('friend', []))


    _resList = []
    # 所有有探讨boss的
    _friendInfo = g.mdb.find('friend', {'uid': {'$in': _allUid}, 'treasure.boss':{'$exists': 1}}, fields=['_id', 'uid', 'treasure'])
    for x in _friendInfo:
        _bossData = {}
        _freeTime = 0
        # _bossData = x['treasure']['boss']
        _fightLess = x['treasure']['boss'].get('fightless',{})
        _hpList = []
        for i in x['treasure']['boss']['fightdata']['herolist']:
            if str(i['pos']) in _fightLess:
                _hpList.append(_fightLess[str(i['pos'])])
            else:
                _hpList.append(i['hp'])
        _maxHpList = [i['maxhp'] for i in x['treasure']['boss']['fightdata']['herolist']]

        _bossData['boss'] = {'curhp': sum(_hpList),'maxhp': sum(_maxHpList)}
        _bossData['boss']['headdata'] =  x['treasure']['boss']['fightdata']['headdata']
        _bossData['headdata'] =  g.m.userfun.getShowHead(x['uid'])
        _resList.append(_bossData)

    _res['d'].update({'data': _resList})
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq10")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[uid])