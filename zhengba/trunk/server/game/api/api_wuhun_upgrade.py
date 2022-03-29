# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
武魂———强化
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [武魂tid:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _res = {}
    _wid = data[0]

    _wuhun = g.mdb.find1('wuhun', {'uid': uid, '_id': g.mdb.toObjectId(_wid)}, fields=['lv','id','wearer'])
    # 武魂不存在 或者已穿戴
    if _wuhun is None:
        _res["s"] = -1
        _res["errmsg"] = g.L('global_argserr')
        return _res

    _wuhun['lv'] += 1
    _con = g.GC['wuhuncom']['base']
    # 已经升到满级了
    if str(_wuhun['lv']) not in _con['need'] or _wuhun['lv'] > _con['maxlevel']:
        _res["s"] = -2
        _res["errmsg"] = g.L('global_lverr')
        return _res

    _need = list(_con['need'][str(_wuhun['lv'] - 1)]['need'])

    # 同名的武魂
    _chives = g.mdb.find('wuhun',{'uid':uid,'id':_wuhun['id'],'lv':1,'_id':{'$ne':_wuhun['_id']},'wearer':{'$exists':0}},fields={'_id':1},limit=_con['need'][str(_wuhun['lv'] - 1)]['num'])
    _num = len(_chives)
    if _num < _con['need'][str(_wuhun['lv'] - 1)]['num']:
        _need.append({'a':'item','t':_con['item'],'n':_con['need'][str(_wuhun['lv'] - 1)]['num']-_num})

    _chk = g.chkDelNeed(uid, _need)
    # 材料不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res


    _res['wuhun'] = _wuhun
    _res['need'] = _need
    _res['delete'] = map(lambda x:x['_id'], _chives)
    return _res


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _send = {}
    if _chkData['delete']:
        # 删除韭菜武魂
        g.mdb.delete('wuhun', {'uid':uid,'_id':{'$in':_chkData['delete']}})
        _send['wuhun'] = {str(i): {'num': 0} for i in _chkData['delete']}

    _sendData = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'wuhun_upgrade','lv':_chkData['wuhun']['lv'], "whid": _chkData['wuhun']["id"]})
    g.mergeDict(_send, _sendData)

    g.mdb.update('wuhun', {'uid':uid,'_id':_chkData['wuhun']['_id']}, {'lv': _chkData['wuhun']['lv']})
    g.mergeDict(_send, {'wuhun': {str(_chkData['wuhun']['_id']): {'lv': _chkData['wuhun']['lv']}}})

    g.mc.delete('wuhun_{0}'.format(data[0]))
    if 'wearer' in _chkData['wuhun']:
        # 穿戴装备
        _sendData = g.m.herofun.reSetHeroBuff(uid, _chkData['wuhun']['wearer'], ['wuhun'])
        g.mergeDict(_send, {'hero': _sendData})


    g.sendChangeInfo(conn, _send)
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ["5e9fbd579e2178edaa0d8d2a"]
    _r = doproc(g.debugConn, data)
    print _r
