#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-排名接口
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
    # 获取玩家的uid
    uid = conn.uid
    # 获取当前周次
    _dkey = g.m.crosswzfun.getDKey()
    # 获取前50名uid
    # userData = g.crossDB.find('wzbaoming', {'dkey': _dkey}, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]], fields=['_id', 'uid', 'jifen'], limit=256)
    userData = g.m.crosswzfun.getRankData()
    if len(userData) <= 0:
        _res['d'] = {}
        return _res

    _userData = userData[:50]
    # 获取自己的信息
    _myInfo = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'uid', 'jifen', 'zhanli', 'ctime'])
    _userList = [_tmp['uid'] for _tmp in _userData]
    _jifenDict = {_tmp['uid']: {'jifen': _tmp['jifen'], 'zhanli': _tmp['zhanli']} for _tmp in _userData}
    # 查询玩家数据
    _data = g.crossDB.find('userdata', {'uid': {'$in': _userList}}, fields=['_id', 'info', 'uid'])
    # 格式化玩家数据
    _dataInfo = {_tmp['uid']: _tmp['info']['headdata'] for _tmp in _data if not _tmp['info']['headdata'].update({'uid': _tmp['uid']})}
    _dataList = []
    # 按照排名拍序,并将积分插入列表
    _dataList = [_dataInfo[_tmp] for _tmp in _userList if not _dataInfo[_tmp].update(_jifenDict[_tmp])]
    # 获取自己的排名
    _userNum = len(userData)
    _rank = _userNum
    for i in xrange(_userNum):
        if _myInfo['uid'] == userData[i]['uid']:
            _rank = i
    _rank += 1
    _reData = {'rank': _rank, 'jifen': _myInfo['jifen'], 'ranklist': _dataList}
    _res['d'] = _reData
    return _res


if __name__ == '__main__':
    uid = '0_584e8d10625aee1fa0bad4c1'
    g.m.gud.reGud(uid)
    g.debugConn.uid = uid
    tmp = doproc(g.debugConn, [])
    print tmp
