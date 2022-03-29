#!/usr/bin/python
# coding:utf-8
'''
神殿迷宫 - 打开界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d':{
            'data':{
                step: 第几层
                maze:{1:[迷宫关卡1的事件id]},
                'trace': {
                    "1":{"idx":已经选择的第一关的索引, 'finish': 是否完成了}
                },
                'total': {'1': 第一层总共通过多少次},
                'relic': {遗物id: 数量},
                'relicprize':打赢后没有选择的宝箱奖励,
                'receive':这层奖励是否已领取,
                'status':{英雄tid: {‘hp’:剩余血量百分比, 'nuqi':怒气}}
            'hero':[{lv:等级,hid:英雄id,'tid':英雄tid,'star':英雄星级}]}
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
    if not g.chkOpenCond(uid, 'maze'):
        _res['s'] = -2
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _res['d'] = {'cd': g.m.mazefun.getResetTime()}
    _maze = g.mdb.find1('maze', {'uid': uid}, fields={'_id':0,'uid':0,'ctime':0})
    # 数据已存在
    if not _maze or g.C.NOW() >= _maze['cd']:
        _res['s'] = -1
        return _res

    for i in _maze['maze']:
        for x in _maze['maze'][i]:
            if 'fightdata' in x:
                x['fightdata'] = filter(lambda j:'pid' not in j, x['fightdata'])

    _res['d']['data'] = _maze
    _res['d']['hero'] = g.mdb.find('mazehero', {'uid': uid}, fields=['_id','tid','hid','lv','star','zhongzu','zhanli','skin'])
    # 设置扫荡数据,如果为空就自动领取了
    _saodanginfo = g.m.mazefun.getSaoDangInfo(uid)
    _res['d']["herolist"] = _saodanginfo.get("herolist", [])
    _res['d']["relicprizelist"] = _saodanginfo.get("relicprizelist", [])
    _res['d']["shoplist"] = _saodanginfo.get("shoplist", [])
    return _res

if __name__ == '__main__':
    uid = g.buid('0')
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, []))