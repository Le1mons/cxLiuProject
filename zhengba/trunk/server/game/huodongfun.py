#! /usr/bin/python
# -*- coding:utf-8 -*-


'''
    活动公共方法

活动相关方法
htype 活动类型:

具体活动实现文件里面要添加的方法

initHdData


4 -- 等级基金
7 -- 限时掉落
10 -- 限时兑换
11 积天返利
12 -- 超值礼包
13 -- 累计充值
14 -- 点金达人
15 -- 远征统帅
16 -- 赏金奇兵
'''

import g
import os
import sys

# 全局活动htype数组
HTPY = []

# 活动列表处理方法
HDLISTFUNC = {}

# 活动打开方法
HDOPENFUNC = {}

# 活动使用方法
HDUSEDFUNC = {}

# 活动红点方法
HDHDFUNC = {}

# 活动事件
HDEVENT = {}

# 初始化用户的活动数据 hddata集合中的数据
INITHDDATA = {}

# 活动名称，保存文件用
HDFILENAME = []


def getFunctionName():
    """
    返回当前文件名去掉fun.py
    :return: str
    """
    file_name = os.path.basename(__file__)
    _file_name = file_name.split('.')[0]
    return _file_name[:-3]


# 活动获取列表,主要用于显示 hdvtype='weixin' 用于分流微信红包活动
def getOpenList(uid=None, isid=0, field=None, isrtime=0, isdouble=0, hdvtype="", isxianshi=1):
    # print "hdvtype",hdvtype
    hdwhere = {}
    nt = g.C.NOW()
    # 查询条件
    hdwhere['stime'] = {'$lte': nt}
    hdwhere['$or'] = [{'etime': {'$gte': nt}}, {'etime': 0}]
    # 非倍数活动前端模板不为0
    if isdouble == 0:
        hdwhere["stype"] = {"$ne": 0}
    hdwhere['ttype'] = 0
    # 查询字段
    hdfields = ['_id', 'showtime', 'hdid', 'name', 'img', 'arg', 'showitem',
                'itype', 'intr', 'stype', 'etime', 'rtime', 'htype', 'icon',
                'order', 'btntype', 'data', 'icon', 'model', 'buff', 'tips','show','isqingdian']
    if uid:
        gud = g.getGud(uid)
        exTime = gud['ctime']
        czt = g.C.ZERO(exTime)
        pDay = (nt - czt) // (24 * 3600)
        hdwhere = {'$or': [hdwhere, {'ttype': 1, 'stime': {'$lte': pDay}, 'etime': {'$gt': pDay}},{'ttype': 3,'rtime':{'$gt':nt},'stime': {'$lt':nt}}]}
        hdfields = list(set(hdfields + ['ttype', 'stime', 'etime', 'rtime', 'arg']))

    # 筛选有代码的活动
    hdwhere['htype'] = {'$in': HTPY}

    # 分类显示 微信红包活动
    if hdvtype == "weixin":
        hdwhere['htype'] = {'$in': [300, 310, 301]}

    # 查询数据
    if field:
        hdfields = ['_id'] + field
    hddata = g.mdb.find('hdinfo', where=hdwhere, fields=hdfields)
    if isxianshi:
        # 移除限时活动里的等级基金 月基金
        hddata = [i for i in hddata if i['htype'] not in (4, 170)]
    hdfmtDict = {}

    _con = g.GC['showhd']['notshowhtype']
    exception = []
    for hd in hddata:
        htype = hd['htype']
        hdid = hd['hdid']
        hd['isxianshi'] = isxianshi
        # 执行各个活动中对应的方法
        rehd = HDLISTFUNC[htype](uid, hd)
        if rehd:
            hdfmtDict[hdid] = rehd
        if htype in exception:
            hdfmtDict[hdid] = hd

    if isid:
        hddata = [e for e in hdfmtDict]
    else:
        hddata = [hdfmtDict[e] for e in hdfmtDict]

    return hddata



