#!/usr/bin/python
# coding:utf-8

'''
开服狂欢管理模块
'''
import g


# 获取配置
def getKFKHcon(day, hdid):
    _con = g.GC['kaifukuanghuan']
    return _con[str(day)][str(hdid)]


# 获取当前开服狂欢完成度
def getFinishNum(uid):
    _allNum = getKfkhAllNum()
    _where = {'uid': uid, 'finish': 1}
    _finishNum = g.mdb.count("kfkhdata", _where)
    _proNum = (_finishNum * 10000) / _allNum
    _proNum = int(_proNum * 0.01)
    return _proNum


# 获取开服狂欢总数量
def getKfkhAllNum():
    _kfkhCon = g.GC['kaifukuanghuan']
    _num = 0
    for k, v in _kfkhCon.items():
        _num += len(v)
    return _num


# 获取我的开服狂欢数据
def getKfkhData(uid, where=None, **kwargs):
    _w = {"uid": uid}
    if where != None:
        # 如果是根据天数来取数据
        if 'day' in where:
            where = {'hdid': {'$in': map(lambda x:int(x), g.GC['kaifukuanghuan'][str(where['day'])].keys())}}
        _w.update(where)
    _rInfo = g.mdb.find("kfkhdata", _w, **kwargs)
    return _rInfo


# 检查是否在活动期间内
def checkIsOpen(uid,day=7):
    gud = g.getGud(uid)
    _opTime = g.C.ZERO(gud['ctime'])
    _nt = g.C.NOW()
    _diffDay = g.C.getTimeDiff(_nt, _opTime, 0)
    # _retVal = _diffDay + 1
    # if _diffDay > day or _diffDay == 0:
    if _diffDay >= day or _diffDay < 0:
        return False

    return True


# 获取现在活动在哪一天
def getKfkhDay(uid):
    gud = g.getGud(uid)
    _opTime = gud['ctime']
    _nt = g.C.NOW()
    _diffDay = g.C.getTimeDiff(_nt, _opTime, 0)
    _retVal = _diffDay + 1
    return _retVal


# 生成今日活动信息
def genrateDayInfo(uid, _nDay=None):
    if _nDay == None: _nDay = getKfkhDay(uid)
    _chkRes = checkIsOpen(uid)
    # 活动已结束
    if not _chkRes: return
    _myKfkhData = getKfkhData(uid, where={"day": _nDay}, limit=1)
    # 今日已生成,无须再生成
    if len(_myKfkhData) > 0: return
    _con = g.GC['kaifukuanghuan'][str(_nDay)]
    _addData = []
    _retVal = []
    for hdid, hddata in _con.items():
        _nVal = getCondVal(uid, _nDay, hdid)
        _fmtData = fmtData(uid, _nDay, hdid, nval=_nVal)
        # _retVal.append({"hdid": hdid, "pval": _fmtData["pval"], "nval": _nVal, "finish": 0})
        _addData.append(_fmtData)

    g.mdb.insert('kfkhdata', _addData)
    for i in _addData:
        del i['_id']
    return _addData


# 生成今日活动信息
def genrateInfo(uid):
    _chkRes = checkIsOpen(uid)
    # 活动已结束
    if not _chkRes: return
    _myKfkhData = getKfkhData(uid, where={}, limit=1)
    # 今日已生成,无须再生成
    if len(_myKfkhData) > 0: return
    _con = g.GC['kaifukuanghuan']
    _addData = []
    _retVal = []
    for _nDay, info in _con.items():
        for hdid, hddata in info.items():
            _nVal = getCondVal(uid, _nDay, hdid)
            _fmtData = fmtData(uid, _nDay, hdid, nval=_nVal)
            # _retVal.append({"hdid": hdid, "pval": _fmtData["pval"], "nval": _nVal, "finish": 0})
            _addData.append(_fmtData)

    g.mdb.insert('kfkhdata', _addData)
    for i in _addData:
        del i['_id']
    return _addData





