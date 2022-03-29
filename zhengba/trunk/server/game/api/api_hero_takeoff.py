#!/usr/bin/python
# coding:utf-8
'''
英雄--脱下装备
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: ["5d2db17c0ae9fe3a60067ac2"英雄tid,"3"装备位置]
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
    # 英雄唯一id
    tid = data[0]
    # 装备类型
    _type = str(data[1])
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄不存在
    if not _heroInfo:
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    # 穿戴信息不存在 或者 type不在穿戴信息里
    if not _heroInfo.get('weardata')  or _type not in _heroInfo.get('weardata'):
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_takeoff_res_-3')
        return _res

    _wearData = _heroInfo.get('weardata')
    _eid = _heroInfo['weardata'][_type]
    _data = g.m.herofun.takeOffUserWear(uid, tid, _type, _eid)
    del _wearData[_type]
    _sendData = g.m.herofun.reSetHeroBuff(uid, tid)
    _sendData[tid].update({'weardata': _wearData})
    _send = {'hero':_sendData}
    # 如果是饰品就要加上新数据
    if _type == '5':
        # _shipinData = g.mdb.find1('shipin',{'uid':uid,'spid':_eid})
        # _tid = str(_shipinData['_id']);del _shipinData['_id']
        _send.update({'shipin': _data})
    else:
        # _eqData = g.mdb.find1('equiplist', {'uid': uid, 'eid': _eid})
        # _tid = str(_eqData['_id']);del _eqData['_id']
        _send.update({'equip': _data})


    g.sendChangeInfo(conn,_send)
    g.event.emit('JJCzhanli', uid, tid)

    return _res

if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5d2db17c0ae9fe3a60067ac2","3"])