# 活动获取原始活动列表
def getBaseOpenList(uid=None, field=None,isrtime=0, isdouble=0, hdvtype="", isxianshi=1):
    hdwhere = {}
    nt = g.C.NOW()
    # 查询条件
    hdwhere['stime'] = {'$lte': nt} #开始时间小于现在
    hdwhere['$or'] = [{'etime': {'$gte': nt}}, {'etime': 0}] #结束时间大于现在或者为0
    hdwhere['ttype'] = {"$in": [0, 3, 4]}
    # 非倍数活动前端模板不为0
    if isdouble == 0:
        hdwhere["stype"] = {"$ne": 0}
    # 查询字段
    hdfields= ['_id', 'data','showtime', 'hdid', 'name', 'img', 'arg', 'itype', 'intr', 'stype', 'etime','buff','rtime', 'htype', 'order', 'btntype', 'icon', "model","lihui","hot","tips"]
    if uid:
        gud=g.getGud(uid)
        exTime = gud['ctime']
        czt = g.C.ZERO(exTime)
        pDay = (nt - czt) // (24 * 3600)
        hdwhere = {'$or': [hdwhere, {'ttype': {"$in":[1, 3]}, 'stime': {'$lte': pDay}, 'etime': {'$gt': pDay}}]}
        hdfields = list(set(hdfields + ['ttype', 'stime', 'etime', 'rtime', 'arg']))
    # 筛选有代码的活动
    hdwhere['htype'] = {'$in': HTPY}
    # 分类显示 微信红包活动
    if hdvtype == "weixin":
        hdwhere['htype'] = {'$in': [300, 310, 301]}
    # 查询数据
    if field:
        hdfields= ['_id'] + field
    hddata = g.mdb.find("hdinfo", where=hdwhere, fields=hdfields)
    if isxianshi:
        # 移除限时活动里的等级基金
        hddata = [i for i in hddata if i['htype'] != 4]
    return hddata


# 获取活动信息
def getInfo(hdid, keys=None):
    """
    # remove
    获取 ``hdinfo`` 集合中的数据

    :param hdid:
    :param keys:
    :return:
    """
    hdwhere = {}
    _islist = 0
    if hdid:
        if isinstance(hdid, list):
            hdwhere['hdid'] = {'$in': hdid}
            _islist = 1
        else:
            hdwhere['hdid'] = hdid

    # dfeilds = ['_id', 'htype', 'data', 'hdid', 'arg']
    dfeilds = ['_id']
    if keys:
        dfeilds += keys.split(',')
    hdinfo = g.mdb.find('hdinfo', hdwhere, fields=dfeilds)
    if hdinfo and not _islist:
        hdinfo = hdinfo[0]
    return hdinfo


# 通过htypes获取当前的活动列表
def getIDSByHypes(htypes=[]):
    nt = g.C.NOW()

    _where = {}
    _where['htype'] = {'$in': htypes}
    _where['stime'] = {'$lte': nt}
    # _where['$or'] = [{'etime': {'$gte': nt}}, {'etime': 0}]
    _where['$and'] = [
        {"$or": [{'etime': {'$gte': nt}}, {'etime': 0}]},
        {"$or": [{'stime': {'$lte': nt}}, {'stime': 0}]}
    ]

    hdInfos = g.mdb.find('hdinfo', _where)
    return hdInfos


# 获取活动数据
def getHDData(uid, hdid, keys=None):
    hdwhere = {'hdid': hdid, 'uid': uid}
    _islist = 0
    if isinstance(hdid, list):
        hdwhere['hdid'] = {'$in': hdid}
        _islist = 1
    # 默认读取的key
    dfeilds = ['_id', 'val', 'gotarr']
    if keys:
        dfeilds += keys.split(',')
    hddata = g.mdb.find('hddata', hdwhere, fields=dfeilds)
    if hddata and not _islist:
        hddata = hddata[0]
    return hddata


# 设置活动数据
def setHDData(uid, hdid, data):
    hdwhere = {'uid': uid, 'hdid': hdid}
    _keyList = [tmp for tmp in data if '$' in tmp]
    if '$set' in data:
        data['$set']['lasttime'] = g.C.NOW()
    elif not _keyList:
        data['lasttime'] = g.C.NOW()
    else:
        data['$set'] = {'lasttime': g.C.NOW()}

    _r = g.mdb.update('hddata', hdwhere, data, upsert=True)
    # 活动红点推送 uid 为 HOMM_SYSTEM 不触发
    if uid != 'HOMM_SYSTEM':
        g.event.emit("checkHongdian", uid, getFunctionName())
    return _r


