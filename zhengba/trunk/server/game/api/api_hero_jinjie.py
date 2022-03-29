#!/usr/bin/python
# coding: utf-8
'''
英雄——英雄进阶
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: ["5d2da49d0ae9fe3a60067a83"进阶英雄的tid]
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
    tid = str(data[0])
    _hero_info = g.m.herofun.getHeroInfo(uid, tid, keys='lv,dengjielv,hid,star,dengjie')
    # 根据uid查询gud里的数据   查询的数据是None的话返回玩家不存在
    if not _hero_info:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_heroerr')
        return _res
    
    _hero_dengjie = _hero_info['dengjielv']
    _hero_lv = _hero_info['lv']
    _hero_star = _hero_info['star']

    # 判断是否进阶到最高级
    if _hero_dengjie >= _hero_star or _hero_dengjie >= g.GC['herocom']['maxdengjie']:
        _res['s'] = -1
        _res['errmsg'] = g.L('hero_jinjie_res_-1')
        return _res

    # 读取hero.json里的配置信息
    _hero_jinjie_conf = g.GC['herocom']['herojinjieup']
    _maxlv = _hero_jinjie_conf[str(_hero_dengjie)]['maxlv']

    # 判断是否达到当前等级上限
    if _hero_lv < _maxlv:
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_jinjie_res_-2')
        return _res
    _need_item = _hero_jinjie_conf[str(_hero_dengjie)]['need']

    # 再查询进阶对应等级需要的材料（金币，勇气徽章，是否有技能)
    _alt_res = g.chkDelNeed(uid, _need_item)
    if not _alt_res['res']:
        if _alt_res['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _alt_res['t']
        else:
            _res["s"] = -104
            _res[_alt_res['a']] = _alt_res['t']
        return _res

    # 删除gud里的金币和勇气徽章
    _sendData = g.delNeed(uid, _need_item, issend=False, logdata={'act': 'hero_jinjie'})
    # 更改里对应的英雄数据库里与uid和英雄id的阶级
    _resDengjie = _hero_dengjie + 1
    g.m.herofun.updateHero(uid, tid, {'dengjielv': _resDengjie,'dengjie':_resDengjie})
    # 重置英雄buff
    _hero_buff = g.m.herofun.reSetHeroBuff(uid, tid,['bdskillbuff'])
    _hero_buff[tid]['dengjielv'] = _resDengjie
    _sendData['hero']  = _hero_buff
    # 返回进阶后的英雄buff以及下一阶的buff与需要物品
    g.sendChangeInfo(conn, _sendData)
    g.event.emit('JJCzhanli', uid, tid)
    return _res


if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5d2da49d0ae9fe3a60067a83"])
