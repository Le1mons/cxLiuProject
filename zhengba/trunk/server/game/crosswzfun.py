#!/usr/bin/python
# coding:utf-8


'''
跨服巅峰王者相关方法
'''

import g
import random
import copy
import datetime
import time
from fight.ZBFight import ZBFight


# 获取当前时间
def now():
    return g.C.NOW()


# 获取dkey
def getDKey():
    _nt = now()
    _dkey = g.C.getWeekNumByTime(_nt)
    return _dkey


# 获取周一零点事件戳
def getStartTime():
    _nt = now()
    _res = g.C.getWeekFirstDay(_nt)
    return _res


# 获取配置
def getCon():
    _con = g.GC['crosswz']['base']
    return _con


# 获取相应周次大乱斗剩余次数
def getRemainDldNum(uid):
    _maxNum = 15
    _doNum = 0
    _dkey = getDKey()
    _userData = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'fightdata'])
    if _userData != None:
        _doNum = len(_userData['fightdata'])

    _canNum = _maxNum - _doNum
    if _canNum < 0: _canNum = 0
    return _canNum


# 获取大乱斗胜利积分
def getDaLuanDouScore(fightdata, winside):
    # 计算连胜
    _num = 0
    _score = 2
    if fightdata[-1] < 1:
        _score = 10
    for i in xrange(len(fightdata) - 1, -1, -1):
        if fightdata[i] > 0:
            break
        _num += 1
    if _num >= 2:
        _score += _num
    return _score


# 获取任意阶段开始和结束时间
def getStatusTime(status):
    _nt = now()
    # 多向后取2天防止误差
    _nt += 2 * 24 * 3600
    _con = g.GC['crosswz']['base']['timestatus'][status]
    _zeroTime = g.C.getWeekFirstDay(_nt)
    _sTime = _con['stime'] + _zeroTime
    _eTime = _con['etime'] + _zeroTime
    return {'stime': _sTime, 'etime': _eTime}


# 获取当前报名人数(默认读取缓存))
def getBaomingNum(ugid=None):
    _dkey = getDKey()
    _where = {'dkey': _dkey}
    if ugid:
        _where['ugid'] = ugid
        _where['$where'] = 'return this.uid.indexOf("npc_") == -1'
    # 大乱斗阶段时间
    _nt = now()
    _con = g.GC['crosswz']['base']['timestatus'][1]
    _zeroTime = getStartTime()
    _sTime = _con['stime'] + _zeroTime
    # 报名阶段取实时数据
    if _nt <= _sTime:
        return g.crossDB.count('wzbaoming', _where)

    cacheKey = 'WANGZHEBMNUM_{0}_{1}'.format(str(_dkey), ugid)
    _bmNum = g.crossMC.get(cacheKey)
    # 从数据库读取人数
    if _bmNum != None:
        return _bmNum

    _bmNum = g.crossDB.count('wzbaoming', _where)
    # 如果有人报名
    if 0 < _bmNum < 256:
        if '$where' in _where:
            _where.pop('$where')
        _bmNum = g.crossDB.count('wzbaoming', _where)
    g.crossMC.set(cacheKey, _bmNum, time=60)

    return _bmNum


# 获取一个除选择的uid外选择随机的uid
def getRandomUid(uid, ugid, groupList):
    where = {'dkey': getDKey(),'ugid':ugid}
    for _ in xrange(3):
        _toUser = g.crossDB.find1_rand('wzbaoming', where, fields=['_id', 'uid'])
        if _toUser and _toUser['uid'] != uid:
            return _toUser['uid']
    return None


# 依据uid判断玩家是否报名
def isUserBaoming(uid):
    _dkey = getDKey()
    _userData = g.crossDB.count('wzbaoming', {'uid': uid, 'dkey': _dkey})
    if _userData >= 1:
        return 1
    return 0


# 获取自动报名状态
def getAutoBMStatus(uid):
    _data = g.getAttr(uid, {'ctype': 'autobmflag'})
    if _data is not None:
        return _data[0]['v']
    return False


# 设置自动报名状态
def setAutoBMStatus(uid, value):
    return g.setAttr(uid, {'ctype': 'autobmflag'}, {'v': value})


# 获取自动报名uid数组
def getAutoBMList():
    _data = g.mdb.find('playattr', {'ctype': 'autobmflag', 'v': True}, fields=['_id', 'uid'])
    _uid = [_tmp['uid'] for _tmp in _data]
    return _uid


# 获取大乱斗玩家数据
def getLuanDouUserData(uid, iscache=1):
    _userData = g.crossDB.find1('userdata', {'uid': uid}, fields=['_id'])
    return _userData


# 删除跨服玩家大乱斗缓存信息
def clearLuanDouUserCache(uid):
    g.m.crosszbfun.clearUserDataCache(uid)
    return 1


# 删除跨服玩家缓存信息
def clearWangZheUserCache(uid):
    _key = getWangZheUserKey(uid)
    g.crossMC.delete(_key)
    return 1


# 获取玩家巅峰王者进阶赛阶段的缓存key
def getWangZheUserKey(uid):
    _dkey = getDKey()
    return g.C.STR("CROSS_WANGZHEJINJIE_{1}_{2}", uid, _dkey)


# 获取玩家出战英雄信息
def getUserHeroData(uid):
    _dkey = getDKey()
    _usrData = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'herodata', 'curzhanli'])
    if _usrData:
        return {'hero': _usrData['herodata'], 'zhanli': _usrData.get('curzhanli', 0)}
    else:
        return {'hero': [], 'zhanli': 0}


# 获取玩家数据
def getUserData(uid, field=None):
    _fields = ['_id']
    if field:
        _fields += field
    _usrData = g.crossDB.find('userdata', {'uid': uid}, fields=_fields)
    return _usrData


# 获取巅峰王者进阶赛玩家数据
def getWangZheUserData(uid, iscache=1):
    _key = getWangZheUserKey(uid)
    _res = g.crossMC.get(_key)
    if _res != None and iscache:
        return _res

    _dkey = getDKey()
    _res = g.crossDB.find1('wzuserdata', {'uid': uid, 'dkey': _dkey})
    _res.update(_res.pop('info'))
    if _res != None:
        g.crossMC.set(_key, _res, time=3600 * 72)
    return _res


# 上传玩家信息到跨服服务器(data：特殊参数，udata：如果不是none则为完整用户信息)
def uploadWangZheUserData(uid, data=None, udata=None):
    _userData = udata
    if _userData == None:
        _userData = g.crossDB.find1('userdata', {'uid': uid}, fields=['_id'])
        if not _userData:
            return

    _dkey = getDKey()
    _userData['lasttime'] = now()
    _userData['dkey'] = _dkey
    _userData['ttltime'] = g.C.UTCNOW()
    if data != None: _userData.update(data)
    _w = {'uid': uid, 'dkey': _dkey}
    g.crossDB.update('wzuserdata', _w, _userData, upsert=True)
    clearWangZheUserCache(uid)
    return _userData


# 更新跨服数据
def uploadUserData(uid, data=None, zldata=None):
    _userData = {}
    if data:
        _userData.update(data)
    gud = g.getGud(uid)
    _userData['uid'] = uid
    _userData['sid'] = int(gud['sid'])
    # 开服时间
    openDay = getDOpenDay()
    if openDay < 0:
        openDay = 0
    _userData['openday'] = openDay
    _userData['headdata'] = g.m.userfun.getShowHead(uid)
    if _userData['headdata']['head'] == 1001:
        _userData['headdata']['head'] = '11023'
    _userData['headdata']['zhanli'] = gud['maxzhanli']
    _userData['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(_userData['sid'])
    _userData['maxzhanli'] = int(gud['maxzhanli'])
    if zldata:
        _userData['headdata']['zhanli'] = zldata['zhanli']
        if 'maxzhanli' in zldata:
            _userData['maxzhanli'] = zldata['maxzhanli']
        else:
            _userData.pop('maxzhanli')
    _setData = {'lasttime': now()}
    _setData['info'] = _userData
    g.crossDB.update('userdata', {'uid': uid}, _setData, upsert=True)
    return _userData


# 大乱斗前256名缓存
def getRankData(ugid, grouplist):
    if ugid:
        mcKey = "WANGZHEDLD256RANK_{0}".format(ugid)
    else:
        mcKey = "WANGZHEDLD256RANK_{0}".format(3)
    _rankData = g.crossMC.get(mcKey)
    _dkey = getDKey()
    if _rankData != None:
        return _rankData
    _where = {'dkey': _dkey,'ugid':ugid}
    _rankData = g.crossDB.find('wzbaoming', _where, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]],
                               fields=['_id', 'uid', 'jifen', 'zhanli'], limit=256)
    g.crossMC.set(mcKey, _rankData, time=10)
    return _rankData


# 获取查询条件
def getBmWhere(grouplist):
    groupDict = {}
    for idx, group in enumerate(grouplist):
        if not group:
            continue

        if idx > 4: idx = 4
        if group > 5:group = 5

        oArr = getOpenTimeByUgid(idx)
        fw = {}
        fw['$gte'] = oArr[0]
        if len(oArr) > 1:
            fw['$lte'] = oArr[1]
        if group not in groupDict:
            groupDict[group] = fw
        else:
            if len(oArr) > 1:
                groupDict[group]['$lte'] = oArr[1]
            elif '$lte' in groupDict[group]:
                groupDict[group].pop('$lte')
    return groupDict