# 活动打开接口
def getHuodongData(uid, hdid):
    """
    huodong_open 单独打开活动数据 没个活动中调用会调用 ``getOpenData(uid, hdinfo)``

    :param uid:
    :param hdid:
    :return:
    """
    hdInfo = getInfo(hdid)
    hdData = HDOPENFUNC[hdInfo['htype']](uid, hdInfo)
    return hdData


# 使用活动
def getPrize(uid, hdid, *args, **kwargs):
    hdInfo = getInfo(hdid)
    useData = HDUSEDFUNC[hdInfo['htype']](uid, hdInfo, *args, **kwargs)
    return useData


def getHuodongInfo(where=None, *arg, **kwargs):
    _res = g.mdb.find("hdinfo", where, *arg, **kwargs)
    return _res


# 获取活动信息
# iscache 是否缓存
def getHuodongInfoById(hdid, keys='', iscache=1, *arg, **kwargs):
    """
    获取活动 ``hdinfo`` 集合中的数据

    :param hdid:
    :param keys:
    :param iscache:
    :param arg:
    :param kwargs:
    :return:
    """
    hdid = int(hdid)
    _cacheKey = "HDINFO_" + str(hdid)
    _cacheInfo = g.mc.get(_cacheKey)
    if _cacheInfo != None and iscache == 1:
        _res = _cacheInfo
    else:
        _res = getHuodongInfo({"hdid": hdid}, *arg, **kwargs)
        if len(_res) == 0:
            return (None)
        else:
            _res = _res[0]
        if iscache == 1: g.mc.set(_cacheKey, _res)
    # 过滤key
    if keys != "":
        _tmpArr = keys.split(",")
        _newInfo = {}
        for k, v in _res.items():
            if k in _tmpArr: _newInfo[k] = v

        _res = _newInfo

    return (_res)


# 活动红点
def getCanFinishHD(uid, hdid=None):
    canFinish = {'huodong': [],'qingdian':[]}
    if hdid:
        openHd = getInfo(hdid)
    else:
        _mcKey = 'huodongevent_hdlist'
        # 获取活动列表
        openHd = g.mc.get(_mcKey)
        if not openHd:
            openHd = getBaseOpenList(uid, field=['data', 'htype', 'hdid', 'rtime', 'etime', 'arg', 'stime','isqingdian'])
            g.mc.set(_mcKey, openHd, time=5)
    if isinstance(openHd, dict):
        openHd = [openHd]
    _nt = g.C.NOW()
    for hd in openHd:
        if hd['etime'] <= _nt and hd['etime'] != 0:
            continue
        fhdid = HDHDFUNC[hd['htype']](uid, hd['hdid'], hd)
        if fhdid:
            canFinish['qingdian' if hd.get('isqingdian') else 'huodong'].append(hd['hdid'])
    return canFinish


# 活动事件
def event(uid, etype, *args, **kwargs):
    _mcKey = 'huodongevent_hdlist_event_{}'.format(uid)
    # 获取活动列表
    _hdList = g.mc.get(_mcKey)
    if not _hdList:
        # _hdList = getOpenList(uid, 0, ['htype', 'data', 'hdid', 'rtime', 'etime', 'arg'], isxianshi=0)
        _hdList = getBaseOpenList(uid, field=['htype', 'data', 'hdid', 'rtime', 'etime', 'arg'], isxianshi=0)
        g.mc.set(_mcKey, _hdList, time=5)
    _nt = g.C.NOW()
    for hdinfo in _hdList:
        if hdinfo['rtime'] < _nt and hdinfo['rtime'] != 0:
            continue
        if 'htype' not in hdinfo:
            continue
        htype = hdinfo['htype']
        try:
            HDEVENT[htype](uid, hdinfo, etype, *args, **kwargs)
        except Exception as e:
            print('hdevent err!!! id: {0}'.format(hdinfo['hdid']))
            print(e)
    return 1


'''
    活动初始化
'''


