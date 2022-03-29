#!/usr/bin/python
# coding:utf-8

'''
公平竞技场 相关方法
'''
import g, random
from ZBFight import ZBFight

def isOpen(uid, type="fight", shop=1):
    _res = {"act": 0, "shop": 0}
    # 判断是否开启
    if not g.chkOpenCond(uid,'gpjjc'):
        return _res
    gud = g.getGud(uid)
    if gud["gpjjclv"] > 1 or gud["gpjjcexp"] > 0:
        _res["shop"] = 1

    # 获取本月结束时间
    _closeTime = g.C.getLastMonthTime() + 24 * 3600
    _starTime = _closeTime - 8 * 24 * 3600

    _nt = g.C.NOW()
    if _nt < _starTime:
        return _res
    _res["act"] = 1
    _res["startime"] = _starTime
    _res["closetime"] = _closeTime
    return _res



# 获取赛季
def getSeason():
    # 获取本月结束时间
    _closeTime = g.C.getLastMonthTime() + 24 * 3600
    _starTime = _closeTime - 8 * 24 * 3600
    return g.C.getDate(_starTime, fmtStr='%Y-%m')


# 初始化玩家数据
def initUserData(uid, **kwargs):
    # 获取赛季
    _season = getSeason()
    _nt = g.C.NOW()
    _con = g.GC["gongpingjjc"]

    # 设置玩家的默认阵容
    _equipData = g.getAttrOne(uid, {"ctype": "gpjjc_con"}) or {}

    _initData = {
        "uid": uid,
        "season": _season,
        "ttltime": g.C.getTTLTime(),
        "ctime": _nt,
        "lasttime": _nt,
        "jifen":_con["initjifen"],
        "tq":0, # 礼包特权
        "winnum":0, # 胜利次数
        "sid": g.getHostSid(),
        "fightnum":0, # 战斗次数
        "shipin": _equipData.get("shipin", {}),
        "baoshi": _equipData.get("baoshi", {}),
        "skin": _equipData.get("skin", {}),
        "lock":[],
    }
    _initData.update(kwargs)
    # 设置工会数据
    g.crossDB.insert("gpjjc_rank", _initData)
    if "_id" in _initData:
        _initData["tid"] = str(_initData["_id"])
        del _initData["_id"]

    return _initData

# 获取玩家数据
def getData(uid, keys=None):
    # 获取赛季
    _season = getSeason()
    _options = {}
    if keys != None:
        _options['fields'] = keys.split(",")
    _data = g.crossDB.find1("gpjjc_rank", {"uid": uid, "season": _season}, **_options)
    if not _data:
        _data = initUserData(uid)

    return _data


# 设置玩家数据
def setData(uid, data):
    _setData = {"$set": {}}
    _season = getSeason()
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    g.crossDB.update("gpjjc_rank",  {"uid": uid, "season": _season}, _setData)


# 初始化匹配数据
def initPipeiData(uid, **kwargs):
    # 获取赛季
    _season = getSeason()
    _nt = g.C.NOW()
    _con = g.GC["gongpingjjc"]
    _jifeninfo = getData(uid, keys="jifen")
    _initData = {
        "uid": uid,
        "season": _season,
        "ttltime": g.C.getTTLTime(),
        "headdata":g.m.userfun.getShowHead(uid),
        "ctime": _nt,
        "lasttime": _nt,
        "jifen": _jifeninfo.get("jifen", 0),
        "state": 1, #当前处于的状态， 1是匹配中, 2是匹配上，3阵容选择
        "rivaluid":"",
        "sid":g.getHostSid(),
        "pipeinum":0,
        "stime":_nt,
        "fightdata":{},
        "selecthero":{},#选择过的英雄数量

    }
    _initData.update(kwargs)
    # 设置工会数据
    g.crossDB.insert("gpjjc_pipei", _initData)
    if "_id" in _initData:
        _initData["tid"] = str(_initData["_id"])
        del _initData["_id"]

    _diffGrade = _con["diffgrade"]
    # 获取玩家的整数积分，用于划分玩家的档位
    grade = _initData["jifen"] / _diffGrade * _diffGrade
    # 获取当前匹配的跨服缓存
    _pipeiList = getMcPipeiList(str(grade)) or []

    _pipeiList.append(uid)
    # 集合去除
    _pipeiList = list(set(_pipeiList))
    # 设置到匹配列表中
    _ckey = "gpjjc_pipeilst_{}_{}".format(_season, str(grade))
    g.crossMC.set(_ckey, _pipeiList, time=2 * 3600)

    return _initData

# 获取匹配缓存列表, state为1
def getMcPipeiList(grade):
    _season = getSeason()
    _ckey = "gpjjc_pipeilst_{}_{}".format(_season, grade)
    _pipeiList = g.crossMC.get(_ckey)
    _con = g.GC["gongpingjjc"]
    _diffGrade = _con["diffgrade"]
    if not _pipeiList:
        _pipeiList = []
        _info = g.crossDB.find("gpjjc_pipei", {"state": 1, "season": _season, "jifen":{"$lt": int(grade) + _diffGrade, "$gte": int(grade)}}, fields=["jifen", "_id", "uid"])
        for i in _info:
        #     _jifen = i["jifen"]
        #     # 获取玩家的整数积分，用于划分玩家的档位
        #     grade = _jifen / _diffGrade * _diffGrade
        #     if str(grade) not in _pipeiList:
            _pipeiList.append(i["uid"])
        # 集合去除
        _pipeiList = list(set(_pipeiList))
        g.crossMC.set(_ckey, _pipeiList, time=2 * 3600)
    else:
        # 加入所有段位的key
        _ckey2 = "gpjjc_pipeilst_{}_all".format(_season)
        _pipeiKeyList = g.crossMC.get(_ckey2) or []
        if grade not in _pipeiKeyList:
            _pipeiKeyList.append(grade)
            g.crossMC.set(_ckey2, _pipeiKeyList,  time=2 * 3600)

    return _pipeiList

# 设置玩家数据
def setPipeiData(uid, data, _w={}):
    _setData = {"$set": {}}
    _season = getSeason()
    _nt = g.C.NOW()
    _where = {"uid": uid, "season": _season}
    if _w:
        _where.update(_w)
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    return g.crossDB.update("gpjjc_pipei",  _where, _setData)


