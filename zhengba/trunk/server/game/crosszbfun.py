#!/usr/bin/python
# coding:utf-8


'''
跨服争霸相关方法
'''
import g,time,random


def now():
    return g.C.NOW()


def ifOpen(uid):
    if not g.chkOpenCond(uid, 'crosszb') or not checkIfOpenByOpenTime():
        return False
    else:
        return True

def checkIfOpenByOpenTime():
    _openTime = g.C.NOW(g.C.getDate(g.getOpenTime())) #开区当天00:00:00的时间戳
    etime = _openTime + 48*3600 #开区当天0点开始，推后48小时后开启
    return time.time() >= etime

# 获取跨服争霸配置
def getCon():
    _con = g.GC['crosszb']['base']
    return _con


# 获取玩家争霸赛的区域
def getZhengBaStep(uid, iscache=1):
    _step = 0
    _dkey = dkey_Now()
    _key = g.C.STR("ZBAREA_{1}_{2}", uid, _dkey)
    _data = g.mc.get(_key)
    if type(_data) == type(1) and iscache:
        return _data

    # 不加step条件
    _zbData = g.crossDB.find1('crosszb_zb', {'uid': uid, 'dkey': _dkey})
    if _zbData != None:
        _step = int(_zbData['step'])
        g.mc.set(_key, _step)

    return _step


# 获取本周积分赛的开始时间和结束时间戳
def getJiFenArea():
    _openData = g.GC['crosszb']['base']['jifen']['opentime']
    _nt = now()
    # 获取本周星期一零点的时间戳
    _firstTme = g.C.getWeekFirstDay(_nt)
    _start = _firstTme + _openData[0]
    _end = _firstTme + _openData[1]
    return [_start, _end]


# 获取本周争霸赛的开始时间和结束时间戳
def getZhengBaArea():
    _openData = g.GC['crosszb']['base']['zhengba']['opentime']
    _nt = now()
    # 获取本周星期一零点的时间戳
    _firstTme = g.C.getWeekFirstDay(_nt)
    _start = _firstTme + _openData[0]
    _end = _firstTme + _openData[1]
    return [_start, _end]


# 获取本周争霸赛筹备阶段的开始时间和结束时间
def getZhengbaCBArea():
    _openData = g.GC['crosszb']['base']['zhengba']['choubeitime']
    _nt = now()
    _firstTme = g.C.getWeekFirstDay(_nt)
    _start = _firstTme + _openData[0]
    _end = _firstTme + _openData[1]
    return [_start, _end]


# 是否是积分赛开启时间段
def isOpenJifen(nt=0):
    _nt = nt
    if nt == 0: _nt = now()
    _area = getJiFenArea()
    if _nt >= _area[0] and _nt < _area[1]:
        return 1
    return 0


# 是否是争霸赛开启时间段
def isOpenZB(nt=0):
    _nt = nt
    if nt == 0: _nt = now()
    _area = getZhengBaArea()
    if _nt >= _area[0] and _nt < _area[1]:
        return 1
    return 0


# 上传玩家信息到跨服服务器
def uploadUserDataToCross(uid, data=None):
    gud = g.getGud(uid)
    if gud == None:
        return
    _userData = {}
    _userData['uid'] = uid
    _userData['headdata'] = g.m.userfun.getShowHead(uid)
    _userData['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(gud['sid'])
    _userData['maxzhanli'] = int(gud['maxzhanli'])
    _defHero = g.m.zypkjjcfun.getDefendHero(uid)
    _defHero['pet'] = g.m.petfun.getPlayPet(uid)
    _chkFightData = g.m.fightfun.chkFightData(uid, _defHero,side=1)
    if _chkFightData['chkres'] < 1:
        return
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1, sqid=_defHero.get('sqid'))
    _userFightData.sort(key=lambda x: x.get('pos', 0))
    _userData['zhanli'] = _chkFightData['zhanli']
    _userData['fightdata'] = _userFightData
    _userData['lasttime'] = now()
    if data != None: _userData.update(data)
    _userData['sid'] = int(gud['sid'])
    _w = {'uid': uid}
    g.crossDB.update('jjcdefhero', _w, _userData, upsert=True)
    clearUserDataCache(uid)
    return _userData


# 获取玩家跨服数据key
def getCrossUserKey(uid):
    return g.C.STR("CROSS_USERDATA_{1}",uid)

# 获取跨服玩家信息
def CGUD(uid, iscache=1):
    return getCrossUserData(uid, iscache)


# 获取跨服玩家信息
def getCrossUserData(uid, iscache=1):
    _key = getCrossUserKey(uid)
    _res = g.crossMC.get(_key)
    if _res != None and iscache:
        return _res

    _res = g.crossDB.find1('jjcdefhero', {'uid': uid})
    if _res == None:
        uploadUserDataToCross(uid)
        _res = g.crossDB.find1('jjcdefhero', {'uid': uid})
        if _res == None:
            return

    if _res != None: g.crossMC.set(_key, _res, time=3600 * 72)
    return _res


# 删除跨服玩家缓存信息
def clearUserDataCache(uid):
    _key = getCrossUserKey(uid)
    g.crossMC.delete(_key)


# 设置积分信息
def setJiFenData(uid, data):
    _dkey = g.C.getWeekNumByTime(now())
    _where = {}
    _where['uid'] = uid
    _where['dkey'] = _dkey
    gud = g.getGud(uid)
    data['ordertime'] = int(gud['ctime'])
    g.crossDB.update('crosszb_jifen', _where, data, upsert=True)
    return 1


# 设置争霸赛信息
def setZhengBaData(uid, data):
    _dkey = g.C.getWeekNumByTime(now())
    _step = getZhengBaStep(uid, 0)
    _where = {}
    _where['uid'] = uid
    _where['dkey'] = _dkey
    _where['step'] = _step
    data['ttltime'] = g.C.UTCNOW()
    g.crossDB.update('crosszb_zb', _where, data, upsert=True)
    return 1


