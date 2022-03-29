#!/usr/bin/python
# coding:utf-8

import g

'''
武将列传
'''
def getCon(id):
    _con = g.GC["jiban"][str(id)]
    return _con


# 设置羁绊
def setJiBanData(uid, jid, data):
    _where = {"uid": uid, 'jid': jid}
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    # 设置
    g.mdb.update("jiban", _where, data)


# 获取羁绊
def getJiBanData(uid, jid, keys="_id"):
    _where = {"uid": uid, 'jid': jid}
    _options = {}
    if keys != None:
        _options['fields'] = keys.split(",")
    _data = g.mdb.find1("jiban", _where, **_options)
    if not _data:
        # 初始化羁绊
        _data = initJiBanData(uid, jid)

    return _data


# 初始化羁绊
def initJiBanData(uid, jid):
    _nt = g.C.NOW()
    # # 获取羁绊配置
    _con = getCon(jid)
    _data = {
        "uid": uid,
        "jid": str(jid),
        "ctime": _nt,
        "lasttime": _nt,
        "uphero": {},
        "lv": -1
    }
    g.mdb.insert("jiban", _data)
    del _data["_id"]
    return _data


# 检测英雄是否还存在,不存在就删除对应羁绊中的英雄并刷新数据
def chkJiBanHero(uid, tidlist, conn, herodata=None):
    # 获取羁绊上阵的英雄
    if not herodata:
        herodata = g.m.herofun.getMyHeroList(uid, where={"_id": {"$in": [g.mdb.toObjectId(tid) for tid in tidlist]}})

    _dispatchHero, name = getDispatchHero(uid)
    _isDel = 0
    _sendData = {}
    for hero in herodata:
        _tid = str(hero["_id"])
        if _tid in _dispatchHero:
            _isDel = 1
            del _dispatchHero[_tid]
        if "jiban" not in hero or not hero["jiban"]:
            continue

        # 获取对应的英雄所处的位置和羁绊
        _jid = str(hero["jiban"])
        # _key = g.C.STR("uphero.{1}", _pos)
        _w = {"uid": uid, "jid": _jid}
        _jibanData = g.mdb.find1("jiban", _w, fields=["_id"])
        # 如果羁绊不存在
        if not _jibanData:
            continue
        _newLv = -1
        _uphero = _jibanData["uphero"]
        # 如果tid不存在上阵阵容
        if _tid not in _uphero:
            continue
        del _uphero[_tid]
        # 更新羁绊数据
        g.mdb.update("jiban", _w, {"uphero": _uphero, "lv": _newLv})
        # 等级发生改变就刷新英雄数据
        if _newLv != _jibanData["lv"]:
            _con = g.m.jibanfun.getCon(_jid)
            _hidList = []
            for _plid in _con["chkhero"]:
                _hidData = g.GC["pre_hero_pinglun"][_plid]
                _hidList += _hidData.keys()
            # 获取玩家羁绊对应的buff
            _buff = getAllJiBanBuff(uid)
            g.m.userfun.setCommonBuff(uid, {'buff.jiban': _buff})
            _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"hid": {"$in": _hidList},
                                                                   "lv": {"$gt": 1}})
            _sendData.update(_heroChange)

    g.sendChangeInfo(conn, {"hero": _sendData})
    # 如果需要清除派遣列表的里面的英雄
    if _isDel:
        setDispatchHero(uid, _dispatchHero)



# 获取当前羁绊的buff
def getAllJiBanBuff(uid):
    _res = {}
    jiBanInfo = g.mdb.find("jiban", {"uid": uid}, fields=["jid", "lv"])
    for jiban in jiBanInfo:
        _jid = jiban["jid"]
        _lv = jiban["lv"]
        # 如果等级为0就跳过
        if _lv < 0:
            continue
        _buff = getJiBanBuff(uid, jiban)
        _res.update(_buff)
    return _res


# 获取当前羁绊的buff
def getJiBanBuff(uid, _jibanData):
    _res = {}
    _buff = {}
    # 获取羁绊信息
    _lv = _jibanData["lv"]
    if _lv == -1:
        return _buff
    jid = _jibanData["jid"]
    _con = getCon(jid)
    for i in xrange(_lv + 1):
        for k, v in _con["updata"][i]["buff"].items():
            if k not in _buff: _buff[k] = 0
            _buff[k] += int(v)
    for plid in _con["chkhero"]:
        _res[str(plid)] = _buff
    return _res


# 设置派遣武将
def setDispatchHero(uid, herodata,name=None):
    _ctype = "jiban_rechero"
    _w = {"ctype": _ctype}
    if not name:
        gud = g.getGud(uid)
        name = gud["name"]
    g.CROSSATTR.setAttr(uid, _w, {"v": herodata, "name": name})