# 获取玩家匹配数据
def getPipeiData(uid, keys=None):
    _res = {}
    # 获取赛季
    _season = getSeason()
    _options = {}
    if keys != None:
        _options['fields'] = keys.split(",")
        if "_id" not in _options['fields'] or len(_options['fields']) > 1:
            _options['fields'].append("stime")


    _data = g.crossDB.find1("gpjjc_pipei", {"uid": uid, "season": _season}, **_options)
    _nt = g.C.NOW()
    if _data:
        _res = _data
        # 如果当前阶段超过1分钟就会清除数据
        if _data["stime"] + 180 < _nt:
            # 删除匹配数据
            g.crossDB.delete("gpjjc_pipei", {"uid": uid, "season": _season})

            _res = {}

    return _res


# 匹配逻辑
def starPipei(uid, jifen, type=0):
    # 获取赛季
    _season = getSeason()
    _con = g.GC["gongpingjjc"]
    # _pipeiList = getMcPipeiList()

    # 获取玩家的整数积分，用于划分玩家的档位
    _diffGrade = _con["diffgrade"]
    grade = jifen / _diffGrade * _diffGrade

    _chkRand = 0
    _hidlist = g.GC["pro_gpjjc_hero"]
    # 如果是根据积分
    if not type:
        # _geadeList = _pipeiList.get(str(grade), [])
        _geadeList = getMcPipeiList(str(grade))

        if _geadeList:
            # 去除玩家自己的uid
            _geadeList = list(set(_geadeList))
            if uid in _geadeList:
                _geadeList.remove(uid)
            # 随机一个敌方uid
            if _geadeList:
                _rivalUid = g.C.RANDLIST(_geadeList)[0]
                # 加入锁
                _lockKey = "gpjjc_pipei_{}".format(_rivalUid)
                # 如果没有加锁
                if not g.crossMC.get(_lockKey):

                    g.crossMC.set(_lockKey, 1, time=3)

                    # 判断玩家之前是否被选中
                    _rivalPipeiData = getPipeiData(_rivalUid, keys='_id,rivaluid,state,sid,headdata,jifen,ctime')
                    if _rivalPipeiData and not _rivalPipeiData["rivaluid"]:
                        # 如果自己已经匹配到了对手就直接结束
                        _myPipeiData = getPipeiData(uid, keys='_id,rivaluid,state,sid,headdata,jifen,ctime')
                        if not _myPipeiData or _myPipeiData["rivaluid"]:
                            g.crossMC.delete(_lockKey)
                            return

                        _nt = g.C.NOW()
                        _uuid = g.C.getUniqCode()
                        # 设置玩家当前的匹配进度和对手uid
                        _chkSet1 = setPipeiData(uid, {"rivaluid": _rivalUid, "state": 2, "randhid": randHero(), "stime": _nt, "uuid":_uuid}, _w={"state": 1})
                        _chkSet2 = setPipeiData(_rivalUid, {"rivaluid": uid, "state": 2, "randhid": randHero(), "stime": _nt + 1, "uuid":_uuid}, _w={"state": 1})
                        # 判断是否设置成功
                        if not _chkSet1.get('updatedExisting', False):
                            g.crossMC.delete(_lockKey)
                            return

                        if _chkSet2.get('updatedExisting', False):
                            # 删除玩家的跨服匹配数据
                            if _rivalUid in _geadeList:
                                _geadeList.remove(_rivalUid)
                            # _pipeiList[str(grade)] = list(set(_geadeList))
                            # 设置到匹配列表中
                            _ckey = "gpjjc_pipeilst_{}_{}".format(_season, str(grade))
                            g.crossMC.set(_ckey, list(set(_geadeList)), time=2 * 3600)
                            # 推送时间告知玩家当前已经匹配成功
                            _MySendData = {"rivaluid": _rivalUid, "state": 2, "headdata": _rivalPipeiData["headdata"], "uid": uid, "jifen": _rivalPipeiData["jifen"]}
                            emitEvent(_myPipeiData["sid"], "gpjjc_pipei", _MySendData)
                            # 推送时间告知玩家当前已经匹配成功
                            _MyRivalSendData = {"rivaluid": uid, "state": 2, "headdata": _myPipeiData["headdata"], "uid": _rivalUid, "jifen": _myPipeiData["jifen"]}
                            emitEvent(_rivalPipeiData["sid"], "gpjjc_pipei", _MyRivalSendData)
                            # 设置是否随机到
                            _chkRand = 1


    elif type == 1:
        _ckey2 = "gpjjc_pipeilst_{}_all".format(_season)
        _pipeiKeyList = g.crossMC.get(_ckey2) or []

        _geadeList = []
        _geadeKeyList = [key for key in _pipeiKeyList]

        # 判断是否有可以随机的人
        if _geadeKeyList:
            _geadeKey = g.C.RANDLIST(_geadeKeyList)[0]
            _geadeList = getMcPipeiList(str(_geadeKey)) or []
            # 如果随机的段位没有玩家,就在随机三次结束
            if not _geadeList:
                _geadeKeyList.remove(_geadeKey)
                if _geadeKeyList:
                    for i in xrange(3):
                        if not _geadeKeyList:
                            break
                        _geadeKey = g.C.RANDLIST(_geadeKeyList)[0]
                        _geadeList = getMcPipeiList(str(_geadeKey)) or []
                        if not _geadeList:
                            continue
                        _geadeKeyList.remove(_geadeKey)

        if _geadeList:
            _geadeList = list(set(_geadeList))
            # 去除玩家自己的uid
            if uid in _geadeList:
                _geadeList.remove(uid)
            # 随机一个敌方uid
            if _geadeList:
                _rivalUid = g.C.RANDLIST(_geadeList)[0]
                # 加入锁
                _lockKey = "gpjjc_pipei_{}".format(_rivalUid)
                # 如果没有加锁
                if not g.crossMC.get(_lockKey):
                    g.crossMC.set(_lockKey, 1, time=3)

                    # 判断玩家之前是否被选中
                    _rivalPipeiData = getPipeiData(_rivalUid, keys='_id,rivaluid,state,sid,headdata,jifen,ctime')
                    if _rivalPipeiData and not _rivalPipeiData["rivaluid"]:

                        # 如果自己已经匹配到了对手就直接结束
                        _myPipeiData = getPipeiData(uid, keys='_id,rivaluid,state,sid,headdata,jifen,ctime')
                        if not _myPipeiData or _myPipeiData["rivaluid"]:
                            g.crossMC.delete(_lockKey)
                            return

                        _nt = g.C.NOW()
                        _uuid = g.C.getUniqCode()
                        _chkSet1 = setPipeiData(uid, {"rivaluid": _rivalUid, "state": 2, "randhid": randHero(), "stime":_nt, "uuid":_uuid}, _w={"state": 1})
                        _chkSet2 = setPipeiData(_rivalUid, {"rivaluid": uid, "state": 2, "randhid": randHero(), "stime":_nt + 1, "uuid":_uuid}, _w={"state": 1})
                        # 判断是否设置成功
                        if not _chkSet1.get('updatedExisting', False):
                            g.crossMC.delete(_lockKey)
                            return

                        if _chkSet2.get('updatedExisting', False):
                            # 删除玩家的跨服匹配数据
                            if _rivalUid in _geadeList:
                                _geadeList.remove(_rivalUid)
                            # _pipeiList[str(_geadeKey)] = list(set(_geadeList))
                            # 设置到匹配列表中
                            _ckey = "gpjjc_pipeilst_{}_{}".format(_season, str(_geadeKey))
                            g.crossMC.set(_ckey, list(set(_geadeList)), time=2 * 3600)
                            # 推送时间告知玩家当前已经匹配成功
                            _MySendData = {"rivaluid":_rivalUid, "state":2, "headdata": _rivalPipeiData["headdata"], "uid": uid, "jifen": _myPipeiData["jifen"]}
                            emitEvent(_myPipeiData["sid"], "gpjjc_pipei", _MySendData)
                            # 推送时间告知玩家当前已经匹配成功
                            _MyRivalSendData = {"rivaluid": uid, "state": 2, "headdata": _myPipeiData["headdata"], "uid": _rivalUid, "jifen": _myPipeiData["jifen"]}
                            emitEvent(_rivalPipeiData["sid"], "gpjjc_pipei", _MyRivalSendData)
                            # 设置是否随机到
                            _chkRand = 1

    # 随机npc
    else:
        # 删除玩家uid
        _geadeList = getMcPipeiList(str(grade))
        if uid in _geadeList:
            _geadeList.remove(uid)
        # 判断玩家是否被其他玩家选中
        _myPipeiData = getPipeiData(uid, keys='_id,rivaluid,state,sid,headdata,jifen,ctime')
        # 判断玩家之前是否被选中
        if _myPipeiData and not _myPipeiData["rivaluid"]:
            # 设置玩家当前的匹配进度和对手uid
            _nt = g.C.NOW()
            _uuid = g.C.getUniqCode()
            # 設置跨服陣容信息
            _embattleList = g.m.crosscomfun.getGameConfig({"ctype":"gpjjc_embattle"})
            if _embattleList:
                if len(_embattleList[0].get("v", [])) < 10:
                    _embattleList[0]["v"] = _embattleList[0].get("v", []) + list(_con["defaultembattle"])
                _npcfightdata = g.C.RANDLIST(_embattleList[0]["v"])[0]
            else:
                _npcfightdata = g.C.RANDLIST(_con["defaultembattle"])[0]

            _nameCon = g.GC["other"]["robot"]
            _Name = g.C.RANDLIST(list(_nameCon["firstname"]))[0] + g.C.RANDLIST(list(_nameCon["sexname"]))[0]
            _head = g.C.RANDLIST(list(g.GC["zaoxing"]["head"]))[0]
            _model = _npcfightdata["1"] if _npcfightdata["1"] else "11096"

            _chkSet1 = setPipeiData(uid, {"rivaluid": "npc", "uuid": _uuid, "state": 2, "randhid": randHero(), "npcfightdata":_npcfightdata, "npchead":{"head": _head, "name": _Name, "model":_model},"stime": _nt}, _w={"state": 1})
            # 判断是否设置成功
            if not _chkSet1.get('updatedExisting', False):

                return
            # 设置到匹配列表中
            _ckey = "gpjjc_pipeilst_{}_{}".format(_season, str(grade))
            g.crossMC.set(_ckey, _geadeList, time=2 * 3600)
            # 推送时间告知玩家当前已经匹配成功

            _MySendData = {"rivaluid": "npc", "state": 2, "headdata": {"head": _head, "name": _Name, "model":_model}, "uid": uid, "jifen":_myPipeiData["jifen"]}
            emitEvent(_myPipeiData["sid"], "gpjjc_pipei", _MySendData)
            # 设置是否随机到
            _chkRand = 1

        else:
            return

    # 如果没有被随机到
    if not _chkRand:
        # 判断当前的随机次数
        _myPipeiData = getPipeiData(uid, keys='_id,pipeinum,rivaluid,state,ctime')
        if not (_myPipeiData and not _myPipeiData["rivaluid"] and _myPipeiData["state"] == 1):
            return
        _pipeinum = _myPipeiData["pipeinum"]
        _type = 0
        # 2秒执行一次定时任务
        callLater = 2
        # 如果匹配数量大于3，直接匹配全服的玩家
        if 5 > _pipeinum >= 3:
            _type = 1
        # 如果随机大于5次就随机npc
        elif _pipeinum >= 5:
            _type = 2
            # 15秒内随机一个时间
            callLater = g.C.RANDLIST(xrange(1, 5))[0]

        if _pipeinum >= 10:
            return


        # 加入延时推送机制
        g.m.delaycallfun.add(
            'gpjjc_starpipei' + str(uid),
            callLater,
            starPipei,
            *[uid, jifen, _type]
        )

        # 设置当前匹配次数
        setPipeiData(uid, {"$inc": {"pipeinum": 1}})