# 获取分组idx
def getGroupIdx(openday):
    if 0 <= openday <= 60:
        return 0
    elif 61 <= openday <= 90:
        return 1
    elif 91 <= openday <= 120:
        return 2
    elif 121 <= openday <= 210:
        return 3
    else:
        return 4


# 获取时间
def getOpenTimeByUgid(idx):
    if idx == 4:
        return [211]
    elif idx == 3:
        return [121, 210]
    elif idx == 2:
        return [91, 120]
    elif idx == 1:
        return [61, 90]
    elif idx == 0:
        return [0, 60]


# 获取本期开服时间天数
def getDOpenDay(nt=None, uid=None):
    _nt = nt or now()
    # 星期几
    _weekDay = datetime.datetime(*(list(time.localtime(_nt))[: -3])).weekday()
    # 转化为周一的时间戳
    _nt -= _weekDay * 24 * 3600
    openDaya = (_nt - g.C.ZERO(g.getOpenTime())) // (24 * 3600) + 1
    if uid is not None:
        _dkey = getDKey()
        openDaya = g.mc.get('crosswz_openday_{0}_{1}'.format(_dkey, uid))
        if openDaya is None:
            _data = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey}, fields=['_id', 'openday'])
            if _data:
                openDaya = _data['openday']
                g.mc.set('crosswz_openday_{0}_{1}'.format(_dkey, uid), openDaya, 7 * 24 * 3600)
            else:
                openDaya = getDOpenDay()

    return openDaya


# 判断巅峰王者是否开启（报名人数是否已达256人）
def isWangZheOpen(ifflaush=0):
    groupList = [1,2,3,4,5]
    if getWangZheStatus() in (1, 2):
        return groupList

    _dkey = getDKey()
    _cacheKey = g.C.STR("ISWANGZHEOPEN_{1}",_dkey)
    # 取缓存
    if not ifflaush:
        _isOpen = g.crossMC.get(_cacheKey)
    else:
        _isOpen = None

    if _isOpen:
        return _isOpen

    _data = g.crossDB.find1('crossconfig',{'ctype':'crosswz_group'},fields=['_id','group']) or {'group': 5}
    groupList = range(1, _data['group'] + 1)
    g.crossMC.set(_cacheKey, groupList, 3600)

    return groupList


# 一个虚假的分组
def getFalseGroup():
    _dkey = getDKey()
    _cacheKey = g.C.STR("FALSEGROUP_{1}", _dkey)
    _isOpen = g.crossMC.get(_cacheKey)
    if _isOpen:
        return _isOpen

    groupList = []
    _1_num = g.crossDB.count('wzbaoming', {'dkey': _dkey, 'openday': {'$lte': 60},
                                           '$where': 'return this.uid.indexOf("npc_") == -1'})

    _2_num = g.crossDB.count('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 61, '$lte': 90},
                                           '$where': 'return this.uid.indexOf("npc_") == -1'})

    _3_num = g.crossDB.count('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 91, '$lte': 120},
                                           '$where': 'return this.uid.indexOf("npc_") == -1'})

    _4_num = g.crossDB.count('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 121, '$lte': 210},
                                           '$where': 'return this.uid.indexOf("npc_") == -1'})

    _5_num = g.crossDB.count('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 211},
                                           '$where': 'return this.uid.indexOf("npc_") == -1'})

    _num = 1
    for i in (_1_num, _2_num, _3_num, _4_num, _5_num):
        groupList.append(_num)
        if i > 0:
            _num += 1

    g.crossMC.set(_cacheKey, groupList, 7 * 24 * 3600)
    return groupList


# 判断巅峰王者是否开启（报名人数是否已达256人）
# def isWangZheOpen(ifflaush=0):
#     #取缓存
#     _dkey = getDKey()
#     _cacheKey = g.C.STR("ISWANGZHEOPEN_{1}",_dkey)
#     _isOpen = g.crossMC.get(_cacheKey)
#     if ifflaush:
#         _isOpen = None
#     if _isOpen != None:
#         return _isOpen
#
#     _where = {'dkey':_dkey}
#     # 2019-3-12需要对玩家分组，此处统计分组，进行时间戳分组
#     nt = g.C.NOW()
#     # 全部玩家
#     _bmNum = g.crossDB.count('wzbaoming',_where)
#     #开启数量写死，如配置到配置中比较危险，错写会导致整个系统无法进行
#     if _bmNum < 256:
#         return 0
#
#     groupList = [1, 1, 1, 1, 1]
#     if nt < 1568563200:
#         groupList = [3,3,3,3,3]
#     if _bmNum >= 256 * 2:
#         # 人数多于2组，尝试分组
#         _slxxW = {'dkey': _dkey, 'openday': {'$lte': 60}}
#         _slxxNum = g.crossDB.count('wzbaoming', _slxxW)
#         # 英雄传说
#         _yxcsW = {'dkey': _dkey, 'openday': {'$gte': 61, '$lte': 90}}
#         _yxcsNum = g.crossDB.count('wzbaoming', _yxcsW)
#         _ssyzw = {'dkey': _dkey, 'openday': {'$gte': 91, '$lte': 120}}
#         _ssyzNum = g.crossDB.count('wzbaoming', _ssyzw)
#         _cqzsw = {'dkey': _dkey, 'openday': {'$gte': 121, '$lte': 210}}
#         _cqzsNum = g.crossDB.count('wzbaoming', _cqzsw)
#         _yyzhNum = _bmNum - _slxxNum - _yxcsNum - _ssyzNum - _cqzsNum
#
#         # 9.16零点号之前按照原来的逻辑
#         if nt < 1568563200:
#             if _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分3组
#                 groupList = [1, 2, 4, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 groupList = [2, 4, 5, 3, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [2, 4, 5, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [2, 4, 4, 5, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [2, 2, 4, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 groupList = [4, 5, 3, 3, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [4, 5, 5, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [4, 4, 4, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [4, 5, 5, 3, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [4, 4, 5, 3, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [4, 4, 5, 5, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [5, 3, 3, 3, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [5, 5, 3, 3, 3]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [5, 5, 5, 3, 3]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [5, 5, 5, 5, 3]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [3, 3, 3, 3, 3]
#         else:
#
#             if _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分3组
#                 groupList = [1, 2, 3, 4, 5]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [1, 1, 2, 3, 4]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [1, 2, 2, 3, 4]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [1, 2, 3, 3, 4]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 groupList = [1, 2, 3, 4, 4]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum >= 256 and _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [1, 1, 1, 2, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 groupList = [1, 2, 2, 2, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum >= 256 and _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 2, 3, 3, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 2, 2, 3]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 2, 3, 3]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 2, 2, 3, 3]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum + _cqzsNum >= 256 and _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 1, 1, 2]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum >= 256 and _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 1, 2, 2]
#
#             elif _slxxNum + _yxcsNum >= 256 and _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 2, 2, 2]
#
#             elif _slxxNum >= 256 and _yxcsNum + _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 2, 2, 2, 2]
#
#             elif _slxxNum + _yxcsNum + _ssyzNum + _cqzsNum + _yyzhNum >= 256:
#                 # 分2组
#                 groupList = [1, 1, 1, 1, 1]
#
#     #如果达到人数要求存入缓存
#     _time = 7 * 24 * 3600
#     if getWangZheStatus() == 1:
#         _time = 7200
#     g.crossMC.set(_cacheKey, groupList, time=_time)
#     return groupList

# 获取王者的当前状态阶段
# isstatus只返回status，否则返回对应的status和配置中所需的值{"status":x}
def getWangZheStatus(isstatus=1,ugid=None):
    _nt = now()
    _con = g.GC['crosswz']['base']['timestatus']
    _zeroTime = getStartTime()
    # 默认比赛结束状态
    _res = {'status': 8, 'cd': _zeroTime + 7 * 24 * 3600}
    # 开服7天内结束
    if g.getOpenDay() <= 7:
        return _res

    for ele in _con:
        _stime = _zeroTime + ele['stime']
        _etime = _zeroTime + ele['etime']
        if _nt >= _stime and _nt < _etime:
            _res['status'] = ele['status']
            for e in ele['show']:
                if e == 'cd':
                    # 显示下一个节点的
                    _res['cd'] = _etime
                elif e == 'num':
                    # 显示报名人数
                    _res['num'] = getBaomingNum(ugid)

            break
    '''status:
    1.(0-22*3600)大乱斗报名阶段，人数未达到要求显示报名人数，达到要求显示结束时间倒计时
    2.(22*3600-24*3600)报名结束时间到大乱斗开始时间
    3.(24*3600 - (24 + 22)*3600)大乱斗开始时间到大乱斗结束时间
    4.((24 + 22)*3600-2*24*3600)大乱斗结束时间到钻石赛开启阶段
    5.(2*24*3600-(3*24+20)*3600+600)钻石赛开始时间到钻石赛结束时间
    6.((3*24+20)*3600+600-(5*24+20)*3600)竞猜开始时间到结束时间
    7.((5*24+20)*3600-(6*24+20)*3600+1200)王者决赛开始时间到结束时间
    8.((6*24+20)*3600+1200-(7*24)*3600)王者结束时间到下届报名时间
    '''
    if isstatus:
        return _res['status']
    return _res


