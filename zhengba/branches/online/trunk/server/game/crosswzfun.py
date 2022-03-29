#!/usr/bin/python
#coding:utf-8


'''
跨服巅峰王者相关方法
'''

import g
import random
import copy
from fight.ZBFight import ZBFight

#获取当前时间
def now():
    return g.C.NOW()

#获取dkey
def getDKey():
    _nt = now()
    _dkey = g.C.getWeekNumByTime(_nt)
    return _dkey

#获取周一零点事件戳
def getStartTime():
    _nt = now()
    _res = g.C.getWeekFirstDay(_nt)
    return _res

#获取配置
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
    if _canNum < 0: _canNum=0
    return _canNum


# 获取大乱斗胜利积分
def getDaLuanDouScore(fightdata, winside):
    # 计算连胜
    _num = 0
    _score = 2
    if fightdata[-1] < 1:
        _score = 10
    for i in xrange(len(fightdata)-1, -1, -1):
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
def getBaomingNum():
    _dkey = getDKey()
    _where = {'dkey': _dkey}
    # 大乱斗阶段时间
    _nt = now()
    _con = g.GC['crosswz']['base']['timestatus'][1]
    _zeroTime = getStartTime()
    _sTime = _con['stime'] + _zeroTime
    # 报名阶段取实时数据
    if _nt <= _sTime:
        return g.crossDB.count('wzbaoming', _where)

    cacheKey = 'WANGZHEBMNUM_{0}'.format(str(_dkey))
    _bmNum = g.crossMC.get(cacheKey)
    # 从数据库读取人数
    if _bmNum != None:
        return _bmNum

    _bmNum = g.crossDB.count('wzbaoming', _where)
    g.crossMC.set(cacheKey, _bmNum, time=60)

    return _bmNum


# 获取一个除选择的uid外选择随机的uid
def getRandomUid(uid):
    _toUser = g.crossDB.find1_rand('wzbaoming', {'uid': {'$nin': [uid]}, 'dkey': getDKey()}, fields=['_id', 'uid'])
    if _toUser != None:
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
    _data = g.mdb.find('playattr', {'ctype':'autobmflag', 'v': True}, fields=['_id', 'uid'])
    _uid = [_tmp['uid'] for _tmp in _data]
    return _uid


#获取大乱斗玩家数据
def getLuanDouUserData(uid, iscache=1):
    _userData = g.crossDB.find1('userdata', {'uid': uid}, fields=['_id'])
    return _userData


#删除跨服玩家大乱斗缓存信息
def clearLuanDouUserCache(uid):
    g.m.crosszbfun.clearUserDataCache(uid)
    return 1


#删除跨服玩家缓存信息
def clearWangZheUserCache(uid):
    _key = getWangZheUserKey(uid)
    g.crossMC.delete(_key)
    return 1

#获取玩家巅峰王者进阶赛阶段的缓存key
def getWangZheUserKey(uid):
    _dkey = getDKey()
    return g.C.STR("CROSS_WANGZHEJINJIE_{1}_{2}",uid,_dkey)


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


#获取巅峰王者进阶赛玩家数据
def getWangZheUserData(uid,iscache=1):
    _key = getWangZheUserKey(uid)
    _res = g.crossMC.get(_key)
    if _res != None and iscache:
        return _res

    _dkey = getDKey()
    _res = g.crossDB.find1('wzuserdata',{'uid':uid, 'dkey': _dkey})
    _res.update(_res.pop('info'))
    if _res != None:
        g.crossMC.set(_key,_res,time=3600 * 72)
    return _res

# 上传玩家信息到跨服服务器(data：特殊参数，udata：如果不是none则为完整用户信息)
def uploadWangZheUserData(uid,data=None,udata=None):
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
    _w = {'uid': uid,'dkey':_dkey}
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
def getRankData():
    _rankData = g.crossMC.get("WANGZHEDLD256RANK")
    _dkey = getDKey()
    if _rankData != None:
        return _rankData
    _rankData = g.crossDB.find('wzbaoming', {'dkey': _dkey}, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]], fields=['_id', 'uid', 'jifen', 'zhanli'], limit=256)
    g.crossMC.set("WANGZHEDLD256RANK", _rankData, time=10)
    return _rankData


