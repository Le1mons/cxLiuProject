#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-大乱斗接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g
from fight.ZBFight import ZBFight


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 获取玩家数据
    uid = conn.uid
    toUid = data[0]
    heroData = data[1]
    if uid == toUid:
        # 无法同自己大乱斗
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_daluandou_-1')
        return _res

    if len(heroData) < 3:
        # 对战玩家信息有误
        _res['s'] = -7
        _res['errmsg'] = g.L('wangzhe_daluandou_heroerr')
        return _res

    # 检测活动是否开启
    if not g.m.crosswzfun.isWangZheOpen():
        # 活动未开启
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_daluandou_-2')
        return _res

    # 获取当前周数
    _dkey = g.m.crosswzfun.getDKey()
    # 计算报名时间段（0:00-22:00）
    if g.m.crosswzfun.getWangZheStatus() != 3:
        # 当前不是大乱斗时间
        _res['s'] = -3
        _res['errmsg'] = g.L('wangzhe_daluandou_-3')
        return _res

    # 获取玩家报名信息
    _userData = g.crossDB.find('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'uid', 'jifen', 'touid', 'zhanli', 'fightdata'])
    # 验证是否报名
    if len(_userData) <= 0:
        # 未报名
        _res['s'] = -4
        _res['errmsg'] = g.L('wangzhe_daluandou_-4')
        return _res

    _myData = _userData[0]
    # 验证玩家挑战次数
    if len(_myData['fightdata']) >= 15:
        # 没有挑战次数
        _res['s'] = -5
        _res['errmsg'] = g.L('wangzhe_daluandou_-5')
        return _res

    # 验证对战玩家信息
    if _myData['touid'] != toUid:
        # 对战玩家信息有误
        _res['s'] = -6
        _res['errmsg'] = g.L('wangzhe_daluandou_-6')
        return _res

    '''开始大乱斗'''
    # 获取战斗双方信息
    _toHero = g.m.crosswzfun.getUserHeroData(toUid)
    if not _toHero['hero']:
        # 对战玩家信息有误
        _res['s'] = -6
        _res['errmsg'] = g.L('wangzhe_daluandou_-6')
        return _res

    fightResList = []
    heroList = []
    winside = 1
    winNum = 0
    _myZhanli = 0
    _toHeadData = g.m.crosswzfun.getLuanDouUserData(toUid)

    isOver = 0
    for index in xrange(3):
        fgroup = heroData[index]
        if not (fgroup and [t for t in fgroup if t != 'sqid']):
            _res['s'] = -5
            _res['errmsg'] = g.L('wangzhe_baoming_nodef')
            return _res

        _chkRes = g.m.fightfun.chkFightData(uid, fgroup)
        if _chkRes['chkres'] < 1:
            _res['s'] = _chkRes['chkres']
            _res['errmsg'] = g.L(_chkRes['errmsg'])
            return _res
        _myZhanli += _chkRes['zhanli']
        _myFData = g.m.fightfun.getUserFightData(uid, _chkRes['herolist'], 0, sqid=fgroup.get('sqid'))
        _saveData = []
        for sd in _myFData:
            _saveData.append(sd.copy())
        heroList.append(_saveData)
        if isOver:
            break

        _toFData = []
        for _tod in _toHero['hero'][index]:
            _tod['side'] = 1
            _toFData.append(_tod)

        # 实例化战斗
        f = ZBFight('pvp')
        fightRes = f.initFightByData(_myFData + _toFData).start()
        fightRes['headdata'] = [_chkRes['headdata'], _toHeadData['info']['headdata']]
        # 获取战斗结果
        if fightRes['winside'] == -2:
            winNum += int(_myZhanli > _toHero['zhanli'])
        else:
            winNum += int(fightRes['winside'] == 0)
        fightResList.append(fightRes)
        if winNum >= 2:
            winside = 0
            isOver = 1
        if (index - winNum) >= 1:
            isOver = 1

    # 扣除作战次数
    _myData['fightdata'].append(winside)
    _data = {'fightdata': _myData['fightdata'], 'curzhanli': _myZhanli}
    _data['herodata'] = heroList
    _zlData = {'zhanli': _myZhanli}
    if _myZhanli > _myData['zhanli']:
        _data['zhanli'] = _myZhanli
        _zlData['maxzhanli'] = _myZhanli
    else:
        _zlData['maxzhanli'] = _myData['zhanli']
    # 进入结算流程
    # 获取积分
    _score = g.m.crosswzfun.getDaLuanDouScore(_myData['fightdata'], winside)
    # 增加积分
    _data['jifen'] = _myData['jifen'] + _score
    '''刷新对手'''
    # 获取随机报名号
    _toUid = g.m.crosswzfun.getRandomUid(_myData['uid'])
    if _toUid == None:
        # 寻找对手失败
        _res['s'] = -7
        _res['errmsg'] = g.L('wangzhe_refighter_-7')
        return _res

    _data['touid'] = _toUid
    # 将结果写入数据库
    g.crossDB.update('wzbaoming', {'uid': uid, 'dkey': _dkey}, _data)
    '''发送积分奖励邮件'''
    # 获取积分配置
    _wzCon = g.m.crosswzfun.getCon()
    _conJiangli = _wzCon['jiangli']['dld'][1:]
    _emailTxt = _wzCon['email']['dldjifen']
    # 获取奖励
    _prizeData = [_tmp for _tmp in _conJiangli if _myData['jifen'] < _tmp['jifen'] <= _data['jifen']]
    # 发送邮件
    for _prize in _prizeData:
        _content = g.C.STR(_emailTxt['content'], _prize['jifen'])
        g.m.emailfun.sendEmail(uid, 1, _emailTxt['title'], _content, _prize['p'])
    # 更新玩家数据至跨服服务器
    g.m.crosswzfun.uploadUserData(uid, zldata=_zlData)
    # 向前端返回战斗数据
    _jifenChange = {
        'rivaljifen': _myData['jifen'],
        'add': _score,
        'reduce': _score,
        'jifen': _myData['jifen'] + _score
    }
    _res["d"] = {"fightres": fightResList, 'jifenchange': _jifenChange}
    return _res


if __name__ == '__main__':
    g.debugConn.uid = "0_584e8d10625aee1fa0bad4c1"
    print doproc(g.debugConn, ["0_585cd67ae1382367a6012d7d"])