# 上传每个区竞技场前五玩家信息
def upJJCTopUser(blackUid=None):
    # 2017-2-23改为前6名
    _rankList = g.mdb.find('zypkjjc',sort=[['jifen', -1], ['zhanli', -1]], fields=['_id', 'uid', 'jifen','zhanli'], limit=10)
    _nt = now()
    g.m.gameconfigfun.setGameConfig({'ctype':'crosszb_top10'}, {'v': _rankList,'lasttime':_nt})
    _sid = g.getSvrIndex()
    _uids = []
    for r in _rankList:
        gud = g.getGud(r['uid'])
        # 2017-04-8 增加争霸赛晋级条件
        if gud['lv'] < 50:
            continue
        _data = {}
        _data['zhanli'] = int(gud.get('maxzhanli',0))
        _data['tozb'] = 1
        _data['headdata'] = g.m.userfun.getShowHead(r['uid'])
        _data['sid'] = _sid
        _data['ctime'] = _nt
        _data['ordertime'] = int(gud['ctime'])
        _data['ttltime'] = g.C.UTCNOW()
        uploadUserDataToCross(r['uid'])
        setJiFenData(r['uid'], _data)
        _uids.append(r['uid'])
        # 2020-8-24
        g.m.friendfun.uploadLoginTime(r['uid'], True)
        
    # 战旗任务
    # if blackUid:
    #     for d in blackUid:
    #         if d in _uids:
    #             _uids.remove(d)
    #
    # g.event.emit("FlagTask", _uids, '304')
    return _uids


# 标识积分赛每个种族前100名的人员
def fmtJiFenToZB():

    # 2017-2-23改为前200名
    # _top100 = g.crossDB.find('crosszb_jifen', {'dkey': _dkey}, sort=[["jifen", -1], ['zhanli', -1]], fields=['_id', 'uid'], limit=300)
    # _top100_uids = map(lambda x: x["uid"], _top100)
    # _gtJifenUser = g.crossDB.find('crosszb_jifen', {'dkey': _dkey,'jifen':{'$gte':_jifen},'uid':{'$nin':_top100_uids}},fields=['_id', 'uid'])
    # _top100_uids += map(lambda x: x["uid"], _gtJifenUser)

    # 2019-7-8 本服前30名
    # _max30Uids = g.mdb.find('crosszbjifen', {'dkey': _dkey, 'jifen': {'$gte':_jifen}},fields=['_id','uid'],sort=[['jifen', -1]],limit=30)
    #
    # g.crossDB.update('crosszb_jifen', {'dkey': _dkey,'uid': {'$in': _top100_uids}}, {'tozb': 1})
    # 战旗任务
    # _flag = g.crossDB.find1('gameconfig', {'ctype': 'flag_task', 'k': _dkey}, fields=['_id', 'v']) or {'v':{}}
    # _flag = _flag['v']
    # for i in _top100_uids:
    #     _flag[i] = _flag.get(i, 0) + 1
    # g.crossDB.update('gameconfig', {'ctype': 'flag_task'}, {'v': _top100_uids,'lasttime':g.C.NOW(), 'k':_dkey},upsert=True)
    pass

# 从本服上传前30玩家至跨服
def uploadZhengBaRank(blackUid= None):
    _jifen = g.GC['crosszb']['base']['zhengba']['jinjifenshu']
    _dkey = g.C.getWeekNumByTime(now())
    # 排行前30
    _max30Uids = g.mdb.find('crosszbjifen', {'dkey': _dkey,'jifen': {'$gt':0}},fields=['_id','uid'],sort=[['jifen', -1]],limit=30)
    # 大于4500
    _gt4500Uids = g.mdb.find('crosszbjifen', {'dkey': _dkey,'jifen': {'$gte':_jifen}},fields=['_id','uid'])
    _max30Uids = list(set(map(lambda x:x['uid'], _max30Uids+_gt4500Uids)))
    g.crossDB.update('crosszb_jifen', {'dkey': _dkey,'uid': {'$in': _max30Uids}}, {'tozb': 1})
    # # 战旗任务
    # if blackUid:
    #     for d in blackUid:
    #         if d in _max30Uids:
    #             _max30Uids.remove(d)
    return _max30Uids


# 格式化争霸赛排名信息
def fmtZhengBaRank():
    fmtJiFenToZB()
    _dkey = g.C.getWeekNumByTime(now())
    # 可参加争霸赛的条件
    _where = {'dkey': _dkey, 'tozb': 1}
    # 2016-12-20 修改争霸赛分区域规则
    _defalutStep = 0  # 默认分组
    _teamNum = 100  # 每组人数
    _mixNum = 33  # 混合人数
    _nt = now()
    _rankList = g.crossDB.find('crosszb_jifen', _where, sort=[['ordertime', 1]],
                               fields=['_id', 'uid', 'jifen', 'zhanli','sid'])
    _maxTeam = divmod(len(_rankList), _teamNum)  # 最大分组
    _loopNum = _maxTeam[0]
    _groupArr = {}
    _randArr = {}
    if _loopNum > 1:
        for i in xrange(_loopNum):
            _step = i + 1
            if _step >= _maxTeam[0]:
                _step = _defalutStep
                _tmpArr = _rankList[_teamNum * i:]
            else:
                _tmpArr = _rankList[_teamNum * i:_teamNum * _step]

            # 把每组分为3份，1为上升组，2为下降组，3不变
            g.m.common.random.shuffle(_tmpArr)
            if _step == 0:
                # 默认组只有上升组
                _randArr[_step] = {1: _tmpArr[0:_mixNum], 2: [], 3: _tmpArr[_mixNum:]}
            elif _step == 1:
                # 最上组只有下降组
                _randArr[_step] = {1: [], 2: _tmpArr[0:_mixNum], 3: _tmpArr[_mixNum:]}
            else:
                # 普通组有上升组和下降组
                _randArr[_step] = {1: _tmpArr[0:_mixNum], 2: _tmpArr[_mixNum:_mixNum * 2], 3: _tmpArr[_mixNum * 2:]}

        # 重组
        for step, v in _randArr.items():
            _group3 = v[3]
            _group2 = []
            _group1 = []
            if step == 0:
                # 默认组特殊处理
                if len(_randArr) == 2:
                    _group2 = _randArr[1][2]
                else:
                    _group2 = _randArr[len(_randArr) - 1][2]
            elif step == 1:
                if len(_randArr) == 2:
                    _group1 = _randArr[0][1]
                else:
                    _group1 = _randArr[2][1]
            elif step == len(_randArr) - 1 and len(_randArr) != 2:
                # 最后一次特殊处理
                _group1 = _randArr[0][1]
                _group2 = _randArr[step - 1][2]
            else:
                _upStep = step + 1
                _downStep = step - 1
                # 在下组取上升组
                if _upStep in _randArr and 1 in _randArr[_upStep]: _group2 = _randArr[_upStep][1]
                # 在上组取下降组
                if _downStep in _randArr and 2 in _randArr[_downStep]: _group1 = _randArr[_downStep][2]

            _groupArr[step] = _group3 + _group2 + _group1
    else:
        _groupArr[0] = _rankList

    for step, userdata in _groupArr.items():
        _rank = 0
        for r in userdata:
            _rank += 1
            _tmp = {}
            _tmp['ttltime'] = g.C.UTCNOW()
            _tmp['ctime'] = _nt
            _tmp['uid'] = r['uid']
            _tmp['rank'] = _rank
            _tmp['dkey'] = _dkey
            _tmp['step'] = step
            _tmp['sid'] = r['sid']
            setZhengBaData(r['uid'], _tmp)