#判断巅峰王者是否开启（报名人数是否已达256人）
def isWangZheOpen():
    #取缓存
    _dkey = getDKey()
    _cacheKey = g.C.STR("ISWANGZHEOPEN_{1}",_dkey)
    _isOpen = g.crossMC.get(_cacheKey)
    if _isOpen != None:
        return _isOpen
    
    _where = {'dkey':_dkey}
    _bmNum = g.crossDB.count('wzbaoming',_where)
    #开启数量写死，如配置到配置中比较危险，错写会导致整个系统无法进行
    if _bmNum < 256:
        return 0
    #如果达到人数要求存入缓存
    _time = 7 * 24 * 3600
    g.crossMC.set(_cacheKey,1, time=_time)
    return 1

#获取王者的当前状态阶段
#isstatus只返回status，否则返回对应的status和配置中所需的值{"status":x}
def getWangZheStatus(isstatus=1):
    _nt = now()
    _con = g.GC['crosswz']['base']['timestatus']
    _zeroTime = getStartTime()
    #默认比赛结束状态
    _res = {'status':8,'cd':_zeroTime + 7*24*3600}
    # 开服7天内结束
    if g.getOpenDay() <= 7:
        return _res

    for ele in _con:
        _stime = _zeroTime + ele['stime']
        _etime = _zeroTime + ele['etime']
        if _nt>= _stime and _nt < _etime:
            _res['status'] = ele['status']
            for e in ele['show']:
                if e == 'cd':
                    #显示下一个节点的
                    _res['cd'] = _etime
                elif e == 'num':
                    #显示报名人数
                    _res['num'] = getBaomingNum()
                    
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

#设置王者步骤
def setWangZheStep(act):
    _dkey = getDKey()
    _where = {'k':_dkey,'ctype':'wangzhestep'}
    _act = {'v': act}
    g.m.crosscomfun.setGameConfig(_where,_act)
    
#获取当前王者步骤
def getWangZheStep():
    _dkey = getDKey()
    _where = {'k':_dkey,'ctype':'wangzhestep'}
    _res = g.m.crosscomfun.getGameConfig(_where)
    if len(_res)== 0:
        return
    return _res[0]['v']

#获取事件配置信息
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
    if not isWangZheOpen():
        return

    _dkey = getDKey()
    '''检测数据是否异常'''
    # wz晋级数据
    _bmNum = g.crossDB.count('wzuserdata', {'dkey': _dkey})
    if _bmNum == 256:
        setWangZheStep(_act)
        return

    if 0 < _bmNum and _bmNum != 256:
        # 数据异常，初始化'wzuserdata'和'wzfight'
        g.crossDB.delete('wzuserdata', {'dkey': _dkey})
        g.crossDB.delete('wzfight', {'dkey': _dkey})

    # 获取数据库前256名玩家
    userData = g.crossDB.find('wzbaoming', {'dkey': _dkey}, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]], fields=['_id', 'uid'], limit=256)
    _userList = [_tmp['uid'] for _tmp in userData]
    # 查询所有符合要求的数据
    _data = g.crossDB.find('userdata', {'uid': {'$in': _userList}}, fields=['_id'])
    _newdata = []
    for ele in _data:
        if 'extbuffnum' in ele: del ele['extbuffnum']
        ele['dkey'] = _dkey
        ele['ttltime'] = _utc
        _newdata.append(ele)

    # 插入dkey
    _insertData = _newdata
    # 将数据插入数据库
    g.crossDB.insert('wzuserdata', _insertData)
    # 验证操作是否成功
    preWzFightData(userData)
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
        'zuanshi': ['autofight2deep0','autofight2deep1','autofight2deep2','autofight2deep3'],
        'wangzhe': ['autofight2deep4','autofight2deep5','autofight2deep6','autofight2deep7']
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

    if iftimelist==True:
        _newtimelist = []
        _addtime = 600
        if mtype == 'wangzhe': _addtime = 1200
        for i in xrange(4):
            _timelist[i] += 300 #显示时间比配置时间晚出现5分钟
            _newtimelist.append([_timelist[i], _timelist[i] + _addtime])

        return _newtimelist

    else:
        return _time