# 随机英雄
def randHero():
    # 设置玩家当前的匹配进度和对手uid
    _res = {}
    _hidlist = g.GC["pro_gpjjc_hero"]
    for i in xrange(20):
        _hid = g.C.RANDLIST(_hidlist)[0]
        if _hid not in _res: _res[_hid] = 0
        _res[_hid] += 1
    return _res

    #解析跨服事件
def doEvent(eventname,data):

    g.event.emit(eventname,data)

#跨服调用事件
def emitEvent(sid,eventname,data):
    g.m.crosschatfun.gpjjcQueue.put({'tosid':sid,"eventname":eventname,'data':data})

# 推送事件
def onGpjjcPiPei(data):
    data["data"]["headdata"]["name"] = data["data"]["headdata"]["name"]
    if data["data"]["rivaluid"] == "npc":
        _userData = getPipeiData(data["data"]["uid"],keys='_id,npchead')
        try:
            data["data"]["headdata"] = _userData["npchead"]
        except:
            print _userData
    else:
        _userData = getPipeiData(data["data"]["rivaluid"], keys='_id,headdata')
        data["data"]["headdata"] = _userData["headdata"]

    g.m.mymq.sendAPI(data["data"]["uid"], "gongpingjjc_pipei", data["data"])


# 发奖
def onSendPrize(data):
    _prize = data["data"]["prize"]
    _uid = data["data"]["uid"]
    # 如果奖励存在，在记录挑战次数
    if _prize:
        g.CROSSATTR.setPlayAttrDataNum(_uid, "gpjjc_todayfightnum")
    # 获取奖励
    _sendData = g.getPrizeRes(_uid, _prize, act={'act': 'gpjjc_fightprize'})

    g.sendUidChangeInfo(_uid, _sendData)


