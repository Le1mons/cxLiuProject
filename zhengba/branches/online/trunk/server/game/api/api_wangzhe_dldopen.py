#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-打开大乱斗接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 获取玩家id
    uid = conn.uid
    # 验证活动是否开启
    if not g.m.crosswzfun.isWangZheOpen():
        # 活动未开启
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_dldopen_-1')
        return _res

    # 获取当前周数
    _dkey = g.m.crosswzfun.getDKey()
    # 获取玩家报名信息
    _userData = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id'])
    # 判断是否报名
    if _userData == None:
        # 没有报名返回
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_dldopen_-2')
        return _res

    # 获取玩家信息
    _toUid = _userData.get('touid')
    # 获取对手信息
    if not _toUid:
        # 首次进入该界面，刷新对手
        _toUid = g.m.crosswzfun.getRandomUid(_userData['uid'])
        if _toUid == None:
            # 寻找对手失败
            _res['s'] = -3
            _res['errmsg'] = g.L('wangzhe_dldopen_-3')
            return _res

        # 保存对手信息
        g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': _dkey}, {'touid': _toUid})

    # 获取对手信息
    _toGud = g.m.crosswzfun.getLuanDouUserData(_toUid)
    # 获取排名
    # _tmpData = g.crossDB.find('wzbaoming', {'dkey': _dkey}, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]], fields=['_id', 'uid', 'jifen'], limit=256)
    _tmpData = g.m.crosswzfun.getRankData()
    _rank = 256
    for i in xrange(256):
        if uid == _tmpData[i]['uid']:
            _rank = i
    _rank += 1
    # 初始化返回的数值
    _myInfo = {}
    _toInfo = {}
    _zaoxingData = g.m.userfun.getShowHead(uid)
    _myInfo.update(_zaoxingData)
    _myInfo['rank'] = _rank
    _myInfo['jifen'] = _userData['jifen']
    _myInfo['fightdata'] = _userData['fightdata']
    _myInfo['refrash'] = 3-_userData['renum']
    _myInfo['remainnum'] = 15-len(_userData['fightdata'])
    # 格式化对手数据
    _toInfo = _toGud['info']['headdata']
    _toInfo['uid'] = _toUid
    _res['d'] = {'myinfo': _myInfo, 'toinfo': _toInfo}
    return _res


if __name__ == '__main__':
    g.debugConn.uid = "0_584e8d10625aee1fa0bad4c1"
    for _ in xrange(10):
        doproc(g.debugConn, ["0_5829505be138237641d2bee6"])
