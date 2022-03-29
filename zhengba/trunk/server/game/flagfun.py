#!/usr/bin/python
# coding:utf-8


import g

# 更新战旗数据
def updateFlagData(uid, time, refresh=0):
    _lasttime = time + g.GC['flag']['base']['daynum'] * 24 * 3600
    _prize = g.GC['flag']['base']['prize']
    _flag = {
        'lv': 0,
        'exp': 0,
        'prize': _prize,
        'receive': {'base': [], 'jinjie': []},
        'endtime':_lasttime,
        'ctime': g.C.NOW(),
        'addtime': '',
        'jinjie': 0
    }
    g.mdb.update('flag', {'uid': uid},_flag,upsert=True)

    if refresh:
        # 更新任务
        g.mdb.update('flagtask',{'uid':uid},{'nval':0,'finish':0})
    return _flag

# 发送未领取的奖励
def sendEmail(uid, info):
    _prize = []
    for i in range(1, info['lv'] + 1):
        # 普通奖励
        if i not in info['receive']['base']:
            _prize += info['prize'][str(i)]['base']

        # 进阶奖励
        if info['jinjie'] and i not in info['receive']['jinjie']:
            _prize += info['prize'][str(i)]['jinjie']

    _prize = g.fmtPrizeList(_prize)
    if _prize:
        g.m.emailfun.sendEmails([uid], 1, g.GC['flag']['base']['email']['title'], g.GC['flag']['base']['email']['content'],_prize)

# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    if act != 'flag_198':
        return

    _flag = g.mdb.find1('flag', {'uid': uid}, fields=['_id', 'lv','exp'])
    # 没有数据就先生成
    if not _flag:
        _flag = updateFlagData(uid, g.C.ZERO(g.C.NOW()))

    _prize, _exp = [], 0
    for i in g.GC['flag']['base']['flagprize']:
        if i['t'] == 'flagexp':
            _exp = i['n']
            continue
        _prize.append(i)
    _flag['jinjie'] = 1
    addFlagExp(_flag, _exp)
    g.mdb.update('flag',{'uid':uid},_flag)

    _send = g.getPrizeRes(uid, _prize, {'act': 'buy_flag'})
    g.sendUidChangeInfo(uid, _send)

# 获取所有的任务
def getAllTask(uid, ttype, **kwargs):
    _res = []
    # _refresh =
    _dayRefresh = chkRefresh(uid, 'day')
    _weekRefresh = chkRefresh(uid, 'week')
    _allTask = g.mdb.find('flagtask', {'uid': uid, 'type': ttype}, fields=['_id','nval','id','finish','type'])
    if not _allTask:
        _allTask = generateTask(uid)
        _dayRefresh = _weekRefresh = False

    for i in _allTask:
        if (_dayRefresh and i['type'] == '1') or (_weekRefresh and i['type'] == '3'):
            i['nval'] = 0
        # 每日登录得任务
        if i['type'] == '1' and i['id'] == '101':
            i['nval'] = 1
        if ttype == i['type']:
            _res.append(i)

    refreshTask(uid, _dayRefresh, _weekRefresh)
    return _res

# 获取所有的任务
def getHDTask(uid):
    _res = {'1': [], '2': [], '3':[]}
    # _refresh =
    _dayRefresh = chkRefresh(uid, 'day')
    _weekRefresh = chkRefresh(uid, 'week')
    _allTask = g.mdb.find('flagtask', {'uid': uid}, fields=['_id','nval','id', 'type','finish'])
    if not _allTask:
        _allTask = generateTask(uid)
        _dayRefresh = _weekRefresh = False

    for i in _allTask:
        if i['finish']:
            continue
        if (_dayRefresh and i['type'] == '1') or (_weekRefresh and i['type'] == '3'):
            i['nval'] = 0
        # 每日登录得任务
        if i['type'] == '1' and i['id'] == '101':
            i['nval'] = 1

        _res[i.pop('type')].append(i)

    refreshTask(uid, _dayRefresh, _weekRefresh)
    return _res

# 刷新任务
def refreshTask(uid, day, week):
    _typeList = []
    # 更新日常任务
    if day:
        _typeList.append('1')
    # 更新周常任务
    if week:
        _typeList.append('2')
    if _typeList:
        g.mdb.update('flagtask',{'uid':uid,'type':{'$in':_typeList}}, {'nval': 0,'finish':0})

# 检测今天是否需要刷新
def chkRefresh(uid, rtype, set=True):
    _ctype = 'flagtask_refresh_{}'.format(rtype)
    _cache = g.mc.get(str(_ctype + uid))
    _nt = g.C.NOW()
    if _cache and _cache > _nt:
        return False
    elif rtype == 'day' and g.getAttrByDate(uid, {'ctype': _ctype}):
        # g.mc.set(_ctype,g.C.ZERO(_nt) + 24*3600, g.C.ZERO(_nt) + 24*3600 - _nt)
        return False
    elif rtype == 'week' and g.getAttrOne(uid, {'ctype': _ctype, 'k': g.C.getWeekNumByTime(_nt)}):
        # g.mc.set(_ctype,g.C.ZERO(_nt) + 24*3600, g.C.ZERO(_nt) + 24*3600 - _nt)
        return False
    else:
        if set:
            _set = {'v': 1} if rtype == 'day' else {'v': 1,'k':g.C.getWeekNumByTime(_nt)}
            g.setAttr(uid, {'ctype': _ctype}, _set)
            g.mc.set(str(_ctype + uid), g.C.ZERO(_nt) + 24 * 3600, g.C.ZERO(_nt) + 24 * 3600 - _nt)
        return True


