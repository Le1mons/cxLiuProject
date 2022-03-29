# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
十字军远征 ——— 开启界面
'''
from __future__ import division


import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int]
    :return:
    ::

        {'d': {'rival': {'索引': {'headdata':{},'isnpc':是否npc,'sname':区服名,'zhali':战力}}
                'prizelist': [以领取的阶段奖励索引],
                'passlist':[通关索引],
                'status': {英雄tid: {’hp‘: 剩余hp,'maxhp':最大hp,'nuqi':怒气}},
                'iszchd': 是否存在远征的周常活动
                'supply': {'补给品id': 数量},
                'difficult': 当前难度
        }
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
    if not g.chkOpenCond(uid, 'shizijun_1'):
        _res['s'] = -3
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    # 记录是否今天打开过
    # g.setAttr(uid, {'ctype':'shizijun_hongdian'},{'v':1})
    if not _data:
        # 如果数据不存在就全都格式化好存入数据库
        # _rival = g.m.shizijunfun.getRivalList(uid, 0, [uid])
        _rival = []
        _prizeList = []
        _passList = []
        _status ={}
        _difficult = 0
        # _data = {'v':{'0':_rival['0']},'prizelist':_prizeList,'passlist':_passList,'black':_rival['black'],'status':{},'fightless':{}}
        # _rival.pop('black')
        # g.setAttr(uid,{'ctype':_ctype},_data)
    else:
        _rival = _data[0]['v']

        _fightLess = _data[0].get('fightless')
        _prizeList = _data[0]['prizelist']
        _passList = _data[0]['passlist']
        _status = _data[0].get('status',{})
        _difficult = _data[0].get('diff', 1)
        # 继承残余血量
        if _fightLess:
            for k,v in _rival.items():
                _temp = []
                # 并且没有通关  and int(k) not in _passList
                if k in _fightLess and int(k) not in _passList:
                    for i in _rival[k]['rival']:
                        if 'pos' in i and 'hid' in i and str(i['pos']) in _fightLess[k].keys():
                            if 'yj' in _fightLess[k]:
                                if i['pos'] == 7:
                                    i['pos'] = _fightLess[k]['yj']
                                elif i['pos'] == _fightLess[k]['yj']:
                                    continue
                            i['hp'] = int( int(_fightLess[k][str(i['pos'])]) / 100 * i['maxhp'])
                        _temp.append(i)
                    _rival[k]['rival'] = _temp

        for k in _rival:
            _rival[k]['rival'] = filter(lambda x:'pid' not in x and  x.get("pos", 0) != 7, _rival[k]['rival'])

    for i in _status:
        _status[i]['hp'] = int(0.01 * _status[i]['hp'] * _status[i]['maxhp'])
    # 处在远征周常活动任务中
    _addition = 0
    if _difficult and g.m.huodongfun.chkZCHDopen('shizijun'):
        _info = g.mdb.find1('hdinfo', {'htype': 14, 'etime': {'$gte': g.C.NOW()},'data.mark':'shizijun', 'stime':{'$lte': g.C.NOW()}})
        # 赏金奇兵活动存在
        if _info:
            _addition = _info['data']['addition']

    # 2018-11-21 十字军物品道具
    _supply = g.getAttrByCtype(uid, 'shizijun_supply', bydate=False, default={})
    _res['d'] = {'rival':_rival,'prizelist':_prizeList,'passlist':_passList,'status':_status,'iszchd':_addition,'supply':_supply,'difficult':_difficult}
    return _res


if __name__ == '__main__':
    uid = g.buid("chiyuan124")
    g.debugConn.uid = uid
    data = []
    _r = doproc(g.debugConn, data)
    print _r