# 获取npc的区服sid
def getNpcSid(sid):
    sid = str(sid)
    _serverdata = g.m.crosscomfun.getServerData()
    _sidlist = g.C.dcopy(_serverdata['list'])
    _serverlist = g.C.dcopy(_serverdata['data'])

    # 如果不存在sid，则取第一个
    if sid not in _sidlist: sid = _sidlist[0]

    _index = _sidlist.index(sid) - 1  # 减1是因为要排除掉自己的sid
    _sidlist.remove(sid)  # 删掉自己sid
    _sindex = _index - 30 if (_index - 30) >= 0 else 0
    _eindex = _index + 30 if (_index + 30) < len(_sidlist) - 1 else len(_sidlist) - 1

    _nsidlist = _sidlist[_sindex:_eindex]
    _randsid = g.C.getRandList(_nsidlist)
    _servername = _serverlist[_randsid[0]]['servername']
    _tmplist = [int(x) for x in _nsidlist]
    _tmplist.sort()
    return (_randsid, _servername, _tmplist)


def dkey():
    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    return _dkey


# 刷新积分赛对手信息
# arg:
# type 是否主动刷新，0为系统刷新，1为主动刷新
def getJifenEnemy(uid, reftype='sys'):
    # 获得自己的战力
    gud = g.getGud(uid)
    _sid = gud['sid']
    _dkey = dkey()
    maxzhanli = gud.get('maxzhanli', 0)
    _npcNum = 0  # 对手里NPC的数量
    # 根据系统自动刷新还是自己手动刷新来判断
    _rData = []
    _enemylist = []
    _pkuidlist = [uid]
    # _sidlist = getNpcSid(_sid)[-1]  # 玩家所在区服列表的范围
    for i in xrange(1, 4):
        # 获得战力范围

        _uidsArr = []
        _player = None

        _cacheKey = 'crosszbfun_' + str(reftype) + "_" + str(i) + "_" + str(uid)
        _uidsArr = g.mc.get(_cacheKey)
        if not _uidsArr:
            # 如果有缓存的话，从缓存里直接拉一个玩家出来
            _minzl, _maxzl = getZlByType(maxzhanli, reftype, i)
            # _w = {"maxzhanli": {"$gte": _minzl, "$lte": _maxzl}, "uid": {"$nin": _pkuidlist}, 'fightdata': {'$ne': []}}
            # _player = g.crossDB.find1_rand("jjcdefhero", _w, fields=['_id'])

            _w = {"maxzhanli": {"$gte": _minzl,
                                "$lte": _maxzl}}  # , "uid": {"$nin": [uid]}  直接从数据库层不取出自己，但是会造成很大的性能损耗，去掉这个判断，交由下方的_pkuidlist来过滤
            _uidNeedLen = 100  # 一次筛出100个uid
            _count = g.crossDB.count("jjcdefhero", _w)
            _skip = 0  # 在合法范围内skip
            if _count > _uidNeedLen:
                _skip = random.randint(1, _count - _uidNeedLen) - 1

            _uidsArr = g.crossDB.find("jjcdefhero", _w, fields=['_id', 'uid'], limit=_uidNeedLen,
                                      skip=_skip)  # [{uid:1},{uid:2}]
            g.mc.set(_cacheKey, _uidsArr, 20 * 60)  # 缓存uid指定时长

        if _uidsArr and len(_uidsArr) > 0:
            _enemyUid = random.sample(_uidsArr, 1)[0]['uid']
            if _enemyUid not in _pkuidlist:
                _player = g.crossDB.find1("jjcdefhero", {"uid": _enemyUid}, fields=['_id'])

        # 根据刷新类型，获得对手的战力范围
        if not _player:
            _npcNum += 1
            continue

        # if 'head' in _player and isinstance(_player['head'], dict):
        #     _player['headdata'] = _player.pop('head')
        _player['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(_player['sid'])
        _player['herolist'] = _player.pop('fightdata')
        _player['zhanli'] = _player['maxzhanli']
        _pkuidlist.append(_player['uid'])
        _jifen = calcJiFen(maxzhanli, _player['maxzhanli'])
        _prize = getJFfightPrize(maxzhanli, _player['maxzhanli'])
        _player.update({"jifen": _jifen, 'prize': _prize})
        _rData.append(_player)
        _enemylist.append(_player)

    # 需要生成NPC则填充NPC
    if _npcNum > 0:
        _npclist = []
        for i in xrange(_npcNum):
            _con = getCon()['npc']
            _lv = gud['lv']
            # 生成NPC
            for k, v in _con.items():
                _lv1, _lv2 = k.split("-")
                _lv1 = int(_lv1)
                _lv2 = int(_lv2)
                if _lv1 <= _lv <= _lv2:
                    # 如果需要生成的NPC数量，超过了配置的数量，则报错
                    if _npcNum > (v[1] - v[0] + 1):
                        raise ValueError

                    # 确保取出的npcid不重复
                    while True:
                        _npcid = g.C.getRandNum(v[0], v[1])
                        if _npcid not in _npclist:
                            break

                    _npclist.append(_npcid)
                    _npcinfo = g.m.fightfun.getNpcFightData(_npcid)
                    _npcinfo['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getSvrIndex())
                    _npcinfo['uid'] = "NPC"
                    _npcinfo['jifen'] = 30
                    _npcinfo['zhanli'] = g.m.npcfun.getNpcZhanli(_npcinfo['herolist'])
                    _prize = getJFfightPrize(maxzhanli, _npcinfo['zhanli'])
                    _npcinfo['prize'] = _prize
                    _enemylist.append(_npcinfo)
                    _rData.append(_npcinfo)

    # 保存对手列表信息
    g.setAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")}, {"v": _enemylist, "dkey": _dkey, 'passlist': []})
    return _rData


# 获取积分赛的对手信息
def getJfPkList(uid):
    _dkey = dkey()
    _ctype = g.L("playattr_ctype_czbjfenemy")
    pklist = []
    _r = g.getAttr(uid, {'ctype': _ctype})
    if _r:
        pklist = _r[0]['v']

    return pklist


# 设置积分赛的对手信息
def setJfPkList(uid, pklist):
    _dkey = dkey()
    _ctype = g.L("playattr_ctype_czbjfenemy")
    _r = g.setAttr(uid, {'ctype': _ctype}, {'v': pklist, 'dkey': _dkey})
    return _r


# 根据刷新类型和位置返回战力值范围
# arg:
# type 刷新类型 0 系统，1 手动
# place 对手位置
def getZlByType(maxzhanli, reftype, place):
    place = str(place)
    reftype = str(reftype)
    _con = getCon()['jifen']['refmatch'][reftype][place]
    _minzl = eval(_con[0])
    _max = eval(_con[1])
    return (_minzl, _max)


# 获取当天积分赛胜利次数
def getJiFenWinNum(uid):
    _ctype = g.L('crosszb_jifen_winnum')
    _num = g.getPlayAttrDataNum(uid, _ctype)
    return _num


# 设置当天积分赛胜利次数
def setJiFenWinNum(uid, num=1):
    _ctype = g.L('crosszb_jifen_winnum')
    _num = g.setPlayAttrDataNum(uid, _ctype)
    return _num


# 获取积分赛每日奖励的领取信息
def getJiFenRecPrizeList(uid):
    _ctype = g.L('crosszb_jifen_recprize')
    _data = g.getAttrByDate(uid, {'ctype': _ctype})
    if len(_data) == 0:
        return []
    return _data[0]['v']


# 设置积分赛每日奖励的领取信息
def setJiFenRecPrizeList(uid, idx):
    _ctype = g.L('crosszb_jifen_recprize')
    _recList = getJiFenRecPrizeList(uid)
    _recList.append(idx)
    g.setAttr(uid, {'ctype': _ctype}, {'v': _recList})
    return _recList


# 获得积分赛的状态
# res: 1,火热进行中 2,休战中
def getJFStatus():
    if isOpenJifen():
        return 1

    return 2


# 获得争霸赛的状态
# res: 1,火热进行中 2,休战中 3，筹备中
def getZBStatus():
    if isOpenZB():
        return 1

    _nt = now()
    _con = getCon()['zhengba']['choubeitime']
    _cstime, _cetime = getZhengbaCBArea()
    if _cstime <= _nt <= _cetime:
        return 3

    return 2


# 获取全民福利的标识
def getQMKey():
    _con = getCon()['zhengba']['opentime']
    _nt = now() - _con[1]
    _dkey = g.C.getWeekNumByTime(_nt)
    return _dkey


# 获取全民福利领取信息
def getQMRec(uid):
    _dkey = getQMKey()
    _data = g.getAttr(uid, {'ctype': 'crosszb_qmprize_rec', 'k': _dkey})
    if _data == None:
        # 未领取
        return 0
    # 已领取
    return 1


# 设置全名服务领取
def setQMRec(uid):
    _dkey = getQMKey()
    g.setAttr(uid, {'ctype': 'crosszb_qmprize_rec'}, {'k': _dkey, 'v': 1})


# 获取争霸赛刷新对手次数
def getZBRefNum(uid):
    _con = getCon()
    _maxNum = _con['zhengba']['refnum']
    _num = g.getPlayAttrDataNum(uid, 'crosszb_refzbnum')
    _resNum = _maxNum - _num
    if _resNum < 0: _resNum = 0
    return _resNum


# 设置张巴塞刷新对手次数
def setZbRefNum(uid, num=1):
    _num = g.setPlayAttrDataNum(uid, 'crosszb_refzbnum')
    return _num


# 跨服争霸主界面数据
def getZhengBaMainData(uid):
    _res = {}
    _step = getZhengBaStep(uid)
    _dkey_rank = dkey_ZBRank()
    _res['myrank'] = 0
    _res['status'] = getZBStatus()
    _res['top10'] = getZBTopRank(uid, _step)
    _cd = getZBFightCD(uid)
    _res['cdtime'] = _cd if _cd else 0
    # 购买次数
    _buyNum = getZBPKBuyNum(uid)
    # 最大购买次数
    _maxBuyNum = getJFMaxBuyNum(uid)
    # 购买次数
    _res['buynum'] = _maxBuyNum - _buyNum
    # 购买消耗
    _res['buyneed'] = getBuyNeed(_buyNum + 1)
    # 可挑战次数
    _res['pknum'] = getCanZBPkNum(uid)
    if _res['status'] == 2:
        # 休战中,显示前十名玩家，显示奖励信息
        # 不加step条件
        _rankData = g.crossDB.find1('crosszb_zb', {'uid': uid, 'dkey': _dkey_rank})
        if _rankData != None: _res['myrank'] = int(_rankData['rank'])
        # 显示排名奖励
        if _rankData != None:
            if not 'rankprize' in _rankData:
                _rankPrize = getCrossZBRankPrizeCon(_rankData['rank'])
                _res['rankprize'] = _rankPrize

    elif _res['status'] == 1:
        # 开战中
        _nt = now()
        _fcd = getZBFightCD(uid)
        if _fcd != None and _fcd >= _nt:
            _res['cdtime'] = _fcd
        # 可刷新对手次数
        _res['refnum'] = getZBRefNum(uid)
        # pk对手数据
        _res['pkdata'] = getZBFightData(uid)
        # 不加step条件
        _rankData = g.crossDB.find1('crosszb_zb', {'uid': uid, 'dkey': dkey_Now()})
        if _rankData != None: _res['myrank'] = int(_rankData['rank'])
    else:
        # 备战中
        _res = {}

    return _res


# 获取全名福利奖励
def getQMPrizeCon(uid):
    _topData = getZBTopRank(uid)
    _rankData = {}
    _serverList = g.getSvrList()
    for d in _topData:
        _sid = int(d['head']['sid'])
        if _sid in _serverList:
            _rankData['name'] = d['head']['name']
            _rankData['rank'] = d['rank']
            break

    # 无奖励信息
    if len(_rankData) == 0:
        return

    _rank = str(_rankData['rank'])
    _qmCon = getCon()['qmprize']
    if not _rank in _qmCon:
        return
    return {'rank': _rank, 'p': _qmCon[_rank], 'name': _rankData['name']}


# 获取争霸赛前10名排名
def getZBTopRank(uid, step):
    _dkey = dkey_ZBRank()
    _data = g.crossDB.find('crosszb_zb', {'dkey': _dkey, 'step': step}, sort=[['rank', 1]], limit=10)
    _res = []
    _headdata = g.crossDB.find('cross_friend', {'uid':{'$in':map(lambda x:x['uid'], _data)}}, fields={'_id':0,'head.defhero':0})
    _head = {i['uid']:i['head'] for i in _headdata}

    # 区服
    _QUdata = g.m.crosscomfun.getServerData() or {'data':{}}
    for d in _data:
        _tmpUid = d['uid']
        if _tmpUid not in _head:
            continue

        _udata = _head[_tmpUid]
        _tmp = {}
        _tmp['uid'] = _tmpUid
        _tmp['rank'] = int(d['rank'])
        _tmp['headdata'] = _udata
        _tmp['zhanli'] = _udata['zhanli']
        _tmp['servername'] = _QUdata['data'].get(_tmpUid.split('_')[0], {}).get('servername','unknown')
        _res.append(_tmp)
    # 修复排名错误
    _res.sort(key=lambda x:(x['rank'],-x['zhanli']))
    for rank,i in enumerate(_res):
        if i['rank'] != rank + 1:
            i['rank'] = rank + 1
            g.crossDB.update('crosszb_zb',{'dkey': _dkey, 'step': step,'uid':i['uid']},{'rank':rank+1})
    return _res


# 获取我得争霸排名
def getMyZBRank(uid):
    _dkey = dkey_ZBRank()
    _step = getZhengBaStep(uid)
    _where = {}
    _where['uid'] = uid
    _where['dkey'] = _dkey
    _where['step'] = _step
    _step = getZhengBaStep(uid)
    _zbData = g.crossDB.find1('crosszb_zb', _where)
    _rank = 0
    if _zbData != None: _rank = int(_zbData['rank'])
    return _rank


# 获取争霸赛
def getZBFightRank(rank):
    if rank < 4:
        return [1, 2, 3, 4]
    else:
        _res = []
        _rank1_start = int(rank * 0.7)
        _rank1_end = int(rank * 0.85 - 1)
        _rank1 = g.C.RANDINT(_rank1_start, _rank1_end)
        _rank2_start = int(rank * 0.85)
        _rank2_end = int(rank - 1)
        _rank2 = g.C.RANDINT(_rank2_start, _rank2_end)
        _rank3_start = rank + 1
        _rank3_end = int(rank * 1.2) + 1
        _rank3 = g.C.RANDINT(_rank3_start, _rank3_end)
        return [_rank1, _rank2, rank, _rank3]


# 玩家刷新争霸赛对手
def refZBFightData(uid):
    _rank = getMyZBRank(uid)
    # 争霸赛没有排名
    if _rank == 0:
        return []

    _res = []
    _dkey = g.C.getWeekNumByTime(now())
    # 2017-1-3刷新时也刷新自己的分组，容错处理
    _step = getZhengBaStep(uid, 0)
    _rankList = getZBFightRank(_rank)
    _userList = g.crossDB.find('crosszb_zb', {'dkey': _dkey, 'step': _step, 'rank': {'$in': _rankList}},
                               sort=[['rank', 1]], fields=['_id', 'uid', 'rank'])
    _k = _dkey
    _v = {'list': [], 'data': {}}
    for u in _userList:
        _tmpUid = u['uid']
        _userData = getCrossUserData(_tmpUid)
        if _userData == None:
            continue
        _tmp = {}
        _v['list'].append(_tmpUid)
        _tmp['uid'] = _tmpUid
        _tmp['rank'] = u['rank']
        _tmp['zhanli'] = _userData['maxzhanli']
        _tmp['herolist'] = _userData['fightdata']
        _tmp['headdata'] = _userData['headdata']
        if 'ext_servername' in _userData['headdata']:
            _tmp['servername'] = _userData['headdata']['ext_servername']        
        _v['data'][_tmpUid] = _tmp
        _res.append(_tmp)

    g.setAttr(uid, {'ctype': 'crosszb_zbfightdata'}, {'k': _dkey, 'v': _v,'passlist':[]})
    return _res


# 获取争霸赛对手列表
def getZBFightData(uid, isref=0):
    _dkey = g.C.getWeekNumByTime(now())
    _data = g.getAttr(uid, {'ctype': 'crosszb_zbfightdata', 'k': _dkey})
    _ref = 0
    if _data == None or isref:
        _res = refZBFightData(uid)
    else:
        _myRank = getMyZBRank(uid)
        _data = _data[0]
        _res = []
        for u in _data['v']['list']:
            if u == uid and _data['v']['data'][u]['rank'] != _myRank:
                _ref = 1
                break
            _res.append(_data['v']['data'][u])

    # 如果我得排名发生改变，则重新刷新对手
    if _ref: _res = refZBFightData(uid)
    return _res


# 获得积分主要数据
def getJFMainData(uid):
    _con = getCon()
    _status = getJFStatus()
    _nt = now()
    _dkey = str(g.C.getWeekNumByTime(_nt))

    # 获取我的积分赛积分和种族排名
    _myjifen, _myrank = getMyJFRankAndJF(uid)
    # 积分赛开放中
    if _status == 1:
        # 获得对手信息
        _r = g.getAttr(uid, {"ctype": g.L("playattr_ctype_czbjfenemy")})
        if _r != None:
            _enemydata = _r[0]['v']
            passlist = _r[0].get('passlist', [])
        else:
            _enemydata = getJifenEnemy(uid)
            passlist = []

        # 格式化显示数据
        _enemy = _enemydata
        # 获取当前免费刷新次数，可购买次数,以及本次刷新消耗
        _maxBuyNum = getJFMaxBuyNum(uid)  # 最大可购买次数
        _buyNum = getJFPKBuyNum(uid)  # 当前已经购买次数
        _freerefNum = getJFLessRefNum(uid)
        _needRMB = getBuyNeed(_buyNum + 1)
        _pknum = getJFPKNum(uid)  # 当前已经pk次数
        _lessnum = getCanJFPkNum(uid)  # 当前剩余可以PK次数
        _rData = {}
        _rData['pknum'] = _lessnum  # 剩余可pk次数
        _rData['buynum'] = _maxBuyNum - _buyNum  # 当前剩余可购买次数
        _rData['jifen'] = _myjifen
        _rData['rank'] = _myrank
        _rData['buyneed'] = _needRMB
        _rData['freerefnum'] = _freerefNum  # 免费刷新次数
        # 获取积分赛结束时间
        _rData['cd'] = getJiFenArea()[1]
        _rData['enemy'] = _enemy
        _rData['status'] = _status
        _rData['passlist'] = passlist
        return _rData

    # 积分赛休战中
    else:
        # 获取积分赛前三的玩家信息
        _ranklist = g.crossDB.find("crosszb_jifen", {"dkey": _dkey}, sort=[['jifen', -1]],
                                   fields=['_id', 'uid'], limit=3)
        _rankplayer = []
        for ele in _ranklist:
            _player = g.crossDB.find("jjcdefhero", {"uid": ele['uid']}, fields=['_id', 'headdata','sid','maxzhanli','fightdata'])
            _player[0]['headdata']['ext_servername'] = g.m.crosscomfun.getSNameBySid(_player[0]['sid'])
            _player[0]['zhanli'] = _player[0]['maxzhanli']
            _player[0]['herolist'] = _player[0]['fightdata']
            _rankplayer.append(_player[0])

        # 获取玩家自己的数据
        _maxBuyNum = getJFMaxBuyNum(uid)  # 最大可购买次数
        _buyNum = getJFPKBuyNum(uid)  # 当前已经购买次数
        _freerefNum = getJFLessRefNum(uid)
        _needRMB = getBuyNeed(_buyNum + 1)
        _pknum = getJFPKNum(uid)  # 当前已经pk次数
        _lessnum = getCanJFPkNum(uid)  # 当前剩余可以PK次数
        _rData = {}
        _rData['jifen'] = _myjifen
        _rData['rank'] = _myrank
        _rData['enemy'] = _rankplayer
        _rData['pknum'] = _lessnum
        _rData['buynum'] = _maxBuyNum - _buyNum
        _rData['buyneed'] = _needRMB
        _rData['freerefnum'] = _freerefNum
        # 获取我现在的排名
        # _rankData = g.crossDB.find1('crosszb_jifen', {'uid': uid, 'dkey': _dkey})
        # if _rankData != None and "rankprize" not in _rankData:
        #     _myjifen,_myrank = g.m.crosszbfun.getMyJFRankAndJF(uid)
        #     _prize = getJFRankPrize(_myrank)
        #     #设置领取奖励
        #     g.crossDB.update('crosszb_jifen',{'uid':uid,'dkey':_dkey},{'rankprize':_prize})
        #     _prizeMap = g.getPrizeRes(uid,_prize,{"act":"crosszb_jfbankprize","prize":_prize})
        #     _rData['cinfo'] = _prizeMap
        #     _prize = list(_prize)
        #     if len(_prize) != 0: _rData['rankprize'] = _prize
        # 下次积分赛开赛时间
        # _rData['cd'] = getJiFenArea()[0] + 7*24*3600 #下个星期开始时间
        _rData['status'] = _status
        return _rData


# 获取积分赛刷新次数
def getJFLessRefNum(uid):
    _con = getCon()
    _freenum = _con['jifen']['freerefnum']
    _buynum = getJFBuyRefNum(uid)
    _refnum = getJFRefNum(uid)
    _lessrefnum = _freenum + _buynum - _refnum
    if _lessrefnum < 1: _lessrefnum = 0
    return _lessrefnum


# 获取刷新购买次数
def getJFBuyRefNum(uid):
    _buyrefnum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbjfrefbuynum"))
    return _buyrefnum


# 设置刷新购买次数
def setJFBuyRefNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbjfrefbuynum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 获取积分赛刷新次数
def getJFRefNum(uid):
    _buyrefnum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbjfrefnum"))
    return _buyrefnum


# 设置积分赛刷新次数
def setJFRefNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbjfrefnum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 获取当前剩余可以pk次数
def getJFLessPKNum(uid):
    gud = g.getGud(uid)
    _vip = str(gud['vip'])
    _con = getCon()
    _freeNum = _con["jifen"]["freerefnum"]  # 每天的免费次数
    _buyNum = getJFPKBuyNum(uid)  # 购买的PK次数
    _pknum = getJFPKNum(uid)  # 已经PK的次数
    _lessNum = _freeNum + _buyNum - _pknum
    if _lessNum < 1: _lessNum = 0
    return _lessNum


# 获取积分赛购买PK次数消耗
def getBuyNeed(fightnum):
    fightnum = int(fightnum)
    _con = getCon()
    _buyprice = _con['numprice']
    _resNum = _buyprice[-1][1]
    for v in _buyprice:
        if fightnum <= v[0]:
            _resNum = v[1]
            break

    _need = [{'a':'attr', 't':'rmbmoney', 'n': _resNum}]
    return _need


# 获取目前已经PK次数
def getJFPKNum(uid):
    _pknum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbjfpknum"))
    return _pknum


# 获取当前已购买PK次数
def getJFPKBuyNum(uid):
    _buyNum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbjfbuynum"))
    return _buyNum


# 获取争霸已PK次数
def getZBPKNum(uid):
    _pknum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbpknum"))
    return _pknum


# 获取已经购买PK次数
def getZBPKBuyNum(uid):
    _pknum = g.getPlayAttrDataNum(uid, g.L("playattr_ctype_czbpkbuynum"))
    return _pknum


# 设置争霸赛PK购买次数
def setZBPKBuyNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbpkbuynum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 设置积分赛PK购买次数
def setJFPKBuyNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbjfbuynum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 设置我今日PK次数
def setJFPkNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbjfpknum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 设置争霸PK次数
def setZBPKNum(uid, num=1):
    _ctype = g.L('playattr_ctype_czbpknum')
    _num = g.setPlayAttrDataNum(uid, _ctype, num)
    return _num


# 获取我的最大免费次数
def getMaxFreePkNum():
    _con = getCon()
    _res = _con['freepknum']
    return _res


# 获取我可以pk的次数
def getCanJFPkNum(uid):
    _freeNum = getMaxFreePkNum()
    _pkNum = getJFPKNum(uid)
    _buyNum = getJFPKBuyNum(uid)
    _res = _freeNum + _buyNum - _pkNum
    if _res < 0: _res = 0
    return _res


# 获取我可以pk的次数
def getCanZBPkNum(uid):
    _freeNum = getMaxFreePkNum()
    _pkNum = getZBPKNum(uid)
    _buyNum = getZBPKBuyNum(uid)
    _res = _freeNum + _buyNum - _pkNum
    if _res < 0: _res = 0
    return _res


# 根据战力差计算积分
def calcJiFen(myzl, ezl):
    _con = getCon()
    _jifen = eval(_con['jifen']['pkprize']['jifen'][2], {"ezl": ezl, "myzl": myzl})
    _min, _max = _con['jifen']['pkprize']['jifen'][0], _con['jifen']['pkprize']['jifen'][1]
    _jifen = _min if _jifen < _min else _jifen
    _jifen = _max if _jifen > _max else _jifen
    return _jifen

# 获取积分赛战斗奖励
def getJFfightPrize(myzl, ezl):
    _con = getCon()
    _itemId = '2019'
    _num = eval(_con['jifen']['pkprize'][_itemId][2], {"ezl": ezl, "myzl": myzl})
    _min, _max = _con['jifen']['pkprize'][_itemId][0], _con['jifen']['pkprize'][_itemId][1]
    _num = _min if _num < _min else _num
    _num = _max if _num > _max else _num
    _res = [{'a':'item','t':_itemId,'n':_num}]
    return _res


# 最大可购买次数
def getJFMaxBuyNum(uid):
    gud = g.getGud(uid)
    _vip = str(gud['vip'])
    _con = getCon()
    _maxBuyNum = _con['fightnum'][_vip]
    return _maxBuyNum


# 获取争霸赛战斗cd
def getZBFightCD(uid):
    _data = g.getAttr(uid, {'ctype': 'crosszb_zbfightcd'})
    if _data == None:
        return
    return int(_data[0]['v'])


# 设置争霸赛战斗CD
def setZBfightCD(uid):
    _nt = g.C.NOW()
    _con = getCon()
    _cd = _con['zhengba']['fightcd']
    _cdTime = _nt + _cd
    g.setAttr(uid, {'ctype': 'crosszb_zbfightcd'}, {'v': _cdTime})
    return _cdTime


# 记录争霸日志
def setZBFightLog(data):
    _data = data
    _nt = g.C.NOW()
    _data['dkey'] = g.C.getWeekNumByTime(_nt)
    _data['ctime'] = _nt
    _data['ttltime'] = g.C.UTCNOW()
    g.crossDB.insert('crosszb_zblog', _data)


# 获取争霸赛日志
def getZBFightLog(uid):
    _nt = g.C.NOW()
    _dkey = g.C.getWeekNumByTime(_nt)
    _data = g.crossDB.find('crosszb_zblog', {'uid': uid, 'dkey': _dkey}, sort=[['ctime', -1]], fields=['_id'], limit=20)
    # for d in _data:
    #     d['ext_servername'] = g.C.is_ustr(d['ext_servername'])

    return _data


# 获取跨服争霸排名奖励
def getCrossZBRankPrizeCon(rank, con=None):
    _rank = rank
    if con:
        _con = con
    else:
        _con = getCon()

    _prizeData = _con['zhengba']['prize']
    _prize = []
    for p in _prizeData:
        _chkRank = p['rank']
        if type(p['rank']) != type(1): _chkRank = p['rank'][1]
        if _rank <= _chkRank:
            _prize = p['p']
            break

    return _prize


# 获取积分赛排行奖励
def getJFRankPrize(rank, con=None):
    _rank = rank
    _con = con if con else getCon()
    _prizeData = _con['jifen']['prize']
    _prize = []
    for p in _prizeData:
        _chkRank = p['rank']
        if type(p['rank']) != type(1): _chkRank = p['rank'][1]
        if _rank <= _chkRank:
            _prize = p['p']
            break

    return _prize


# 获取玩家积分赛积分和排名
def getMyJFRankAndJF(uid):
    gud = g.getGud(uid)
    _nt = g.C.NOW()
    _utc = g.C.UTCNOW()
    _dkey = str(g.C.getWeekNumByTime(_nt))
    _r = g.mdb.find1("crosszbjifen", {"uid": uid, "dkey": _dkey})
    _myjifen = 0
    if _r and 'jifen' in _r:
        _myjifen = _r['jifen']
    else:
        # 积分赛开放时才会写入积分数据库
        if isOpenJifen():
            _headdata = g.m.userfun.getShowHead(uid)
            _r = g.crossDB.update("crosszb_jifen", {"uid": uid, "dkey": _dkey,'sid':gud['sid']},
                                  {"jifen": 0, "ctime": _nt, 'ttltime': _utc,'headdata':_headdata,'zhanli':gud['maxzhanli'],
                                   'ordertime': int(gud['ctime'])}, upsert=True)

    # _jifenFlag = getJifenByRank(_dkey, 1200)
    _myrank = -1
    # if _myjifen <= _jifenFlag:
    #     _myrank = 1200
    # elif _myjifen > 0:
    #     _myrank = g.mdb.count("crosszbjifen",
    #                           {'$or': [{"jifen": {"$gt": _myjifen}}, {'jifen': _myjifen, 'zhanli': {'$gt': gud['maxzhanli']}}],"dkey": _dkey}) + 1
    _cacheRank = g.mc.get("crosszbjifen_rank")
    if _cacheRank and uid in _cacheRank['uid2rank']:
        _myrank = _cacheRank['uid2rank'][uid]
    elif _myjifen > 0:
        _myrank = g.mdb.count("crosszbjifen", {'$or': [{"jifen": {"$gt": _myjifen}}, {'jifen': _myjifen, 'zhanli': {'$gt': gud['maxzhanli']}}],"dkey": _dkey}) + 1

    return (_myjifen, _myrank)

def getJifenByRank(dkey, num):
    key = str('crosszb_jifenflag_' + dkey)
    _jifen = g.crossMC.get(key)
    if _jifen == None:
        _jifenData = g.crossDB.find('crosszb_jifen',{"dkey": dkey},sort=[['jifen',-1]],skip=num,limit=1,fields=['_id','jifen'])
        if _jifenData and len(_jifenData)>0 and 'jifen' in _jifenData[0]:
            _jifen = _jifenData[0]['jifen']
            g.crossMC.set(key, _jifen, 300)
        else:
            _jifen = -1
    return _jifen




# 获取争霸赛排名dkey
def dkey_ZBRank():
    _con = getCon()['zhengba']['opentime']
    _nt = now() - _con[0]
    _dkey = g.C.getWeekNumByTime(_nt)
    return _dkey


# 获取争霸赛当前key
def dkey_Now():
    return g.C.getWeekNumByTime(now())


# 获取跨服争霸额外buff
def getExtBuff(uid):
    return {}

# 添加战斗日志
def addFightLog(data):
    _nt = g.C.NOW()
    _data = g.C.dcopy(data)
    _data['ctime'] = _nt
    _data['ttltime'] = g.C.UTCNOW()
    if 'prize' in _data: del (_data['prize'])
    _rid = g.crossDB.insert('fightlog', _data)
    return str(_rid)


# 添加跨服战争霸赛前20排名改变的记录
def addCrossZbLog(data):
    _nt = g.C.NOW()
    _data = data
    _data['ctime'] = _nt
    _data['ttltime'] = g.C.UTCNOW()
    _rid = g.crossDB.insert('crosszbtoplog', _data)
    return str(_rid)

#获取每日积分赛上传防守数据的次数
def getUpCrossDataNum(uid):
    _ctype = 'crosszb_jfupdatanum'
    return g.getPlayAttrDataNum(uid,_ctype)

#设置每日积分赛上传防守数据的次数
def setUpCrossDataNum(uid):
    _ctype = 'crosszb_jfupdatanum'
    return g.setPlayAttrDataNum(uid,_ctype)

# 跨服争霸上传竞技场玩家数据
def timer_jifenUserUpLoad():
    if not checkIfOpenByOpenTime():
        return
    
    _nt = g.C.NOW()
    _dkey = g.C.getWeekNumByTime(_nt)
    _chkData = g.m.gameconfigfun.getGameConfig({'ctype': 'CROSSZB_JIFENUSER_UPLOAD', 'k': _dkey})
    if len(_chkData) > 0:
        # 已上传成功
        return
    _blackUids = upJJCTopUser()
    _blackUids += uploadZhengBaRank()

    # 战旗任务
    g.event.emit("FlagTask", list(set(_blackUids)), '304')
    # 发送积分赛结算提醒邮件
    # _nt = g.C.NOW()
    # _passtime = _nt + 3600 * 25  # 到星期天 0：00 过期
    # _email = {
    #     "uid": "SYSTEM",
    #     "title": "积分赛结算啦！",
    #     "content": "本届跨服积分赛结算啦，快去积分赛查看排名领取奖励吧！",
    #     "etype": '1'
    #     # "needlv": 40,
    #     # "passtime": _passtime
    # }
    # g.m.emailfun.sendEmail(**_email)
    g.m.gameconfigfun.setGameConfig({'ctype': 'CROSSZB_JIFENUSER_UPLOAD'}, {'k': _dkey})


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    print timer_jifenUserUpLoad()