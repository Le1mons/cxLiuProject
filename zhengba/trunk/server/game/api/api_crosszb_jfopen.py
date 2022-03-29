#!/usr/bin/python
# coding:utf-8
'''
积分赛打开界面接口
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

        {'d': 'jifen': 我的积分,
                'rank': 我的排名,
                'enemy':[{'headata':{}, 'herolist':[{英雄属性}], 'zhanli':玩家战力, 'jifen':获胜积分, 'prize': '获胜奖励'}]
                'pknum':pk次数,
                'buynum':购买pk的次数,
                'buyneed':购买消耗,
                'freerefnum': 免费刷新次数,
                'status': 状态（1：积分赛开放中， 2：积分赛休战中）
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _con = g.m.crosszbfun.getCon()
    _lv = gud['lv']

    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res

    # 上传玩家信息到跨服数据库
    _r = g.crossDB.find1('jjcdefhero', {'uid': uid})
    if not _r:
        g.m.crosszbfun.uploadUserDataToCross(uid)

    # 获取积分赛主数据
    _rData = g.m.crosszbfun.getJFMainData(uid)
    if 'cinfo' in _rData:
        g.sendChangeInfo(conn, _rData.pop('cinfo'))
    _res['d'] = _rData
    return _res


if __name__ == "__main__":
    uid = g.buid("lsq444")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])
    # a = g.crossDB.find('crosszb_jifen')
    # for i in a:
    #     uid = i['uid']
    #     gud = g.getGud(uid)
    #     g.crossDB.update('crosszb_jifen',{'uid':uid},{'zhanli':gud.get('maxzhanli', 0)})