# 设置王者步骤
def setWangZheStep(act):
    _dkey = getDKey()
    _where = {'k': _dkey, 'ctype': 'wangzhestep'}
    _act = {'v': act}
    g.m.crosscomfun.setGameConfig(_where, _act)


# 获取当前王者步骤
def getWangZheStep():
    _dkey = getDKey()
    _where = {'k': _dkey, 'ctype': 'wangzhestep'}
    _res = g.m.crosscomfun.getGameConfig(_where)
    if len(_res) == 0:
        return
    return _res[0]['v']


# 获取事件配置信息
def getActCon(act):
    _eventCon = g.GC['crosswz']['base']['event']
    _res = None
    for e in _eventCon:
        if e['act'] != act:
            continue
        _res = e
    return _res


# 获取活动是否是在激活时间
def isRightActiveTime(act):
    # 获取当前时间
    _nt = now()
    _st = getStartTime()
    # 理论执行时间
    _eventCon = getActCon(act)
    _doTime = _st + int(_eventCon['time'])
    if _nt < _doTime:
        # 未到活动时间
        return 0
    return 1


# 设置大乱斗前256名进入进阶赛-周一晚22:00执行
def act_setLuanDouUser2JinJi():
    _act = 'setluandou2jinji'
    _utc = g.C.UTCNOW()
    # 验证时间是否正确
    if not isRightActiveTime(_act):
        # 未到执行时间
        return

    # 判断活动状态
    groupList = isWangZheOpen(1)
    if not groupList:
        return

    groupDict = getBmWhere(groupList)

    # if not groupDict:
    #     groupDict = {None: 0}
    _dkey = getDKey()
    '''检测数据是否异常'''
    for ugid in groupList:
        # wz晋级数据
        _where = {'dkey': _dkey}
        if ugid:
            _where['ugid'] = ugid
        _bmNum = g.crossDB.count('wzuserdata', _where)
        if _bmNum == 256:
            continue

        if 0 < _bmNum and _bmNum != 256:
            # 数据异常，初始化'wzuserdata'和'wzfight'
            g.crossDB.delete('wzuserdata', _where)
            g.crossDB.delete('wzfight', _where)

        bmWhere = {'dkey': _dkey,'ugid':ugid}
        # if ugid:
        # bmWhere['ugid'] = groupDict[ugid]
        # 获取数据库前256名玩家
        userData = g.crossDB.find('wzbaoming', bmWhere, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]],fields=['_id', 'uid','ugid'], limit=256)
        _userList, _npcNum = [], 0
        for _tmp in userData:
            _userList.append(_tmp['uid'])
            if _tmp['uid'].startswith('npc_'):
                _npcNum += 1

        # 如果都是npc  就废弃这个赛区
        if _npcNum >= 256:
            del _userList[:]
            del userData[:]

        # 查询所有符合要求的数据
        _data = g.crossDB.find('userdata', {'uid': {'$in': _userList}}, fields=['_id'])
        # 给npc安排区服
        for i in _data:
            if not i['uid'].startswith('npc_'):
                continue
            _sName = getServerName(groupDict[ugid])
            i['info']['headdata']['ext_servername'] = _sName
            g.crossDB.update('userdata', {'uid': i['uid']}, {'info.headdata.ext_servername': _sName})

        _newdata = []
        for ele in _data:
            if 'extbuffnum' in ele: del ele['extbuffnum']
            ele['dkey'] = _dkey
            ele['ttltime'] = _utc
            if ugid:
                ele['ugid'] = ugid
            _newdata.append(ele)

        # 插入dkey
        _insertData = _newdata
        # 将数据插入数据库
        if _insertData:
            g.crossDB.insert('wzuserdata', _insertData)
        # 验证操作是否成功
        preWzFightData(userData, ugid)
        # 成功设置步骤
    setWangZheStep(_act)


# 检查钻石是否开启
def chkIfOpen(act='zuanshisai'):
    _st = getStartTime()
    _nt = now()
    _con = getCon()
    _retVal = False
    if _nt > _st + _con['timerange']['zuanshisai'][0]:
        _retVal = True

    return _retVal


# 获取下场比赛开始时间
# 前端用来拉取新的战斗数据
def getZSSNextMatchStartTime(mtype='zuanshi', iftimelist=False, ifmain=False):
    _st = getStartTime()
    _nt = now()
    _time = 0
    _con = getCon()
    _dict = {
        'zuanshi': ['autofight2deep0', 'autofight2deep1', 'autofight2deep2', 'autofight2deep3'],
        'wangzhe': ['autofight2deep4', 'autofight2deep5', 'autofight2deep6', 'autofight2deep7']
    }
    _timelist = [x['time'] + _st for x in _con['event'] if x['act'] in _dict[mtype]]
    if ifmain:
        _addtime = 300
        _timelist = [x['time'] + _st + _addtime for x in _con['event'] if x['act'] in _dict['zuanshi']]
        _timelist += [x['time'] + _st + _addtime for x in _con['event'] if x['act'] in _dict['wangzhe']]
        return _timelist

    for ele in _timelist:
        if ele > _nt:
            _time = ele
            break

    if iftimelist == True:
        _newtimelist = []
        _addtime = 600
        if mtype == 'wangzhe': _addtime = 1200
        for i in xrange(4):
            _timelist[i] += 300  # 显示时间比配置时间晚出现5分钟
            _newtimelist.append([_timelist[i], _timelist[i] + _addtime])

        return _newtimelist

    else:
        return _time


# 获取某个玩家的竞猜金额和数量
def getGuessDataByUid(uid):
    _res = {}
    _guessmoney, _guessnum = 0, 0
    _res['guessnum'] = 0
    _res['guessmoney'] = 0
    _res['ext_guessnum'] = 0
    _res['ext_guessmoney'] = 0

    _dkey = getDKey()
    _r = g.crossDB.find1('wzguessdata', {'dkey': _dkey, 'uid': uid}, fields=['_id','guessnum','guessmoney','ext_guessnum','ext_guessmoney'])
    if _r:
        _res['guessnum'] = _r['guessnum']
        _res['guessmoney'] = _r['guessmoney']
        _res['ext_guessnum'] = _r['ext_guessnum']
        _res['ext_guessmoney'] = _r['ext_guessmoney']

    return _res


# 获取玩家竞猜名字
def getMyGuessName(uid):
    _name = ''
    _dkey = getDKey()
    _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'uid': uid}, fields=['_id', 'guessuid'])
    if _r:
        _guessuid = _r[0]['guessuid']
        _userdata = getWangZheUserData(_guessuid)
        _name = _userdata['headdata']['name']

    return _name


def getMyGuessUid(uid):
    _guessuid = ''
    _dkey = getDKey()
    _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'uid': uid}, fields=['_id', 'guessuid'])
    if _r:
        _guessuid = _r[0]['guessuid']

    return _guessuid


# 增加竞猜数据
def addGuessData(uid, gtype, touid):
    gud = g.getGud(uid)
    _con = getCon()
    _utc = g.C.UTCNOW()
    _addmoney = _con['guess'][gtype]['addmoney']
    _dkey = getDKey()
    _setData = {'$inc': {'guessmoney': _addmoney, 'guessnum': 1,'ext_guessnum':1,'ext_guessmoney': _addmoney}, '$set': {'ttltime': _utc}}
    g.crossDB.update('wzguessdata', {'dkey': _dkey, 'uid': touid}, _setData, upsert=True)
    g.crossDB.update('crosskv', {'dkey': _dkey, 'ctype': 'crosswz_guess_totalnum'}, {'$inc': {'v': _addmoney}},upsert=True)
    g.crossDB.update('crosskv', {'dkey': _dkey, 'ctype': 'crosswz_guess_totalnum_ext'}, {'$inc': {'v': _addmoney}}, upsert=True)
    _data = {
        'uid': uid,
        'sid': gud['sid'],
        'guessuid': touid,
        'dkey': _dkey,
        'gtype': gtype,
        'ttltime': _utc
    }
    _r = g.crossDB.insert('wzguesslog', _data)
    return _r


# 本轮竞猜总金额
def getTotalGuessMoney():
    _total = 0
    _dkey = getDKey()
    _r = g.crossDB.find('crosskv', {'ctype': 'crosswz_guess_totalnum_ext', 'dkey': _dkey})
    if _r:
        _total = _r[0]['v']

    return _total


# 检测是否竞猜
def chkIfCanGuess():
    _status = getWangZheStatus()
    _retVal = False
    if _status == 6:
        _retVal = True

    return _retVal


# 检查是否可以上传数据
def chkIfCanUpload(uid):
    _retVal = [True, 0]
    _con = getCon()
    _st = getStartTime() + 300
    _nt = now()
    _dkey = getDKey()
    # 未晋级钻石赛
    _r = g.crossDB.find('wzfight', {'dkey': _dkey, 'uid': uid}, fields=['_id', 'uid'])
    if not _r: return [False, g.L('crosswz_upload_-1')]

    # 晋级赛前后30分钟不能上传
    _rawtimelist = [x['time'] + _st for x in _con['event'] if x['act'] != 'setluandou2jinji']
    _timelist = [[x - 1800, x + 1800] for x in _rawtimelist]
    for ele in _timelist:
        if ele[0] < _nt < ele[1]: return [False, g.L('crosswz_upload_-2')]

    # 检查上传CD
    _r = g.getAttr(uid, {'ctype': 'crosswz_uploadcd'})
    if _r:
        if _nt < _r[0]['v']: return [False, g.L('crosswz_upload_-3')]

    return _retVal


