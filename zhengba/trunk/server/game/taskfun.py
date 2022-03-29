#!/usr/bin/python
# coding:utf-8

'''
成就任务相关方法
'''
import g


# 判断是否需要重置任务
def checkResetDailyTask(func):
    def _deco(*args, **kwargs):
        _uid = args[0]

        _data = g.getAttrByDate(_uid, {'ctype': 'resetDailyTask'}, 0)
        if len(_data) == 0:
            resetDailyTask(_uid)
            g.setAttr(_uid, {"ctype": 'resetDailyTask'}, {"v": 1})

        ret = func(*args, **kwargs)
        return ret

    return _deco
# 重置每日任务
def resetDailyTask(uid):
    g.mdb.delete('task', {'uid':uid, 'type':2})
    _taskList = []
    _con = g.GC['pre_task']['2']
    _nt = g.C.NOW()
    _ele = {'isreceive': 0, 'uid': uid, 'lasttime': _nt, 'ctime': _nt}
    for k, v in _con.items():
        # 如果是起步任务
        if not v['pretask']:
            _temp = _ele.copy()
            _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                          'type': v['type'], 'stype': v['stype'],'nval':0})
            _taskList.append(_temp)

    g.mdb.insert('task',_taskList)


# 获取任务配置
def getTaskConByType(_type, taskid):
    _taskid = str(taskid)
    return g.GC['task'][_taskid]


# 获取玩家所有的成就任务
# 不存在就插入所有的任务
def getUserTaskList(uid, where=None, **kwargs):
    _w = {'uid': uid}
    if where: _w.update(where)
    _taskInfo = g.mdb.find('task', _w, **kwargs)
    return _taskInfo

# 生成所有的任务
def generateAllTask(uid):
    _taskInfo = []
    _con = g.GC['pre_task']
    _nt = g.C.NOW()
    _ele = {'isreceive': 0, 'uid': uid, 'lasttime': _nt, 'ctime': _nt, 'nval': 0}
    for type in _con:
        for k, v in _con[type].items():
            # 如果是起步任务
            if not v['pretask']:
                _temp = _ele.copy()
                _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                              'type': v['type'], 'stype': v['stype']})
                _taskInfo.append(_temp)

    g.mdb.insert('task', _taskInfo)


# 获取玩家单个任务的信息
def getUserTaskInfo(uid, taskid):
    _w = {'uid': uid, 'taskid': taskid}
    _taskInfo = g.mdb.find1('task', _w)
    return _taskInfo


# 根据taskid增加完成值
def setNvalByType(uid, taskid):
    pass


# 增加新数据
def setTaskInfo(uid, _type, idlist, data=None):
    _list = []
    _nt = g.C.NOW()
    _ele = {'isreceive': 0, 'uid': uid, 'lasttime': _nt, 'nval': 0, 'ctime': _nt}
    for _id in idlist:
        _con = getTaskConByType(_type, _id)
        _temp = _ele.copy()
        _temp.update({'taskid': _id, 'prize': _con['prize'], 'pval': _con['pval'],
                      'type': _con['type'], 'stype': _con['stype']})
        if data: _temp.update(data)

        _list.append(_temp)

    g.mdb.insert('task', _list)
    for i in _list: del i['_id']
    return _list


# 获取日常任务列表
@checkResetDailyTask
def getDailyTask(uid, **kwargs):
    _time = g.C.ZERO(g.C.NOW())
    _w = {'uid': uid, 'type': 2}
    _taskInfo = g.mdb.find('task', _w, **kwargs)
    return _taskInfo


# 获取任务红点的缓存值
def getTaskSendHDCache(uid):
    _cacheKey_randCode = 'TASK_HONGDIANSEND'
    return g.m.sess.get(uid, _cacheKey_randCode)


# 设置
def setTaskSendHDCache(uid, randcode):
    _cacheKey_randCode = 'TASK_HONGDIANSEND'
    return g.m.sess.set(uid, _cacheKey_randCode, randcode)