# 获取某个玩家的竞猜金额和数量
def getGuessDataByUid(uid):
    _guessmoney, _guessnum = 0,0
    _dkey = getDKey()
    _r = g.crossDB.find('wzguessdata', {'dkey': _dkey,'uid':uid}, fields=['_id','guessnum','guessmoney'])
    if _r:
        _guessmoney = _r[0]['guessmoney']
        _guessnum = _r[0]['guessnum']

    return (_guessmoney, _guessnum)

# 获取玩家竞猜名字
def getMyGuessName(uid):
    _name = ''
    _dkey = getDKey()
    _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'uid': uid}, fields=['_id','guessuid'])
    if _r:
        _guessuid = _r[0]['guessuid']
        _userdata = getWangZheUserData(_guessuid)
        _name = _userdata['headdata']['name']

    return _name

def getMyGuessUid(uid):
    _guessuid = ''
    _dkey = getDKey()
    _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'uid': uid}, fields=['_id','guessuid'])
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
    _setData = {'$inc':{'guessmoney': _addmoney, 'guessnum': 1}, '$set':{'ttltime': _utc}}
    g.crossDB.update('wzguessdata', {'dkey': _dkey, 'uid': touid}, _setData, upsert=True)
    g.crossDB.update('crosskv', {'dkey': _dkey, 'ctype': 'crosswz_guess_totalnum'}, {'$inc': {'v': _addmoney}}, upsert=True)
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
    _r = g.crossDB.find('crosskv', {'ctype': 'crosswz_guess_totalnum', 'dkey': _dkey})
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
    _retVal = [True,0]
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

    g.setAttr(uid, {'ctype':'crosswz_uploadcd'}, {'v': _nt + 600})
    return _retVal

#钻石赛淘汰赛 周三周四中午12点和20点开始
def act_zuanShiGroupFight(deep):
    deep = int(deep)
    _act = g.C.STR('autofight2deep{1}',deep)
    _eventCon = getActCon(_act)
    #周一零点时间戳
    _st = getStartTime()
    _nt = now()
    #理论执行时间
    _doTime = _st + int(_eventCon['time'])
    _where = {}
    _where['deep'] = deep
    _dKey = getDKey()
    _where['dkey'] = _dKey
    _sort = [["groupid",1],["orderid",1]]
    if deep >= 4: _sort = [["random", 1]]
    _userList = g.crossDB.find('wzfight',_where,sort=_sort,fields=['_id','matchlog','uid','deep','groupid','orderid'])
    # 一起获取玩家数据
    _uidList = [t['uid'] for t in _userList] 
    _userData = g.crossDB.find('wzbaoming',{'uid': {'$in': _uidList}, 'dkey': _dKey}, fields=['_id', 'herodata', 'uid', 'curzhanli'])
    uidtoHero = {t['uid']: t['herodata'] for t in _userData}
    uidtozhanli = {t['uid']: t.get('curzhanli', 0) for t in _userData}
    # 造型数据
    _deadData = g.crossDB.find('userdata',{'uid': {'$in': _uidList}}, fields=['_id', 'info.headdata', 'uid'])
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

        _signData = []  # 先记录所有的战斗结果后记录数据库
        _winArr = [0,0]
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
                        if ('sqid' not in newfd) and newfd['hp'] <= 0:
                            continue
                        _fData1.append(newfd)
                if i < len(fightdata2):
                    for fd2 in fightdata2[i]:
                        newfd = fd2.copy()
                        newfd['side'] = 1
                        if ('sqid' not in newfd) and newfd['hp'] <= 0:
                            continue
                        _fData2.append(newfd)
                fightRes = {}
                f = ZBFight('pvp')
                fightRes = f.initFightByData(_fData1 + _fData2).start()
                fightRes['headdata'] = [uidToHead[_uid1], uidToHead[_uid2]]
                # 获取战斗结果
                if fightRes['winside'] == -2:
                    winNum += int(uidtozhanli[_uid1] > uidtozhanli[_uid2])
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
                'fightuser': _uidlist  # pk的玩家
            }
            _signData.append(_tmpdata)
            _addtime += 300

        _winUid = _uid1
        if _winArr[1] > _winArr[0]: _winUid = _uid2

        #通过_signData的记录来写入数据
        for i,_uid in enumerate(_uidlist):
            _w = g.C.dcopy(_where)
            _w.update({'uid': _uid})
            _matchlog = g.C.dcopy(_tmpGroup[i]['matchlog'])
            _tmpdata = {str(deep): {
                    'winlog': _signData,
                    'uuid':_uuid,
                    'order': _order
                    }}
            _matchlog.update(_tmpdata)
            _setData = {'matchlog': _matchlog}

            # 获胜玩家更新deep值
            if _uid == _winUid:
                _setData.update({'deep': _tmpGroup[i]['deep'] + 1})
            else:
                # 失败这设置数据，防止多定时器同时运行
                _setData.update({'deep': _tmpGroup[i]['deep']})

            _savedata.append([_w,_setData])
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
        i = divmod(i,2)[0]
        for j,_data in enumerate(_setData['matchlog'][str(deep)]['winlog']):
            _data['fid'] = _fidlist[i*_pkNum + j]

        g.crossDB.update('wzfight', _w, _setData)

    #设置步骤
    setWangZheStep(_act)
    return 1