# 钻石赛淘汰赛 周三周四中午12点和20点开始
def act_zuanShiGroupFight(deep):
    deep = int(deep)
    _act = g.C.STR('autofight2deep{1}', deep)
    _eventCon = getActCon(_act)
    # 周一零点时间戳
    _st = getStartTime()
    _nt = now()
    # 王者印记
    _wzyj = g.crossDB.find1('gameconfig', {'ctype': 'king_imprint'}, fields=['_id', 'v']) or {'v': {}}
    _wzyj = _wzyj['v']
    _winUids = []
    # 理论执行时间
    _doTime = _st + int(_eventCon['time'])

    groupList = isWangZheOpen()
    runList = set(groupList)
    for ugid in runList:
        _where = {}
        if ugid:
            _where = {'ugid': ugid}
        else:
            _where = {'ugid': {'$exists': 0}}
        _where['deep'] = deep
        _dKey = getDKey()
        _where['dkey'] = _dKey
        _sort = [["groupid", 1], ["orderid", 1]]
        if deep >= 4: _sort = [["random", 1]]
        _userList = g.crossDB.find('wzfight', _where, sort=_sort,
                                   fields=['_id', 'matchlog', 'uid', 'deep', 'groupid', 'orderid'])
        # 一起获取玩家数据
        _uidList = [t['uid'] for t in _userList]
        _userData = g.crossDB.find('wzbaoming', {'uid': {'$in': _uidList}, 'dkey': _dKey},
                                   fields=['_id', 'herodata', 'uid', 'curzhanli', 'team2zhanli'])
        uidtoHero = {t['uid']: t['herodata'] for t in _userData}
        _uid2zhanli = {t['uid']: t['team2zhanli'] for t in _userData if 'team2zhanli' in t and t['team2zhanli']}
        # 造型数据
        _deadData = g.crossDB.find('userdata', {'uid': {'$in': _uidList}}, fields=['_id', 'info.headdata', 'uid'])
        uidToHead = {t['uid']: t['info']['headdata'] for t in _deadData}
        _tmpGroup = []
        _savedata = []
        _fidlist = []
        _floglist = []
        _pkNum = 3  # TODO 根据deep判断战斗场次
        if deep > 3: _pkNum = 5
        # 用来确定战斗的顺序
        _order = deep * 16
        for u in _userList:
            _tmpGroup.append(u)
            if len(_tmpGroup) <= 1:
                continue

            _uid1 = _tmpGroup[0]['uid']
            _uid2 = _tmpGroup[1]['uid']
            _uidlist = [_uid1, _uid2]



            fightdata1 = uidtoHero[_uid1]
            fightdata2 = uidtoHero[_uid2]
            try:
                _zhanliList = [_uid2zhanli.get(_uid1, 0), _uid2zhanli.get(_uid2, 0)]
                _herolist = [map(lambda x: x['hid'], fightdata1), map(lambda x: x['hid'], fightdata2)]
            except:
                _zhanliList = [0, 0]
                _herolist = [[],[]]
                print

            _signData = []  # 先记录所有的战斗结果后记录数据库
            _winArr = [0, 0]
            # 第一场战斗开始时间
            _addtime = 0
            _uuid = g.C.getUniqCode()

            for i in xrange(_pkNum):
                _winside = 1
                winNum = 0
                fightResList = []
                for i in xrange(3):
                    _fData1 = []
                    _fData2 = []
                    if i < len(fightdata1):
                        for fd1 in fightdata1[i]:
                            newfd = fd1.copy()
                            newfd['side'] = 0
                            if ('hid' in newfd) and newfd['hp'] <= 0:
                                continue
                            _fData1.append(newfd)
                    if i < len(fightdata2):
                        for fd2 in fightdata2[i]:
                            newfd = fd2.copy()
                            newfd['side'] = 1
                            if ('hid' in newfd) and newfd['hp'] <= 0:
                                continue
                            _fData2.append(newfd)
                    fightRes = {}
                    f = ZBFight('pvp')
                    fightRes = f.initFightByData(_fData1 + _fData2).start()
                    fightRes['headdata'] = [uidToHead[_uid1], uidToHead[_uid2]]
                    # # 趣味成就
                    # if fightRes['dpsbyside'][0] == 0 and fightRes['winside'] != 0:
                    #     g.crossDB.update('crossplayattr', {'uid': _uid2, 'ctype': 'qwcj_data'}, {'$inc': {'v.dps': 1}},
                    #                      upsert=True)
                    # if fightRes['dpsbyside'][1] == 0 and fightRes['winside'] == 0:
                    #     g.crossDB.update('crossplayattr', {'uid': _uid1, 'ctype': 'qwcj_data'}, {'$inc': {'v.dps': 1}},
                    #                      upsert=True)

                    # 获取战斗结果
                    if fightRes['winside'] == -2:
                        # 有新战力就用新的  没有就用原来的方法
                        if _uid1 in _uid2zhanli:
                            zl = _uid2zhanli[_uid1][i]
                        else:
                            zl = sum(g.m.herofun.makeHeroBuff(t)['zhanli'] for t in fightdata1[i] if 'hid' in t)

                        if _uid2 in _uid2zhanli:
                            tozl = _uid2zhanli[_uid2][i]
                        else:
                            tozl = sum(g.m.herofun.makeHeroBuff(t)['zhanli'] for t in fightdata2[i] if 'hid' in t)

                        fightRes['winside'] = int(tozl > zl)
                        winNum += int(zl > tozl)
                    else:
                        winNum += int(fightRes['winside'] == 0)
                    fightResList.append(fightRes)
                    if winNum >= 2:
                        _winside = 0
                        break
                    if (i - winNum) >= 1:
                        break

                # 保存战斗日志
                _tmpflog = {
                    'ctime': _nt,
                    'fightres': fightResList,
                    'ttltime': g.C.UTCNOW()
                }
                _floglist.append(_tmpflog)

                _winArr[_winside] += 1

                # 每场胜利数据
                _tmpdata = {
                    'showtime': _doTime + _addtime + 300,  # 服务端会在预设时间点提前5分钟计算
                    'winuid': _uidlist[_winside],
                    'winarr': _winArr,
                    'fightuser': _uidlist,  # pk的玩家
                    "zhanliarr": _zhanliList,
                    "herolistarr":_herolist,
                }
                _signData.append(_tmpdata)
                _addtime += 300

            _winUid = _uid1
            if _winArr[1] > _winArr[0]: _winUid = _uid2

            # 通过_signData的记录来写入数据
            for i, _uid in enumerate(_uidlist):
                _w = g.C.dcopy(_where)
                _w.update({'uid': _uid})
                _matchlog = g.C.dcopy(_tmpGroup[i]['matchlog'])
                _tmpdata = {str(deep): {
                    'winlog': _signData,
                    'uuid': _uuid,
                    'order': _order
                }}
                _matchlog.update(_tmpdata)
                _setData = {'matchlog': _matchlog}

                # 获胜玩家更新deep值
                if _uid == _winUid:
                    _setData.update({'deep': _tmpGroup[i]['deep'] + 1})
                    if _tmpGroup[i]['deep'] + 1 == 4:
                        _wzyj[_winUid] = _wzyj.get(_winUid, 0) + 1
                        _winUids.append(_winUid)

                else:
                    # 失败这设置数据，防止多定时器同时运行
                    _setData.update({'deep': _tmpGroup[i]['deep']})

                _savedata.append([_w, _setData])
                _order += 1

            # 清空列表
            _tmpGroup = []

        # 保存战斗日志
        if _floglist:
            _fidlist = g.crossDB.insert("fightlog", _floglist)
            _fidlist = [str(x) for x in _fidlist]

        # 保存数据
        for i, ele in enumerate(_savedata):
            _w, _setData = ele
            i = divmod(i, 2)[0]
            for j, _data in enumerate(_setData['matchlog'][str(deep)]['winlog']):
                _data['fid'] = _fidlist[i * _pkNum + j]

            g.crossDB.update('wzfight', _w, _setData)

    # 更新王者印记信息
    g.crossDB.update('gameconfig', {'ctype': 'king_imprint'}, {'v': _wzyj, 'lasttime': g.C.NOW()}, upsert=True)
    g.crossDB.update('wzuserdata', {'uid': {'$in': _winUids}}, {'$inc': {'info.headdata.wzyj': 1}})
    g.crossDB.update('userdata', {'uid': {'$in': _winUids}}, {'$inc': {'info.headdata.wzyj': 1}})

    # 设置步骤
    setWangZheStep(_act)
    return 1