# 生成任务
def generateTask(uid):
    _res = []
    for i in ('1', '2', '3'):
        for tid,ele in g.GC['flag']['base']['task'][i].items():
            _temp = {}
            _temp['uid'] = uid
            _temp['type'] = i
            _temp['nval'] = 0
            _temp['finish'] = 0
            _temp['id'] = tid
            _res.append(_temp)

    g.mdb.insert('flagtask',_res)
    for i in _res:
        del i['uid']
        del i['_id']
    return _res

# 增加经验
def addFlagExp(flag,exp):
    flag['exp'] += exp
    # 升级
    while str(flag['lv']+1) in g.GC['flag']['base']['exp'] and flag['exp'] >= g.GC['flag']['base']['exp'][str(flag['lv']+1)]:
        flag['exp'] -= g.GC['flag']['base']['exp'][str(flag['lv']+1)]
        flag['lv'] += 1

# 任务
def OnFlagTask(uid, id, val=1):
    # 开区时间在规定之后
    if g.getOpenTime() >= g.GC['flag']['base']['timestamp']:
        _uids = []
        if not isinstance(uid, list):
            uid = [uid]
        for i in uid:
            if g.C.getDateDiff(g.getGud(i)['ctime'], g.C.NOW())<7:
                continue
            _uids.append(i)
        uid = _uids
    else:
        # 40级之前不记录任务
        if isinstance(id, basestring) and isinstance(uid, basestring) and not id.startswith('1') and not g.chkOpenCond(uid, 'flag') :
            return

    if isinstance(id, basestring):
        id = [id]
    if isinstance(uid, basestring):
        uid = [uid]
    for i in uid:
        if chkRefresh(i, 'day', False):
            getAllTask(i, '1')
    g.mdb.update('flagtask',{'uid':{'$in':uid},'id':{'$in':id}},{'$inc':{'nval':val}})
    _all = g.mdb.find('flagtask',{'uid':{'$in':uid},'id':{'$in':id},'finish':0},fields=['_id','uid','id','type','nval'])
    _uids = []

    for i in _all:
        if i['uid'] in _uids:
            continue
        if i['nval'] >= g.GC['flag']['base']['task'][i['type']][i['id']]['pval']:
            _uids.append(i['uid'])

    if '101' not in id:
        for i in _uids:
            g.m.mymq.sendAPI(i, 'flag_redpoint', '1')

# 红点
def getFlagHD(uid):
    _res = []
    if not g.chkOpenCond(uid, 'flag'):
        return _res
    _flag = g.mdb.find1('flag', {'uid': uid},
                        fields=['_id', 'lv', 'endtime', 'prize', 'exp', 'receive', 'addtime', 'jinjie'])

    if not _flag:
        return _res

    _con = g.GC['flag']['base']
    # 有未领取的奖励
    _set = set(i for i in xrange(1, _flag['lv']+1) if _con['prize'][str(i)]['base'])
    if _set-set(_flag.get('receive', {}).get('base', [])) or (_flag['jinjie'] and set(xrange(1, _flag['lv']+1)) - set(_flag.get('receive', {}).get('jinjie', []))):
        _res.append(0)

    # 有未领取的任务
    _tasks = getHDTask(uid)
    for tp in _tasks:
        for i in _tasks[tp]:
            if i['nval'] >= _con['task'][tp][i['id']]['pval']:
                _res.append(tp)
                break
            
    #2019-7-17 增加周奖励红点
    if _flag['jinjie']:
        _key = g.C.getWeekNumByTime(g.C.NOW())
        if ('addtime' not in _flag) or('addtime' in _flag and _key != _flag['addtime']):
            _res.append('week')
            
    return _res


# 获取域外争霸积分任务的值
def chkTaskNval(uid):
    _res = g.mc.get('flag_task_{}'.format(uid))
    if _res is None:
        _res = g.crossDB.find1('crosszb_jifen', {'uid': uid, 'dkey': g.C.getWeekNumByTime(g.C.NOW()),'tozb':1,'flag':{'$exists':0}}, fields={'_id':1})
        # 本周自己晋级了 就缓存
        if _res is not None:
            # 缓存到第二天0点
            g.mc.set('flag_task_{}'.format(uid), 0, g.C.ZERO(g.C.NOW()+24*3600)-g.C.NOW())
            g.crossDB.update('crosszb_jifen', {'uid': uid, 'dkey': g.C.getWeekNumByTime(g.C.NOW()),'tozb':1}, {'flag':1})
            return 1

        _res = 0
    return _res


# 战旗购买
g.event.on('chongzhi', OnChongzhiSuccess)
# 完成任务
g.event.on('FlagTask', OnFlagTask)


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    _con = g.GC['flag']['base']
    print g.C.getDateDiff(g.C.NOW(), 1566532800)