def getAllHd():
    # 活动逻辑目录
    pyfile = os.listdir(__file__.split('huodongfun.py')[0] + 'huodong/')
    # 寻找所有.py 文件
    pylist = [py.split('.py')[0] for py in pyfile if py.find('__') != 0 and '.py' in py and '.pyc' not in py]
    for pypack in pylist:
        HDFILENAME.append(pypack)
        # 遍历所有活动逻辑文件，加载入huodongfun
        # print(__package__)
        __modname = 'huodong.' + pypack

        try:
            __tmpmod = __import__(__modname)
        except:
            __modname = 'huodong.' + pypack
            __tmpmod = __import__(__modname)

        # __tmpmod = __import__(__modname)
        __mod = sys.modules[__modname]
        __hdhtype = __mod.htype
        # 添加活动类型
        HTPY.append(__hdhtype)
        # 增加活动列表检测方法
        HDLISTFUNC[__hdhtype] = __mod.getOpenList
        # 增加活动打开数据方法
        HDOPENFUNC[__hdhtype] = __mod.getOpenData
        # 增加使用活动方法
        HDUSEDFUNC[__hdhtype] = __mod.getPrize
        # 增加能完成的活动方法
        HDHDFUNC[__hdhtype] = __mod.getHongdian
        # 增加活动事件
        HDEVENT[__hdhtype] = __mod.hdEvent
        # 初始化用户的活动数据 hddata集合中的数据
        INITHDDATA[__hdhtype] = __mod.initHdData
        del sys.modules[__modname]
        if 'getAllHd' in __tmpmod.__dict__:
            del __tmpmod.__dict__['getAllHd']


# 打印活动htype列表
def SaveHDList():
    _path = __file__.split('huodongfun.py')[0] + '/huodong/hdlist.txt'
    txtFile = open(_path, 'wb')
    witeDict = zip(HTPY, HDFILENAME)
    witeDict.sort(key=lambda e: e[0])
    for hdinfo in witeDict:
        txtFile.write(str(hdinfo[0]) + " : " + str(hdinfo[1]) + '\r\n')
    txtFile.close()


# starup 中会调用
def addHuodongInfo(data):
    _res = g.mdb.insert("hdinfo", data)
    return _res


# 获取我的活动数据
def getMyHuodongData(uid, hdid, keys='', *args, **kwargs):
    hdid = int(hdid)
    _w = {"uid": uid, "hdid": hdid}
    if keys != '': kwargs["fields"] = keys.split(",")
    # _res = g.m.dbhuodong.getHuodongData(_w,*arg,**kwargs)
    _res = g.mdb.find("hddata", _w, *args, **kwargs)
    # 没有活动数据 生成活动数据
    if len(_res) == 0:
        hdData = getHuodongInfoById(hdid, keys='_id,htype')
        htype = hdData['htype']
        initdata = INITHDDATA[htype](uid, hdid, *args, **kwargs)
        _res = g.mdb.find("hddata", _w, *args, **kwargs)
        _res = _res[0]
    else:
        _res = _res[0]
    return (_res)






# 设置我的活动数据
def setMyHuodongData(uid, hdid, data):
    hdid = int(hdid)
    _w = {"uid": uid, "hdid": hdid}
    _data = {"$set": {}}
    for k, v in data.items():
        if str(k).startswith("$"):
            _data[k] = v
        else:
            if "$set" not in _data:
                _data["$set"] = {}
            _data["$set"][k] = v

    _data["$set"]["lasttime"] = g.C.NOW()
    # _res = g.m.dbhuodong.setHuodongData(_w,_data)
    _res = g.mdb.update("hddata", _w, _data, upsert=True)
    return (_res)


# 活动数据统计，用于在gameconfig后台统计活动参与度数据
def analysisData(uid, hdid, k, addVal):
    # _r = setMyHuodongData(uid, hdid, {"$inc":{"analy."+str(k) :addVal}})
    _r = setHDData(uid, hdid, {"$inc": {"analy." + str(k): addVal}})
    return _r


# 获取该倍数活动值,未开启时默认val为1
# ttype如下
# txexp -- 探险 基础经验双倍
# txres -- 探险 各种资源产量双倍
# mrslres -- 每日试炼产出双倍
# pkjjcres -- 竞技场每日结算奖励双倍
# jyfbres -- 精英关卡挑战奖励双倍

def getTimesValue(uid, ttype):
    _ttype2Map = {
        "1": "txexp",
        "2": "txres",
        "3": "mrslres",
        "4": "pkjjcres",
        "5": "jyfbres"
    }
    ttype = str(ttype)
    # 方便程序调用,k/v映射
    if ttype in _ttype2Map: ttype = _ttype2Map[ttype]
    _list = getOpenDoubleList(uid)
    _retVal = {"val": 1}
    if ttype in _list: _retVal = _list[ttype]
    return (_retVal)


