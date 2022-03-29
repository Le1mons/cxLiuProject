#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 使用
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [(1是使用补给  2是购买商品,4使用幸运币, 3是恶毒药剂), (1是使用id  2是索引)]
    :return:
    ::

        {'d':{'winprize': 获胜奖励 参考fight接口,'data':_data}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 1是使用补给  2是购买商品,4使用幸运币, 3是恶毒药剂
    _act = int(data[0])
    # 1是使用id  2是索引
    _idx = data[1]
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'watcher'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id','supply','status','trader','herolist','layer','toplayer','winnum','mixture'])
    # 数据不存在
    if not _data:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    if _act == 1:
        # 给哪一位英雄使用
        _toHeroIdx = int(data[2])
        # 使用的补给不存在
        if not _data.get('supply') or _idx not in _data['supply']:
            _res['s'] = -3
            _res['errmsg'] = g.L('watcher_useitem_-3')
            return _res

        # 数量不足
        if _data['supply'][_idx] <= 0:
            _res['s'] = -5
            _res['errmsg'] = g.L('watcher_useitem_-5')
            return _res

        _buff = g.GC['watchercom']['base']['supply'][_idx]['buff']
        _data['supply'][_idx] -= 1
        _status = _data.get('status',{})
        # 这个英雄已经挂了
        if str(_toHeroIdx) in _status and 'hp' in _status[str(_toHeroIdx)] and _status[str(_toHeroIdx)]['hp'] == 0:
            _res['s'] = -7
            _res['errmsg'] = g.L('watcher_useitem_-7')
            return _res

        g.m.watcherfun.useSupply(_data, _buff, _toHeroIdx)
        _res['d'] = {'status': _data['status'],'supply':_data['supply']}
    elif _act == 2:
        # 购买的商品不存在
        if not _data.get('trader') or _idx >= len(_data['trader']):
            _res['s'] = -4
            _res['errmsg'] = g.L('watcher_useitem_-4')
            return _res

        _sale = _data['trader'][_idx]['sale']
        _saleNeed = [{'a':i['a'],'t':i['t'],'n':int(i['n']*_sale/10.0)} for i in _data['trader'][_idx]['need']]

        _chk = g.chkDelNeed(uid, _saleNeed)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _prize = [_data['trader'][_idx]['item']]
        _data['trader'].pop(_idx)
        g.delNeed(uid, _saleNeed, logdata={'act': 'watcher_useitem','need':_saleNeed,'prize':_prize})
        _sendData = g.getPrizeRes(uid, _prize)
        g.sendChangeInfo(conn, _sendData)
        _res['d'] = {'prize': _prize, 'trader': _data['trader']}

    elif _act == 4:
        # 使用的补给不存在
        if not _data.get('supply') or _idx not in _data['supply']:
            _res['s'] = -3
            _res['errmsg'] = g.L('watcher_useitem_-3')
            return _res

        # 数量不足
        if _data['supply'][_idx] <= 0:
            _res['s'] = -5
            _res['errmsg'] = g.L('watcher_useitem_-5')
            return _res

        _data['supply'][_idx] -= 1
        _dlz = g.GC['pre_shopitem'][g.GC['watchercom']['base']['supply']['5']['ext']['shopitem']]
        _item = g.C.RANDARR(_dlz['items'], _dlz['base'])

        _data['trader'] = _data.get('trader', []) + [_item]
        _res['d'] = {'trader':_data['trader'],'supply': _data['supply']}
    else:
        # 使用的补给不存在
        if not _data.get('supply') or _idx not in _data['supply']:
            _res['s'] = -3
            _res['errmsg'] = g.L('watcher_useitem_-3')
            return _res

        # 数量不足
        if _data['supply'][_idx] <= 0:
            _res['s'] = -5
            _res['errmsg'] = g.L('watcher_useitem_-5')
            return _res

        # 最后一层就通关
        if str(_data['layer']) not in g.GC['watcher']:
            _res['s'] = -6
            _res['errmsg'] = g.L('watcher_useitem_-6')
            return _res

        _data['supply'][_idx] -= 1
        _data['layer'] += 1
        _data['winnum'] = 1 + _data['winnum']
        # 更新历史最大层数
        if _data['toplayer'] < _data['layer']:
            _data['toplayer'] = _data['layer']

        # 最后一层就通关
        if str(_data['layer']) in g.GC['watcher']:
            _boss = g.m.fightfun.getNpcFightData(g.GC['watcher'][str(_data['layer'])]['npc'])
            _boss['herolist'][0].update({'enlargepro': 1.5})
            _data['npc'] = _boss

        # 获取一个随机奖励
        _prizeDict = g.m.watcherfun.getWinPrize(_data.get('mixture',{}))
        _set = g.m.watcherfun.getFightPrize(uid,_data, _prizeDict)
        _data.update(_set)
        _res['d'] = {'winprize': _prizeDict,'data':_data}

    g.mdb.update('watcher', {'uid': uid}, _data)

    return _res

if __name__ == '__main__':
    uid = g.buid('lsq13')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [3,'4',1])