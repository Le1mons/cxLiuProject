#!/usr/bin/python
# coding:utf-8
'''
积分赛--扫荡
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

def _checkCond(uid, data):
    _res = {}
    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res

    _fightData = data[0]

    if g.m.crosszbfun.getJFStatus() != 1:
        # 休战中
        _res['s'] = -4
        _res['errmsg'] = g.L("crosszb_jffight_-4")
        return _res

    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    _con = g.m.crosszbfun.getCon()
    # 判断当前是否有PK次数
    _lessNum = g.m.crosszbfun.getCanJFPkNum(uid)
    _r = g.getAttrOne(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")})
    
    # 要PK的玩家是否在当前对手列表里
    if not _r:
        # 对手列表不存在
        _res['s'] = -2
        _res['errmsg'] = g.L("crosszb_jffight_-2")
        return _res

    # 没有PK次数则报错
    if _lessNum < 3 - len(_r.get('passlist', [])):
        _res['s'] = -1
        _res['errmsg'] = g.L("crosszb_jffight_-1")
        return _res

    # 全部打完了
    if len(_r.get('passlist', [])) >= 3:
        _res['s'] = -3
        _res['errmsg'] = g.L("global_argserr")
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res

    _res['r'] = _r
    _res['fightdata'] = _chkFightData
    return _res

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _r = _chkData['r']
    _chkFightData = _chkData['fightdata']
    _passList = _r.get('passlist', [])
    _pklist = _r['v']
    
    _upFightNum = g.m.crosszbfun.getUpCrossDataNum(uid)
    if g.C.HOUR() != 0 and _upFightNum == 0:
        #2019-7-15 每天第一次战斗上传玩家防守数据
        g.m.crosszbfun.uploadUserDataToCross(uid)
        #设置上传次数
        g.m.crosszbfun.setUpCrossDataNum(uid)
        

    _fightData = data[0]
    # 扣除PK次数
    _pknum = g.m.crosszbfun.getJFPKNum(uid)
    g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfpknum")}, {"v": _pknum + 3 - len(_passList)})
    # 玩家战斗信息
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))

    _resData = {'fightres': {}}
    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    _alljifen, _allPrize = 0, []
    for _idx in xrange(2, -1, -1):
        if _idx in _passList:
            continue
        f = ZBFight('pvp')
        _fightRes = f.initFightByData(_userFightData + _pklist[_idx]['herolist']).start()

        # 趣味成就
        g.m.qwcjfun.emitFightEvent(uid, _fightRes, _userFightData)

        _fightRes['headdata'] = [_chkFightData['headdata'], _pklist[_idx]['headdata']]
        _winside = _fightRes['winside']
        _resData['fightres'][str(_idx)] = _fightRes['winside']
        # _resData = {}
        # _resData['fightres'] = _fightRes
        #计算获得的战力，积分
        _jifen = _pklist[_idx]['jifen']
        _pklist[_idx]['winside'] = _winside
        _passList.append(_idx)
        # 上传玩家信息到跨服数据库
        _prize = _pklist[_idx]['prize']
        if _winside == 0:
            # 设置当天积分赛胜利次数
            g.m.crosszbfun.setJiFenWinNum(uid)

            # 域外争霸成就任务
            g.event.emit('CrosszbJifen', uid)
        else:
            _prize = [{'a': tmp['a'], 't': tmp['t'], 'n': (tmp['n'] >> 1 + tmp['n'] - tmp['n'] >> 1 << 1)} for tmp in _prize]
            _jifen = int(_jifen * 0.5)

        _alljifen += _jifen
        _allPrize += _prize

    g.setAttr(uid, {"ctype":"playattr_ctype_czbjfenemy"},{"v": _pklist,"dkey": _dkey,'passlist':_passList})

    # 将新的积分值上传到跨服数据库
    gud = g.getGud(uid)
    g.crossDB.update("crosszb_jifen", {"uid": uid, "dkey": _dkey}, {"$inc": {"jifen": _alljifen}, '$set': {'zhanli': gud['maxzhanli']}})
    g.mdb.update("crosszbjifen", {"uid": uid, "dkey": _dkey}, {"$inc": {"jifen": _alljifen}, '$set': {'zhanli': gud['maxzhanli']}},upsert=True)
    # 判断是否三名对手都已经打过，是则刷新对手，返回新的对手信息
    _npklist = g.m.crosszbfun.getJifenEnemy(uid)
    # 保存对手列表信息
    g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")}, {"v": _npklist, "dkey": _dkey,'passlist':[]})
    _resData['rival'] = _npklist

    _allPrize = g.fmtPrizeList(_allPrize)
    _resData['prize'] = _allPrize + [{'a':'item','t':'jifen','n':_alljifen}]
    if _allPrize:
        _sendData = g.getPrizeRes(uid, _allPrize, {'act':"crosszb_jffight"})
        g.sendChangeInfo(conn, _sendData)

    _res['d'] = _resData
    return _res


if __name__ == "__main__":
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    print doproc(g.debugConn, [{"1": "5d2c3bfb9dc6d667ac380da8",
"2": "5d2c3bf99dc6d667ac380c18",
"3": "5d2c3bfd9dc6d667ac380e70",
"4": "5d2c3bfd9dc6d667ac380eaf",
"5": "5d2c3bf69dc6d667ac380a8a",
"6": "5d2c3bf79dc6d667ac380b50"}])