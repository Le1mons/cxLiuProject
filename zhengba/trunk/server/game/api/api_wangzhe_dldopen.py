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
    """

    :param conn:
    :param data: [玩家uid:str]
    :return:
    ::

        {'d': {
            'myinfo':{ 有headdata
                'rank': 排名
                'jifen':积分,
                'fightdata':[战果获胜还是输],
                'refrash':剩余刷新次数,
                'remainnum':剩余挑战次数
            },
            'toinfo':{
                同上
            }

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
    # 获取玩家id
    uid = conn.uid
    # 时22天
    if g.getOpenDay() < 31:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 31 - g.getOpenDay())
        return _res

    # 验证活动是否开启
    groupList = g.m.crosswzfun.isWangZheOpen()
    if not groupList:
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
    _openDay = None
    if 'openday' in _userData:
        _openDay = _userData['openday']
    else:
        _openDay = g.m.crosswzfun.getDOpenDay(uid=uid)
        g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': _dkey}, {'openday': _openDay})
    ugid = g.m.crosswzfun.getUgid(uid)

    # 获取对手信息
    if not _toUid:
        # 首次进入该界面，刷新对手
        _toUid = g.m.crosswzfun.getRandomUid(_userData['uid'], ugid, groupList)
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
    _rank = 256
    if _userData['jifen'] > 0 and _userData['jifen'] >= getShowJifen(ugid, groupList)['jifen']:
        _tmpData = g.m.crosswzfun.getRankData(ugid, groupList)
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


# 获取参考积分
def getShowJifen(ugid, grouplist, refresh=0):
    dkey = g.m.crosswzfun.getDKey()
    tempKey = 'jifenrank_mckey_' + dkey + '_{0}'
    mcKey = ''
    if ugid:
        mcKey = tempKey.format(ugid)
    else:
        mcKey = tempKey.format(3)
    mcData = g.crossMC.get(mcKey)
    baseRank = 400
    if not mcData:
        _where = {'dkey': dkey,'ugid':ugid}
        mcNumKey = mcKey + '_num'
        maxRank = g.crossMC.get(mcNumKey)
        if not maxRank:
            maxRank = g.crossDB.count('wzbaoming', _where)
            g.crossMC.set(mcNumKey, maxRank, time=24 * 3600)
        maxRank -= 1
        if maxRank < baseRank:
            baseRank = maxRank
        data = g.crossDB.find1('wzbaoming', _where, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]], skip=baseRank, fields=['_id', 'jifen'])
        data['rank'] = baseRank
        mcData = data
        time = 300
        if data['jifen'] >= 269:
            time = 24 * 3600
        g.crossMC.set(mcKey, mcData, time=time)
    return mcData


if __name__ == '__main__':
    uid = g.buid("jingqi_1910281231084070")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[['1'],{"1":'5e421a533ca7a2d0b7b6cf63'}])