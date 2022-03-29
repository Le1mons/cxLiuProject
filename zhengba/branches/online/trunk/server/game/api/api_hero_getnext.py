#!/usr/bin/python
# coding: utf-8
'''
英雄——获取下一级的属性
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _act = data[0]
    tid = str(data[1])
    _hero = g.m.herofun.getHeroInfo(uid, tid)
    if not _hero:
        # 无英雄信息
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    if _act == 'lv':
        _lv = _hero['lv']+1
        _lv_conf = g.m.herofun.getHeroComCon()['herolvup']

        # 超过英雄最大等级
        if str(_lv) not in _lv_conf:
            _res['s'] = -2
            _res['errmsg'] = g.L('hero_getnext_res_-2')
            return _res

        _hero['lv'] += 1

    elif _act == 'dengjielv':
        _hid = _hero['hid']
        _star = g.m.herofun.getHeroCon(_hid)['star']
        _djlv = _hero['dengjie'] + 1

        # 已升至hero最大品质
        if _djlv > _star or _djlv > g.GC['herocom']['maxdengjie']:
            _res['s'] = -4
            _res['errmsg'] = g.L('hero_getnext_res_-4')
            return _res

        _lv_conf = g.m.herofun.getHeroComCon()['herojinjieup']

        # 超过英雄最大等阶
        if str(_djlv) not in _lv_conf:
            _res['s'] = -3
            _res['errmsg'] = g.L('hero_getnext_res_-3')
            return _res

        _hero['dengjielv'] += 1
        _hero['dengjie'] += 1
        _heroBuff = []
        _skill = g.m.herofun.getOpenBDSkill(uid, _hero)
        _con = g.GC.skill
        for bid in _skill:
            skill = _con[bid]
            _attr = str(skill['type'])
            if _attr != '1':
                continue
            # 该被动技能如果已存在
            if 'herobuff' in _hero and 'bdskillbuff' in _hero['herobuff'] and \
                    {skill['attr']: skill['v']} in _hero['herobuff']['bdskillbuff']:
                continue
            _heroBuff.append({skill['attr']:skill['v']})

        if 'herobuff' in _hero and 'bdskillbuff' in _hero['herobuff']:
            _hero['herobuff']['bdskillbuff'] += _heroBuff
        else:
            _hero['herobuff'] = {'bdskillbuff': _heroBuff}


    elif _act == 'star':
        _hid = _hero['hid']
        _star = g.GC['herostarup'][_hid]
        _djlv = _hero['dengjielv'] + 1

        # 已升至hero最大星级
        if _djlv not in _star:
            _res['s'] = -5
            _res['errmsg'] = g.L('hero_getnext_res_-5')
            return _res

        _hero['star'] += 1

    _next_buff = g.m.herofun.caleHeroBuff(uid, _hero)
    _resData = {'buff':_next_buff}
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("wow001")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["dengjielv","5b6abb7ea8578f6d889326ee"])