# 获取派遣的武将
def getDispatchHero(uid):
    _res = {}
    _name = ""
    _ctype = "jiban_rechero"
    _w = {"ctype": _ctype}
    _data = g.CROSSATTR.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
        _name = _data["name"]
    return _res, _name


# 武将信息
def fmtHeroData(uid, hero):
    _res = {}
    _tid = str(hero["_id"])
    _hid = hero["hid"]
    _con = g.m.herofun.getPreHeroCon(hero["hid"])
    _data = {
        "tid": _tid,
        "uid": uid,
        "hid": _hid,
        "plid": _con["pinglunid"],
        "star": hero["star"],
        "lv": hero["lv"],
        "uidinfo": {},
    }
    _res[_tid] = _data
    return _res


# 检查技能等级
def chkJiBanLv(_jid, uphero):
    # 判断是否满足条件：
    _lv = -1
    # 获取羁绊
    _con = g.m.jibanfun.getCon(_jid)
    # 判断是否满足人数
    if len(uphero) < len(_con["chkhero"]):
        return _lv

    # 获取英雄数据
    _tidList = uphero
    # 循环判断等级
    for lv, d in enumerate(_con["updata"]):
        _needStar = d["star"]
        for tid, hero in uphero.items():
            # 判断星级是否满足
            if _needStar > hero["star"]:
                return _lv
        _lv = lv

    return _lv


# 记录玩家租借uid的次数
def setBorrowInfo(uid, data):
    _ctype = "jiban_borrow"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"v": data})


# 获取当前玩家租借的信息
def getBorrowInfo(uid):
    _res = {}
    _ctype = "jiban_borrow"
    _w = {"ctype": _ctype}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
    return _res

# 获取玩家的援助uid列表
def getBorrowUserList(uid):
    gud = g.getGud(uid)
    userList = []
    _nt = g.C.NOW()
    # 区分跨服和本服好友
    _friendList = g.m.friendfun.getFriendList(uid)
    # 循环出跨服好友和本服好友
    _crossUidList = []
    _oneUidlist = []
    for _uid in _friendList:

        if not g.m.crosscomfun.chkIsThisService(_uid):
            _crossUidList.append(_uid)
        else:
            _oneUidlist.append(_uid)

    # 获取本服玩家的登录的时间
    _userinfo = g.mdb.find("userinfo", {"uid": {"$in": _oneUidlist}}, fields=["_id", "logintime", "uid"])
    for user in _userinfo:
        if user["logintime"] >= _nt - 7 * 3600 * 24:
            userList.append(user["uid"])

    # 获取跨服玩家的登录的时间
    _userinfo = g.crossDB.find('cross_friend', {'uid': {'$in': _crossUidList}}, fields=['_id', 'logintime', 'uid'])
    for user in _userinfo:
        # 获取跨服缓存的数据
        _loginTime = 0
        user["logintime"] = _loginTime if _loginTime else user.get('logintime', 0)
        if user["logintime"] >= _nt - 7 * 3600 * 24:
            userList.append(user["uid"])

    # 获取工会成员列表
    _ghid = gud["ghid"]
    # 如果有工会，获取工会玩家的列表
    if _ghid:
        _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': _ghid}, fields=['_id'])
        uidlist = [i["uid"] for i in _allGonghuiUser]
        userData = g.mdb.find("userinfo", {"uid": {"$in": uidlist}},fields=["_id"])
        for user in userData:
            _loginTime = 0
            # 判断如果没有缓冲就取工会里面的数据
            user["logintime"] = _loginTime if _loginTime else user["logintime"]
            if user["logintime"] >= _nt - 7 * 3600 * 24:
                userList.append(user["uid"])

    # 赛选玩家已经使用过的三个英雄uid，
    _borrowInfo = getBorrowInfo(uid)
    _userList = []
    for _uid in userList:
        # 如果一个英雄租借了3次就不在显示这个玩家的英雄列表
        if _uid in _borrowInfo and len(_borrowInfo[_uid]) >= 3:
            continue
        _userList.append(_uid)
    return _userList