# 推送事件
def onGpjjcPiPeifinish(data):
    g.m.mymq.sendAPI(data["data"]["uid"], "gongpingjjc_pipei_finish", data["data"])

# 推送时间
def onGpjjcEmbattle(data):
    g.m.mymq.sendAPI(data["data"]["uid"], "gpjjc_embattle", data["data"])

# 推送帮对方上阵的数据
def onGpjjcAutoEmbattle(data):
    g.m.mymq.sendAPI(data["data"]["uid"], "gpjjc_autoembattle", data["data"])

# 获取当前礼包购买次数
def getLiBaoInfo(uid):
    _ctype = "gpjjc_buylibao"
    # 获取赛季信息
    _season = getSeason()
    _data = g.getAttrOne(uid, {"ctype": _ctype, "k":_season})
    _libaoCon = g.GC["gongpingjjc"]["libao"]
    _res = {}
    if _data:
        _res = _data["v"]
    return _res


# 设置礼包当前购买次数
def setLiBaoInfo(uid, _setData):
    _ctype = "gpjjc_buylibao"
    # 获取赛季信息
    _season = getSeason()
    _setData.update({"k": _season})

    g.setAttr(uid, {"ctype": _ctype}, _setData)


# 监听购买礼包时间
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _libaoCon = g.GC["gongpingjjc"]["libao"]
    _proidlist = {d["proid"]: idx for idx, d in enumerate(_libaoCon) if d["proid"]}
    if act not in _proidlist:
        return
    _idx = _proidlist[act]

    # 获取当前礼包数据
    _libaoInfo = getLiBaoInfo(uid)
    _buyNum = _libaoCon[_idx]["buynum"]
    # 判断是否超过购买次数
    if _libaoInfo.get(str(_idx), 0) >= _buyNum:
        return
    _prize = _libaoCon[_idx]["prize"]

    _libaoInfo[str(_idx)] = _libaoInfo.get(str(_idx), 0) + 1
    # 设置购买数据
    setLiBaoInfo(uid, {"v": _libaoInfo})
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'gpjjc_buylibao', 'prize': _prize, "idx": _idx, "proid": act})
    # 推送
    g.sendUidChangeInfo(uid, _sendData)

    # 设置特权
    _myinfo = getData(uid, keys='_id,jifen,tq,winnum,fightnum,uid,shipin,baoshi,lock,skin')
    if _libaoCon[_idx]["tq"] and not _myinfo["tq"]:
        setData(uid, {"tq": 1})

        _con = g.GC["gongpingjjc"]
        _email = _con["tqemail"]
        # 发送跨服工会邮件
        _title = _email["title"]
        _content = _email["content"]
        _prize = []
        _winprize = _con["winprize"]
        _fightprize = _con["fightprize"]
        for i in xrange(_myinfo["winnum"]):
            for p in _winprize:
                if p["t"] == "2088":
                    _prize.append(p)

        for i in xrange(_myinfo["fightnum"]):
            for p in _fightprize:
                if p["t"] == "2088":
                    _prize.append(p)
        if _prize:
            _prize = g.mergePrize(_prize)

            # 发送邮件
            g.m.emailfun.sendEmail(uid, 1, _title, _content, _prize)






# 计算buff
def getBuff(herodata):
    _buff = {}
    for k, v in herodata.items():
        if k not in ["baoshi", "shipin", "skin"]:
            continue
        if k == "baoshi":
            _con = g.GC["baoshi"]["20"]["buff"]
            if v in _con:
                for bk, bv in _con[v].items():
                    _buff[bk] = _buff.get(bk, 0) + bv

        elif k == "shipin":
            _con = g.GC["shipin"]
            if v in _con:
                for bk, bv in _con[v]["buff"].items():
                    _buff[bk] = _buff.get(bk, 0) + bv
        elif k == "skin":
            _con = g.GC["accessories"]
            if v["sid"] in _con:
                for bk, bv in _con[v["sid"]]["buff"].items():
                    _buff[bk] = _buff.get(bk, 0) + bv

    # 加入武魂buff
    _wid = g.GC['hero'][herodata["hid"]]["wuhun"]
    # 装备50级武魂
    _wuhunCon = g.GC['wuhun']
    if _wid  in _wuhunCon:
        _con = _wuhunCon[_wid]["50"]
        for k,v in _con['exbuff'].items():
            _buff[k] = _buff.get(k, 0) + v
        for k, v in _con['buff'].items():
            _buff[k] = _buff.get(k, 0) + v
    # 加入被动技能buff
    _skilluff = []
    _heroStarCon = g.GC["herostarup"][herodata["hid"]]["10"]
    _bdSkill = {'bd{}skill'.format(i): _heroStarCon['bd{}skill'.format(i)] for i in xrange(1, 4)}
    herodata.update(_bdSkill)
    _skill = g.m.herofun.getOpenBDSkillByHeroData(herodata)

    _con = g.GC.skill
    for bid in _skill:
        skill = _con[bid]
        _attr = str(skill['type'])
        if _attr != '1':
            continue
        _skilluff.append({skill['attr']: skill['v']})
    for i in _skilluff:
        for k, v in i.items():
            _buff[k] = _buff.get(k, 0) + v

    return _buff