# 格式化数据
def fmtData(uid, day, hdid, nval=0):
    _data = {}
    day = int(day)
    hdid = int(hdid)
    _nt = g.C.NOW()
    _con = getKFKHcon(day, hdid)
    _data["uid"] = uid
    # 活动天数
    _data["day"] = day
    # 活动id
    _data["hdid"] = hdid
    # 目标值
    _data["pval"] = _con["pval"]
    # 活动类型
    _data["htype"] = _con["htype"]
    # 当前值
    _data["nval"] = nval
    # 所属标签分类
    _data["tab"] = _con["tab"]
    # 是否已完成
    _data["finish"] = 0
    # 时间戳
    _data["lasttime"] = _nt
    _data["ctime"] = _nt
    return _data


# 获取条件值
def getCondVal(uid, day, hdid, defval=0):
    day = int(day)
    hdid = int(hdid)
    _con = getKFKHcon(day, hdid)
    _cond = _con["cond"]
    _htype = _con["htype"]
    _retVal = defval
    # 今日登陆可领取
    if _htype == 1:
        _oday = getKfkhDay(uid)
        _retVal = 1
        if _oday > day:
            _retVal = 0
    # 累计充值
    elif _htype == 2:
        _retVal = g.m.payfun.getAllPayYuan(uid)
    # 全民半价
    elif _htype == 3:
        _retVal = 1
    # 探险通关
    elif _htype == 11:
        _tmpGud = g.getGud(uid)
        _tmpVal = _tmpGud['maxmapid']
        # 通关boss进度 = 通关地图id - 1 (第x关boss)
        _retVal = _tmpVal - 1
    # 赠送好友印记
    elif _htype == 12:
        _retVal = 0
        _info = g.getAttrOne(uid, {'ctype': 'friend_yinji'})
        if _info:
            _retVal = _info.get('sendnum', 0)
    # 法师塔通关
    elif _htype == 13:
        _fashita = g.mdb.find1('fashita', {'uid': uid}, fields=['_id','layernum']) or {'layernum': 0}
        _retVal = _fashita['layernum']

    # 竞技场最高分
    elif _htype == 15:
        _retVal = g.m.zypkjjcfun.getZypkjjcJifen(uid)

    # 拥有120级以上等级的英雄
    elif _htype == 16:
        _heroList = g.m.herofun.getMyHeroList(uid, where={'lv': {'$gte': _cond[0]}})
        _retVal = len(_heroList)

    # 十字军通关
    elif _htype == 19:
        _retVal = len(g.m.shizijunfun.getPassList(uid))
    # 获得X名X星英雄
    elif _htype == 20:
        _retVal = g.mdb.count('hero', {'uid': uid, 'star': {'$gte':_cond[0]}})
    # 英雄宝石达到X色X星
    elif _htype == 21:
        _w = {'baoshilv': {'$gte': _cond[0]}, 'uid': uid}
        _retVal = g.mdb.count('hero', _w)

    # 玩家达到多少级
    elif _htype == 24:
        _retVal = g.getGud(uid)['lv']
    return _retVal


# 设置开服狂欢数据
def setKfkhData(uid, where, data):
    _w = {"uid": uid}
    _w.update(where)
    _nt = g.C.NOW()
    _data = {"$set": {"lasttime": _nt}}
    if str(data.keys()).find("$") != -1:
        _data.update(data)
    else:
        _data["$set"].update(data)

    _rInfo = g.mdb.update("kfkhdata", _w, _data)
    return _rInfo


# 获取完成度奖励
def getFinishProPrize(uid):
    _where = {'ctype': 'kfkh_finishprize'}
    _data = g.getAttr(uid, _where)
    _res = []
    if _data != None: _res = _data[0]['v']
    return _res


# 设置完成度奖励
def setFinishProPrize(uid, rec):
    _where = {'ctype': 'kfkh_finishprize'}
    g.setAttr(uid, _where, {'v': rec})


# 登陆时拉取开服狂欢是否开启
def getKfkh(uid):
    act = 0
    if checkIsOpen(uid):
        act = 1

    _opTime = g.C.ZERO(g.getGud(uid)['ctime'])
    etime = _opTime + 7 * 24 * 3600
    res = {"act": act, "kfkhetime": etime}
    return res


