# coding: utf-8
#!/usr/bin/python
# coding: utf-8
from __future__ import division

'''
十字军远征 ——— 开启界面
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
    _ctype = 'shizijun_data'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    # 记录是否今天打开过
    # g.setAttr(uid, {'ctype':'shizijun_hongdian'},{'v':1})
    if not _data:
        # 如果数据不存在就全都格式化好存入数据库
        _rival = g.m.shizijunfun.getRivalList(uid, 0, [uid])
        _prizeList = []
        _passList = []
        _status ={}
        _data = {'v':{'0':_rival['0']},'prizelist':_prizeList,'passlist':_passList,'black':_rival['black'],'status':{},'fightless':{}}
        _rival.pop('black')
        g.setAttr(uid,{'ctype':_ctype},_data)
    else:
        _rival = _data[0]['v']
        _fightLess = _data[0].get('fightless')
        _prizeList = _data[0]['prizelist']
        _passList = _data[0]['passlist']
        _status = _data[0].get('status',{})
        # 继承残余血量
        if _fightLess:
            for k,v in _rival.items():
                # 并且没有通关  and int(k) not in _passList
                if k in _fightLess and int(k) not in _passList:
                    for i in _rival[k]['rival']:
                        if 'pos' in i and str(i['pos']) in _fightLess[k].keys():
                            #print 'less',_fightLess[k][str(i['pos'])]
                            #print 'max',i['maxhp']
                            
                            i['hp'] = int( int(_fightLess[k][str(i['pos'])]) / 100 * i['maxhp'] )
                            #print 'hp',i['hp']
    for i in _status:
        _status[i]['hp'] = int(0.01 * _status[i]['hp'] * _status[i]['maxhp'])
    # 处在远征周常活动任务中
    _addition = 0
    if g.m.huodongfun.chkZCHDopen('shizijun'):
        _info = g.mdb.find1('hdinfo', {'htype': 14, 'etime': {'$gte': g.C.NOW()},'data.mark':'shizijun', 'stime':{'$lte': g.C.NOW()}})
        # 赏金奇兵活动存在
        if _info:
            _addition = _info['data']['addition']

    # 2018-11-21 十字军物品道具
    _supply = g.getAttrByCtype(uid, 'shizijun_supply', bydate=False, default={})
    _res['d'] = {'rival':_rival,'prizelist':_prizeList,'passlist':_passList,'status':_status,'iszchd':_addition,'supply':_supply}
    return _res


if __name__ == '__main__':
    uid = g.buid("jingqi_1810161000122676")
    # g.debugConn.uid = uid
    # data = ['5b07b65bc0911a308c01f02c', {'2054': 100}]
    # _r = doproc(g.debugConn, data)
    g.getPrizeRes(uid, [{'a':'equip','t':'3032','n':1},{'a':'equip','t':'3032','n':1}])