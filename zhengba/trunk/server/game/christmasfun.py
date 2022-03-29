#!/usr/bin/python
# coding:utf-8

'''
圣诞节
'''
import g

htype = 81

# 获取配置
def getCon():
    res = g.GC['christmas']
    return res


# 获取数据
def getData(uid, hdid, keys=None, hdinfo=None):
    # 默认读取的key
    dfeilds = []
    if keys:
        dfeilds += keys.split(',')

    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            'task': {'data': {}, 'rec': [], 'sprec': []},     # 任务数据
            'liwu': {'data': {}, 'rec': [], 'task':[]},     # 圣诞礼物数据
            'date': g.C.DATE(),                # 每日刷新标识
            'duihuan': {},                     # 兑换
            "buylibao": {},                    # 礼包购买
            'buysptask': 0,                    # 特殊任务购买
            "lasttime": _nt,                   # 设置时间
            "gamerecord": -1,                    # 小游戏分数
            "gamenum": 0,                       # 小游戏当天游玩次数
        }
    # 跨天重置
    if _myData.get('date') != _dkey:
        _set['date'] = _myData['date'] = _dkey
        _set['gamerecord'] = _myData['gamerecord'] = -1
        _set['gamenum'] = _myData['gamenum'] = 0

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    _res = {}
    if dfeilds:
        for key in dfeilds:
            _res[key] = _myData.get(key, {})
    else:
        _res = _myData

    return _res


# 更新数据 带上日期
def setData(uid, hdid, data):
    g.m.huodongfun.setHDData(uid, hdid, data)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")

    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res["stime"] = _hd["stime"]
    return _res


# 礼物最后一个登录任务监听
@g.event.on('firstlogin')
def onLoginEvent(uid):
    onChkTask(uid, {'liwu': ['7']})


# 任务监听，data为监听的数据，其中键为'task'或'liwu'，对应值为包含监听任务id的数组
def onChkTask(uid, data, val=1, *args):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd or g.C.NOW() > _hd['etime'] - 24 * 3600:
        return

    _con = getCon()
    _diffDay = g.C.getDateDiff(sdate=_hd['stime'], edate=g.C.NOW(), w='d') + 1
    _redPoint = 0
    _myData = getData(uid, _hd['hdid'])

    # 普通任务
    for ttype, tasklist in data.items():
        for taskid in tasklist:
            # 无该任务
            if str(taskid) not in _con[ttype]:
                continue
            # 未到可完成任务的时间
            if ttype == 'liwu':
                _reqDay = int(taskid)
            else:
                _reqDay = _con[ttype][str(taskid)]['day']
            if _diffDay < _reqDay:
                continue
            # 特殊处理的任务
            if ttype == 'liwu' and taskid in ['4', '7']:
                continue
            # 记录任务信息
            if _myData[ttype].get(taskid, 0) + val >= _con[ttype][taskid]['pval'] and taskid not in _myData[ttype]['rec']:
                _redPoint = 1
            _myData[ttype]['data'][str(taskid)] = _myData[ttype]['data'].get(str(taskid), 0) + val

    # 特殊礼物任务处理
    # 召唤、幸运、先祖祭祀均完成一次
    if 'liwu' in data:
        _type2id = {
            'zhaohuan': ['1', '2'],
            'xinyun': ['5', '6'],
            'xianzu': ['3', '4']
        }
        if '4' in data['liwu'] and _diffDay >= 4:
            _zhType = args[0]
            _type = ''
            for k, v in _type2id.items():
                if _zhType in v:
                    _type = k
                    break
            if _type and _type not in _myData['liwu']['task']:
                _myData['liwu']['task'].append(_type)
                _myData['liwu']['data']['4'] = _myData['liwu']['data'].get('4', 0) + 1
                if _myData['liwu']['data']['4'] >= _con['liwu']['4']['pval'] and '4' not in _myData['liwu']['rec']:
                    _redPoint = 1
    # 最后一个礼物检查
    if _diffDay == 7:
        _finish = True
        for i in range(1, 7):
            if _myData['liwu']['data'].get(str(i), 0) < _con['liwu'][str(i)]['pval'] or _myData['liwu']['data'].get('7', 0) == 1:
                _finish = False
                break
        if _finish:
            _myData['liwu']['data']['7'] = 1
            _redPoint = 1

    # 设置数据
    if _redPoint:
        g.m.mymq.sendAPI(uid, 'christmas_redpoint', '1')
    setData(uid, _hd['hdid'], {'task': _myData['task'], 'liwu': _myData['liwu']})


g.event.on('shengdan', onChkTask)


# 监听圣诞活动购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd:
        return

    _con = getCon()

    # 购买礼包
    _data = getData(uid, _hd['hdid'])
    if act in _con['libao']:
        if _data["buylibao"].get(act, 0) >= _con["libao"][act]['buynum']:
            g.success[orderid] = False
            return
        _data["buylibao"][act] = _data["buylibao"].get(act, 0) + 1
        setData(uid, _hd['hdid'], {'buylibao': _data['buylibao']})
        _send = g.getPrizeRes(uid, _con["libao"][act]['prize'], {'act': 'christmas_libao'})
        g.sendUidChangeInfo(uid, _send)

    # 购买特殊任务激活
    if act == _con['jifeidian']['proid'] and _nt <= _hd["etime"] - 24 * 3600:
        if _data['buysptask']:
            g.success[orderid] = False
            return
        _setData = {}
        _data['buysptask'] = 1
        _setData['buysptask'] = _data['buysptask']
        # 获取激活后可领取的奖励
        _data, _prize = chkPrize(_data, _hd)
        # 发放奖励
        if _prize:
            _setData['task'] = _data['task']
            _send = g.getPrizeRes(uid, _prize, {'act': 'christmas_taskfinish'})
            g.sendUidChangeInfo(uid, _send)
        setData(uid, _hd['hdid'], _setData)