# 设置任务的值
def setTaskVal(uid, stype, chkcall=None, val=1, isinc=True, gt=False):
    _taskList = getUserTaskList(uid, {'isreceive': 0,'stype': stype}, fields=['_id'])
    # _taskList = filter(lambda x:x['stype']==stype, _taskList1)
    _con = g.GC['task']
    for i in _taskList:
        _taskid = i['taskid']
        taskCon = _con[_taskid]
        if not chkcall or not chkcall(taskCon['cond']):
            continue
        if gt and i['nval'] > val:
            continue
        if isinc:
            _data = {'$inc': {'nval': val}}
            i['nval'] += val
        else:
            _data = {'nval': val}
            i['nval'] = val
        g.mdb.update('task', {'uid': uid, 'taskid': _taskid, 'stype': stype}, _data)

    for i in _taskList:
        if i['nval'] >= i['pval']:
            g.m.mymq.sendAPI(uid, 'task_redpoint', '1')
            break


# 检测任务是否推送红点
def chkTaskHDisSend(uid):
    _taskList = getUserTaskList(uid, {'isreceive': 0}, fields=['_id'])
    for i in _taskList:
        if i['nval'] >= i['pval']:
            g.m.mymq.sendAPI(uid, 'task_redpoint', '1')
            break


def getTaskInitVal(uid, con):
    _retVal = 0

    _stype = con["stype"]
    _cond = con["cond"]
    # 完成全部日常任务
    if _stype == 101:
        _gud = g.getGud(uid)
        _retVal = _gud['lv']

    # 获得四星英雄
    elif _stype == 102:
        _retVal = g.mdb.count('hero', {'uid': uid, 'star': _cond[0]})
    # 分解英雄
    elif _stype == 103:
        _retVal = g.getAttrByCtype(uid, 'hero_fenjie', bydate=False)
    # 获得{1}件橙色装备
    elif _stype == 104:
        _retVal = g.mdb.count('equip', {'uid': uid, 'star': _cond[0]})
    # 自由竞技场胜{1}次
    elif _stype == 105:
        _retVal = g.getAttrByCtype(uid, 'zypkjjc_win', bydate=False)
    # 自由竞技场达到X分
    elif _stype == 106:
        _temp = g.m.zypkjjcfun.getUserJJC(uid)
        if _temp: _retVal = _temp.get('jifen', 0)
    # 完成X色悬赏
    elif _stype == 107:
        _info = g.getAttrOne(uid, {'ctype': 'xstask_finish'})
        if _info:
            _retVal = _info['v'].count(_cond[0])
    # 好友搜寻{1}次敌人
    elif _stype == 108:
        _retVal = g.getAttrByCtype(uid, 'friend_treasure', bydate=False)
    # 十字军通过第{1}关
    elif _stype == 109:
        _retVal = g.getAttrByCtype(uid, 'shizijun_pass', bydate=False)
    # 许愿获得{1}次5星英雄
    elif _stype == 110:
        _retVal = g.getAttrByCtype(uid, 'xuyuanchi_gethero', bydate=False)
    # 在世界树召唤{1}次
    elif _stype == 111:
        _retVal = g.getAttrByCtype(uid, 'worldtree_call', bydate=False)

    # 完成全部日常任务
    elif _stype in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11):
        _retVal = g.getAttrByCtype(uid, 'dailytask_stype_{}'.format(_stype))

    return _retVal


# 监听获取英雄事件
def onGetHero(uid, hid, num=1):
    _star = g.m.herofun.getHeroCon(hid)['star']

    def chk(c):
        return _star == c[0]

    setTaskVal(uid, 102, chkcall=chk, val=num)


# 监听玩家等级事件
def OnPlayDegree(uid, val=1):
    setTaskVal(uid, 101, chkcall=lambda a: True, isinc=False, val=val)


# 监听分解英雄事件
def OnFenjie(uid, *args, **kwargs):
    setTaskVal(uid, 103, chkcall=lambda a: True, **kwargs)


# 监听品质装备
def OnGetEquip(uid, eid, *args, **kwargs):
    _color = g.m.equipfun.getEquipCon(eid)["color"]

    def chk(c):
        return _color == c[0]

    setTaskVal(uid, 104, chkcall=chk,**kwargs)


