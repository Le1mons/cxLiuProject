#!/usr/bin/python
# coding:utf-8
'''
积分赛战斗接口
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
from ZBFight import ZBFight


def proc(conn, data):
    """

    :param conn:
    :param data: [对手索引:idx, 我的阵容:dict]
    :return:
    ::

        {'d': 'fightres': {},
                'prize': [],
                'rival':[{'headata':{}, 'herolist':[{英雄属性}], 'zhanli':玩家战力, 'jifen':获胜积分, 'prize': '获胜奖励'}]
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    
    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res    

    _idx = data[0]
    _fightData = data[1]
    if g.m.crosszbfun.getJFStatus() != 1:
        # 休战中
        _res['s'] = -4
        _res['errmsg'] = g.L("crosszb_jffight_-4")
        return _res

    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    _con = g.m.crosszbfun.getCon()
    # 判断当前是否有PK次数
    _lessNum = g.m.crosszbfun.getCanJFPkNum(uid)
    # 没有PK次数则报错
    if _lessNum < 1:
        _res['s'] = -1
        _res['errmsg'] = g.L("crosszb_jffight_-1")
        return _res

    # 要PK的玩家是否在当前对手列表里
    _r = g.getAttrOne(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")})
    if not _r:
        # 对手列表不存在
        _res['s'] = -2
        _res['errmsg'] = g.L("crosszb_jffight_-2")
        return _res

    _passList = _r.get('passlist', [])
    _pklist = _r['v']

    # 已经打过了
    if _idx in _passList:
        _res['s'] = -3
        _res['errmsg'] = g.L("crosszb_jffight_-3")
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res
    
    _upFightNum = g.m.crosszbfun.getUpCrossDataNum(uid)
    if g.C.HOUR() != 0 and _upFightNum == 0:
        #2019-7-15 每天第一次战斗上传玩家防守数据
        g.m.crosszbfun.uploadUserDataToCross(uid)
        #设置上传次数
        g.m.crosszbfun.setUpCrossDataNum(uid)
        

    # 扣除PK次数
    _pknum = g.m.crosszbfun.getJFPKNum(uid)
    g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfpknum")}, {"v": _pknum + 1})
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _pklist[_idx]['herolist']).start()

    # 趣味成就
    g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

    _fightRes['headdata'] = [_chkFightData['headdata'], _pklist[_idx]['headdata']]
    _winside = _fightRes['winside']
    _resData = {}
    _resData['fightres'] = _fightRes
    #计算获得的战力，积分
    _jifen = _pklist[_idx]['jifen']
    _pklist[_idx]['winside'] = _winside
    _passList.append(_idx)
    g.setAttr(uid, {"ctype":"playattr_ctype_czbjfenemy"},{"v": _pklist,"dkey": _dkey,'passlist':_passList})
    # 上传玩家信息到跨服数据库
    _prize = _pklist[_idx]['prize']
    if _winside == 0:
        # 设置当天积分赛胜利次数
        g.m.crosszbfun.setJiFenWinNum(uid)

        # 如果该玩家是其种族的前20名玩家，则刷新排行榜数据
        # if _pklist[_idx]['uid'] != 'NPC':
        #     _enemyUid = _pklist[_idx]['uid']
        #     _enemyRank= g.m.rankfun.getKFZBRank(1, _enemyUid)['myrank']
        #     # 如果被攻击的玩家在前20名
        #     if _enemyRank <= 20:
        #         # 删除排行缓存
        #         _cachekey = "kfzb_rank"
        #         g.crossMC.delete(_cachekey)

        # 域外争霸成就任务
        g.event.emit('CrosszbJifen', uid)
    else:
        _prize = [{'a': tmp['a'], 't': tmp['t'], 'n': (tmp['n'] >> 1 + tmp['n'] - tmp['n'] >> 1 << 1)} for tmp in _prize]
        _jifen = int(_jifen * 0.5)

    # 将新的积分值上传到跨服数据库
    gud = g.getGud(uid)
    g.crossDB.update("crosszb_jifen", {"uid": uid, "dkey": _dkey}, {"$inc": {"jifen": _jifen}, '$set': {'zhanli': gud['maxzhanli']}})
    g.mdb.update("crosszbjifen", {"uid": uid, "dkey": _dkey}, {"$inc": {"jifen": _jifen}, '$set': {'zhanli': gud['maxzhanli']}},upsert=True)
    # 判断是否三名对手都已经打过，是则刷新对手，返回新的对手信息
    if len(_passList) >= 3:
        _npklist = g.m.crosszbfun.getJifenEnemy(uid)
        # 保存对手列表信息
        g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")}, {"v": _npklist, "dkey": _dkey,'passlist':[]})
        _resData['rival'] = _npklist
    else:
        g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")}, {"passlist": _passList, "dkey": _dkey})

    _resData['prize'] = _prize + [{'a':'item','t':'jifen','n':_jifen}]
    _sendData = g.getPrizeRes(uid, _prize, {'act':"crosszb_jffight",'prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = _resData
    return _res


if __name__ == "__main__":
    uid = g.buid("lsq13")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [0,{'1':'5b92c298e13823142fdda923','2':'5b6cef9cc0911a2d786f2f5f'}])