# 生成钻石赛的测试数据
def createZuanshisaiTestData(ftype='baoming'):
    # 准备玩家报名数据
    def __prepareBaomingData():
        _r = g.mdb.find('userinfo', {}, sort=[['zhanli', -1]], limit=300, fields=['_id','uid','zhanli'])
        _nt = g.C.NOW()
        _dkey = getDKey()
        _ttl = g.C.UTCNOW()
        _data = {
            'ctime': _nt,
            'jifen': 0,
            'fightdata': [],
            'renum': 0,
            'dkey': _dkey,
            'ttltime': _ttl
        }
        _userdata = []
        for ele in _r:
            _data['uid'] = ele['uid']
            _data['zhanli'] = ele['zhanli']
            _userdata.append(g.C.dcopy(_data))
            heroList = g.mdb.find('hero', {'uid': ele['uid']}, fields={'_id': 1}, sort=[['zhanli', -1]])
            _heroData = [{}, {}, {}]
            for idx, hero in enumerate(heroList):
                gidx = idx % 3
                _heroData[gidx].update({str(gidx + 1): str(hero['_id'])})
            _myZhanli = 0
            for hidx, hgroup in enumerate(_heroData):
                _chkRes = g.m.fightfun.chkFightData(ele['uid'], hgroup)
                _myZhanli += _chkRes['zhanli']
                _heroData[hidx] = g.m.fightfun.getUserFightData(ele['uid'], _chkRes['herolist'], 0, sqid=None)

            uploadUserData(ele['uid'])
            _userdata['herodata'] = _heroData
            _userdata['zhanli'] = _myZhanli
        if _userdata:
            g.crossDB.insert('wzbaoming', _userdata)


    # 准备巅峰王者玩家数据
    def __prepareWzUserData():
        
        _r = g.mdb.find('userinfo',{}, sort=[['zhanli', -1]], limit=256, fields=['_id','uid','binduid'])
        # 上传数据到wzuserdata里
        for _user in _r:
            try:
                uploadWangZheUserData(_user['uid'])
            except:
                print "failed {0} ".format(_user['binduid'])

    # wzfight里生成测试数据
    def __preWzFightData():
        _r = g.crossDB.find('wzuserdata',{}, fields=["_id"])
        _groupid = 1
        _orderid = 1
        _nt = now()
        _wzfightdata = []
        for i,ele in enumerate(_r):
            _group = divmod(i, 2)[0] + 1
            _tmp = {
                'uid': ele['uid'],
                'dkey': getDKey(),
                'groupid': _groupid,
                'orderid': _orderid,
                'deep': 0,
                'ctime': _nt,
                'matchlog': {} # 保存每轮战斗结果 
            }
            _orderid += 1
            if _orderid > 16: 
                _orderid = 1
                _groupid += 1
            
            _wzfightdata.append(_tmp)


        g.crossDB.insert('wzfight', _wzfightdata)

    if ftype=="baoming":
        __prepareBaomingData()

    elif ftype=='wzuserdata':
        __prepareWzUserData()
    else:
        __preWzFightData()

