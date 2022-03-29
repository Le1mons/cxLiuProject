#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 获取遗物奖励
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [索引:int]
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
    _idx = int(data[0])
    # 等级不足
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _con = g.GC['mazecom']['base']
    _maze = g.mdb.find1('maze', {'uid': uid}, fields=['_id','relicprize','cd','relic','step','diff'])
    # 数据已存在
    if not _maze or g.C.NOW() >= _maze['cd'] or 'relicprize' not in _maze:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 参数错误
    if _idx >= _maze['relicprize']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _relic = _maze.get('relic', {})
    _relic[_maze['relicprize'][_idx]] = _relic.get(_maze['relicprize'][_idx], 0) + 1
    g.mdb.update('maze',{'uid':uid},{'$inc':{'relic.{}'.format(_maze['relicprize'][_idx]):1},'$unset':{'relicprize':1},'$set':{'lasttime':g.C.NOW()}})
    # 如果是需要加面板属性的遗物
    _relicCon = g.GC['mazerelic'][_maze['relicprize'][_idx]]
    if _relicCon['colorcount']:
        _allHero = g.mdb.find('mazehero',{'uid':uid},fields=['job'])
        # 四个基础属性的pro
        for i in _allHero:
            _buff = g.m.mazefun.getBaseBuffPro(_relic, i['job'], _maze['step'],_maze['diff'])
            if not _buff:
                continue
            # for key,val in _buff.items():
            #     _baseKey = key
            #     _base = i.get('base' + key, i.get(key, 0))
            #     if key.replace('pro', '') in ('hp', 'def', 'atk', 'speed'):
            #         _baseKey = key.replace('pro', '')
            #         _base = i.get('base' + _baseKey, i[_baseKey])
            #         _set['base'+_baseKey] = i.get('base'+_baseKey, i[_baseKey])
            #     else:
            #         _set[key] = i[key] + val
            #     _set[_baseKey] = int(_base * (1 + _buff[key] * 0.001))

            g.mdb.update('mazehero',{'uid':uid,'_id':i['_id']},{'relicbuff': _buff})

    return _res

if __name__ == '__main__':
    uid = g.buid('rs1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, ['0'])