# 大乱斗进入晋级赛时，加入wzfight数据
def preWzFightData(userdata, ugid):
    _groupid = 1
    _orderid = 1
    _nt = now()
    _wzfightdata = []
    _dkey = getDKey()
    _randnum = range(1, 257)
    random.shuffle(_randnum)
    random.shuffle(userdata)
    for i, ele in enumerate(userdata):
        _group = divmod(i, 2)[0] + 1
        _tmp = {
            'uid': ele['uid'],
            'dkey': _dkey,
            'groupid': _groupid,
            'orderid': _orderid,
            'deep': 0,
            'ctime': _nt,
            'random': _randnum[i],
            'matchlog': {}  # 保存每轮战斗结果
        }
        if 'ugid' in ele:
            _tmp['ugid'] = ugid
        elif ugid:
            _tmp['ugid'] = ugid
        _orderid += 1
        if _orderid > 16:
            _orderid = 1
            _groupid += 1

        _wzfightdata.append(_tmp)

    if _wzfightdata:
        g.crossDB.insert('wzfight', _wzfightdata)


# 更新王者之巅数据
def act_updateWZZhidian():
    _act = 'autofight2deep8'
    # 活动未开启
    groupList = isWangZheOpen()
    if not groupList:
        return

    # 获取当前步骤
    if getWangZheStatus() < 8:
        # 还没有进行到当前步骤
        print 'getWangZheStatus() < 8'
        return

    print 'groupList-->', groupList
    # 获取当前周次
    _dkey = getDKey()
    if g.crossDB.count('wzquarterwinner', {'dkey': _dkey}) > 0:
        print "g.crossDB.count('wzquarterwinner', {'dkey': _dkey}) > 0"
        # 数据已经存在
        return

    runList = set(groupList)
    rankList = {}
    _qwcj = g.crossDB.find1('crossconfig', {'ctype': 'qwcj'}) or {'v': {}}
    for ugid in runList:
        # 获取王者晋级赛数据
        _where = {'deep': {'$gte': 6}, 'dkey': _dkey}
        if ugid:
            _where['ugid'] = ugid
        _playerInfo = g.crossDB.find('wzfight', _where, fields=['_id', 'uid', 'deep'])
        # 验证人数
        if len(_playerInfo) < 4:
            print "len(_playerInfo) < 4:~~~~", _where
            # 人数不足无法操作
            continue

        # 将玩家按照排名生成列表
        _rankList = sorted(_playerInfo, key=lambda e: e['deep'], reverse=True)
        # 验证王者是否产生
        if _rankList[0]['deep'] < 8:
            print "_rankList[0]['deep'] <8"
            return

        g.crossDB.update('crossplayattr', {'uid': _rankList[0]['uid'], 'ctype': 'qwcj_data'},
                         {'$push': {'v.wz': _qwcj['v'].get('wz', 0)}}, upsert=True)

        # 生成deep键值对
        _deepDict = {_tmp['uid']: _tmp['deep'] for _tmp in _rankList}
        # 获取uid列表
        _uidlist = [_tmp['uid'] for _tmp in _rankList]
        # 获取玩家数据
        _playerData = g.crossDB.find('wzuserdata', {'uid': {'$in': _uidlist}}, fields=['_id', 'info', 'uid'])
        if len(_playerData) <= 0:
            # 未在王者组找到数据
            print "len(_playerData) <= 0"
            return

        # 格式化数据
        _playerDict = {_tmp['uid']: _tmp['info']['headdata'] for _tmp in _playerData if
                       not _tmp['info']['headdata'].update({'deep': _deepDict[_tmp['uid']]}) and not _tmp['info'][
                           'headdata'].update({'uid': _tmp['uid']})}
        # 生成4强数据
        _playerList = [_playerDict[_tmp] for _tmp in _uidlist]
        if ugid:
            rankList[str(ugid)] = _playerList
        else:
            rankList = _playerList
    # 获取当前round
    _round = g.crossDB.count('wzquarterwinner') + 1
    _data = {'round': _round}
    _data['ctime'] = now()
    _data['dkey'] = _dkey
    _temp, _num = {}, 1
    for i in xrange(1, 11):
        if str(i) in rankList:
            _temp[str(_num)] = rankList[str(i)]
            _num += 1

    _data['ranklist'] = _temp
    _data['grouplist'] = groupList
    _data['falselist'] = getFalseGroup()
    # 保存4强数据
    g.crossDB.insert('wzquarterwinner', _data)
    if g.crossDB.count('wzquarterwinner', {'dkey': _dkey}) < 0:
        # 如果数据保存不成功，重复执行
        raise Exception('failed')
    # 保存活动状态
    setWangZheStep(_act)

    # 记录赛季  趣味成就使用
    g.crossDB.update('crossconfig', {'ctype': 'qwcj'}, {'$inc': {'v.wz': 1}}, upsert=True)


# 发送竞猜奖励
def act_giveJingcaiPrize():
    # 总奖金
    totalmoney = getTotalGuessMoney()
    # 本期前四
    _dkey = getDKey()

    # 2020-9-3 新增发奖流程信息
    _extGuessData = g.crossDB.find('wzguessdata', {'dkey': _dkey}, sort=[['deep', -1]],
                                   fields=['_id', 'uid', 'ext_guessnum'])
    _uid2GuessNum = {}
    for d in _extGuessData:
        _uid2GuessNum[d['uid']] = d['ext_guessnum']

    _con = getCon()

    groupList = isWangZheOpen()
    runList = set(groupList)
    getUidList = []
    _emaillist = []
    for ugid in runList:
        _where = {'dkey': _dkey}
        if ugid:
            _where['ugid'] = ugid
        _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['_id', 'uid'], limit=4)
        _uidlist = [x['uid'] for x in _r]
        getUidList.extend(_uidlist)
        _nt = now()
        _utc = g.C.UTCNOW()
        _data = {
            "etype": 1,
            "getprize": 0,
            "ifpull": 0,
            "title": _con['email']['jingcai']['title'],
            "ctime": _nt,
            "ttltime": _utc
        }
        _rankdict = {
            '0': 0.4,
            '1': 0.3,
            '2': 0.3
        }
        _leveldict = {
            '1': 0.2,
            '2': 0.3,
            '3': 0.5
        }
        for idx, _uid in enumerate(_uidlist):
            if idx in (2, 3): idx = 2
            _userdata = getWangZheUserData(_uid)
            _data['content'] = _con['email']['jingcai']['content'].format(_userdata['headdata']['name'],
                                                                          _con['email']['jingcai']['zanweifu'][idx])
            _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'guessuid': _uid}, fields=['_id', 'uid', 'gtype', 'sid'])
            # 各个gtype有多少人
            _dict = {}
            for ele in _r:
                if ele['gtype'] not in _dict: _dict[ele['gtype']] = 0
                _dict[ele['gtype']] += 1
                if _uid in _uid2GuessNum:
                    _uid2GuessNum[_uid] -= 1

            # # 特殊处理第三档（300钻的）
            # if _uid in _uid2GuessNum:
            #     _dict['3'] = _uid2GuessNum[_uid]

            for ele in _r:
                _data['sid'] = str(ele['sid'])
                _data['uid'] = ele['uid']
                # 除以本档次总竞猜人数
                _addrmbmoney = int(
                    totalmoney * _rankdict[str(idx)] * _leveldict[ele['gtype']] * 1.0 / _dict[ele['gtype']])
                if _addrmbmoney > _con['guess'][ele['gtype']]['addmoney'] * 10: _addrmbmoney = \
                _con['guess'][ele['gtype']]['addmoney'] * 10
                _prize = [{'a': 'attr', 't': 'rmbmoney', 'n': _addrmbmoney}]
                _data['prize'] = _prize
                try:
                    wzfightInfo = g.crossDB.find('wzfight', {'dkey': _dkey}, fields=['uid', 'dldjinjiprize'])


                    g.xLog.user(ele['uid'], 'mszw_gamble_end', 'setOnce', {
                        'rank_id': _type_,
                        'a_fighting_capacity': sum(map(lambda x: x['zhanli'], winhero)),
                        'b_fighting_capacity': sum(map(lambda x: x['zhanli'], loshero)),
                        'a_hero_list': map(lambda x: x['hid'], winhero),
                        'b_hero_list': map(lambda x: x['hid'], loshero),
                        'stage_result': 1,
                        'pvp_id': 'moshizhiwang'
                    })
                except:
                    print "errr"



                _emaillist.append(g.C.dcopy(_data))

    if len(_emaillist) > 0:
        g.crossDB.insert('crossemail', _emaillist)

    # 2017-03-06 给本期未中奖的玩家发送竞猜失败邮件
    _loseemail = []
    _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'guessuid': {'$nin': getUidList}}, fields=['_id', 'uid', 'sid'])
    _data['title'] = _con['email']['jingcaifail']['title']
    _data['content'] = _con['email']['jingcaifail']['content']
    _data['prize'] = _con['email']['jingcaifail']['prize']
    for ele in _r:
        _data['sid'] = str(ele['sid'])
        _data['uid'] = ele['uid']
        _loseemail.append(copy.copy(_data))

    if len(_loseemail) > 0:
        g.crossDB.insert('crossemail', _loseemail)
    _step = "jingcaiprize"
    setWangZheStep(_step)
    return len(_emaillist)


