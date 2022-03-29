#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄 - 融魂
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 融魂的类型
    _type = data[0]
    # 英雄的tid
    tid = data[1]
    # 融魂的次数
    _num = int(data[2])
    # 玩家等级不足
    if not g.chkOpenCond(uid, 'meltsoul'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 玩家等级不足
    if _num != 1 and not g.chkOpenCond(uid, 'meltsoulnum'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitvip')
        return _res

    _heroInfo = g.m.herofun.getHeroInfo(uid, tid, keys='_id,lv,hid,meltsoul,extbuff')
    # 玩家等级不足
    if not _heroInfo:
        _res['s'] = -8
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['meltsoul'][_heroInfo['hid']]
    _comcon = g.GC['meltsoulcom']['base']
    # 英雄等级不够
    if _heroInfo['lv'] < _comcon['limitlv']:
        _res['s'] = -2
        _res['errmsg'] = g.L('hero_meltsoul_-2')
        return _res

    _extbuff = _heroInfo.get('extbuff',{})
    _curNum = 0
    if 'meltsoul' in _extbuff:
        for i in _extbuff['meltsoul']:
            if _type == i.keys()[0]:
                _curNum = i.values()[0]

    _curLv = str(_heroInfo.get('meltsoul',1))
    # 已经达到上限
    if _curLv not in _con:
        _res['s'] = -4
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 已经达到上限
    if _curNum >= _con[_curLv]['upperlimit'][_type]:
        _res['s'] = -3
        _res['errmsg'] = g.L('hero_meltsoul_-3')
        return _res

    _addNum = 0
    _crit = g.m.herofun.getBuffCrit()
    for i in xrange(_num):
        _curNum += int(_con[_curLv]['buff'][_type] * _crit)
        _addNum += 1
        if _curNum >= _con[_curLv]['upperlimit'][_type]:
            # 修正数据  不能超过上限
            _curNum = _con[_curLv]['upperlimit'][_type]
            break

    if _type == 'atk':
        _need = _comcon['atkneed'][_curLv]
    else:
        _need = _comcon['hpneed'][_curLv]
    _need = [{'a':i['a'],'t':i['t'],'n':int(i['n']*_addNum)} for i in _need]
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

    _sendData = g.delNeed(uid, _need, issend=False, logdata={'act': 'hero_meltsoul','need':_need,'hid':_heroInfo['hid']})
    g.sendChangeInfo(conn, _sendData)

    # 记录消耗 过滤经验
    _allNeed = g.getAttrByCtype(uid,'meltsoul_cost',bydate=False,default=[],k=tid)
    _resNeed = []
    for i in _need:
        if i['t'] == 'useexp':
            continue
        _resNeed.append(i)
    g.setAttr(uid, {'uid':uid,'ctype':'meltsoul_cost','k':tid}, {'v':g.fmtPrizeList(_resNeed + _allNeed)})
    # 增加extbuff里的对应属性
    _extbuff = g.m.herofun.addExtbuffVal(_extbuff, {'meltsoul':[{_type:_curNum}]}, isinc=0)
    g.m.herofun.updateHero(uid, tid, {'extbuff': _extbuff})
    _heroBuff = g.m.herofun.reSetHeroBuff(uid, tid)
    _heroBuff[tid].update({'extbuff': _extbuff,'meltsoul':_heroInfo.get('meltsoul',1)})
    g.sendChangeInfo(conn, {'hero': _heroBuff})
    _res['d'] = {'hero':_heroBuff,'crit':_crit}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['atk','5bdd04e2c0911a0cb89aee79',10])