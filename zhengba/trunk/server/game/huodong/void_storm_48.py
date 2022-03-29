#! /usr/bin/python
# -*-coding:utf-8-*-


"""
虚空风暴
"""
if __name__ == '__main__':
    import sys
    sys.path.append('game')

from ZBFight import ZBFight
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 48
import g



def getOpenList(uid, hdinfo):

    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,date,val,fightless,boss,mowanghp,reclist,over')
    _date = g.C.DATE(g.C.NOW())
    # 置零挑战次数
    if hdData.get('date') != _date:
        g.m.huodongfun.setHDData(uid, hdid, {'val': 0,'date':_date})
        hdData['val'] = 0

    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _fightData = kwargs['idx']
    act = int(kwargs['act'])
    hdid = hdinfo['hdid']
    _con = g.GC['voidstorm']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,fightless,boss,over,reclist')
    # 挑战boss
    # 午时已到
    if g.C.NOW() >= hdinfo['rtime']:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_hdnoopen')
        return _res

    if act == 1:
        # 挑战次数不足
        if hdData.get('val', 0) + 1 > _con['dailynum']:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_numerr')
            return _res

        # 检查战斗参数
        _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
        if _chkFightData['chkres'] < 1:
            _res['s'] = _chkFightData['chkres']
            _res['errmsg'] = g.L(_chkFightData['errmsg'])
            return _res

        _bossIdx = hdData.get('boss', 0)
        _bossId = _con['challengesort'][_bossIdx]
        # 玩家战斗信息
        _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
        f = ZBFight('pvm')

        _bosslist = list(_con['mowang'][_bossId]['boss'])
        # 如果最后一关打通了就锁血
        if hdData.get('over'):
            for i in _bosslist:
                i['lockHP'] = True
        f.initFightByData(_userFightData + _bosslist)
        # 继承血量
        if 'fightless' in hdData:
            f.setSZJRoleHp(1, hdData['fightless'])
        _fightRes = f.start()

        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

        # 如果是蓝龙
        if _fightRes['winside'] == 0 and _bossId == '5':
            for k, v in _fightRes['fightres'].items():
                if v['side'] == 1 and v.get('ismowang') and v['hp'] > 0:
                    _fightRes['winside'] = 1

        _fightRes['headdata'] = [_chkFightData['headdata'], _con['mowang'][_bossId]['headdata']]
        _winside = _fightRes['winside']

        _set = {'$inc': {'val': 1}}
        # 挑战奖励
        _prize = _con['prize'][_bossIdx]['fight']
        if _winside == 0:
            # 战斗通关 并且没打完
            if _bossIdx + 1 < len(_con['challengesort']):
                _set['$set'] = {'boss': _bossIdx + 1}
            else:
                _set['$set'] = {'over': 1}
            _set['$unset'] = {'mowanghp': 1, 'fightless': 1}
        else:
            # 记录对手的残余状态
            _fightLess = {}
            _mowangHp = 0
            for k, v in _fightRes['fightres'].items():
                if v['side'] == 1 and v.get('ismowang'):
                    _mowangHp = _fightLess[str(v['pos'])] = int(
                        v['hp'] * 100.0 / v['maxhp'])  # v['hp']  修改为按百分比继承，而不是绝对值

            _set['$set'] = {'fightless': _fightLess, 'mowanghp': _mowangHp}

        _rData["fightres"] = _fightRes
    else:
        idx = abs(int(kwargs['idx']))
        # 还没打通 非最后一层   或者 最后一层但是没有over
        if (idx != 6 and idx >= hdData.get('boss', 0)) or (idx == 6 and not hdData.get('over')):
            _res['s'] = -10
            _res['errmsg'] = g.L('global_valerr')
            return _res

        # 奖励已领取
        if idx in hdData.get('reclist', []):
            _res['s'] = -11
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _prize = _con['prize'][idx]['win']
        _set = {'$push': {'reclist': idx}}
    g.m.huodongfun.setHDData(uid, hdid, _set)

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "void_storm"})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid, keys='_id,val,fightless,boss,mowanghp,reclist,over')
    _rData["prize"] = _prize

    return _rData

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _info = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,date,val,reclist,over,boss')
    # 有挑战次数
    if g.C.DATE(g.C.NOW()) != _info['date'] or (g.C.DATE(g.C.NOW()) == _info['date'] and _info.get('val', 0) < g.GC['voidstorm']['dailynum']):
        _retVal = True
    # boss的索引大于0 表示至少打赢第一个boss   没有领取   获取boss等于6 有over  也没有领取
    elif _info.get('boss',0)>0 and (_info['boss']-1 not in _info.get('reclist',[]) or (_info['boss']==6 and _info.get('over') and _info['boss'] not in _info.get('reclist',[]))):
        _retVal = True

    return _retVal

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """

    setData = {'val':0,'gotarr':[],'date':g.C.DATE(g.C.NOW()),'reclist':[]}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a