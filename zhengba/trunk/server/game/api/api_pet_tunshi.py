#!/usr/bin/python
# coding:utf-8
'''
宠物 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [宠物_id:str,宠物_id:str...]
    :return:
    ::

        {"d": 殿堂经验值
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _isPet = bool(data[0])
    _con = g.GC['petcom']['base']['palace']
    # 开区时间不足30天
    if not _isPet and g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    # 没有激活
    _crystal = g.mdb.find1('crystal', {'uid': uid}, fields={'palace': 1,'crystal':1,'play':1})
    if not _crystal or 'palace' not in _crystal:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    _w = {'$or':[{'_id':{'$in':map(g.mdb.toObjectId, data)}}, {'lv':{'$gte':_con['lv']},'pid':{'$in':[k for k,v in g.GC['pet'].items() if v['color']>=_con['color']]}}], 'uid': uid}
    if 'play' in _crystal:
        _w['_id'] = {'$nin': map(g.mdb.toObjectId, _crystal['play'].values())}
    # 要吞噬的宠物和已满足激活殿堂条件的宠物
    _pets = g.mdb.find('pet', _w, fields=['pid','lv','lock'])
    _palace, _tsPet = [], []
    for i in _pets:
        if str(i['_id']) in data:
            _tsPet.append(i)
        else:
            _palace.append(i['pid'])

    # 没有数据
    if not _tsPet:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    for i in _tsPet:
        # 此宠物没有橙色+5  不能分解
        if i['pid'] not in _palace:
            _chkData['s'] = -4
            _chkData['errmsg'] = g.L('global_valerr')
            return _chkData
        # 判断宠物是否上锁
        # 判断上锁
        if i.get("lock", 0) == 1:
            _chkData['s'] = -5
            _chkData['errmsg'] = g.L('pet_lock_-1')
            return _chkData



    _chkData['pet'] = _tsPet
    _chkData['exp'] = _crystal['palace']
    _chkData['crystal'] = _crystal
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _con = g.GC['petupgrade']
    _addExp = sum(_con[i['pid']][str(i['lv'])].get('exp', 0) for i in _chkData['pet'])
    _addExp = 100
    g.mdb.update('crystal', {'uid': uid}, {'$inc': {'palace': _addExp}})
    g.mdb.delete('pet', {'uid': uid,'_id':{'$in':map(lambda x:x['_id'], _chkData['pet'])}})
    g.sendChangeInfo(conn, {'pet': {i:{'num':0} for i in data}})

    _preLv = g.m.petfun.getPalaceLv(_chkData['crystal']['palace'])
    _chkData['crystal']['palace'] += _addExp
    _curLv = g.m.petfun.getPalaceLv(_chkData['crystal']['palace'])

    # 计算buff
    if _preLv != _curLv:
        _buff = g.m.petfun.getBuff(_chkData['crystal'])
        g.m.userfun.setCommonBuff(uid, {'buff.crystal': [_buff]})
        _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})
        if _r:
            g.sendChangeInfo(conn, {'hero': _r})

    _res['d'] = {'exp': _chkData['crystal']['palace']}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5f62d74210af7e8e6fba3390'])