# 获取英雄属性
def makeHeroBuff(herodata):
    _hid = str(herodata["hid"])
    _heroCon = g.m.herofun.getPreHeroCon(_hid)


    _heroData = dict(_heroCon)
    _heroData['hid'] = _hid
    # 显示星级
    _heroData['star'] = herodata['star']
    # 显示等阶
    _heroData['dengjie'] = 14
    # dengjielv用于升阶和升星读取配置使用
    _heroData['dengjielv'] = herodata['star']
    _heroData['lv'] = herodata["lv"]
    _heroData["baoshi"] = herodata["baoshi"]
    _heroData["shipin"] = herodata["shipin"]
    _heroData["skin"] = herodata.get("skin", {})


    # 成长id
    _growid = str(_heroCon['growid'])
    # 基础属性值
    _lv = _heroData['lv']
    _dengjielv = _heroData['dengjielv']

    _growCon = g.GC['herogrow'][_growid]
    _tmpBuff = dict(g.GC['table']['herobuff'])

    # 升级配置
    _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]
    _tmpBuff['xpskill'] = _djBuffCon['xpskill']
    _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
    _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
    _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']

    # 雕纹提供的star属性
    _starBuff = {}
    for i in ('staratkpro', 'starhppro'):
        _starBuff[i] = _djBuffCon.get(i, 0) + 1000
        _tmpBuff[i] = _heroData.get(i, 0) + 1000


    # 基础属性
    _baseAtk = (_growCon['atk'] + (_lv - 1) * _growCon['atk_grow']) * _djBuffCon['atkpro'] * (
                _starBuff['staratkpro'] * 0.001)
    _baseDef = (_growCon['def'] + (_lv - 1) * _growCon['def_grow']) * _djBuffCon['defpro']
    _baseHp = (_growCon['hp'] + (_lv - 1) * _growCon['hp_grow']) * _djBuffCon['hppro'] * (
                _starBuff['starhppro'] * 0.001)
    _baseSpeed = (_growCon['speed'] + (_lv - 1) * _growCon['speed_grow']) * _djBuffCon['speedpro']
    _tmpBuff['atk'] = _baseAtk
    _tmpBuff['def'] = _baseDef
    _tmpBuff['hp'] = _baseHp
    _tmpBuff['speed'] = _baseSpeed


    # # 装备属性
    _itemVal = {'atk': 0, 'def': 0, 'hp': 0, 'atkpro': 0, 'defpro': 0, 'hppro': 0}
    _con = g.GC["pro_gpjjc_jobequip"][str(_heroData["job"])]
    tzid = ""
    for i in _con:
        _equipBuff = i["buff"]
        for bk,bv in _equipBuff.items():
            _itemVal[bk] = _itemVal.get(bk, 0) + bv
        _equipBuff = i["jobbuff"]
        for bk, bv in _equipBuff.items():
            _itemVal[bk] = _itemVal.get(bk, 0) + bv
        tzid = i["tzid"]

    _equipBuff = {}
    # 如果有套装信息
    _tmpCon = g.m.equipfun.getEquipTzCon(tzid)
    for i in _tmpCon["buff"].values():
        for bk, bv in i.items():
            _itemVal[bk] = _itemVal.get(bk, 0) + bv

    for bk, bv in _equipBuff.items():
        _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

    _extBuff = herodata["buff"]
    for bk, bv in _extBuff.items():
        _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

    # 乘法加成取整
    for mkey in g.GC['herocom']['multiplykey']:
        _tmpBuff[mkey] = int(_tmpBuff[mkey])

    _tmpBuff['atk'] = int(_tmpBuff['atk'] * (_tmpBuff['atkpro'] * 0.001))
    _tmpBuff['def'] = int(_tmpBuff['def'] * (_tmpBuff['defpro'] * 0.001))
    _tmpBuff['hp'] = int(_tmpBuff['hp'] * (_tmpBuff['hppro'] * 0.001))
    _tmpBuff['speed'] = int(_tmpBuff['speed'] * (_tmpBuff['speedpro'] * 0.001))



    # 战力计算
    # 基础攻击：英雄成长表配置的攻击（herogrow）
    # 攻击成长：英雄成长表配置的成长值（herogrow）
    # 攻击阶位加成：等阶或星级的加成（herocom或herostarup）
    # A1：（（基础攻击+（lv-1）*攻击成长）*攻击阶位加成+装备固定攻击）*装备攻击百分比
    _A1 = (_baseAtk + _itemVal['atk']) * _itemVal['atkpro'] * 0.001 + _extBuff.get('atk', 0)
    # B1：（基础防御+（lv-1）*防御成长）*防御阶位加成
    _B1 = _baseDef + _extBuff.get('def', 0)
    # C1：（（基础生命+（lv-1）*生命成长）*生命阶位加成+装备固定生命）*装备生命百分比/6
    _C1 = ((_baseHp + _itemVal['hp']) * _itemVal['hppro'] * 0.001) / 6 + _extBuff.get('hp', 0) / 6
    # 其他：宝石战力+饰品战力+所属职业公会技能战力
    # 宝石战力
    _bsZhanLi = g.GC['baoshi']["20"]['zhanli']

    # 饰品战力
    _spZhanLi = g.m.shipinfun.getShipinCon(herodata['shipin'])['zhanli']


    # 所属职业公会技能战力
    _ghZhanLi = 0
    # 战力 = A1 + B1 + C1 + 其他
    _zhanli = int(_A1 + _B1 + _C1 + _bsZhanLi + _spZhanLi)
    _tmpBuff['zhanli'] = _zhanli
    _heroData.update(_tmpBuff)
    return _heroData