# 监听开服狂欢
def onKFKH(uid, htype, day, val=1, cond=0,*args, **kwargs):
    if not g.m.kfkhfun.checkIsOpen(uid):
        return

    # 数据不存在就会生成
    genrateInfo(uid)
    # 今日充值
    if htype == 2:
        setKfkhData(uid, {'htype': 2}, {'$inc': {'nval': val}})

    # 探险通关
    elif htype == 11:
        setKfkhData(uid, {'htype': 11}, {'nval': val})

    # 友情印记赠送
    elif htype == 12:
        setKfkhData(uid, {'htype': 12}, {'$inc': {'nval': val}})

    # 法师塔通关
    elif htype == 13:
        setKfkhData(uid, {'htype': 13}, {'nval': val})

    # 祭坛招募
    elif htype == 14:
        setKfkhData(uid, {'htype': 14}, {'$inc': {'nval': val}})

    # 竞技场最高分
    elif htype == 15:
        setKfkhData(uid, {'nval': {'$lt': val}, 'htype': 15}, {'nval': val})

    # # 英雄升级
    elif htype == 16:
        _hdidList = [int(k) for _,_con in g.GC['kaifukuanghuan'].items() for k, v in _con.items() if v['htype'] == 16 and v['cond'][0] == cond]
        if _hdidList:
            setKfkhData(uid, {'htype': 16, 'hdid': {"$in": _hdidList}}, {'$inc': {'nval': 1}})

    # 悬赏任务完成
    elif htype == 17:
        _hdidList = [int(k) for _,_con in g.GC['kaifukuanghuan'].items() for k, v in _con.items() if v['htype'] == 17 and v['cond'][0] <= cond]
        setKfkhData(uid, {'htype': 17, 'hdid': {"$in": _hdidList}}, {'$inc': {'nval': 1}})

    # 悬赏任务刷新
    elif htype == 18:
        setKfkhData(uid, {'htype': 18}, {'$inc': {'nval': 1}})

    # 十字军战斗胜利
    elif htype == 19:
        setKfkhData(uid, {'htype': 19, 'nval': {'$lt': val}}, {'nval': val})

    # 获得X星英雄
    elif htype == 20:
        _hdidList = [int(k) for _,_con in g.GC['kaifukuanghuan'].items() for k, v in _con.items() if v['htype'] == 20 and v['cond'][0] == cond]
        setKfkhData(uid, {'htype': 20, 'hdid': {"$in": _hdidList}}, {"$inc": {'nval': 1}})

    # 英雄宝石达到X色X星
    elif htype == 21:
        _hdidList = [int(k) for _,_con in g.GC['kaifukuanghuan'].items() for k, v in _con.items() if v['htype'] == 21 and v['cond'][0] == cond]
        _w = {'baoshilv': {'$gte': cond}, 'uid': uid}
        _retVal = g.mdb.count('hero', _w)
        setKfkhData(uid,{'htype':htype,'hdid':{'$in':_hdidList}, 'nval':{'$lt':_retVal}},{'nval':_retVal})

    # 许愿池抽奖
    elif htype == 22:
        setKfkhData(uid, {"htype": 22}, {'$inc': {'nval': val}})

    # 合成N星英雄
    elif htype == 23:
        _hdidList = [int(k) for _,_con in g.GC['kaifukuanghuan'].items() for k, v in _con.items() if v['htype'] == 23 and v['cond'][0] == cond]
        setKfkhData(uid, {'htype': 23, 'hdid':{'$in':_hdidList}}, {"$inc": {'nval': 1}})

    # 玩家达到多少级
    elif htype == 24:
        setKfkhData(uid,{'htype':htype},{'nval':val})

    # 监测红点
    _data = getKfkhData(uid, {'htype': htype,'finish': 0})
    for i in _data:
        if i['nval']  >= i['pval']:
            g.m.mymq.sendAPI(uid, 'kfkh_redpoint', '1')
            break

g.event.on('kfkh', onKFKH)

if __name__ == '__main__':
    uid = g.buid("666")
    # print g.m.payfun.getAllPayYuan(uid)
    g.mdb.update('kfkhdata',{},{'nval':99999})