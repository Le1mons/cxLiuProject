#!/usr/bin/python
# coding:utf-8

'''
新年活动3
'''
import g

htype = 82
# 获取配置
def getCon():
    res = g.GC['newyear3']
    return res


# 获取数据
def getData(uid, hdid, log=False):
    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0, "fightlog": 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            "qiandao": [],                      # 签到奖励
            'date': g.C.DATE(),                 # 每日刷新标识
            'libao':{},                        # 礼包购买次数
            'task': {'data': {"1":1}, 'rec': []},  # 任务数据
            "gamenum": 0,                      # 小游戏次数
            "bossnum": 0,                      # 攻击boss次数
            "topdps": 0,                        # 最高伤害
            "eig": [],                           # 敲碎的蛋
            "eigrec":[],                         # 积分蛋奖励领奖
            "val": 0,                            # 积分
            "dpsrec":[],                         # 挑战造成伤害的最大奖励
            "eignum":0,                          # 砸蛋次数
        }
    # 任务跨天重置
    elif _myData.get('date') != _dkey:
        _set['task'] = _myData['task'] = {'data': {}, 'rec': []}
        _set['date'] = _myData['date'] = _dkey
        _set["gamenum"] = _myData['gamenum'] = 0
        _set["bossnum"] = _myData['bossnum'] = 0

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    if not log and "fightlog" in _myData:
        del _myData["fightlog"]
    return _myData

# 更新数据 带上日期
def setData(uid, hdid, data):
    # for i in data:
    #     if i.startswith('$'):
    #         data['$set'] = data.get('$set', {})
    #         break
    # else:
    #     _temp = data
    #     data = {}
    #     data['$set'] = _temp
    #
    # data['$set']['date'] = g.C.DATE()

    g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, data, upsert=True)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
    return _res


# 获取今天随机的技能
def getExtSkill(hdid):
    _res = {}
    _ctype = 'newyear_extskill_{}'.format(hdid)
    _chkData = g.m.gameconfigfun.getGameConfig({'ctype': _ctype, 'k': g.C.DATE()})
    _con = g.GC["newyear3"]

    if not _chkData:
        # 设置重置活动的时间
        _extSkill = g.C.RANDLIST(_con["extskill"])[0]
        g.m.gameconfigfun.setGameConfig({'ctype': 'repeathd_czlb', 'k': g.C.DATE()}, {'v': _extSkill})
        _res = _extSkill
    else:
        _res = _chkData[0]["v"]

    return _res

# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'longzhou_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt > _hd["rtime"]:
        return

    _con = getCon()
    _id = ""
    for id, info in _con["libao"].items():
        if info["proid"] == act:
            _id = id
            break
    if not _id:
        return
    _data = getData(uid, _hd['hdid'])
    # 判断是否达到礼包上限
    if _data['libao'].get(_id, 0) >= _con['libao'][_id]['buynum']:
        g.success[orderid] = False
        return
    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(_id): 1}})
    _send = g.getPrizeRes(uid, _con['libao'][_id]['prize'], {'act': 'newyear3_libao'})
    g.sendUidChangeInfo(uid, _send)

# 获取红点
def getHongDian(uid):
    _res = {"newyear3": 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res
    _nt = g.C.NOW()
    _con = g.GC["newyear3"]
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])

    if _nt < _hd['rtime']:
        _day = g.C.getDateDiff(_hd["stime"], _nt)
        for i in xrange(_day + 1):
            if i not in _myData["qiandao"]:
                _res['newyear3'] = 1
                return _res
        if _myData["gamenum"] < 1:
            _res['newyear3'] = 1
            return _res
        if _myData["bossnum"] < _con["bossnum"]:
            _res['newyear3'] = 1
            return _res

        for idx, info in enumerate(_con["eigprize"]):
            if idx not in _myData["eigrec"] and info["val"] >= _myData["val"]:
                _res["newyear3"] = 1
                return _res

        for idx, info in enumerate(_con["rankprize"]):
            if _myData["topdps"] >= info[0][0] and idx not in _myData["dpsrec"]:
                _res["newyear3"] = 1
                return _res

    return _res


# 获取小游戏的rank
def getRankList(hdid, _myinfo=None, uid=None,limit=3):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}

    _cacheRank = g.mc.get("newyear3_ranklist_{}".format(limit))
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _info = g.mdb.find('hddata', {'hdid': hdid, 'topdps': {'$gt': 0}, "ftime":{"$gt":0}}, sort=[['topdps', -1], ["ftime", 1]], limit=limit,
                           fields=['_id', 'uid', 'topdps'])
        # _info.sort(key=lambda x: (x['val'], g.getGud(x['uid'])['maxzhanli']), reverse=True)
        for idx, i in enumerate(_info):
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
            _temp['val'] = i['topdps']
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['topdps']

        if len(_rankList) > 0:
            g.mc.set("newyear3_ranklist_{}".format(limit), {"list": _rankList, 'uid2rank': _uid2rank, 'uid2val': _uid2val}, 20)

    _myRank = -1
    _myVal = _myinfo["topdps"]
    if uid != None:
        if uid in _uid2rank:
            _myRank = _uid2rank[uid]
            _myVal = _uid2val[uid]

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _myVal}
    return _rData


# 发奖 跨服
def timer_newyear3_sendprize():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.mdb.find1("hdinfo", {"htype": htype, "etime": {"$lte": _nt}}, fields=['_id', "stime", "hdid"], sort=[["etime", -1]])
    if not _hdinfoInfo:
        return
    _hdid = _hdinfoInfo["hdid"]
    _con = g.GC["newyear3"]
    _rankPrize = _con["rankprize"]
    _email = _con["email"]
    # 判断是否已经执行过
    _ctype = 'TIMER_Newyear3_SENDPRIZE'
    _chkData = g.m.gameconfigfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData:
        return

    _info = g.mdb.find('hddata', {'hdid': hdid, 'topdps': {'$gt': 0}, "ftime": {"$gt": 0}},
                       sort=[['topdps', -1], ["ftime", 1]], limit=limit,
                       fields=['_id', 'uid', 'topdps'])

    for idx, data in enumerate(_info):
        _rank = idx + 1
        _prize = []
        _uid = data["uid"]

        # 发奖
        for ele in _rankPrize:
            if ele[0][0] <= _rank <= ele[0][1]:
                _prize += ele[1]
                break
        # 发奖
        if _prize:
            # 发送跨服工会邮件
            _title = _email["title"]
            _content = g.C.STR(_email['content'], str(_rank))

            g.m.emailfun.sendEmail(_uid, 1, _title, _content, _prize)

    g.m.gameconfigfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v": 1})



# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('newyear3', onChkTask)


if __name__ == '__main__':
    uid = g.buid('ysr1')
    print getHongDian(uid)