# 通知某个阶段已经完成可以进入下一个阶段
def emitEventFinish(uidlist, state):
    # 获取赛季
    _season = getSeason()
    _pipeiInfo = g.crossDB.find("gpjjc_pipei", {"uid":{"$in":uidlist}, "season": _season}, fields=["_id", "sid", "uid", "state", "headdata", "fightdata", "npcfightdata","npchead","uuid", "jifen"])
    # 如果状态为5就开始战斗
    if state == 5:
        _con = g.GC["gongpingjjc"]
        _default = _con["default"]
        _fightInfo = []
        _uuid = _pipeiInfo[0]["uuid"]
        for idx, i in enumerate(_pipeiInfo):

            if len(_fightInfo) > 2:
                break
            uid = i["uid"]
            _userInfo = g.crossDB.find1("gpjjc_rank", {"uid": uid, "season": _season}, fields=["_id", "shipin", "baoshi", "skin","tq"])

            _heroList = []
            # 設置跨服陣容信息
            g.m.crosscomfun.setGameConfig({"ctype": "gpjjc_embattle"}, {"$push": {"v": {"$each": [i["fightdata"]], "$slice": -3000}}})
            # 格式化英雄数据
            for pos, hid in i["fightdata"].items():
                if pos == "sqid":
                    continue
                _herodata = {"lv": 300, "star": 14, "buff": {}, "dengjielv": 14, "hid": hid}
                _herodata["baoshi"] = _userInfo["baoshi"].get(hid, _default["baoshi"])
                _herodata["shipin"] = _userInfo["shipin"].get(hid, _default["shipin"])

                if _userInfo["skin"].get(hid, ""):
                    _herodata["skin"] = {"sid": _userInfo["skin"][hid], "expire" : -1,"tid":""}
                # 获取当前装备的buff
                _herodata["buff"] = g.m.gongpingjjcfun.getBuff(_herodata)
                # 获取英雄数据
                _heroInfo = g.m.gongpingjjcfun.makeHeroBuff(_herodata)
                _heroInfo["pos"] = int(pos)
                _heroList.append(_heroInfo)

            # 玩家战斗信息
            _userFightData = []
            _shenqiBuff = {}
            # 加入神器数据
            if i["fightdata"].get("sqid"):
                _userFightData.append({'sqid': i["fightdata"].get("sqid"), 'side': idx, 'djlv': 24, 'shenqidpspro': 0})
                _shenqiBuff.update(g.GC['shenqibuff'][i["fightdata"].get("sqid")]["120"]['buff'])
                _djBuff = g.m.artifactfun.getBuffByDengjie(i["fightdata"].get("sqid"), 24)
                _shenqiBuff.update(_djBuff)

            for hero in _heroList:
                hero['side'] = idx
                _tmp = g.m.fightfun.fmtFightData(hero, extdata=_shenqiBuff)
                # 加入飾品技能
                if "shipin" in hero:
                    _tmp["skill"] += g.GC['shipin'][str(hero["shipin"])]['skill']

                # 加入武魂技能
                _wid = g.GC['hero'][hero['hid']]["wuhun"]
                if _wid:
                    _tmp["skill"] += g.GC['wuhun'][str(_wid)]["50"]['skill']
                _userFightData.append(_tmp)

            _fightInfo.append({"fight": _userFightData, "head": i["headdata"], "uid": i["uid"], "sid":i["sid"], "jifen":i["jifen"],"tq":_userInfo["tq"]})
            # 如果有npc数据
            if "npcfightdata" in i:
                _heroList = []
                # 格式化英雄数据
                for pos, hid in i["npcfightdata"].items():
                    if pos == "sqid":
                        continue
                    _herodata = {"lv": 300, "star": 14, "buff": {}, "dengjielv": 14, "hid": hid}
                    _herodata["baoshi"] = _default["baoshi"]
                    _herodata["shipin"] =_default["shipin"]
                    # 获取当前装备的buff
                    _herodata["buff"] = g.m.gongpingjjcfun.getBuff(_herodata)
                    # 获取英雄数据
                    _heroInfo = g.m.gongpingjjcfun.makeHeroBuff(_herodata)
                    _heroInfo["pos"] = int(pos)
                    _heroList.append(_heroInfo)

                # 玩家战斗信息
                _userFightData = []
                _shenqiBuff = {}
                # 加入神器数据
                if i["npcfightdata"].get("sqid"):
                    _userFightData.append(
                        {'sqid': i["fightdata"].get("sqid"), 'side': 1, 'djlv': 24, 'shenqidpspro': 0})

                    _shenqiBuff.update(g.GC['shenqibuff'][str(i["fightdata"].get("sqid"))]["120"]['buff'])
                    _djBuff = g.m.artifactfun.getBuffByDengjie(i["fightdata"].get("sqid"), 24)
                    _shenqiBuff.update(_djBuff)

                for hero in _heroList:
                    hero['side'] = 1
                    _tmp = g.m.fightfun.fmtFightData(hero, extdata=_shenqiBuff)
                    _userFightData.append(_tmp)

                _fightInfo.append({"fight": _userFightData, "head": i["npchead"], "uid": "npc", "sid":i["sid"], "jifen":1000, "tq":0})


        f = ZBFight('pvp')
        _fightRes = f.initFightByData(_fightInfo[0]["fight"] + _fightInfo[1]["fight"]).start()
        _fightRes['headdata'] = [_fightInfo[0]['head'], _fightInfo[1]['head']]
        _fightRes["jifeninfo"] = [_fightInfo[0]['jifen'], _fightInfo[1]['jifen']]
        _winside = _fightRes['winside']
        # 如果是0方赢了
        _prize = {}
        _prize[_fightInfo[0]['uid']] = []
        _prize[_fightInfo[1]['uid']] = []
        _todayFightNum = 0
        if _fightInfo[0]["uid"] != "npc":
            _todayFightNum = g.CROSSATTR.getPlayAttrDataNum(_fightInfo[0]["uid"], "gpjjc_todayfightnum")
        _today2FightNum = 0
        if _fightInfo[1]["uid"] != "npc":
            _today2FightNum = g.CROSSATTR.getPlayAttrDataNum(_fightInfo[1]["uid"], "gpjjc_todayfightnum")
        _setData = {"$set":{}}
        _toSetData = {"$set":{}}
        _maxfightnum1 = _con["maxfightnum"] + _con["tqaddfightnum"] if _fightInfo[0]["tq"] else _con["maxfightnum"]
        _maxfightnum2 = _con["maxfightnum"] + _con["tqaddfightnum"] if _fightInfo[1]["tq"] else _con["maxfightnum"]
        if _winside == 0:
            # 获取获胜方的奖励
            _prize[_fightInfo[0]['uid']] = []
            _fightRes["winuid"] = _fightInfo[0]['uid']

            if _todayFightNum < _maxfightnum1:
                _prize[_fightInfo[0]['uid']] += list(_con["fightprize"])
                _prize[_fightInfo[0]['uid']] += list(_con["winprize"])
                if _fightInfo[0]["tq"]:
                    _tqprize = []
                    for p in list(_con["fightprize"]) + list(_con["winprize"]):
                        if p["t"] != "2088":
                            continue
                        _tqprize.append(p)
                    _prize[_fightInfo[0]['uid']] += _tqprize

                _setData["$inc"] = {}
                _setData["$inc"]["winnum"] = 1
                _setData["$inc"]["fightnum"] = 1
            _setData["$set"]["jifen"] = _fightInfo[0]['jifen'] + 1
            # 设置我方数据
            if _fightInfo[0]["uid"] != "npc":
                setData(_fightInfo[0]['uid'], _setData)

            if _today2FightNum < _maxfightnum2:
                _prize[_fightInfo[1]['uid']] += list(_con["fightprize"])
                if _fightInfo[1]["tq"]:
                    _tqprize = []
                    for p in list(_con["fightprize"]):
                        if p["t"] != "2088":
                            continue
                        _tqprize.append(p)
                    _prize[_fightInfo[1]['uid']] += _tqprize

                _toSetData["$inc"] = {}
                _toSetData["$inc"]["fightnum"] = 1
                # 设置我方数据
            _toSetData["$set"]["jifen"] = _fightInfo[1]['jifen'] - 1
            if _fightInfo[1]["uid"] != "npc":
                setData(_fightInfo[1]['uid'], _toSetData)
        elif _winside == 1:
            _fightRes["winuid"] = _fightInfo[1]['uid']
            if _today2FightNum < _maxfightnum2:
                _prize[_fightInfo[1]['uid']] += list(_con["fightprize"])
                _prize[_fightInfo[1]['uid']] += list(_con["winprize"])
                if _fightInfo[1]["tq"]:

                    _tqprize = []
                    for p in list(_con["fightprize"]) + list(_con["winprize"]):
                        if p["t"] != "2088":
                            continue
                        _tqprize.append(p)
                    _prize[_fightInfo[1]['uid']] += _tqprize
                _toSetData["$inc"] = {}
                _toSetData["$inc"]["fightnum"] = 1
                _toSetData["$inc"]["winnum"] = 1

            if _todayFightNum < _maxfightnum1:
                _prize[_fightInfo[0]['uid']] += list(_con["fightprize"])
                if _fightInfo[0]["tq"]:
                    _tqprize = []
                    for p in list(_con["fightprize"]):
                        if p["t"] != "2088":
                            continue
                        _tqprize.append(p)
                    _prize[_fightInfo[0]['uid']] += _tqprize

                _setData["$inc"] = {}
                _setData["$inc"]["fightnum"] = 1

            _setData["$set"]["jifen"] = _fightInfo[0]['jifen'] - 1
            # 设置我方数据
            if _fightInfo[0]["uid"] != "npc":
                setData(_fightInfo[0]['uid'], _setData)
            # 设置我方数据
            _toSetData["$set"]["jifen"] = _fightInfo[1]['jifen'] + 1
            if _fightInfo[1]["uid"] != "npc":
                setData(_fightInfo[1]['uid'], _toSetData)

        else:
            _maxZhanli1 = _fightInfo[0]["head"].get("maxzhanli", 0)
            _maxZhanli2 = _fightInfo[1]["head"].get("maxzhanli", 0)
            # 判断战力谁高谁赢
            if _maxZhanli1 >= _maxZhanli2:
                _fightRes['winside'] = 0
                # 获取获胜方的奖励
                _prize[_fightInfo[0]['uid']] = []
                _fightRes["winuid"] = _fightInfo[0]['uid']

                if _todayFightNum < _maxfightnum1:
                    _prize[_fightInfo[0]['uid']] += list(_con["fightprize"])
                    _prize[_fightInfo[0]['uid']] += list(_con["winprize"])
                    if _fightInfo[0]["tq"]:
                        _tqprize = []
                        for p in list(_con["fightprize"]) + list(_con["winprize"]):
                            if p["t"] != "2088":
                                continue
                            _tqprize.append(p)
                        _prize[_fightInfo[0]['uid']] += _tqprize

                    _setData["$inc"] = {}
                    _setData["$inc"]["winnum"] = 1
                    _setData["$inc"]["fightnum"] = 1
                _setData["$set"]["jifen"] = _fightInfo[0]['jifen'] + 1
                # 设置我方数据
                if _fightInfo[0]["uid"] != "npc":
                    setData(_fightInfo[0]['uid'], _setData)

                if _today2FightNum < _maxfightnum2:
                    _prize[_fightInfo[1]['uid']] += list(_con["fightprize"])
                    if _fightInfo[1]["tq"]:
                        _tqprize = []
                        for p in list(_con["fightprize"]):
                            if p["t"] != "2088":
                                continue
                            _tqprize.append(p)
                        _prize[_fightInfo[1]['uid']] += _tqprize

                    _toSetData["$inc"] = {}
                    _toSetData["$inc"]["fightnum"] = 1
                    # 设置我方数据
                _toSetData["$set"]["jifen"] = _fightInfo[1]['jifen'] - 1
                if _fightInfo[1]["uid"] != "npc":
                    setData(_fightInfo[1]['uid'], _toSetData)

            else:
                _fightRes['winside'] = 1
                _fightRes["winuid"] = _fightInfo[1]['uid']
                if _today2FightNum < _maxfightnum2:
                    _prize[_fightInfo[1]['uid']] += list(_con["fightprize"])
                    _prize[_fightInfo[1]['uid']] += list(_con["winprize"])
                    if _fightInfo[1]["tq"]:

                        _tqprize = []
                        for p in list(_con["fightprize"]) + list(_con["winprize"]):
                            if p["t"] != "2088":
                                continue
                            _tqprize.append(p)
                        _prize[_fightInfo[1]['uid']] += _tqprize
                    _toSetData["$inc"] = {}
                    _toSetData["$inc"]["fightnum"] = 1
                    _toSetData["$inc"]["winnum"] = 1

                if _todayFightNum < _maxfightnum1:
                    _prize[_fightInfo[0]['uid']] += list(_con["fightprize"])
                    if _fightInfo[0]["tq"]:
                        _tqprize = []
                        for p in list(_con["fightprize"]):
                            if p["t"] != "2088":
                                continue
                            _tqprize.append(p)
                        _prize[_fightInfo[0]['uid']] += _tqprize

                    _setData["$inc"] = {}
                    _setData["$inc"]["fightnum"] = 1

                _setData["$set"]["jifen"] = _fightInfo[0]['jifen'] - 1
                # 设置我方数据
                if _fightInfo[0]["uid"] != "npc":
                    setData(_fightInfo[0]['uid'], _setData)
                # 设置我方数据
                _toSetData["$set"]["jifen"] = _fightInfo[1]['jifen'] + 1
                if _fightInfo[1]["uid"] != "npc":
                    setData(_fightInfo[1]['uid'], _toSetData)



        if _fightInfo[0]['uid'] != "npc":
            # if _prize[_fightInfo[0]['uid']]:
            # g.CROSSATTR.setPlayAttrDataNum(_fightInfo[1]["uid"], "gpjjc_todayfightnum")
            # 通知发奖
            _prize1 = g.mergePrize(_prize[_fightInfo[0]['uid']])
            emitEventSendPrize(_fightInfo[0]["uid"], _fightInfo[0]["sid"], _prize1)
            _prize[_fightInfo[0]['uid']] = _prize1
        if _fightInfo[1]['uid'] != "npc":
            # if _prize[_fightInfo[1]['uid']]:
                # g.CROSSATTR.setPlayAttrDataNum(_fightInfo[1]["uid"], "gpjjc_todayfightnum")
                # 通知发奖
            _prize2 = g.mergePrize(_prize[_fightInfo[1]['uid']])
            _prize[_fightInfo[1]['uid']] = _prize2
            emitEventSendPrize(_fightInfo[1]["uid"], _fightInfo[1]["sid"], _prize2)




        _resData = {}
        _resData["fightres"] = _fightRes
        _resData["prize"] = _prize
        g.crossMC.set('gpjjc_fight_{}'.format(_uuid), _resData, 60)


    _nt = g.C.NOW()
    for pipei in _pipeiInfo:
        _sendData = {"state": pipei["state"],"uid":pipei["uid"], "stime":_nt, "fightdata":pipei["fightdata"]}
        emitEvent(pipei["sid"], "gpjjc_pipei_finish", _sendData)
        # 战斗以后就设置数据了
        if state < 5:
            setPipeiData(pipei["uid"], {"stime": _nt})
            _nt += 1




