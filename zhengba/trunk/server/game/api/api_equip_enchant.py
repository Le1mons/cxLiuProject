#!/usr/bin/python
# coding:utf-8
'''
装备 - 装备附魔
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

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # # 职业
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
    _idx = _enchant.get('idx', 0)
    _type = _con['order'][_idx]
    _lv = _enchant['data'].get(_type,0) + 1
    # 等级达到上限
    if str(_lv) not in _con['common']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_maxlv')
        return _res

    _need = _con['need'][str(_lv)]
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

    if _type not in _enchant['data']:
        _enchant['data'][_type] = _lv
    else:
        _enchant['data'][_type] += 1

    _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'equip_enchant','lv':_lv})

    # 检测附魔大师等级
    _masterLv = 0
    # 所有部件都生过级
    if len(_enchant['data']) == 4:
        _masterLv = min(_enchant['data'].values()) / _con['modulus']

    # 下次升级只能升级当前type+1
    _idx = (_idx + 1) % len(_con['order'])
    g.m.equipfun.setEnchantInfo(uid, {'data.{}'.format(_type):_lv, 'masterlv':_masterLv,'lasttime':g.C.NOW(), 'idx': _idx})

    # 设置附魔的commonbuff
    _extBuff = g.m.equipfun.getEnchantBuff(str(_masterLv), _enchant['data'])
    # 如果大师等级有改变  就需要更新所有的buff 此类职业hero的buff
    _w = {'weardata.{}'.format(_type): {'$exists': 1}, 'lv':{'$gt':1}}
    # 等级和之前不一样  并且没有超过配置
    if _enchant['masterlv'] != _masterLv and str(_masterLv) in _con['master']:
        _w = {'lv':{'$gt':1}}
    g.m.userfun.setCommonBuff(uid, {'buff.enchant': _extBuff, 'buff.equipmaster': g.m.equipfun.getMasterBuff(uid)})
    _r = g.m.herofun.reSetAllHeroBuff(uid, _w) or {}

    g.mergeDict(_sendData, {'hero': _r})
    g.sendChangeInfo(conn, _sendData)
    return _res

if __name__ == "__main__":
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = ['1']
    _r = doproc(g.debugConn, data)
    print _r