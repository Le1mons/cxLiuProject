# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———  添加饰品
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
    heroid = data[0]
    _needList = data[1]
    if not _needList:
        _res['s'] = -10
        _res['errmsg'] = g.L('shipin_upstar_res_-10')
        return _res

    _wearInfo = g.m.herofun.getUserwearInfo(uid, heroid)

    # 在userwear 表里查不到对应数据
    if not _wearInfo or '5' not in _wearInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('shipin_upstar_res_-1')
        return _res

    _needItem = [{'a':'shipin','t':k,'n':v} for k, v in _needList.items()]

    _chk = g.chkDelNeed(uid, _needItem)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    spid = _wearInfo['5']
    _shipinCon = g.m.shipinfun.getShipinCon(spid)

    # 已达到最大星级
    if not _shipinCon['upid']:
        _res['s'] = -3
        _res['mrrmsg'] = g.L('shipin_upstar_res_-3')
        return _res

    _upid = _shipinCon['upid']
    _upexp = int(_shipinCon['upexp'])
    _allExp = g.m.shipinfun.getTgExp(_needList)

    # 提供的经验比需要的经验少
    if _upexp > _allExp:
        _res['s'] = -2
        _res['errmsg'] = g.L('shipin_upstar_res_-2')
        return _res

    _delItemList = []
    for _spid in _needList:
        _delDict = {'a': 'shipin'}
        _num = _needList[_spid]
        _delDict['t'] = _spid
        _delDict['n'] = _num
        _delItemList.append(_delDict)

    _delInfo = g.delNeed(uid, _delItemList, issend=0,logdata={'act': 'shipin_upstar','id': _upid})

    # 设置穿戴信息
    _shipinInfo = g.m.herofun.setUserWearInfo(uid, heroid, '5', _upid)
    # 更新数据库对应信息
    # _spData = g.m.herofun.updateByUserWear(uid, heroid, '5', _upid)
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, heroid,['shipin'])
    _heroBuff[heroid].update(_shipinInfo)
    _sendData={'hero':_heroBuff}
    _sendData['shipin']=_delInfo['shipin']

    # 多的经验换成 星界精华 返回给玩家
    _essence_num = int((_allExp - _upexp) * 0.1)
    # 星界精华的id
    _spid = '1001'
    if _essence_num > 0:
        _spData = g.m.shipinfun.changeShipinNum(uid, _spid, _essence_num)
        _sendData['shipin'].update(_spData)
        _res['d'] = {'prize': [{'a':'shipin','t':_spid,'n':_essence_num}]}
    g.sendChangeInfo(conn, _sendData)
    g.event.emit('JJCzhanli', uid, heroid)
    return _res


if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    data = ["5b92c298e13823142fdda922",{"1001":19}]
    _r = doproc(g.debugConn, data)
    print _r