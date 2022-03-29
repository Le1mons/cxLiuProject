#! /usr/bin/python
# -*-coding:utf-8-*-
"""
龙骑试炼
"""
from ZBFight import ZBFight


import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 46
import g

def getDataByDate(uid, hdinfo):
    _res = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,date,dps,dailydps')
    _date = g.C.DATE(g.C.NOW())
    if _res['date'] != _date:
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'val':hdinfo['data']['dailynum'],'date':_date,'dailydps':0})
        _res['val'] = hdinfo['data']['dailynum']
        _res['dailydps'] = 0
    return _res


def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    hdData = getDataByDate(uid, hdinfo)
    _retVal = {"info":hdinfo["data"],"myinfo":hdData, 'rank': getRankData(hdinfo['hdid'])}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    _fightData = kwargs['idx']
    act = int(kwargs['act'])
    # 是否扫荡
    _sweep = bool(kwargs['wxcode'])
    hdid = hdinfo['hdid']
    _myData = getDataByDate(uid, hdinfo)

    if act == 1:
        if _sweep:
            if _myData.get('dailydps', 0) <= 0:
                _res['s'] = -2
                _res['errmsg'] = g.L('global_argserr')
                return _res
        else:
            # 必须上阵六个
            if 'sqid' in _fightData and len(_fightData) < 7 or len(_fightData) < 6:
                _res['s'] = -1
                _res['errmsg'] = g.L('global_argserr')
                return _res

            # 检查战斗参数
            _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
            if _chkFightData['chkres'] < 1:
                _res['s'] = _chkFightData['chkres']
                _res['errmsg'] = g.L(_chkFightData['errmsg'])
                return _res

        # 挑战次数不足
        if _myData['val'] <= 0:
            _need = hdinfo['data']['pkneed']
            _chk = g.chkDelNeed(uid, _need)
            if not _chk['res']:
                if _chk['a'] == 'attr':
                    _res['s'] = -100
                    _res['attr'] = _chk['t']
                else:
                    _res["s"] = -104
                    _res[_chk['a']] = _chk['t']
                return _res
            _sendData = g.delNeed(uid, _need, logdata={'act': 'dragon_knight'})
            g.sendUidChangeInfo(uid, _sendData)

        _prize, _dlzprize = [], []
        if _sweep:
            _dps = _myData['dailydps']
        else:
            _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
            f = ZBFight('pvm')
            _fightRes = f.initFightByData(_userFightData + list(g.GC['dragonknight'][hdinfo['data'].get('key','1')]['boss']['boss'])).start()

            # 趣味成就
            g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

            _fightRes['headdata'] = [_chkFightData['headdata'], g.GC['dragonknight'][hdinfo['data'].get('key','1')]['boss']['headdata']]
            _winside = _fightRes['winside']
            _dps = _fightRes['dpsbyside'][0]
            # 设置单场最高伤害
            setTopDps(uid, hdid, _fightRes['dpsbyside'][0])
            _fightRes['prize'] = _prize
            _fightRes['dlzprize'] = _dlzprize
            _rData["fightres"] = _fightRes

        for i in g.GC['dragonknight'][hdinfo['data'].get('key','1')]['dps2dlz']:
            if _dps >= i[0]:
                _prize += i[1]['prize']
                if 'dlz' in i[1]:
                    _temp = g.m.diaoluofun.getGroupPrize(i[1]['dlz'])
                    _prize += _temp
                    _dlzprize += _temp
            else:
                break

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
        _prize = g.fmtPrizeList(_prize)
        if not _sweep:
            _fightRes['prize'] = _prize

        _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprinze", "hdid": hdid})
        for k, v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _set = {'$inc': {'dps': _dps}, '$set': {'dailydps': _dps}}

        if _myData['val']:
            _set['$inc']['val'] = -1

        g.m.huodongfun.setHDData(uid, hdid, _set)
        _rData["cinfo"] = _changeInfo
        _rData["prize"] = _prize
        _rData["dlzprize"] = _dlzprize
        _rData["myinfo"] = getDataByDate(uid, hdinfo)
        _rData["rank"] = getRankData(_sweep)
        _rData["rank"]['val'] = _dps + _myData.get('dps', 0)
    else:
        _rData['s'] = -1
        _rData['errmsg'] = g.L('global_argserr')

    return _rData