# 大乱斗进入晋级赛时，加入wzfight数据
def preWzFightData(userdata):
    _groupid = 1
    _orderid = 1
    _nt = now()
    _wzfightdata = []
    _dkey = getDKey()
    _randnum = range(1,257)
    random.shuffle(_randnum)
    random.shuffle(userdata)
    for i,ele in enumerate(userdata):
        _group = divmod(i, 2)[0] + 1
        _tmp = {
            'uid': ele['uid'],
            'dkey': _dkey,
            'groupid': _groupid,
            'orderid': _orderid,
            'deep': 0,
            'ctime': _nt,
            'random': _randnum[i],
            'matchlog': {} # 保存每轮战斗结果 
        }
        _orderid += 1
        if _orderid > 16: 
            _orderid = 1
            _groupid += 1
        
        _wzfightdata.append(_tmp)


    g.crossDB.insert('wzfight', _wzfightdata)

# 更新王者之巅数据
def act_updateWZZhidian():
    _act = 'autofight2deep8'
    # 活动未开启
    if not isWangZheOpen():
        return

    # 获取当前步骤
    if getWangZheStatus() < 8:
        #还没有进行到当前步骤
        return

    # 获取当前周次
    _dkey = getDKey()
    if g.crossDB.count('wzquarterwinner', {'dkey': _dkey}) > 0:
        # 数据已经存在
        return

    # 获取王者晋级赛数据
    _playerInfo = g.crossDB.find('wzfight', {'deep': {'$gte': 6}, 'dkey': _dkey}, fields=['_id', 'uid', 'deep'])
    # 验证人数
    if len(_playerInfo) < 4:
        # 人数不足无法操作
        return

    # 将玩家按照排名生成列表
    _rankList = sorted(_playerInfo, key=lambda e:e['deep'], reverse=True)
    # 验证王者是否产生
    if _rankList[0]['deep'] <8:
        return

    # 生成deep键值对
    _deepDict = {_tmp['uid']: _tmp['deep'] for _tmp in _rankList}
    # 获取uid列表
    _uidlist = [_tmp['uid'] for _tmp in _rankList]
    # 获取玩家数据
    _playerData = g.crossDB.find('wzuserdata', {'uid': {'$in': _uidlist}}, fields=['_id', 'info', 'uid'])
    if len(_playerData) <= 0:
        # 未在王者组找到数据
        return

    # 格式化数据
    _playerDict = {_tmp['uid']: _tmp['info']['headdata'] for _tmp in _playerData if not _tmp['info']['headdata'].update({'deep': _deepDict[_tmp['uid']]}) and not _tmp['info']['headdata'].update({'uid': _tmp['uid']})}
    # 生成4强数据
    _playerList = [_playerDict[_tmp] for _tmp in _uidlist]
    # 获取当前round
    _round = g.crossDB.count('wzquarterwinner') + 1
    _data = {'round': _round}
    _data['ctime'] = now()
    _data['dkey'] = _dkey
    _data['ranklist'] = _playerList
    # 保存4强数据

    g.crossDB.insert('wzquarterwinner', _data)
    if g.crossDB.count('wzquarterwinner', {'dkey': _dkey}) < 0:
        # 如果数据保存不成功，重复执行
        raise Exception('failed')
    # 保存活动状态
    setWangZheStep(_act)


