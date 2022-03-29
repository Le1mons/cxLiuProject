#!/usr/bin/python
# coding:utf-8

'''
周年庆
'''
import g

# 获取配置
def getCon():
    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    res = g.GC['anniversary']
    res['sign'] = _hd['data'].get('sign', [])
    res['task'] = _hd['data']['task']
    res['prizepool'] = _hd['data']['prizepool']
    return res


# 获取数据
def getData(uid, hdid):
    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    # 没有数据
    if not _myData:
        _myData = {
            'task': {},  # 任务数据
            'receive': {},  # 任务领奖记录
            'sign': 0,  # 签到领奖记录
            'prizepool': {},  # 奖池领取记录
            'pool': 0,  # 奖池编号
        }
    # 任务跨天重置
    elif _myData.get('date') != g.C.DATE():
        _myData['task'] = {}
        _myData['receive'] = {}
        _set = {'task':{"1":1},'receive':{},'date':g.C.DATE()}

    # 切换奖池 非最终奖池
    _con = getCon()
    for idx, i in enumerate(_con['prizepool'][_myData.get('pool', 0)]):
        if _myData.get('prizepool', {}).get(str(_myData.get('pool', 0)), {}).get(str(idx), 0) < i['num']:
            break
    else:
        if _myData.get('pool', 0) < len(_con['prizepool']) - 1:
            _myData['pool'] = _myData.get('pool', 0) + 1
        else:
            _myData['pool'] = len(_con['prizepool']) - 1
            _set['prizepool.{}'.format(len(_con['prizepool']) - 1)] = {}

        _myData['change'] = 1
        _set['pool'] = _myData['pool']

    # 默认数据  登录任务默认完成一次
    _myData['task']         = _myData.get('task', {})
    _myData['prizepool']    = _myData.get('prizepool', {})
    _myData['pool']         = _myData.get('pool', 0)
    _myData['chess']        = _myData.get('chess', 0)
    _myData['receive']      = _myData.get('receive', {})
    _myData['sign']         = _myData.get('sign', 0)
    _myData['pay']          = _myData.get('pay', {})
    _myData['choose']       = _myData.get('choose', {})
    _myData['task']['1'] = 1

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    return _myData


# 更新数据 带上日期
def setData(uid, data, hdid):
    for i in data:
        if i.startswith('$'):
            data['$set'] = data.get('$set', {})
            break
    else:
        _temp = data
        data = {}
        data['$set'] = _temp

    data['$set']['date'] = g.C.DATE()

    g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, data, upsert=True)


# 检测是否开启
def checkOpen(*args):
    _key = 'huodong_' + str("qingdian")
    _hd = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hd or _nt >= _hd['rtime']:
        _hd = g.mdb.find1('hdinfo', {'isqingdian': {"$gt": 0}, 'rtime': {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id', 'rtime', 'hdid', 'stime', 'data'])
        # 活动已过期
        if not _hd:
            return False
        else:
            g.mc.set(_key, _hd)
    _res = False
    if _hd:
        _res = True
    return _res


# 获取天数
def getDay(data=None):
    _hd = data or g.m.huodongfun.getHDinfoByHtype(60)
    _res = 0
    if _hd and 'hdid' in _hd:
        _res = g.C.getDateDiff(_hd['stime'], g.C.NOW()) + 1
    return _res


# 登陆
def onAnniversaryTask(uid, taskId, val=1):
    # 等级不符
    if not g.chkOpenCond(uid, 'anniversary'):
        return

    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    getData(uid, _hd['hdid'])
    setData(uid, {'$inc': {'task.{}'.format(taskId): val}}, _hd['hdid'])


# 开始下棋
def chess(data, num):
    # 从奖池里挑一个奖励
    def randPrize():
        _pool = _con['prizepool'][data.get('pool', 0)]
        _p = 0
        _list = []
        for idx, i in enumerate(_pool):
            if data.get('prizepool', {}).get(str(data['pool']), {}).get(str(idx), 0) >= i['num']:
                continue
            _p += i['p']
            i['idx'] = idx
            _list.append(i)
        if not _list:
            for k,v in data:
                print '**********************'
                print k
                print v
        _prize = g.C.RANDARR(_list, _p)
        data['prizepool'] = data.get('prizepool', {})
        data['prizepool'].setdefault(str(data['pool']), {})[str(_prize['idx'])] = data['prizepool'].setdefault(str(data['pool']), {}).get(str(_prize['idx']), 0) + 1
        return _prize['prize']

    def proc(numList, prize, trace):
        _randNum = g.C.RANDINT(*numList)
        data['chess'] = data.get('chess', 0) + _randNum
        trace.append(data['chess'] if data['chess'] < len(_con['grid']) else len(_con['grid']) - 1)
        if data.get('chess', 0) >= len(_con['grid']) - 1:
            prize.insert(0, randPrize())
            return

        # 如果是掉落组奖励
        if _con['grid'][data['chess']]['dlz']:
            prize += g.m.diaoluofun.getGroupPrize(_con['grid'][data['chess']]['dlz'])
        else:

            if _con['grid'][data['chess']]['number'] is None:
                print 'error chess2', trace, data['chess']
            proc(_con['grid'][data['chess']]['number'], prize, trace)

    _con = getCon()
    _goAhead = 0
    _prize, _trace = [], []

    for i in xrange(num):
        if _con['chess']['number'] is None:
            print 'error chess1', _trace, data['chess']
        proc(_con['chess']['number'], _prize, _trace)
        _goAhead += 1
        if data['chess'] >= len(_con['grid']) - 1:
            data['chess'] = 0
            break

    return _prize, [{'a': i['a'], 't': i['t'], 'n': i['n'] * _goAhead} for i in _con['chess']['need']], _trace


# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _con = getCon()['pay']
    if act not in _con:
        return

    _data = getData(uid, _hd['hdid'])
    if _data.get('pay', {}).get(act, 0) >= _con[act]['num']:
        g.success[orderid] = False
        return

    setData(uid, {'$inc': {'pay.{}'.format(act): 1}}, _hd['hdid'])
    _send = g.getPrizeRes(uid, _con[act]['prize'], {'act': 'buy_anniversary'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    if not g.chkOpenCond(uid, 'anniversary'):
        return {'anniversary': 0}

    _hd = g.m.huodongfun.getHDinfoByHtype(60)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return {'anniversary': 0}

    _con = getCon()
    # 可以领取登录奖励
    _myData = getData(uid, _hd['hdid'])
    _day = getDay(_hd)
    if _day > _myData.get('sign', 0) and _myData.get('sign', 0) < len(_con['sign']):
        return {'anniversary': 1}

    # 有骰子可用时
    if g.chkDelNeed(uid, _con['chess']['need'])['res']:
        return {'anniversary': 1}

    # 有终极任务可领取时
    for tid, num in _myData.get('task', {}).items():
        if num >= _con['task'][tid]['pval'] and _myData.get('receive', {}).get(tid, 0) < _con['task'][tid]['num']:
            return {'anniversary': 1}
    return {'anniversary': 0}


# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('ANNIVERSARY', onAnniversaryTask)

if __name__ == '__main__':
    print getHongDian(g.buid('xuzhao'))