# 监听自由竞技场获胜次数
def OnZyjjcWin(uid, *args, **kwargs):
    setTaskVal(uid, 105, chkcall=lambda a: True)


# 监听自由竞技场达到分数
def OnzyjjcScore(uid, *args, **kwargs):
    setTaskVal(uid, 106, chkcall=lambda a: True, isinc=False, **kwargs)


#  悬赏完成任务事件
def OnXstask(uid, _color, *args, **kwargs):
    def chk(c):
        return _color == c[0]

    setTaskVal(uid, 107, chkcall=chk)


# 监听好友探宝搜寻敌人事件
def OnSearchFriend(uid, *args, **kwargs):
    setTaskVal(uid, 108, chkcall=lambda a: True)


# 监听十字军试炼通过实践
def OnShilian(uid, val=1, *args, **kwargs):
    setTaskVal(uid, 109, chkcall=lambda a: True, isinc=False, val=val, gt=True)

# 监听十字军试炼通过实践
def OnShilianWin(uid, val=1, *args, **kwargs):
    setTaskVal(uid, 113, chkcall=lambda a: True, val=val)


# 监听在许愿池获得5星英雄
def OnXycGetHero(uid, *args, **kwargs):
    setTaskVal(uid, 110, chkcall=lambda x: True)


# 监听在世界树召唤事件
def OnWorldTree(uid, *args, **kwargs):
    setTaskVal(uid, 111, lambda x: True)


# 监听每日试炼挑战
def onMrslFight(uid):
    setTaskVal(uid, 112, lambda x: True)


# 监听获取探险收益
def onTanxianPrize(uid):
    setTaskVal(uid, 10, lambda x: True)


# 监听获取探险收益
def onZypkjjcFight(uid):
    setTaskVal(uid, 9, lambda x: True)

# 好友印记
def OnFriendYinji(uid, val=1):
    setTaskVal(uid, 114, lambda x: True, val=val)

# 域外争霸积分赛
def OnCrosszbJifen(uid):
    setTaskVal(uid, 115, lambda x: True)

# 监听日常任务完成
@checkResetDailyTask
def onDailyTask(uid, stype, val=1):
    setTaskVal(uid, stype, chkcall=lambda x: True, val=val)


# 监听升星任务
def onStarup(uid, tid):
    _res = g.m.herofun.getHeroInfo(uid, tid)
    _star = _res["star"]

    def chk(c):
        return _star == c[0]

    setTaskVal(uid, 102, chkcall=chk)


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    _prize = {'a': 'item', 't': '15025'}
    print OnShilian(uid, 102)

# 监听获取英雄

g.event.on('PlayDegree', OnPlayDegree)  # userfun  (监听接口名)
g.event.on('Fenjie', OnFenjie)  # api_hero_fenjie
g.event.on('GetEquip', OnGetEquip)  # api_equip_hecheng
g.event.on('ZyjjcWin', OnZyjjcWin)  # api_zypkjjc_fight
g.event.on('ZyjjcScore', OnzyjjcScore)  # api_zypkjjc_fight
g.event.on('Xstask', OnXstask)  # api_xstask_lingqu
g.event.on('SearchFriend', OnSearchFriend)  # api_friend_treasure
g.event.on('Shilian', OnShilian)  # api_shizijun_fight
g.event.on('Shilianwin', OnShilianWin)  # api_shizijun_fight
g.event.on('XycGetHero', OnXycGetHero)  # api_xuyuanchi_lottery
g.event.on('WorldTree', OnWorldTree)  # api_worldtree_call
g.event.on('FriendYinji', OnFriendYinji)  # 好友印记
g.event.on('CrosszbJifen', OnCrosszbJifen)  # 域外争霸积分赛

g.event.on('gethero', onGetHero)  # api_xuyuanchi_lottery
g.event.on("hero_star_up", onStarup)
g.event.on('mrsl_fight', onMrslFight)

# 监听每日任务完成
g.event.on('dailytask', onDailyTask)