# 发送竞猜奖励
def act_giveJingcaiPrize():
    # 总奖金
    totalmoney = getTotalGuessMoney()
    # 本期前四
    _dkey = getDKey()
    _con = getCon()
    _r = g.crossDB.find('wzfight', {'dkey': _dkey}, sort=[['deep', -1]], fields=['_id','uid'], limit=4)
    _uidlist = [x['uid'] for x in _r]
    _nt = now()
    _utc = g.C.UTCNOW()
    _data = {
        "etype":1,
        "getprize":0,
        "ifpull":0,
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
    _emaillist = []
    for idx, _uid in enumerate(_uidlist):
        if idx in (2,3): idx=2
        _userdata = getWangZheUserData(_uid)
        _data['content'] = _con['email']['jingcai']['content'].format(_userdata['headdata']['name'], _con['email']['jingcai']['zanweifu'][idx])
        _r = g.crossDB.find('wzguesslog', {'dkey': _dkey, 'guessuid': _uid}, fields=['_id','uid','gtype','sid'])
        # 各个gtype有多少人
        _dict = {}
        for ele in _r:
            if ele['gtype'] not in _dict: _dict[ele['gtype']] = 0
            _dict[ele['gtype']] += 1


        for ele in _r:
            _data['sid'] = str(ele['sid'])
            _data['uid'] = ele['uid']
            # 除以本档次总竞猜人数
            _addrmbmoney = int(totalmoney * _rankdict[str(idx)] * _leveldict[ele['gtype']] * 1.0 /_dict[ele['gtype']])
            if _addrmbmoney > _con['guess'][ele['gtype']]['addmoney'] * 10:  _addrmbmoney = _con['guess'][ele['gtype']]['addmoney'] * 10
            _prize = [{'a':'attr','t':'rmbmoney','n': _addrmbmoney}]
            _data['prize'] = _prize
            _emaillist.append(g.C.dcopy(_data))

    if len(_emaillist) > 0:
        g.crossDB.insert('crossemail', _emaillist)

    # 2017-03-06 给本期未中奖的玩家发送竞猜失败邮件
    _loseemail = []
    _r = g.crossDB.find('wzguesslog', {'dkey':_dkey, 'guessuid':{'$nin': _uidlist}}, fields=['_id','uid','sid'])
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
    _r = g.crossDB.find('wzfight', {'dkey': _dkey}, fields=['uid','dldjinjiprize'])
    if not _r:
        print 'give daluandou prize failed ...',
        return

    _emaillist = []
    _idlist = []
    _nt = g.C.NOW()
    _utc = g.C.UTCNOW()
    _data = {
        "etype":1,
        "getprize":0,
        "ifpull":0,
        "prize": _con['jiangli']['dld'][0]['p'],
        "title": _con['email']['dldjinji']['title'],
        "content": _con['email']['dldjinji']['content'],
        "ctime": _nt,
        "ttltime": _utc
    }
    for _user in _r:
        # 如果已经发过奖则跳过
        if 'dldjinjiprize' in _user and _user['dldjinjiprize'] == 1: continue
        _userdata = getWangZheUserData(_user['uid'])
        _data['uid'] = _user['uid']
        _data['sid'] = str(_userdata['sid'])
        _emaillist.append(g.C.dcopy(_data))
        _idlist.append(_user['_id'])

    if len(_emaillist)>0:
        g.crossDB.insert('crossemail', _emaillist)

    if len(_idlist)>0:
        g.crossDB.update('wzfight', {'_id':{'$in': _idlist}}, {'dldjinjiprize':1})

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
            "etype":1,
            "getprize":0,
            "ifpull":0,
            "ctime": _nt,
            "ttltime": _utc
        }
        for idx,_uid in enumerate(_uidlist):
            _userdata = getWangZheUserData(_uid)
            _data['uid'] = _uid
            _data['sid'] = str(_userdata['sid'])
            if idx in (2,3): idx = 2
            if idx in (4,5,6,7): idx = 3
            _data['prize'] = _con['jiangli'][mtype][idx]['p']
            _data['title'] = _con['email'][mtype]['title'].format(_con['email'][mtype]['zanweifu'][idx])
            _data['content'] = _con['email'][mtype]['content'].format(_con['email'][mtype]['zanweifu'][idx])
            _emaillist.append(g.C.dcopy(_data))

        if len(_emaillist)>0:
            g.crossDB.insert('crossemail', _emaillist)

        return len(_emaillist)

    _dkey = getDKey()
    if mtype == 'zuanshi':
        # 钻石前四名发奖
        _idlist = []
        for i in xrange(1, 17):
            _where = {'dkey': _dkey,'groupid': i}
            _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['uid','zuanshiprize'], limit=8)
            _uidlist = []
            for ele in _r:
                if 'zuanshiprize' in ele and ele['zuanshiprize'] == 1: continue
                _uidlist.append(ele['uid'])
                _idlist.append(ele['_id'])

            _num = giveTopPrize(_uidlist, mtype)
        
        g.crossDB.update('wzfight', {'_id':{'$in': _idlist}}, {'zuanshiprize':1})

    else:
        _where = {'dkey': _dkey}
        _r = g.crossDB.find('wzfight', _where, sort=[['deep', -1]], fields=['uid', 'wangzheprize'], limit=8)
        _uidlist = []
        _idlist = []
        for ele in _r:
            if 'wangzheprize' in ele and ele['wangzheprize'] == 1: continue
            _uidlist.append(ele['uid'])
            _idlist.append(ele['_id'])

        _num = giveTopPrize(_uidlist, mtype)
        g.crossDB.update('wzfight', {'_id':{'$in': _idlist}}, {'wangzheprize':1})

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
        'zuanshi':'zuanshisaitopprize',
        'wangzhe':'wangzhesaitopprize'
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
    _r = g.crossDB.find('wzfight',{'dkey': _dkey, 'deep':{'$gte':6}},sort=[['deep',-1]], fields=['_id','uid'],limit=4)
    if len(_r)<4: return
    _uidlist = [x['uid'] for x in _r]
    _round = g.crossDB.count('wzquarterwinner') + 1
    _userlist = [getWangZheUserData(x)['headdata'] for x in _uidlist]
    _msgarg1 = [_userlist[0]['ext_servername'], _userlist[0]['name'], _round,_userlist[1]['ext_servername'], _userlist[1]['name']]
    _msgarg2 = [_userlist[2]['ext_servername'], _userlist[2]['name'],_userlist[3]['ext_servername'], _userlist[3]['name'], _round]
    _msg1 = _con['msg']['1'].format(*_msgarg1)
    _msg2 = _con['msg']['2'].format(*_msgarg2)
    g.m.crosschatfun.chatRoom.addCrossChat({'msg':_msg1,"mtype":2,"fdata":{'pmd': 1},"extarg":{}})
    g.m.crosschatfun.chatRoom.addCrossChat({'msg':_msg2,"mtype":2,"fdata":{'pmd': 1},"extarg":{}})
    return