# 检查玩家的租借英雄是否还存在
def chkJiBan(uid):
    # 获取玩家使用的援助列表
    _borrInfo = getBorrowInfo(uid)
    _borr2Info = g.C.dcopy(_borrInfo)
    # 获取玩家使用的援助uid
    uidList = _borrInfo.keys()
    # 删除英雄tid
    _delTid = []
    _nt = g.C.NOW()
    # 赛选出7天未登录的玩家
    _sendData = {}
    _userinfo = g.crossDB.find("jjcdefhero", {"uid": {"$in": uidList}}, fields=["_id", "headdata", "uid", 'head'])
    for user in _userinfo:
        # 取最大的
        _loginTime = user.get('head', user.get('headdata', {})).get("logintime", _nt)
        if _loginTime >= _nt - 7 * 3600 * 24:
            # 获取英雄援助列表
            _dispatchData, name = getDispatchHero(user["uid"])
            for tid in _borrInfo[user["uid"]]:
                if tid in _dispatchData:
                    _key = g.C.STR("uphero.{1}", tid)
                    _pos = _borrInfo[user["uid"]][tid]
                    # 如果玩家当前派遣的英雄对应uid 不等于当前玩家的uid
                    if uid not in _dispatchData[tid]["uidinfo"]:
                        _delTid.append(tid)
                        # 删除我请求的援助列表
                        if tid in _borrInfo[user["uid"]]:
                            del _borr2Info[user["uid"]][tid]
                        continue
                    _heroData = {"uid": user["uid"], "pos": _pos, "isext": 1, "star": _dispatchData[tid]["star"], "name": name,
                     "hid": _dispatchData[tid]["hid"]}
                    # 获取羁绊的信息
                    _jiBanInfo = g.mdb.find1("jiban", {"uid": uid, _key: {"$exists": 1}}, fields=["jid", "uphero", "lv"])
                    if not _jiBanInfo:
                        continue
                    _uphero = _jiBanInfo["uphero"]
                    _jid = _jiBanInfo["jid"]

                    _uphero.update({tid: _heroData})
                    # 计算新的羁绊等级
                    _newlv = chkJiBanLv(_jid, _uphero)
                    # 更新羁绊信息
                    g.mdb.update("jiban", {"uid": uid, "jid": _jid}, {"uphero": _uphero, "lv": _newlv, "lasttime":g.C.NOW()})
                    # 计算羁绊buff， 等级发生改变就刷新英雄数据
                    # 等级发生改变就刷新英雄数据
                    if _newlv != _jiBanInfo["lv"]:
                        _con = g.m.jibanfun.getCon(_jid)
                        _hidList = []
                        for _plid in _con["chkhero"]:
                            _hidData = g.GC["pre_hero_pinglun"][_plid]
                            _hidList += _hidData.keys()
                        # 获取玩家羁绊对应的buff
                        _buff = getAllJiBanBuff(uid)
                        g.m.userfun.setCommonBuff(uid, {'buff.jiban': _buff})
                        _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"hid": {"$in": _hidList},
                                                                               "lv": {"$gt": 1}})
                        _sendData.update(_heroChange)

                else:
                    _delTid.append(tid)
                    # 删除请求援助的列表
                    if tid in _borrInfo[user["uid"]]:
                        del _borr2Info[user["uid"]][tid]
            continue
        _delTid += _borrInfo[user["uid"]]
        del _borr2Info[user["uid"]]

    # 在循环删除的英雄
    for tid in _delTid:
        _key = g.C.STR("uphero.{1}", tid)
        _jiBanInfo = g.mdb.find1("jiban", {"uid": uid, _key: {"$exists": 1}}, fields=["jid", "uphero", "lv"])
        if not _jiBanInfo:
            continue
        _uphero = _jiBanInfo["uphero"]
        _jid = _jiBanInfo["jid"]
        # 删除对应英雄
        del _uphero[tid]
        _newlv = -1
        # 更新羁绊信息
        g.mdb.update("jiban", {"uid": uid, "jid": _jid},  {"lv": -1, "uphero": _uphero})
        # 等级发生改变就刷新英雄数据
        if _newlv != _jiBanInfo["lv"]:
            _con = g.m.jibanfun.getCon(_jid)
            _hidList = []
            for _plid in _con["chkhero"]:
                _hidData = g.GC["pre_hero_pinglun"][_plid]
                _hidList += _hidData.keys()
            # 获取玩家羁绊对应的buff
            _buff = getAllJiBanBuff(uid)
            g.m.userfun.setCommonBuff(uid, {'buff.jiban': _buff})
            _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"hid": {"$in": _hidList}, "lv": {"$gt": 1}})
            _sendData.update(_heroChange)
    # 删除我的借别人的列表
    if _delTid:
        setBorrowInfo(uid, _borr2Info)

    # 推送事件
    g.sendUidChangeInfo(uid, {"hero": _sendData})


