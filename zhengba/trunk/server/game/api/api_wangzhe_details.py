#!/usr/bin/python
# coding:utf-8
'''
    望着荣耀-大乱斗玩家详情
'''

if __name__ == '__main__':
    import time
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


def proc(conn, data):
    """

    :param conn:
    :param data: [玩家uid:str]
    :return:
    ::

        {'d': {
            'maxzhanli':最大战力
            'openday':开服天数
            'zhanli':英雄战力
            'sid':区服
            'headdata':{}
            'fightdata':{'hero':[英雄数据],'zhanli':战力}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    # 获取uid
    uid = data[0]
    # 查询玩家信息
    _myInfo = g.crossDB.find1('userdata', {'uid': uid}, fields=['_id', 'info'])
    if _myInfo == None:
        # 信息不存在
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_details_-1')
        return _res

    # 获取阵容
    _heroData = g.m.crosswzfun.getUserHeroData(uid)
    _rData = _myInfo['info']
    _rData['fightdata'] = _heroData
    _res['d'] = _rData
    return _res


if __name__ == "__main__":
    g.debugConn.uid = "0_5854ad4fe13823027a750ff6"
    print doproc(g.debugConn, ['0_5854ad4fe13823027a750ff6'])
