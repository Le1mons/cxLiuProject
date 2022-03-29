# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———添加饰品
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: ['627601'饰品id, '5d2db17c0ae9fe3a60067ac2'英雄tid]
    :return:
    ::

        {'s': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    spid = str(data[0])
    heroid = data[1]
    _shipinInfo = g.m.shipinfun.getShipinInfo(uid, spid)
    # 饰品不存在
    if not _shipinInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('shipin_wearshipin_res_-1')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, heroid)
    # 英雄信息有误
    if not _heroInfo:
        _res["s"]=-103
        _res["errmsg"]=g.L('global_heroerr')
        return _res

    _wearList = g.m.herofun.getUserwearInfo(uid, heroid)
    # 如果已穿戴装备 并且穿戴了饰品
    if _wearList and '5' in _wearList:
        # 获取之前穿戴的饰品spid
        _pre_spid = _wearList['5']
        _send = g.m.shipinfun.changeShipinNum(uid, _pre_spid)
        g.sendChangeInfo(conn, {'shipin': _send})
    # 穿戴装备
    _wearData = g.m.herofun.setUserWearInfo(uid, heroid, '5', spid)
    _spdata = g.m.herofun.updateByUserWear(uid, heroid, '5', spid)
    _sendData = g.m.herofun.reSetHeroBuff(uid, heroid, ['shipin'])

    # 获取饰品的当前信息
    # _shipinData = g.m.shipinfun.getShipinInfo(uid,spid)
    _sendData[heroid].update(_wearData)
    g.sendChangeInfo(conn, {'hero':_sendData,'shipin':_spdata})
    g.event.emit('JJCzhanli', uid, heroid)
    if _shipinInfo['color'] >= 5:
        g.m.dball.writeLog(uid, 'wearshipin',{'hid':heroid,'sp': _spdata})
    # 加一条日志
    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['627601', '5d2db17c0ae9fe3a60067ac2']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