#运行当前时间之前所有缺失的事件
def runAllEvent():
    #理论当前时间
    _nt = now()
    #根据理论当前时间生成的dkey
    _dkey = getDKey()
    #根据当前时间得到的本周开始时间
    _zeroTime = getStartTime()
    #时间配置
    _eventCon = g.GC['crosswz']['base']['event']
    #当前已经执行到的步骤数初始step
    _baseStep = getWangZheStep()
    _step = _baseStep
    #用来判断执行事件用，为0时，不等于当前step不执行，为1时_nt 大于事件执行事件时执行
    _chkType = 0
    #默认起始事件
    if _step == None:
        _chkType = 1
        _step = _eventCon[0]['act']

    for event in _eventCon:
        _tmpAct = event['act']
        print '_tmpAct===========',_tmpAct
        if _tmpAct == 'setluandou2jinji':
            #特殊处理乱斗上传事件，没有达到开赛人数终止所有事件流程
            _bmNum = getBaomingNum()
            if _bmNum < 256:
                break
            
        if _chkType == 0:
            if _tmpAct == _step:
                #检测到已记录的步骤切换检测类型
                _chkType = 1
            continue
        else:
            _chkTime = _zeroTime + event['time']
            if _chkTime >= _nt:
                #未到检测时间，不执行
                break
            _fmt = g.C.STR("{1}()",event['fun'])
            if 'args' in event:
                _fmt = g.C.STR("{1}('{2}')",event['fun'],event['args' ])

            print 'run============',_fmt
            eval(_fmt)
            _step = getWangZheStep()
            if _step == _baseStep:
                #操作未执行成功
                break
            _baseStep = _step