def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    _data = getDataByDate(uid, hdinfo)
    if _data['val'] > 0:
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
    hdinfo = g.m.huodongfun.getHuodongInfoById(hdid, iscache=1)
    setData = {'val': hdinfo['data']['dailynum'], 'gotarr': {}, 'date':g.C.DATE(g.C.NOW())}
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

def timer_sendPrize(_hdinfo):
    _w = {'ctype': 'huodong_' + str(htype) + str(_hdinfo['hdid']), 'k': g.C.DATE(g.C.NOW())}
    _data = g.mdb.find1('rankprize', _w)
    if _data:
        print "DragonKnight Already Send==", g.C.DATE(g.C.NOW()), htype
        return

    hdid = _hdinfo['hdid']
    _all = g.mdb.find('hddata',{'hdid':hdid,'dps':{'$gt':0}},sort=[['dps',-1]],fields=['dps','_id','uid'])
    if not _all:
        return

    # 单场场最高伤害
    _topData = g.mdb.find1('gameattr', {'ctype': "dragonknight_topdps", 'uid': 'SYSTEMP', 'k': _hdinfo['hdid']},fields=['_id', 'v', 'name'])
    if not _topData:
        print "DragonKnight no top=="
        return

    _przie = []
    _con = g.GC['dragonknight'][_hdinfo['data'].get('key','1')]
    for i in _con['dailyprize']:
        if _topData['v'] >= i[0]:
            _przie = i[1]['prize']
        else:
            break

    _addEmailData,_dpsData = [], []
    for i in _all:
        _dpsData.append(i['uid'])
        _emailData = g.m.emailfun.fmtEmail(
            title=_con['email']['title'],
            uid=i['uid'],
            content=_con['email']['content'].format(_topData['name'],_topData['v']),
            prize = _przie
        )
        _addEmailData.append(_emailData)
    g.mdb.insert('email',_addEmailData)

    g.mdb.update('hddata',{'hdid':hdid},{'dps':0})
    g.mdb.delete('gameattr', {'ctype': "dragonknight_topdps", 'uid': 'SYSTEMP', 'k': _hdinfo['hdid']})
    g.mdb.update('rankprize', _w, {'v': _dpsData, 'dps': _topData['v'],'lasttime':g.C.NOW()}, upsert=True)

def getRankData(hdid, sweep=False):
    _res = g.mc.get('dragon_knight_rank')
    if sweep or not _res:
        _res = {'ranklist': []}
        _all = g.mdb.find('hddata', {'hdid': hdid,'dps':{'$gt': 0}}, sort=[['dps', -1]], fields=['dps', '_id', 'uid'],limit=50)
        for idx,i in enumerate(_all):
            _temp = {}
            _temp['rank'] = idx + 1
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['dps']
            _res['ranklist'].append(_temp)

        # 单场场最高伤害
        _topData = g.mdb.find1('gameattr', {'ctype': "dragonknight_topdps", 'uid': 'SYSTEMP', 'k':hdid},fields=['_id','v','name']) or {'v':0,'name':''}
        _res['topdps'] = _topData['v']
        _res['name'] = _topData['name']

        g.mc.set('dragon_knight_rank', _res, 20)

    return _res

# 设置单场最高伤害
def setTopDps(uid, hdid, dps):
    _topData = g.mdb.find1('gameattr', {'ctype': "dragonknight_topdps", 'uid': 'SYSTEMP', 'k': hdid}) or {'v': 0}
    _topDps = _topData['v']
    if dps <= _topDps:
        return

    g.mdb.update('gameattr', {'ctype': "dragonknight_topdps", 'uid': 'SYSTEMP','k': hdid},{'v': dps,'name':g.getGud(uid)['name']}, upsert=True)




if __name__ == "__main__":
    uid = g.buid("xuzhao")
    g.mc.flush_all()
    # hdidinfo = g.m.huodongfun.getHDinfoByHtype(htype)
    # a = getPrize(uid, hdidinfo, idx=1, act=1)
    print timer_sendPrize()