# 获取双倍活动开启列表
def getOpenDoubleList(uid, keys='_id,data,stime,etime'):
    _cacheKey = "TIMESHD"
    _cacheInfo = g.mc.get(_cacheKey)
    _retVal = {}
    if _cacheInfo != None:
        _retVal = _cacheInfo
    else:
        _list = getOpenList(uid, keys, isdouble=1, htype=6, keys=keys)
        # 获取所有激活的data项
        for ele in _list:
            _data = ele["data"]
            for k, v in _data.items():
                _retVal[k] = {"val": v, "stime": ele["stime"], "etime": ele["etime"]}

    return (_retVal)


# 获取活动奖励
def getTimesPrize(uid, ttype, prize):
    _hdinfo = getTimesValue(uid, ttype)
    _hdVal = _hdinfo["val"]
    _prize = prize
    # 计算活动倍数奖励
    if _hdVal > 1:
        _prize = []
        for ele in prize:
            _tmpData = {}
            _tmpData.update(ele)
            _tmpData["n"] = _tmpData["n"] * _hdVal
            _prize.append(_tmpData)

    if isinstance(_prize, tuple):
        _prize = list(_prize)

    return (_prize)


# 微信红包登录判断是否显示
def weixinghongbao(uid):
    _hdList = getOpenList(uid, hdvtype="weixin")
    if len(_hdList) > 0:
        return 1
    return 0


# 活动红点 huodong
def getHongDian(uid):
    """
    :param uid:
    :return:  hdidlist  [300,3001, ...]
    """
    _rData = getCanFinishHD(uid)
    return _rData


# 发送每周活动奖励
def timer_sendPrize(_htype, iszchd=True, cond=None):
    _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    _w = {'ctype': 'huodong_' + str(_htype), 'k': _dKey}
    _data = g.mdb.find1('rankprize', _w)
    if _data:
        print "ZhouChangHD Already Send==", _dKey, _htype
        return

    _info = g.mdb.find('hdinfo', {'htype': _htype, 'etime': {"$gte": _nt}, 'rtime': {'$lte': _nt}})
    if not _info:
        print "ZhouChangHD Not Send==", _dKey, _htype
        return

    _resList = []
    for x in _info:
        _hdid = x['hdid']
        _rankprize = x['data']['rankprize']
        _where = {'hdid': _hdid}
        if cond: _where.update(cond)
        _rank = g.mdb.find('hddata', _where, sort=[['val', -1], ['settime', 1]], limit=1000)
        _title = x['data']['email']['title']
        for idx, i in enumerate(_rank):
            _temp = {}
            _temp['rank'] = idx + 1
            _temp['uid'] = i['uid']
            _content = g.C.STR(x['data']['email']['content'], _temp['rank'])
            _prize = getPrizeByRank(_temp['rank'], _rankprize)
            g.m.emailfun.sendEmails([i['uid']], 1, _title, _content, _prize)
            _temp['issend'] = 1
            if iszchd:
                _temp['mark'] = x['data']['mark']
            _resList.append(_temp)

    g.mdb.update('rankprize', _w, {'v': _resList, 'lasttime': _nt}, upsert=True)


# 根据排名获取奖励
def getPrizeByRank(rank, con):
    if rank >= con[-1][0][0]:
        return con[-1][1]
    for i in con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]
    return []


# 通过htype检测活动是否开启
def chkHDopen(htype):
    _res = 0
    _w = {'htype': htype, 'etime': {'$gte': g.C.NOW()}, 'stime': {'$lte': g.C.NOW()}}
    # 周常活动的唯一标识
    _hdInfo = g.mdb.find1('hdinfo', _w)
    if _hdInfo:
        _res = _hdInfo['etime']
    return _res


# 通过mark检查周常活动是否开启
def chkZCHDopen(mark):
    # 周常活动默认htype是14
    htype = 14
    _res = 0
    _w = {'htype': htype, 'rtime': {'$gte': g.C.NOW()}, 'data.mark': mark, 'stime': {'$lte': g.C.NOW()}}
    # 周常活动的唯一标识
    _hdInfo = g.mdb.find1('hdinfo', _w)
    if _hdInfo:
        _res = _hdInfo['etime']
    return _res