# 发送大乱斗晋级钻石赛奖励
def act_giveDldJinjiPrize():
    _dkey = getDKey()
    _con = getCon()
    _r = g.crossDB.find('wzfight', {'dkey': _dkey}, fields=['uid', 'dldjinjiprize'])
    if not _r:
        print 'give daluandou prize failed ...',
        return

    _emaillist = []
    _idlist = []
    _nt = g.C.NOW()
    _utc = g.C.UTCNOW()
    _data = {
        "etype": 1,
        "getprize": 0,
        "ifpull": 0,
        "prize": _con['jiangli']['dld'][0]['p'],
        "title": _con['email']['dldjinji']['title'],
        "content": _con['email']['dldjinji']['content'],
        "ctime": _nt,
        "ttltime": _utc
    }
    for _user in _r:
        if _user['uid'].startswith('npc_'): continue
        # 如果已经发过奖则跳过
        if 'dldjinjiprize' in _user and _user['dldjinjiprize'] == 1: continue
        _userdata = getWangZheUserData(_user['uid'])
        _data['uid'] = _user['uid']
        _data['sid'] = str(_userdata['sid'])
        _emaillist.append(g.C.dcopy(_data))
        _idlist.append(_user['_id'])

    if len(_emaillist) > 0:
        g.crossDB.insert('crossemail', _emaillist)

    if len(_idlist) > 0:
        g.crossDB.update('wzfight', {'_id': {'$in': _idlist}}, {'dldjinjiprize': 1})

    _step = "daluandoujinjiprize"
    setWangZheStep(_step)
    return len(_emaillist)


# 发钻石赛前八强奖励/发王者赛前八奖励
def act_givePrizeByMtype(mtype='zuanshi'):
    # 发奖逻辑
    def giveTopPrize(uidlist, mtype='zuanshi'):
        _con = getCon()
        _uidlist = uidlist
        _emaillist = []
        _utc = g.C.UTCNOW()
        _nt = now()
        _data = {
            "etype": 1,
            "getprize": 0,
            "ifpull": 0,
            "ctime": _nt,
            "ttltime": _utc
        }
        for idx, _uid in enumerate(_uidlist):
            if _uid.startswith('npc_'):
                continue
            _userdata = getWangZheUserData(_uid)
            _data['uid'] = _uid
            _data['sid'] = str(_userdata['sid'])
            if idx in (2, 3): idx = 2
            if idx in (4, 5, 6, 7): idx = 3
            _data['prize'] = _con['jiangli'][mtype][idx]['p']
            _data['title'] = _con['email'][mtype]['title'].format(_con['email'][mtype]['zanweifu'][idx])
            _data['content'] = _con['email'][mtype]['content'].format(_con['email'][mtype]['zanweifu'][idx])
            _emaillist.append(g.C.dcopy(_data))

        if len(_emaillist) > 0:
            g.crossDB.insert('crossemail', _emaillist)

        return len(_emaillist)

    _dkey = getDKey()

    groupList = isWangZheOpen()
    runList = set(groupList)
    for ugid in runList:
        if mtype == 'zuanshi':
            # 钻石前四名发奖
            _idlist = []
            for i in xrange(1, 17):
                _where = {'dkey': _dkey, 'groupid': i}
                if ugid:
                    _where['ugid'] = ugid
                _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['uid', 'zuanshiprize'], limit=8)
                _uidlist = []
                for ele in _r:
                    if 'zuanshiprize' in ele and ele['zuanshiprize'] == 1: continue
                    if ele['uid'].startswith('npc_'): continue
                    _uidlist.append(ele['uid'])
                    _idlist.append(ele['_id'])

                _num = giveTopPrize(_uidlist, mtype)

            g.crossDB.update('wzfight', {'_id': {'$in': _idlist}}, {'zuanshiprize': 1})

        else:
            _where = {'dkey': _dkey, 'ugid': ugid}
            if ugid:
                _where['ugid'] = ugid
            _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['uid', 'wangzheprize'], limit=8)
            _uidlist = []
            _idlist = []
            for ele in _r:
                if 'wangzheprize' in ele and ele['wangzheprize'] == 1: continue
                if ele['uid'].startswith('npc_'): continue
                _uidlist.append(ele['uid'])
                _idlist.append(ele['_id'])

            _num = giveTopPrize(_uidlist, mtype)
            g.crossDB.update('wzfight', {'_id': {'$in': _idlist}}, {'wangzheprize': 1})

    _actdict = {
        "zuanshi": "zuanshisaitopprize",
        "wangzhe": "wangzhesaitopprize"
    }
    setWangZheStep(_actdict[mtype])
    # 发跨服通知
    if mtype == 'wangzhe': sendWangzheNotice()
    return _num


# 执行钻石赛、王者赛的定时器逻辑
def runMatchTimer(step):
    # 本周活动未开启
    _ifopen = isWangZheOpen()
    if not _ifopen: return
    _laststep = getWangZheStep()
    _con = getCon()
    _actlist = [x['act'] for x in _con['event']]
    if _laststep not in _actlist: return
    _step = step
    _thisstep = 'autofight2deep{0}'.format(_step)
    _thisidx = _actlist.index(_thisstep)
    _lastidx = _actlist.index(_laststep)
    # 前置步骤未完成，则报错重试
    if _lastidx + 1 < _thisidx:
        print "previous step:{0} is not done, timer will do nothing.".format(_actlist[_lastidx])

    elif _lastidx + 1 == _thisidx:
        act_zuanShiGroupFight(_step)

    # 已经执行过
    else:
        print '{0} is already excuted, timer will do nothing.'.format(_thisstep)

    return


# 执行钻石赛、王者赛发奖定时器逻辑
def runPrizeTimer(mtype):
    # 检查上一步是否完成，如果未完成则延迟执行
    # 如果已经执行过，则跳过
    # 本周活动未开启
    _ifopen = isWangZheOpen()
    if not _ifopen: return
    _laststep = getWangZheStep()
    _con = getCon()
    _actlist = [x['act'] for x in _con['event']]
    if _laststep not in _actlist: return
    _dict = {
        'zuanshi': 'zuanshisaitopprize',
        'wangzhe': 'wangzhesaitopprize'
    }
    mtype = str(mtype)
    if mtype not in _dict: return
    _thisstep = _dict[mtype]
    _thisidx = _actlist.index(_thisstep)
    _lastidx = _actlist.index(_laststep)

    # 前置步骤未完成，则报错重试
    if _lastidx + 1 < _thisidx:
        print "previous step:{0} is not done, timer will do nothing.".format(_actlist[_lastidx])

    elif _lastidx + 1 == _thisidx:
        act_givePrizeByMtype(mtype)

    # 已经执行过
    else:
        print '{0} is already excuted, timer will do nothing.'.format(_thisstep)

    return


# 王者赛前四名发送跨区通告
def sendWangzheNotice():
    _con = getCon()
    _dkey = getDKey()

    groupList = isWangZheOpen()
    runList = set(groupList)
    for ugid in runList:
        _where = {'dkey': _dkey, 'deep': {'$gte': 6}}
        if ugid:
            if ugid != 3:
                continue
            _where['ugid'] = ugid
        _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['_id', 'uid'], limit=4)
        if len(_r) < 4: return
        _uidlist = [x['uid'] for x in _r]
        _round = g.crossDB.count('wzquarterwinner') + 1
        _userlist = [getWangZheUserData(x)['headdata'] for x in _uidlist]
        _msgarg1 = [_userlist[0].get('ext_servername', ''), _userlist[0]['name'], _round,
                    _userlist[1].get('ext_servername', ''), _userlist[1]['name']]
        _msgarg2 = [_userlist[2].get('ext_servername', ''), _userlist[2]['name'],
                    _userlist[3].get('ext_servername', ''), _userlist[3]['name'], _round]
        _msg1 = _con['msg']['1'].format(*_msgarg1)
        _msg2 = _con['msg']['2'].format(*_msgarg2)
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': _msg1, "mtype": 2, "fdata": {'pmd': 1},'extarg':{'ispmd':1}})
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': _msg2, "mtype": 2, "fdata": {'pmd': 1},'extarg':{'ispmd':1}})
    return


# 运行当前时间之前所有缺失的事件
def runAllEvent():
    # 理论当前时间
    _nt = now()
    # 根据理论当前时间生成的dkey
    _dkey = getDKey()
    # 根据当前时间得到的本周开始时间
    _zeroTime = getStartTime()
    # 时间配置
    _eventCon = g.GC['crosswz']['base']['event']
    # 当前已经执行到的步骤数初始step
    _baseStep = getWangZheStep()
    _step = _baseStep
    # 用来判断执行事件用，为0时，不等于当前step不执行，为1时_nt 大于事件执行事件时执行
    _chkType = 0
    # 默认起始事件
    if _step == None:
        _chkType = 1
        _step = _eventCon[0]['act']

    for event in _eventCon:
        _tmpAct = event['act']
        print '_tmpAct===========', _tmpAct
        if _tmpAct == 'setluandou2jinji':
            # 特殊处理乱斗上传事件，没有达到开赛人数终止所有事件流程
            _bmNum = getBaomingNum()
            if _bmNum < 256:
                break

        if _chkType == 0:
            if _tmpAct == _step:
                # 检测到已记录的步骤切换检测类型
                _chkType = 1
            continue
        else:
            _chkTime = _zeroTime + event['time']
            if _chkTime >= _nt:
                # 未到检测时间，不执行
                break
            _fmt = g.C.STR("{1}()", event['fun'])
            if 'args' in event:
                _fmt = g.C.STR("{1}('{2}')", event['fun'], event['args'])

            print 'run============', _fmt
            eval(_fmt)
            _step = getWangZheStep()
            if _step == _baseStep:
                # 操作未执行成功
                break
            _baseStep = _step