g.event.on('chongzhi', OnChongzhiSuccess)


# 检查可领取的奖励信息
def chkPrize(mydata, hdinfo):
    _con = getCon()
    _prize = []

    # 检查任务奖励
    _diffDay = g.C.getDateDiff(sdate=hdinfo['stime'], edate=g.C.NOW(), w='d') + 1
    for taskid, info in _con['task'].items():
        # 普通任务奖励
        if taskid not in mydata['task']['rec'] and mydata['task']['data'].get(str(taskid), 0) >= _con['task'][str(taskid)]['pval']:
            _prize.extend(_con['task'][str(taskid)]['prize'])
            mydata['task']['rec'].append(taskid)
        # 购买特殊任务奖励
        if 'spprize' in info and mydata['buysptask'] and taskid not in mydata['task']['sprec'] and mydata['task']['data'].get(str(taskid), 0) >= _con['task'][str(taskid)]['pval']:
            _prize.extend(_con['task'][str(taskid)]['spprize'])
            mydata['task']['sprec'].append(taskid)

    return mydata, _prize


# 获取红点
def getHongDian(uid):
    _res = {"christmas": {'task': 0, 'game': 0, 'duihuan': 0, 'tree': 0}}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd:
        return _res
    if 'hdid' not in _hd:
        return _res
    if _nt > _hd['etime'] - 24 * 3600:
        return _res

    _con = getCon()
    _myData = getData(uid, _hd['hdid'])

    if _nt < _hd['rtime']:
        # 有可领取的任务奖励
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["christmas"]['task'] = 1
                break
        # 有可领取的礼物奖励
        for k, v in _myData['liwu']['data'].items():
            if v >= _con['liwu'][k]['pval'] and k not in _myData['liwu']['rec']:
                _res["christmas"]['tree'] = 1
                break
        # 小游戏可游玩
        if _myData['gamenum'] < _con['gamenum']:
            _res["christmas"]['game'] = 1
        # 有可兑换的物品
        for k, v in _con['duihuan'].items():
            if _myData['duihuan'].get(k, 0) >= _con['duihuan'][k]['maxnum']:
                continue
            _need = [{'a': i['a'], 't': i['t'], 'n': i['n'] * 1} for i in _con['duihuan'][k]['need']]
            _chk = g.chkDelNeed(uid, _need)
            if _chk['res']:
                _res["christmas"]['duihuan'] = 1
                break

    return _res


# 获取小游戏的rank
def getRankList(hdid, _myinfo=None, uid=None):
    _rankList = []
    _uid2rank = {}
    _uid2val = {}

    _cacheRank = g.mc.get("christmas_ranklist")
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
        _uid2val = _cacheRank['uid2val']
    else:
        _zt = g.C.ZERO(g.C.NOW())
        _info = g.mdb.find('hddata', {'hdid': hdid, 'gamerecord': {'$gt': 0}, 'lasttime': {'$gte': _zt}},
                           sort=[['gamerecord', 1], ['lasttime', 1]], limit=3, fields=['_id', 'uid', 'gamerecord', 'lasttime'])
        for idx, i in enumerate(_info):
            _temp = {
                'headdata': g.m.userfun.getShowHead(i['uid']),
                'gamerecord': i['gamerecord']
            }
            _rankList.append(_temp)
            _uid2rank[i['uid']] = idx + 1
            _uid2val[i['uid']] = i['gamerecord']

        if len(_rankList) > 0:
            g.mc.set("christmas_ranklist", {"list": _rankList, 'uid2rank': _uid2rank, 'uid2val': _uid2val}, 20)

    _myRank = -1
    _myVal = _myinfo["gamerecord"]
    if uid and uid in _uid2rank:
        _myRank = _uid2rank[uid]
        _myVal = _uid2val[uid]

    _rData = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _myVal}
    return _rData


if __name__ == '__main__':
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    print getHongDian(uid)


    # _hdinfo = {
    #     "hdid" : 2333333,       # 活动Id（需更换）
    #     "showtime" : "11月04日00:00-02月12日23:59",     # 活动时间
    #     "stime" : 1638288000,   # 活动开始时间（自行配置）
    #     "etime" : 1638979199,   # 活动结束时间（自行配置）
    #     "rtime" : 1638979199,   # 活动截止时间（自行配置）
    #     "name" : "圣诞活动",    # 活动名称（自行配置）
    #     "htype" : 81,   # 活动处理类型（圣诞活动为81）
    #     "intr" : "圣诞活动",    # 活动描述
    #     "data" : {}
    # }

    g.event.emit('shengdan', uid, {'liwu': ['4']}, 1, '1')