# 设置周常活动的值
def setZCHDval(uid, mark, val=1):
    # 周常活动的htype
    htype = 14
    _nt = g.C.NOW()
    _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'data.mark': mark, 'etime': {'$gte': _nt}, 'stime': {'$lte': _nt}})
    if _hdInfo:
        _nt = g.C.NOW()
        _data = getMyHuodongData(uid, _hdInfo['hdid'], keys='_id,val')
        _val = _data['val'] + val
        if mark == 'shizijun':
            # 一天最多15次
            _maxVal = (g.C.getDateDiff(_hdInfo['stime'], g.C.NOW()) + 1) * 15
            _val = min(_maxVal, _val)

        _setData = {'$set': {'settime': _nt, 'val': _val}}
        g.mdb.update('hddata', {'uid': uid, 'hdid': _hdInfo['hdid'], 'val': _data['val']}, _setData)

# 监听周常活动红点
def onZCHDredpoint(uid):
    _res = g.m.hongdianfun.getAllHongdian(uid, ['zhouchanghuodong'])
    g.m.mymq.sendAPI(uid, 'zchd_redpoint', _res)


# 监听开服冲级红点
def onKFCJredpoint(uid, lv):
    _htype = 1
    _hdinfo = g.mdb.find1('hdinfo', {'htype': _htype}, fields=['_id', 'hdid', 'data'])
    if not _hdinfo:
        return
    hdid = _hdinfo['hdid']
    setMyHuodongData(uid, hdid, {'val': lv})
    for i in _hdinfo['data']['arr']:
        if lv >= i['val'] and i['buynum'] >= 1:
            g.m.mymq.sendAPI(uid, 'activity_redpoint', 'kfcj')
            break