# 跨服定时器发奖
def timer_sendPrize():
    _season = getSeason()
    _ctype = 'TIMER_SENDGPJJCPRIZE'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _season})
    if len(_chkData) > 0:
        # 数据已上传
        return

    # 获取本月倒数第一天
    _closeTime = g.C.getLastMonthTime() - 300
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_closeTime)
    # 判断今天是否发奖
    if g.C.ZERO(_closeTime) != g.C.ZERO(_nt):
        return


    _con = g.GC["gongpingjjc"]
    _email = _con["prizeemail"]
    _emailPrize = _con["emailprize"]

    _rankList = g.crossDB.find('gpjjc_rank', {'season': _season},fields=['_id', 'jifen', 'winnum', 'sid', 'uid', "fightnum"],sort=[['jifen', -1], ['lasttime', 1]], limit=200)
    for idx, data in enumerate(_rankList):
        _rank = idx + 1
        _prize = []
        _intr = ""
        _uid = data["uid"]
        # 发奖
        for ele in _emailPrize:
            if ele[0][0] <= _rank <= ele[0][1]:
                _prize += ele[1]
                break
        # 发奖
        if _prize:
            # 发送跨服工会邮件
            _title = _email["title"]
            _content = g.C.STR(_email['content'],_rank)
            # 发送邮件
            g.m.emailfun.sendCrossEmail(_uid, data["sid"], _title, _content, prize=_prize)

    # 设置分组状态
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': 1, 'k': _season})

