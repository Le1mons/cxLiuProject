#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-随机挑战者接口
'''

if __name__ == '__main__':
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
            'myinfo':{
                'refrash':剩余刷新次数
            },
            'toinfo':{headdata}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 获取活动状态
    groupList = g.m.crosswzfun.isWangZheOpen()
    if not groupList:
        # 活动未开启
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_refighter_-1')
        return _res

    if g.m.crosswzfun.getWangZheStatus() != 3:
        # 当前不是大乱斗时间
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_refighter_-2')
        return _res

    # 获取周次信息
    _dkey = g.m.crosswzfun.getDKey()
    # 获取玩家重置信息
    _userData = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'renum', 'uid', 'openday'])
    if _userData == None:
        # 玩家未报名
        _res['s'] = -3
        _res['errmsg'] = g.L('wangzhe_refighter_-3')
        return _res

    if _userData['renum'] >= 3:
        # 重置次数不足
        _res['s'] = -4
        _res['errmsg'] = g.L('wangzhe_refighter_-4')
        return _res

    # 计算报名时的组别
    ugid = g.m.crosswzfun.getUgid(uid)
    # 获取随机报名号
    _toUid = g.m.crosswzfun.getRandomUid(_userData['uid'], ugid, groupList)
    if _toUid == None:
        # 寻找对手失败
        _res['s'] = -5
        _res['errmsg'] = g.L('wangzhe_refighter_-5')
        return _res

    # 修改刷新次数
    _userData['renum'] += 1
    # 获取对手信息
    _toGud = g.m.crosswzfun.getLuanDouUserData(_toUid)
    # 保存对手信息
    g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': _dkey}, {'touid': _toUid, 'renum': _userData['renum']})
    # 返回查找信息
    _myInfo = {}
    _myInfo['refrash'] = 3-_userData['renum']

    _toInfo = _toGud['info']['headdata']
    _toInfo['uid'] = _toUid

    _res['d'] = {'myinfo': _myInfo, 'toinfo': _toInfo}
    return _res