# 发送参与竞猜通知邮件
def sendWangzheJingcaiEmail():
    # 开启天数不足
    if g.getOpenDay() < 24:
        return

    _ifopen = isWangZheOpen()
    if not _ifopen: return
    _nt = g.C.NOW()
    _con = getCon()
    _title = _con['email']['jingcaikaiqi']['title']
    _content = _con['email']['jingcaikaiqi']['content']
    # 两天之后过期
    _passtime = _nt + 2 * 24 * 3600
    _r = g.m.emailfun.sendXitongEmail(_title, _content, passtime=_passtime)


# 获取王者荣耀红点
def getWangZheRongYaoHongDian(uid):
    if g.getOpenDay() < 31:
        return 0

    _statusData = getWangZheStatus(0)
    _status = _statusData['status']
    gud = g.getGud(uid)
    _lv = gud['lv']
    _vip = gud['vip']
    _res = 0

    if _status == 1:
        # 报名阶段未报名需要显示红点
        if _lv >= 75 and not isUserBaoming(uid):
            _res = 1
    elif _status == 3:
        # 已报名玩家在大乱斗阶段有挑战次数,且活动开启
        if _lv >= 75 and isWangZheOpen() and isUserBaoming(uid) and getRemainDldNum(uid) > 0:
            _res = 1
    elif _status == 6:
        # vip1及以上为投注的显示红点,且活动开启
        if _vip > 0 and isWangZheOpen() and getMyGuessName(uid) == '':
            _res = 1

    return _res


# 获取王者雕像信息
def getKingStatueInfo():
    _nt = g.C.NOW()
    _nowDkey = g.C.getWeekNumByTime(_nt)
    _res = g.mc.get('king_statue_{}'.format(_nowDkey))
    if not _res:
        # 缓存中没有 在跨服数据库中查找上一周排名前32的玩家
        _statue = g.mdb.find1('gameattr', {'uid': 'SYSTEM', 'ctype': 'king_statue'}, fields=['_id', 'v', 'k'])
        if not _statue or _statue['k'] != _nowDkey:
            _dkey = g.C.getWeekNumByTime(_nt - 7 * 24 * 3600)
            allUsers = g.crossDB.find('wzfight', {'dkey': _dkey, 'deep': {'$gte': 2}}, sort=[['deep', -1]],
                                      fields=['_id', 'uid', 'deep', 'groupid', 'ugid'])
            usrDict = {t['uid']: t for t in allUsers if not t['uid'].startswith('npc_')}
            _tmpUsers = {}
            for usr in allUsers:
                if usr['uid'].startswith('npc_'):
                    continue
                ugid = usr.get('ugid', 3)
                if ugid not in _tmpUsers:
                    _tmpUsers[ugid] = []
                _tmpUsers[ugid].append(usr['uid'])
            _users = []
            for pugid in _tmpUsers:
                tmpUid = sorted(_tmpUsers[pugid], key=lambda e: usrDict[e]['deep'], reverse=True)[:64]
                _users.extend(usrDict[t] for t in tmpUid)

            # 没有本服的
            # 缓存周末12点
            if not _users:
                _res = {'name': '虚位以待'}
            else:
                # 筛选本服的人
                _users = filter(lambda x: g.m.crosscomfun.chkIsThisService(x['uid']), _users)
                # 如果没有本服的
                if not _users:
                    _res = {'name': '虚位以待'}
                else:
                    # 如果deep相同就比较战力
                    _users = filter(lambda x: x['deep'] == _users[0]['deep'], _users)
                    if len(_users) > 1:
                        _max = \
                        g.crossDB.find('wzuserdata', {'dkey': _dkey, 'uid': {'$in': map(lambda x: x['uid'], _users)}},
                                       fields=['_id', 'uid'], sort=[['info.maxzhanli', -1]], limit=1)[0]
                        _res = filter(lambda x: x['uid'] == _max['uid'], _users)[0]
                    else:
                        _res = _users[0]
                    _res['name'] = g.getGud(_res['uid'])['name']
                    g.mdb.update('gameattr', {'ctype': 'king_statue', 'uid': 'SYSTEM'}, {'k': _nowDkey, 'v': _res},
                                 upsert=True)

            if _statue and _statue['k'] != _nowDkey:
                # 如果是上周的并且奖励没领完就发送奖励
                sendPreKingPrize(_statue)
        else:
            _res = _statue['v']
        g.mc.set('king_statue_{}'.format(_nowDkey), _res, g.C.getWeekFirstDay(_nt) + 7 * 24 * 3600 - _nt - 1)

    return _res


# 发送上周没有领取的奖励
def sendPreKingPrize(statue):
    _nowDkey = g.C.getWeekNumByTime(g.C.NOW())
    _flower = g.getAttrOne(statue['v']['uid'], {'ctype': 'kingstatue_flower'}, keys='_id,v,reclist')
    # 没有信息 或者连100都没有
    if not _flower or _flower.get('v', 0) < 100:
        return

    _con = g.GC['crosswz']['num2prize']
    _prize = []
    for i in _con:
        if _flower.get('v', 300) >= int(i) and int(i) not in _flower.get('reclist', []):
            _prize += _con[i]

    if _prize:
        _title = '王者雕塑-鲜花奖励'
        _content = '勇者大人，你可能忘记领取大家赠与你的鲜花奖励了！'
        g.m.emailfun.sendEmails([statue['v']['uid']], 1, _title, _content, prize=_prize)
        g.delAttr(statue['v']['uid'], {'ctype': 'kingstatue_flower'})


# 获取王者雕像红点
def getKingStatueHD(uid):
    _res = 0
    _statue = getKingStatueInfo()
    if not _statue.get('uid'):
        return _res
    # 今日可以送花
    if not g.getAttrByDate(uid, {'ctype': 'kingstatue_gift'}, fields={'_id': 1, 'lasttime': 1}):
        _res = 1
    # 王者本王
    elif _statue['uid'] == uid:
        _key = g.C.getWeekNumByTime(g.C.NOW())
        _flower = g.getAttrOne(_statue['uid'], {'ctype': 'kingstatue_flower', 'k': _key}, keys='_id,v,reclist') or {}
        _con = g.GC['crosswz']['num2prize']
        for num in _con:
            if _flower.get('v', 0) >= int(num) and int(num) not in _flower.get('reclist', []):
                _res = 1
                break

    return _res


# 获取大乱斗倒计时
def getDldEndTime(uid):
    if g.m.crosswzfun.isUserBaoming(uid):
        return getCon()['timestatus'][2]['etime'] + getStartTime()
    else:
        return -1


# 检测玩家数据是否重复
def chkHeroRepeatRes(heros):
    _chk = set()
    for i in heros:
        for pos, tid in i.items():
            if pos == 'sqid' or pos == 'pet':
                continue
            if tid in _chk:
                return False
            _chk.add(tid)
    return True


# 获取ugid
def getUGID():
    openDay = g.m.crosswzfun.getDOpenDay()
    if openDay <= 30:
        return 1
    elif 30 <= openDay <= 61:
        return 2
    elif 61 <= openDay <= 90:
        return 3
    elif 91 <= openDay <= 120:
        return 4
    elif 121 <= openDay <= 210:
        return 5
    return 6


# 添加npc
def addNpc():
    if g.crossDB.count('userdata', {'uid': 'npc_0'}) > 0:
        return

    _npcData = {}
    _nameCon = g.GC['other']['robot']
    _headIds = g.GC["zaoxing"]["head"].keys()
    _npcList = g.GC['crosswz']['npclist']

    _insert = []
    for i in xrange(0, 5 * 256):
        _npc = g.C.RANDLIST(_npcList)[0]
        _zhanli = 0
        for npc in _npc:
            if npc in _npcData:
                _npcFight = _npcData[npc]
            else:
                _npcFight = g.m.fightfun.getNpcFightData(npc)
                _npcData[_npc] = _npcFight
            _zhanli += sum(g.m.herofun.getHeroZhanLi(x) for x in _npcFight['herolist'])
        _npcFight['headdata']['name'] = ''.join(g.C.RANDLIST(_nameCon['firstname']) + g.C.RANDLIST(_nameCon['sexname']))
        _npcFight['headdata']['head'] = g.C.RANDLIST(_headIds)[0]
        _npcFight['headdata']['vip'] = 0
        _npcFight['headdata']['zhanli'] = _npcFight['headdata']['maxzhanli'] = _zhanli
        _info = {
            'openday': 0,
            'headdata': _npcFight['headdata'],
            'maxzhanli': _zhanli,
            'uid': 'npc_{}'.format(i)
        }
        _insert.append({'uid': _info['uid'], 'info': _info})
    g.crossDB.insert('userdata', _insert)


# 根据天数获取区服名称
def getServerName(where):
    def getServers():
        _res = g.crossMC.get("cache_servers")
        if not _res:
            _res = g.crossDB.find('serverdata', {'sids': {'$nin': g.GC['crosswz']['sids']}}, fields=['_id'])
            g.crossMC.set('cache_servers', _res, 60)
        return _res

    _res = []
    for s in getServers():
        if (('$gte' in where and s['opentime'] >= g.C.NOW() - 24 * 3600 * where['$gte']) or '$gte' not in where) and (
                ('$lte' in where and s['opentime'] <= g.C.NOW() - 24 * 3600 * where['$lte']) or '$lte' not in where):
            _res.append(s)

    return g.C.RANDLIST(_res)[0]['servername'] if _res else ""