# 监听累计消费
def onLeijixiaofei(uid, _type, val):
    if _type != 'rmbmoney' or val > 0:
        return

    _htype = 16
    _key = 'huodong_' + str(_htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo['rtime']:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': _htype, 'rtime': {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id','rtime','hdid','stime','data'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {'rtime': g.C.ZERO(_nt)}, g.C.ZERO(_nt + 3600*24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo['rtime'] - _nt)

    if _nt >= _hdInfo['rtime']:
        return

    _hdid = _hdInfo['hdid']
    _setData = {'$inc': {"val": abs(val)}, '$set': {'lasttime': _nt}}
    setHDData(uid, _hdid, _setData)


# 重启开启重置任务
def rePeatHuoDong(opentime=None):
    def fmtShowTime(demo, stime, etime):
        _showTime = str(demo)
        _keys = {
            'stime': ['{SY}', '{SM}', '{SD}'],
            'etime': ['{EY}', '{EM}', '{ED}']
        }
        _sTimeDate = g.C.DATE(stime).split('-')
        _eTimeDate = g.C.DATE(etime - 1).split('-')
        _idx = 0
        for k in _keys['stime']:
            _showTime = _showTime.replace(k, _sTimeDate[_idx])
            _idx += 1

        _idx = 0
        for k in _keys['etime']:
            _showTime = _showTime.replace(k, _eTimeDate[_idx])
            _idx += 1

        return _showTime

    # 周常活动htype
    _delHtype = 14
    _nt = g.C.NOW()
    if opentime: _nt = opentime
    _hddata = g.mdb.find('hdinfo', {'htype': _delHtype},
                         fields=['hdid', 'showtimedemo', 'repeatday', 'stime', 'etime', 'rtime','data'])
    _hdidList = [ele['hdid'] for ele in _hddata]

    # 修改轮回规则
    _preHdId = '300'
    _mark2id = {v['data']['mark']:k for k,v in g.GC['zchuodong'].items()}
    for hd in _hddata:
        if hd['rtime'] > _nt:
            continue

        # 删除过期活动
        _preHdId = _mark2id[hd['data']['mark']]
        g.mdb.delete('hdinfo', {'hdid': hd['hdid']})

    # 检测是否还有周常活动
    _chkNum = g.mdb.count('hdinfo', {'htype': _delHtype})
    if _chkNum > 0:
        return

    _zchdCon = g.GC['zchdloop']
    # 开区天数
    _openDay = g.getOpenDay()
    # 活动天数
    _chkSize = _zchdCon['loopsize']
    # 活动id列表
    _loopHid = list(_zchdCon['loophdid'])
    # 获取余数为下标
    _weekSize = divmod(_openDay, _chkSize)[0]
    # _hdIdx = divmod(_weekSize, len(_loopHid))[1]
    _hdIdx = _loopHid.index(_preHdId) + 1
    if _hdIdx >= len(_loopHid): _hdIdx = 0
    _hdid = _loopHid[_hdIdx]
    _hdCon = g.GC['zchuodong'][_hdid]
    # import copy
    _zcData = g.C.dcopy(dict(_hdCon))
    # print '_hdContype====',type(_hdCon)
    # print '_zcData====',type(_zcData)

    _idx = 0
    _extPrize = list(_zchdCon['extprize'])
    _gid = _extPrize[0]['dlp']
    _dlPrize = g.m.diaoluofun.getGroupPrize(_gid)

    _arr = []
    for d in _zcData['data']['arr']:
        _tmp = list(d['p'])
        _num = _extPrize[_idx]['num']
        _tmpItem = {'a': _dlPrize[0]['a'], 't': _dlPrize[0]['t'], 'n': _num}
        _idx += 1
        _tmp.append(_tmpItem)
        d['p'] = _tmp
        _arr.append(d)

    # print _zcData['data']['arr']
    _addTime = _chkSize * 3600 * 24
    _zeroTime = g.C.getZeroTime(_nt)
    _zcData['hdid'] = _nt + 10
    _zcData['model'] = _dlPrize[0]['t']
    _zcData['stime'] = _zeroTime
    _zcData['etime'] = _zeroTime + _addTime
    _zcData['rtime'] = _zeroTime + _addTime - 300
    _zcData['showtime'] = fmtShowTime(_zcData['showtime'], _zcData['stime'], _zcData['etime'])
    # print _zcData
    # 设置重置活动的时间
    g.m.gameconfigfun.setGameConfig({'ctype': 'repeathd_zhouchang', 'k': g.C.DATE()}, {'v': _nt})
    g.mdb.insert('hdinfo', _zcData)
    print g.C.STR('CREATE hdinfo hdid {1} ', _hdid)

# 通过htype获取hddata
def getHDDATAbyHtype(uid, htype):
    _nt = g.C.NOW()
    _info = g.mdb.find1('hdinfo', {'htype': htype, 'etime': {'$gte': _nt}, 'stime': {'$lte': _nt}})
    if not _info:
        return
    hdid = _info['hdid']
    return getHDData(uid, hdid)

def getHDinfoByHtype(htype, ttype=None):
    if not ttype:
        ttype = 'rtime'
    # 下列活动需要根据etime来判断结束时间
    if htype in (66, ):
        ttype = 'etime'

    _key = 'huodong_' + str(htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo[ttype]:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, ttype: {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id','rtime','hdid','stime','data','etime'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {ttype: g.C.ZERO(_nt)}, g.C.ZERO(_nt + 3600*24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo[ttype] - _nt)

    if _nt >= _hdInfo[ttype]:
        return

    return _hdInfo


# 获取返现奖励
def getCashBackPrize(cost, arr):
    _prize = [{'a': 'attr', 't': 'rmbmoney', 'n': 0}]
    for k, v in cost.items():
        _info = arr[int(k)]
        _sale = _info.get('sale', 100)
        _buynum = v['buynum']
        _expend = v['expend']
        _need = _info['need']
        _afterSale = [{'a': i['a'], 't': i['t'], 'n': int(i['n'] * _sale * 0.01 * _buynum)} for i in _need]
        for i in _expend:
            for j in _afterSale:
                if i['a'] == j['a'] and i['t'] == j['t'] and i['n'] > j['n']:
                    _prize.append({'a': i['a'], 't': i['t'], 'n': i['n'] - j['n']})
    return g.fmtPrizeList(_prize)








# 初始化数据
getAllHd()
# 保存存在的活动htype
SaveHDList()
g.event.on('zchd_redpoint', onZCHDredpoint)
g.event.on('PlayDegree', onKFCJredpoint)
g.event.on('leijixiaofei', onLeijixiaofei)
g.event.on('jierikuanghuan', g.m.jierikuanghuan_44.hdTask)


if __name__ == "__main__":
    uid = g.buid('xuzhao')
    rePeatHuoDong()
    # rePeatHuoDong()
    # rePeatHuoDong()
    # timer_sendPrize()