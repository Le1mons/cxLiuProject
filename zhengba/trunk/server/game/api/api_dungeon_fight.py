#!/usr/bin/python
# coding:utf-8
'''
神殿地牢 - 战斗
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight



def proc(conn, data):
    """

    :param conn:
    :param data: [那条路:str (1,2,3), 玩家阵容:dict]
    :return:
    ::

        {'d': {'fightres': {}, 'prize': []},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 挑战哪条路
    _type = str(data[0])
    _comCon = g.GC['dungeoncom']['base']
    # 参数错误
    if _type not in _comCon['road']:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 等级不足
    # if not g.chkOpenCond(uid, 'dungeon'):
    #     _res['s'] = -1
    #     _res['errmsg'] = g.L('global_limitlv')
    #     return _res

    # 玩家的阵容
    _fightData = data[1]

    _con = g.GC['dungeon']
    _data = g.mdb.find1('dungeon',{'uid': uid},fields=['_id','layer','recdict']) or {'layer':{}}
    # 当前处于的层数
    x = _data['layer'].get(_type, 0) + 1
    if x % 10 == 0:
        x -= 1
    _layer = str(int(_type)*10000 + _data['layer'].get(_type, 0) + 1)
    # 已经打通关了
    if _layer not in _con:
        _res['s'] = -2
        _res['errmsg'] = g.L('dungeon_fight_-2')
        return _res

    _byType = _comCon['road'][_type]['zhiyue']
    y = _data['layer'].get(_byType, 0)
    # 受到了其他路的制约
    if eval(_comCon['road'][_type]['why']):
        _res['s'] = -3
        _res['errmsg'] = g.L('dungeon_fight_-3')
        return _res

    # 战斗次数不足
    if g.m.dungeonfun.getFightNum(uid) <= 0:
        _res['s'] = -4
        _res['errmsg'] = g.L('dungeon_fight_-4')
        return _res

    _heroData = g.mdb.find('hero',{'uid':uid,'_id':{'$in':map(g.mdb.toObjectId, [_fightData[i] for i in _fightData if i != 'sqid'])}})
    _zzList = filter(lambda x:x['zhongzu'] in _comCon['road'][_type]['zhongzu'], _heroData)
    _num = len(_fightData) - 1 if _fightData.get('sqid') else len(_fightData)
    # 只能上阵规定种族的
    if len(_zzList) != _num:
        _res['s'] = -5
        _res['errmsg'] = g.L('dungeon_fight_-5')
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData, herodata=_heroData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    # boss战斗信息
    _bossFightData = g.m.fightfun.getNpcFightData(_con[_layer]['boss'])
    # 周一到周六额外增加属性
    for i in _userFightData:
        if 'hid' not in i or (g.C.WEEK() not in (0, i['zhongzu'])) :
            continue
        _modulus = 1.2 if g.C.WEEK() != 0 else 1.1
        i['atk'] = int(_modulus * i['atk'])
        i['hp'] = int(_modulus * i['hp'])
        i['maxhp'] = int(_modulus * i['maxhp'])

    f = ZBFight('pve')
    _fightRes = f.initFightByData(_userFightData + _bossFightData['herolist']).start()
    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _bossFightData['headdata']]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    # 如果胜利了
    if _winside == 0:
        g.m.dungeonfun.addRecording(uid,_type,_fightRes,x,_chkFightData['zhanli'])
        # 扣除一次战斗次数
        g.m.dungeonfun.setFightNum(uid)

        _resData['prize'] = _con[_layer]['prize']
        _sendData = g.getPrizeRes(uid, _resData['prize'],{'act':'dungeon_fight','layer':x+1,'type':_type})
        g.sendChangeInfo(conn, _sendData)

        g.mdb.update('dungeon',{'uid':uid},{'$inc':{'layer.{}'.format(_type): 1},'$set':{'lasttime':g.C.NOW()}}, upsert=True)

    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [1,{'1': "5d5ebf869dc6d602ea4e241d"}])