# 升星后检查羁绊buff
def onUpheroStar(uid, tid, star, hid):
    _key = g.C.STR("uphero.{1}", tid)
    _jiBanInfo = g.mdb.find1("jiban", {"uid": uid, _key: {"$exists": 1}}, fields=["jid", "uphero", "lv"])
    # 如果英雄有羁绊
    if _jiBanInfo:
        _uphero = _jiBanInfo["uphero"]
        _jid = _jiBanInfo["jid"]
        # 删除对应英雄
        _uphero[tid]["star"] = star
        _uphero[tid]["hid"] = hid
        # 计算新的羁绊等级
        _newlv = chkJiBanLv(_jid, _uphero)
        # 更新羁绊信息
        g.mdb.update("jiban", {"uid": uid, "jid": _jid}, {"lv": _newlv, "uphero": _uphero, "lasttime":g.C.NOW()})
        _sendData = {}
        # 等级发生改变就刷新英雄数据
        if _newlv != _jiBanInfo["lv"]:
            _con = g.m.jibanfun.getCon(_jid)
            _hidList = []
            for _plid in _con["chkhero"]:
                _hidData = g.GC["pre_hero_pinglun"][_plid]
                _hidList += _hidData.keys()
            # 获取玩家羁绊对应的buff
            _buff = getAllJiBanBuff(uid)
            g.m.userfun.setCommonBuff(uid, {'buff.jiban': _buff})
            _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"hid": {"$in": _hidList}, "lv": {"$gt": 1}})
            _sendData.update(_heroChange)

         # 推送事件
        g.sendUidChangeInfo(uid, {"hero": _sendData})

    # 判断是否在派遣列表中
    _dispatchHero, name = getDispatchHero(uid)
    if tid in _dispatchHero:
        _dispatchHero[tid]["star"] = star
        # 设置派遣
        setDispatchHero(uid, _dispatchHero)


# 红点
def getHongDian(uid):
    _res = {"jiban": {"hd": 0}}
    if not g.chkOpenCond(uid, 'jiban'):
        return _res
    # 获取羁绊需要的所有的武将hid
    _hidList = list(g.GC["jibanhid"])
    # 获取评论id对应的hid
    _plCon = g.GC["pre_hero_pinglun"]

    # 获取玩家当前羁绊需要的所有hid
    heroData = g.mdb.find("hero", {"uid": uid, "hid": {"$in": _hidList}})
    # 获取玩家拥有的hid
    _myplid = []
    for hero in heroData:
        _hid = hero["hid"]
        _con = g.m.herofun.getPreHeroCon(_hid)
        _plid = _con["pinglunid"]
        if "jiban" in hero and not hero["jiban"]:
            continue
        if _plid not in _myplid:
            _myplid.append(_plid)

    userList = getBorrowUserList(uid)
    # 获取派遣列表
    data = g.crossDB.find("crossplayattr", {"ctype": "jiban_rechero", "uid": {"$in": userList}})
    for heroinfo in data:
        for tid, hero in heroinfo["v"].items():
            if hero["uidinfo"]:
                continue
            _plid = hero["plid"]
            if _plid not in _myplid:
                _myplid.append(_plid)

    # 获取玩家激活的羁绊
    _jiBanInfo = g.mdb.find("jiban", {"uid": uid}, fields=["_id"])
    _jiBanDict = {}
    for ele in _jiBanInfo:
        _jiBanDict[ele["jid"]] = []
        for val in ele["uphero"].values():
            _pinglunid = g.m.herofun.getPreHeroCon(val["hid"])["pinglunid"]
            _jiBanDict[ele["jid"]].append(_pinglunid)

    # 生成活动点数
    _con = g.GC["jiban"]
    for jid, info in _con.items():
        _res["jiban"].update({jid: []})
        _uphero = []
        if jid in _jiBanDict:
            _uphero = _jiBanDict[jid]
        for plid in info["chkhero"]:
            if plid in _uphero or plid not in _myplid:
                continue

            idx = info["chkhero"].index(plid)
            _res["jiban"]["hd"] = 1
            _res["jiban"][jid].append(idx)

    return _res


# 容错检查，检查是否有英雄未上阵但是标记未清除
def onChkHeroJiBan(uid, plid):
    # 获取评论id对应的那些英雄id
    _hidData = g.GC["pre_hero_pinglun"][plid]
    # 只要橙色以上的
    _hidList = [hid for hid, color in _hidData.items() if color >= 4]
    # 判断是否有上阵的英雄
    _data = g.mdb.find("hero", {"uid": uid, "hid": {"$in": _hidList}, "jiban": {"$ne": ""}})
    # 检查是否有未在羁绊上，但是标识没有删
    for d in _data:
        _tid = str(d["_id"])
        _key = g.C.STR("uphero.{1}", _tid)
        _jiban = g.mdb.find1("jiban", {"uid": uid, _key: {"$exists": 1}})
        # 如果有不存在的就直接删除
        if not _jiban:
            g.mdb.update("hero", {"uid": uid, "_id": d["_id"]}, {"jiban": ""})


g.event.on("chkherojiban", onChkHeroJiBan)


g.event.on("chkjiban", onUpheroStar)

if __name__ == '__main__':
    uid = g.buid("s80lsq1")
    a = chkJiBan(uid)
    _loginTime = user.get('head', user.get('headdata', {})).get("logintime", _nt)
    print a