# 获取自己得ugid
def getUgid(uid):
    _key = getDKey()
    _res = g.mc.get('crosswz_ugid_{0}_{1}'.format(_key, uid))
    if _res is None:
        _own = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _key}, fields=['ugid','_id'])
        if _own:
            _res = _own['ugid']
            g.mc.set('crosswz_ugid_{0}_{1}'.format(_key, uid), _res, 24*3600)
        else:
            openDay = getDOpenDay()
            _res = getGroupIdx(openDay) + 1
    return _res


# 生成npc
def generateNpc():
    _dkey = getDKey()
    _group = {}
    _group[1] = g.crossDB.find('wzbaoming', {'dkey': _dkey, 'openday': {'$lte': 60}}, limit=256, fields=['_id'])

    _group[2] = g.crossDB.find('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 61, '$lte': 90}}, limit=256,fields=['_id'])

    _group[3] = g.crossDB.find('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 91, '$lte': 120}}, limit=256,fields=['_id'])

    _group[4] = g.crossDB.find('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 121, '$lte': 210}}, limit=256,fields=['_id'])

    _group[5] = g.crossDB.find('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 211}}, limit=256, fields=['_id'])

    _nameCon = g.GC['other']['robot']
    _headIds = g.GC["zaoxing"]["head"].keys()
    _insertBM, _headUids, _npcList = [], [], g.GC['crosswz']['npclist']
    _openDay = {4: 121, 3: 91, 2: 61, 1: 1, 5: 211}
    _npcData = {}




    _npcNum = 0
    for i in xrange(5, 0, -1):
        num = len(_group[i])
        _groupNum = i
        _randomHero = []
        _randomNpc = g.C.RANDLIST(_npcList, 3)
        for npc2list in _randomNpc:
            for npcid in npc2list:
                _bossFightData = g.m.fightfun.getNpcFightData(npcid)
                _randomHero.append(_bossFightData['herolist'])
        # 人数不足就补足
        while len(_group[i]) < 256 and _groupNum > 1:
            _randomHero = []
            _extend = g.C.dcopy(_group[_groupNum - 1][:256 - num])

            for user in _extend:
                # 取出头像信息
                _userData = g.crossDB.find1('userdata', {'uid': user['uid']}, fields=['info', '_id'])
                if _userData:
                    _userData['info']['openday'] = _openDay[i]
                    _userData['info']['headdata']['name'] = ''.join(
                        g.C.RANDLIST(_nameCon['firstname']) + g.C.RANDLIST(_nameCon['sexname']))
                    _userData['info']['headdata']['head'] = g.C.RANDLIST(_headIds)[0]
                    _userData['info']['headdata']['uid'] = 'npc_{}'.format(_npcNum)
                    g.crossDB.update('userdata', {'uid': 'npc_{}'.format(_npcNum)}, {'info': _userData['info']})

                _randomHero.extend(user["herodata"])
                _randomHero = _randomHero[-1:-20:-1]
                user['uid'] = 'npc_{}'.format(_npcNum)
                user['fightdata'] = []
                user["herodata"] = g.C.RANDLIST(_randomHero, 3)
                user['jifen'] = 0
                user['renum'] = 0
                user['openday'] = _openDay[i]
                _npcNum += 1

            _group[i] += _extend
            _insertBM += _extend
            num = len(_group[i])
            _groupNum -= 1

        ttl = g.C.TTL()
        # 还不够就添加npc
        if num < 256:
            for x in xrange(256 - num):
                _idx = g.C.RANDINT(0, len(_npcList) - 1)
                if _idx in _npcData:
                    _npcFight = _npcData[_idx]
                else:
                    _fightData, _zhanli = [], 0
                    for npcid in _npcList[_idx]:
                        _bossFightData = g.m.fightfun.getNpcFightData(npcid)
                        _zhanli += sum(g.m.herofun.getHeroZhanLi(npcHero) for npcHero in _bossFightData['herolist'])
                        _fightData.append(_bossFightData['herolist'])
                    _npcFight = _npcData[_idx] = {'hero': _fightData, 'zhanli': _zhanli}

                _insertBM.append({
                    'fightdata': [],
                    'uid': 'npc_{}'.format(_npcNum),
                    'jifen': 0,
                    'herodata': _npcFight['hero'],
                    'openday': _openDay[i],
                    'renum': 0,
                    'ttltime': ttl,
                    'ctime': g.C.NOW(),
                    'dkey': _dkey,
                    'curzhanli': _npcFight['zhanli'],
                    'zhanli': _npcFight['zhanli']
                })
                _npcNum += 1
    if _insertBM:
        g.crossDB.insert('wzbaoming', _insertBM)

    # 现在就对所有得人分组
    for idx,i in enumerate(({'$lte': 60},{'$gte': 61, '$lte': 90},{'$gte': 91, '$lte': 120},{'$gte': 121, '$lte': 210})):
        g.crossDB.update('wzbaoming', {'dkey': _dkey, 'openday': i}, {'ugid': idx + 1})

    _data = g.crossDB.find1('crossconfig',{'ctype':'crosswz_group'},fields=['_id','v'])
    if _data:
        for sid,div in _data['v'].items():
            g.crossDB.update('wzbaoming', {'dkey': _dkey, 'sid': str(sid)}, {'ugid': div})
    else:
        g.crossDB.update('wzbaoming', {'dkey': _dkey, 'openday': {'$gte': 211}}, {'ugid': 5})


# 分组
def group():
    # 活跃人数
    _all = g.crossDB.find('wzbaoming', {'dkey': getDKey(),'openday':{'$gte':211}},fields=['_id','sid'])
    _sid2num = {}
    for i in _all:
        _sid2num[i['sid']] = 1 + _sid2num.get(i['sid'], 0)

    _servers = g.crossDB.find('serverdata',{'serverid': {'$in': _sid2num.keys()}},fields=['_id','serverid'],sort=[['opentime',1]])

    _modulus = 1000 if len(_all) <= 7000 else g.C.CEIL(len(_all) / 6.0)
    _num, _sid = 0, []
    _res = 4
    _sid2div = {}
    for i in _servers:
        _num += _sid2num[i['serverid']]
        _sid.append(i['serverid'])
        # 大于系数的话  开始分赛区
        if _num >= _modulus:
            _res += 1
            _num = 0
            for x in _sid:
                _sid2div[x] = _res
            _sid = []
    else:
        if _num >= 500:
            _res += 1
        for x in _sid:
            _sid2div[x] = _res

    if _sid2div:
        g.crossDB.update('crossconfig',{'ctype':'crosswz_group'},{'v':_sid2div,'group':_res},upsert=True)
        _dkey = getDKey()
        _cacheKey = g.C.STR("ISWANGZHEOPEN_{1}", _dkey)
        g.crossMC.delete(_cacheKey)


# 定时增加竞猜任务和金币
def timer_addGuessExtNum(idx):
    _con = getCon()
    # 开始增加人数的初始时间
    _extAddStartTime = _con['ext_addnumstime']
    # 每次增加的概率
    _addNumPro = _con['ext_addnumpro']
    _maxRound = len(_addNumPro)
    _dkey = getDKey()
    # 获得对应的期数
    _nt = g.C.NOW()
    # 每周递增概率
    _sizeTime = 7 * 24 * 3600
    _round = int((_nt - _extAddStartTime) / _sizeTime)
    if _round < 0: _round = 0
    if _round >= _maxRound:  _round = _maxRound - 1
    # 当前的概率
    _addPro = _addNumPro[_round][idx]
    # 获取可参与投票者的排行
    _guessUser = g.crossDB.find('wzguessdata', {'dkey': _dkey, }, sort=[['ext_guessnum', -1]],
                                fields=['_id', 'uid', 'guessnum', 'guessmoney', 'ext_guessnum', 'ext_guessmoney'])
    if len(_guessUser) == 0:
        return

    _allGuessUserList = []
    _top4User = []
    # 全部竞猜的实际数量
    _allGuessUserNum = 0
    # 前四投票总数
    _allTop4GuessNum = 0
    for d in _guessUser:
        if len(_top4User) < 4:
            _top4User.append(d)
            _allTop4GuessNum += d['ext_guessnum']

        _allGuessUserNum += d['guessnum']

    # 当前添加的人数先不取整数
    _allAddUser = _addPro * _allGuessUserNum
    for d in _top4User:
        _tmpUid = d['uid']
        _addUser = int(_allAddUser * d['ext_guessnum'] / _allTop4GuessNum)
        _addMoney = _addUser * 300
        _setData = {'$inc': {'ext_guessnum': _addUser, 'ext_guessmoney': _addMoney}}
        g.crossDB.update('wzguessdata', {'dkey': _dkey, 'uid': _tmpUid}, _setData)
        g.crossDB.update('crosskv', {'dkey': _dkey, 'ctype': 'crosswz_guess_totalnum_ext'}, {'$inc': {'v': _addMoney}},
                         upsert=True)


if __name__ == '__main__':

    _key = 'huodong_' + str(80)
    _hdInfo = g.mc.delete(_key)
