#!/usr/bin/python
# coding: utf-8
'''
英雄——升级
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: ["5d2da49d0ae9fe3a60067a83"升级英雄tid]
    :return:
    ::

        {'s': 1}
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    #英雄tid
    tid = str(data[0])
    _hero = g.m.herofun.getHeroInfo(uid, tid, keys='lv,dengjielv,hid,star')
    if _hero == None:
        #无英雄信息
        _res['s'] = -2
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _hid = str(_hero['hid'])
    _con = g.m.herofun.getHeroCon(_hid)
    _djlv= int(_hero['dengjielv'])
    _maxLv = g.m.herofun.getMaxLv(_hid,_djlv)
    gud = g.getGud(uid)

    # 有共鸣
    if gud.get('resonance') and _hero['star'] >= g.GC['herocom']['resonance']['star']:
        _maxLv += g.mdb.count('hero', {'uid': uid, 'star': {'$gte': g.GC['herocom']['resonance']['star']}}) * g.GC['herocom']['resonance']['lv']

    # 加上等级限制
    if _maxLv > g.GC['herocom']['resonance']['maxlv']:
        _maxLv = g.GC['herocom']['resonance']['maxlv']


    _hlv = _hero['lv']
    if _hlv >= _maxLv or str(_hlv) not in g.GC['herocom']['herolvup']:
        #英雄等级已达上限
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_lvup_res_-1')
        return _res

    if _hlv >= 60:
        _needExp = g.GC['herocom']['herolvup'][str(_hlv)]['maxexp']
        _needJinbi = list(g.GC['herocom']['herolvup'][str(_hlv)]['need'])
        _need = [{'a':'attr','t':'useexp','n':_needExp}]+_needJinbi
        _hlv += 1
    else:
        _maxUpLv = _hlv + 5
        # _jinbi = g.GC['herocom']['herolvup'][str(_hlv)]['need'][0]['n']
        _needExp = _jinbi = 0
        # 最多加五级 消耗足够 在最大等级之内
        while gud['useexp']>=_needExp+g.GC['herocom']['herolvup'][str(_hlv)]['maxexp'] and gud['jinbi']>=_jinbi+g.GC['herocom']['herolvup'][str(_hlv)]['need'][0]['n'] and _hlv<60 and _hlv<_maxLv and _hlv<_maxUpLv:
            _needExp += g.GC['herocom']['herolvup'][str(_hlv)]['maxexp']
            _jinbi += g.GC['herocom']['herolvup'][str(_hlv)]['need'][0]['n']
            _hlv += 1

        if not _needExp or not _jinbi:
            _res['s'] = -100
            _res['attr'] = 'jinbi' if gud['useexp']>=_needExp+g.GC['herocom']['herolvup'][str(_hlv)]['maxexp'] else 'useexp'
            return _res

        _need = [{'a':'attr','t':'useexp','n':_needExp},{'a':'attr','t':'jinbi','n':_jinbi}]

    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chkRes['t']
        else:
            _res["s"] = -104
            _res[_chkRes['a']] = _chkRes['t']
        return _res

    #删除经验
    _resLv = _hlv
    _sendData = g.delNeed(uid, _need, logdata={'act': 'hero_lvup','lv':_resLv,'hid':_hid})
    g.m.herofun.updateHero(uid, tid, {'lv': _resLv})
    # 重置英雄buff
    _reBuff = g.m.herofun.reSetHeroBuff(uid, tid,['herobase'])
    _reBuff[tid]['lv'] = _resLv
    _sendData.update({'hero':_reBuff})
    # 返回进阶后的英雄buff以及下一阶的buff与需要物品
    g.sendChangeInfo(conn,_sendData)
    g.event.emit('kfkh',uid,16,3,cond=_resLv)
    g.event.emit('JJCzhanli',uid,tid)
    # 神器任务
    g.event.emit('artifact', uid, 'yingxionglv',val=_resLv,isinc=0)
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5e8ebe979dc6d65a6e83e57d"])