# 红点
def getHongDian(uid):
    _res = {"gpjjc":0}
    # 判断开启
    if not isOpen(uid)["act"]:
        return _res
    _nt = g.C.NOW()
    # 判断战斗时间
    # 获取本月结束时间
    _closeTime = g.C.getLastMonthTime()
    _starTime = _closeTime - 7 * 24 * 3600
    if _starTime + 8 * 3600 > _nt or _closeTime - 7200 < _nt:
        return _res

    _con = g.GC["gongpingjjc"]
    _todayFightNum = g.CROSSATTR.getPlayAttrDataNum(uid, "gpjjc_todayfightnum")
    _myinfo = getData(uid,keys="_id,tq")

    _maxfightnum = _con["maxfightnum"] + _con["tqaddfightnum"] if _myinfo["tq"] else _con["maxfightnum"]
    if _todayFightNum < _maxfightnum:
        _res["gpjjc"] = 1
    return _res

# 通知发奖
def emitEventSendPrize(uid, sid, prize):
    emitEvent(sid, "gpjjc_prize", {"uid":uid, "prize":prize})



g.event.on("gpjjc_pipei", onGpjjcPiPei)
g.event.on("gpjjc_pipei_finish", onGpjjcPiPeifinish)
g.event.on("gpjjc_prize", onSendPrize)
g.event.on("gpjjc_embattle", onGpjjcEmbattle)
g.event.on("gpjjc_autoembattle", onGpjjcAutoEmbattle)

g.event.on("chongzhi", OnChongzhiSuccess)
if __name__ == '__main__':
    uid = g.buid("ysr1")
    initUserData(uid)