# 发送参与竞猜通知邮件
def sendWangzheJingcaiEmail():
    _ifopen = isWangZheOpen()
    if not _ifopen: return
    _nt = g.C.NOW()
    _con = getCon()
    _title = _con['email']['jingcaikaiqi']['title']
    _content = _con['email']['jingcaikaiqi']['content']
    # 两天之后过期
    _passtime = _nt + 2 * 24 * 3600
    _r = g.m.emailfun.sendXitongEmail(_title, _content, passtime=_passtime)


#获取王者荣耀红点
def getWangZheRongYaoHongDian(uid):
    _statusData = getWangZheStatus(0)
    _status = _statusData['status']
    gud = g.getGud(uid)
    _lv = gud['lv']
    _vip = gud['vip']
    _res = 0

    if _status == 1:
        #报名阶段未报名需要显示红点
        if _lv >= 75 and not isUserBaoming(uid):
            _res = 1
    elif _status == 3:
        #已报名玩家在大乱斗阶段有挑战次数,且活动开启
        if _lv >= 75 and isWangZheOpen() and isUserBaoming(uid) and getRemainDldNum(uid) > 0:
            _res = 1
    elif _status == 6:
        #vip1及以上为投注的显示红点,且活动开启
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
        _statue = g.mdb.find1('gameattr',{'uid':'SYSTEM','ctype':'king_statue'},fields=['_id','v','k'])
        if not _statue or _statue['k'] != _nowDkey:
            _dkey = g.C.getWeekNumByTime(_nt - 7*24*3600)
            _users = g.crossDB.find('wzfight',{'dkey': _dkey},sort=[['deep',-1]],limit=32,fields=['_id','uid','deep','groupid'])
            # 没有本服的
            # 缓存周末12点
            if not _users:
                _res = {'name': '虚位以待'}
            else:
                # 筛选本服的人
                sid = str(g.getSvrIndex())
                _users = filter(lambda x: x['uid'].startswith(sid), _users)
                # 如果deep相同就比较战力
                _users = filter(lambda x:x['deep']==_users[0]['deep'], _users)
                if len(_users) > 1:
                    _max = g.crossDB.find('wzuserdata',{'dkey':_dkey,'uid':{'$in':map(lambda x:x['uid'], _users)}},fields=['_id','uid'],sort=[['info.maxzhanli',-1]],limit=1)[0]
                    _res = filter(lambda x:x['uid'] == _max['uid'], _users)[0]
                else:
                    _res = _users[0]
                _res['name'] = g.getGud(_res['uid'])['name']
                g.mdb.update('gameattr', {'ctype': 'king_statue','uid':'SYSTEM'},{'k':_nowDkey,'v':_res},upsert=True)

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
    if not _flower or _flower.get('v',0) < 100:
        return

    _con = g.GC['crosswz']['num2prize']
    _prize = []
    for i in _con:
        if _flower.get('v', 300) >= int(i) and int(i) not in _flower.get('reclist', []):
            _prize += _con[i]

    if _prize:
        _title = '王者雕塑-鲜花奖励'
        _content = '勇者大人，你可能忘记领取大家赠与你的鲜花奖励了！'
        g.m.emailfun.sendEmails([statue['v']['uid']],1,_title,_content,prize=_prize)

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


if __name__=='__main__':
    runMatchTimer()
    import cProfile
    def testwz(deep):
        import time
        g.crossDB.delete('wzfight',{})
        createZuanshisaiTestData()


        stime = time.time()* 1000
        #for i in xrange(int(deep) + 1):
        # act_zuanShiGroupFight(0)
        cProfile.run('act_zuanShiGroupFight(0)')
        #print "deep {0} finished...".format(i)

        print "total {0}ms".format(time.time()*1000 - stime)

    # testwz(0)
    sendWangzheJingcaiEmail()
    # sendWangzheJingcaiEmail()
    #act_setLuanDouUser2JinJi()
    # givePrizeByMtype('wangzhe')
    # print giveDldJinjiPrize()
    # print act_setLuanDouUser2JinJi()
    # print getWangZheStatus()