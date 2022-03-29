#!/usr/bin/python
# coding:utf-8
'''
守望者秘境 - 开启界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int]
    :return:
    ::

        {'d': {
            'herolist':[[英雄数据]],
            'layer':现在的层数,
            'winnum':胜利次数,
            'npc':{npc数据},
            'toplayer':最高层数,
            'zhanli':战力
            ’rebirthtime‘: 重生时间，
            ’trader‘:[{商品数据 参考 shop_open}],
            'supply':{'补给品id': 数量},
            'mixture':{合剂id: 数量},
            'status': {英雄索引: {'hp':剩余血量,'maxhp':最大血量,'nuqi':怒气}},
            'reclist':[已领取奖励的层数]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'watcher'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id'])
    # 数据不存在
    if not _data or 'herolist' not in _data:
        _res['s'] = -2
        return _res

    # 超过两天了  需要轮回
    if g.C.NOW() > _data['rebirthtime']:
        _res['s'] = -2
        return _res

    # 扫荡奖励 如果有box就直接获得
    if 'box' in _data:
        _sendData = g.getPrizeRes(uid, _data['box'], {'act': 'watcher_open'})
        g.sendChangeInfo(conn, _sendData)

    # 删除扫荡的显示奖励
    if 'prize' in _data:
        g.mdb.update('watcher', {'uid': uid}, {'$unset':{'prize': 1,'box':1}})
    _res['d'] = _data

    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])