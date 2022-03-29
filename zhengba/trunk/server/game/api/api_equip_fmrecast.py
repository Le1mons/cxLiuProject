#!/usr/bin/python
# coding:utf-8
'''
装备 - 装备附魔重铸
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [职业:str]
    :return:
    ::

        {'d': {'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 职业
    # _job = str(data[0])
    # # 参数有误
    # if _job not in ('1','2','3','4','5'):
    #     _res['s'] = -1
    #     _res['errmsg'] = g.L('global_argserr')
    #     return _res

    # 等级不足
    if not g.chkOpenCond(uid, 'enchant'):
        _res['s'] = -10
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['equip_enchant']['base']
    _enchant = g.m.equipfun.getEnchantInfo(uid)
    # 没有附魔 无需重铸
    if not _enchant['data']:
        _res['s'] = -2
        _res['errmsg'] = g.L('equip_fmrecast_-2')
        return _res

    _need = _con['recast']
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

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'equip_fmrecast_del'})
    _lvList = _enchant['data'].values()
    if len(_lvList) != 4:
        _lvList += [0]*(4-len(_lvList))
    _minlv = min(_lvList)
    _prize = []
    for i in range(1, _minlv + 2):
        if i not in _lvList and i > _minlv:
            continue

        for x in _con['need'][str(i)]:
            if i == _minlv+1 and i in _lvList:
                x['n'] *= _lvList.count(i)
            else:
                x['n'] *= 4
            # if x['t'] == 'useexp':
            #     x['n'] /= 2

            _prize.append(x)

    _prize = g.fmtPrizeList(_prize)
    _pData = g.getPrizeRes(uid, _prize, {'act':"fmrecast",'data':_enchant['data']})
    g.mergeDict(_sendData, _pData)
    g.m.equipfun.setEnchantInfo(uid, {'$unset':{'data':1,'idx':1,'masterlv':1},'$set':{'lasttime':g.C.NOW()}})

    g.m.userfun.setCommonBuff(uid, {'$unset':{'buff.enchant': 1,'buff.equipmaster': 1},'$set':{'lasttime':g.C.NOW()}})
    _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv':{'$gt':1},'weardata':{'$exists':1}}) or {}

    g.mergeDict(_sendData, {'hero': _r})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == "__main__":
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['1']
    _r = doproc(g.debugConn, data)
    print _r