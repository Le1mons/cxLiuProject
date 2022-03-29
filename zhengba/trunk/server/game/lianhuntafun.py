#!/usr/bin/python
# coding:utf-8

'''
炼魂塔
'''
import g


# 获取配置
def getCon(id):
    res = g.GC['lianhunta'][str(id)]
    return res


# 获取当前赛季key
def getKey(_stime=None):
    if not _stime:
        _stime = g.C.getMonthFirstDay()
    _key = g.C.getDate(_stime, fmtStr='%Y-%m')
    return _key



# 获取数据
def getData(uid):
    _key = getKey()
    _myData = g.mdb.find1('lianhunta', {'uid': uid, "key":_key}, fields={'_id': 0,  "rec": 1, "pool":1, "allstar":1, "layerstar":1,"selectprize":1, "borrowuid":1, "borrow":1})
    _set = {}
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            "uid": uid,
            "key": _key,
            # "layerinfo": {},
            "layerstar":{},   # 关卡星级
            "selectprize":{},  # 选择的奖励
            "ctime": _nt,
            "lasttime": _nt,
            "rec": [], # 赏金领奖记录
            "pool": {}, # 奖池数量
            "allstar": 0, # 总星级
            "ttltime":g.C.TTL(),
            "borrowuid": [],
            "borrow": "",
        }
    if _set:
        g.mdb.update('lianhunta', {'uid': uid, "key": _key}, _set, upsert=True)
        if "_id" in _myData:
            del _myData["_id"]
        if "ttltime" in _myData:
            del _myData["ttltime"]
    return _myData


# 更新数据 带上日期
def setData(uid, data):
    _key = getKey()
    _w = {"uid": uid,  "key": _key}
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt
    g.mdb.update('lianhunta', _w, _setData)




# 获取关卡数据
def getLayerInfo(uid):
    _key = getKey()
    _guanKaInfo = g.getAttrByCtype(uid, "lianhunta_guanka", k=_key, default={}, bydate=False)
    if not _guanKaInfo:
        _guanKaInfo = initGuanKa(uid)

    # 三星条件
    _guanKaComInfo = g.m.crosscomfun.getGameConfig({'ctype': 'TIMER_lianhunta_creationGuanKa', 'k': _key})
    if not _guanKaComInfo:
        return {}
    _guanKaComInfo = _guanKaComInfo[0]["v"]
    for id in _guanKaInfo.keys():
        _guanKaInfo[id]["starcond"] = _guanKaComInfo[id]["starcond"]

    return _guanKaInfo

# 获取玩家的最强六个英雄的数据
def getMaxInfo(uid):
    _maxInfo = {}
    if not _maxInfo:
        _herolist = g.mdb.find("hero", {"uid": uid}, fields=["_id"], limit=6, sort=[["zhanli", -1]])
        if _herolist:
            _fmtHeroList = []
            _fmtShiPinInfo = []
            _sqinfo = {}
            for hero in _herolist:
                _data = {}
                _data["hid"] = hero["hid"]
                _data["lv"] = hero["lv"]
                _data["star"] = hero["star"]
                _data["dengjielv"] = hero["dengjielv"]
                _data["weardata"] = hero.get("weardata", {})
                _data["wuhunlv"] = g.m.wuhunfun.getWuhunData(hero["wuhun"])["lv"] if hero.get("wuhun", None) else 0
                _fmtHeroList.append(_data)
                if "5" in _data["weardata"]:
                    _shiPinInfo = g.m.shipinfun.getShipinCon(hero["weardata"]["5"])
                    # 加入饰品评分
                    _fmtShiPinInfo.append(_shiPinInfo["fenshu"])
            # 加入当前培养等级最高的神器
            _artifactInfo = g.m.artifactfun.getArtifactInfo(uid, fields=['_id'])
            if _artifactInfo and _artifactInfo["artifact"]:
                for sqid, info in _artifactInfo["artifact"].items():
                    if info["lv"] > _sqinfo.get("lv", 0):
                        _sqinfo["lv"] = info["lv"]
                        _sqinfo["djlv"] = info["djlv"]
            _setData = {"v": _fmtHeroList, "sqinfo": _sqinfo, "shipin": _fmtShiPinInfo}
            g.setAttr(uid, {"ctype": "maxzhanli_herolist"}, {"v": _fmtHeroList, "sqinfo": _sqinfo, "shipin": _fmtShiPinInfo})
            return _setData

    return _maxInfo


# 首次开启的话需要验证是否有6个6星或以上的英雄,只判断一次
def chkHeroOpenCond(uid):
    _ctype = "lianhunta_hero_opencond"
    _data = g.getAttrOne(uid, {'ctype': _ctype})
    if not _data:
        _heroNum = g.mdb.count('hero', {'uid': uid, 'star': {'$gte': 6}})
        if _heroNum < 6:
            return 0
        else:
            g.setAttr(uid, {'ctype': _ctype}, {'v': 1})
            return 1
    return 1


# 检测是否开启
def checkOpen(uid, gkid="1"):
    _res = 0
    # 判断是否开启
    if not g.chkOpenCond(uid, 'lianhunta'):
        return _res

    _nt = g.C.NOW()
    _stime = g.C.getMonthFirstDay()
    if _nt >= _stime + 15 * 24 * 3600:
        return _res

    _guankaCon = g.GC["lianhuntacom"]["guanka"][gkid]
    if _nt < _stime + (_guankaCon["openday"] -1) * 24 * 3600:
        return _res
    return 1


# 跨服定时器，生成关卡数据
def timer_creationGuanKa():
    _closeTime = g.C.getLastMonthTime()
    _key = getKey(_closeTime + 7 * 24 * 3600)
    # 判断是否执行

    _nt = g.C.NOW()
    if g.C.getDate(_closeTime) != g.C.getDate():
        return

    _ctype = 'TIMER_lianhunta_creationGuanKa'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _key})
    if len(_chkData) > 0:
        # 数据已上传
        return
    _setData = {}

    _con = g.GC["lianhuntacom"]
    _randomhero = _con["randomhero"]
    _guankaCon = g.GC["lianhunta"]
    _guakaInfo = {}
    _randHerolist = g.C.RANDLIST(_randomhero, num=len(_guankaCon))
    for id in _guankaCon.keys():
        # 随机每个关卡的阵容
        _guakaInfo[id] = {}
        _guakaInfo[id]["hero"] = _randHerolist.pop(0)
        # 随机每个关卡条件
        _guakaInfo[id]["starcond"] = {}
        for star, condlist in _con["starcond{}".format(_guankaCon[id]["gkid"])].items():
            data = {}
            # 是否有条件需要随机
            if condlist:
                data = g.C.RANDLIST(condlist)[0]
                if data["key"] in ["zhongzu", "nojob", "job"]:
                    data["cond"] = g.C.RANDLIST(data["random"])

                elif data["key"] == "zhongzu3":
                    data["cond"] = g.C.RANDLIST(data["random"], 3)
            _guakaInfo[id]["starcond"][star] = data

    # 设置分组状态
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {'v': _guakaInfo, 'k': _key})

# 计算buff
def getBuff(herodata):

    _buff = {}
    for k, v in herodata.items():
        if k not in ["baoshi", "shipin", "skin"]:
            continue
        if k == "baoshi":
            _con = g.GC["baoshi"][v["lv"]]["buff"]
            if v["bid"] in _con:
                for bk, bv in _con[v["bid"]].items():
                    _buff[bk] = _buff.get(bk, 0) + bv

        elif k == "shipin":
            _con = g.GC["shipin"]
            if v in _con:
                for bk, bv in _con[v]["buff"].items():
                    _buff[bk] = _buff.get(bk, 0) + bv

    # 加入武魂buff

    _wid = g.GC['hero'][herodata["hid"]]["wuhun"]

    if herodata["wuhunlv"] > 0:
        _wuhunCon = g.GC['wuhun']
        if _wid  in _wuhunCon:
            _con = _wuhunCon[_wid][str(herodata["wuhunlv"])]
            for k,v in _con['exbuff'].items():
                _buff[k] = _buff.get(k, 0) + v
            for k, v in _con['buff'].items():
                _buff[k] = _buff.get(k, 0) + v
    # 加入被动技能buff
    _skilluff = []
    if herodata["hid"] in g.GC["herostarup"] and herodata["star"] > 6:
        _star = herodata["star"]
        _maxStar = 7
        for k in g.GC["herostarup"][herodata["hid"]].keys():
            if int(k) > _maxStar:
                _maxStar = int(k)
        if _star > _maxStar:
            # herodata["dengjielv"] = _star = _maxStar
            herodata["star"] = _maxStar
        _heroCon = g.GC["herostarup"][herodata["hid"]][str(_star)]
    else:
        _heroCon = g.GC["hero"][herodata["hid"]]
        herodata["dengjielv"] = herodata["dengjielv"]
        herodata["star"] = 6

    _bdSkill = {'bd{}skill'.format(i): _heroCon['bd{}skill'.format(i)] for i in xrange(1, 4)}

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
def makeHeroBuff(herodata, info={}):
    _hid = str(herodata["hid"])
    _heroCon = g.m.herofun.getPreHeroCon(_hid)


    _heroData = dict(_heroCon)
    _heroData['hid'] = _hid
    # 显示星级
    _heroData['star'] = herodata['star']
    # 显示等阶
    _heroData['dengjie'] = 10
    # dengjielv用于升阶和升星读取配置使用
    _heroData['dengjielv'] = herodata['dengjielv']
    _heroData['lv'] = herodata["lv"]
    _heroData["baoshi"] = herodata.get("baoshi", {})
    _heroData["shipin"] = herodata.get("shipin")
    _heroData["skin"] = herodata.get("skin", {})
    _heroData["wuhunlv"] = herodata.get("wuhunlv", {})
    _heroData["weardata"] = herodata.get("weardata", {})


    # 成长id
    _growid = str(_heroCon['growid'])
    # 基础属性值
    _lv = _heroData['lv']
    _dengjielv = _heroData['dengjielv']

    _growCon = g.GC['herogrow'][_growid]
    _tmpBuff = dict(g.GC['table']['herobuff'])

    # 升级配置
    if _dengjielv > 6:
        # 升级配置
        _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]
        _tmpBuff['xpskill'] = _djBuffCon['xpskill']
        _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
        _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
        _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']
    else:
        # 进阶配置
        _djBuffCon = g.GC.herocom['herojinjieup'][str(_dengjielv)]
        _tmpBuff['xpskill'] = _heroData['xpskill']
        _tmpBuff['bd1skill'] = _heroData['bd1skill']
        _tmpBuff['bd2skill'] = _heroData['bd2skill']
        _tmpBuff['bd3skill'] = _heroData['bd3skill']

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
    _itemVal = {'atk': 0, 'def': 0, 'hp': 0, 'atkpro': 1000, 'defpro': 1000, 'hppro': 1000}


    # 刷新装备数据
    _tzNum = 0
    for type, eid in _heroData["weardata"].items():
        if type in ("5", "6"):
            continue
        _equipInfo = g.GC["equip"][eid]
        # 如果是专属套装
        if _equipInfo["colorlv"] == 1:
            _tzNum += 1
        _equipBuff = _equipInfo["buff"]
        for bk,bv in _equipBuff.items():
            # _itemVal[bk] = _itemVal.get(bk, 0) + bv
            _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

    # 如果是套装
    if _tzNum >= 4:
        _con = g.GC["pro_gpjjc_jobequip"][str(_heroData["job"])]
        tzid = ""
        for i in _con:
            _equipBuff = i["jobbuff"]
            for bk, bv in _equipBuff.items():
                # _itemVal[bk] = _itemVal.get(bk, 0) + bv
                _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv
            tzid = i["tzid"]
        # 如果有套装信息
        _tmpCon = g.m.equipfun.getEquipTzCon(tzid)
        for i in _tmpCon["buff"].values():
            for bk, bv in i.items():
                _itemVal[bk] = _itemVal.get(bk, 0) + bv
                _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv


    _extBuff = herodata["buff"]
    for bk, bv in _extBuff.items():
        # _itemVal[bk] = _itemVal.get(bk, 0) + bv
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

    _A1 = ((_baseAtk + _itemVal['atk']) * _itemVal['atkpro'] * 0.001 + _extBuff.get('atk', 0)) * info.get("atkpro", 1000) / 1000
    # B1：（基础防御+（lv-1）*防御成长）*防御阶位加成
    _B1 = _baseDef + _extBuff.get('def', 0)
    # C1：（（基础生命+（lv-1）*生命成长）*生命阶位加成+装备固定生命）*装备生命百分比/6
    _C1 = (((_baseHp + _itemVal['hp']) * _itemVal['hppro'] * 0.001) / 6 + _extBuff.get('hp', 0) / 6) * info.get("hppro", 1000) / 1000
    # 其他：宝石战力+饰品战力+所属职业公会技能战力
    _bsZhanLi = 0
    if _heroData['baoshi']:
        # 宝石战力
        _bsZhanLi = g.GC['baoshi'][str(_heroData['baoshi']["lv"])]['zhanli']
    _spZhanLi = 0
    if _heroData['shipin']:
        # 饰品战力
        _spZhanLi = g.m.shipinfun.getShipinCon(_heroData['shipin'])['zhanli']

    # 所属职业公会技能战力
    _ghZhanLi = 0
    # 战力 = A1 + B1 + C1 + 其他
    _zhanli = int(_A1 + _B1 + _C1 + _bsZhanLi + _spZhanLi)
    _heroData.update(_tmpBuff)
    if info:
        _heroData["atk"] = int(_heroData["atk"] * (info["atkpro"]) / 1000)
        _heroData["hp"] = int(_heroData["hp"] * (info["hppro"]) / 1000)

    _heroData['zhanli'] = _zhanli

    return _heroData



def initGuanKa(uid):
    _res = {}
    _key = getKey()
    # _guanKaInfo = g.getAttrByCtype(uid, "lianhunta_guanka", k=_key, default={}, bydate=False)
    # if _guanKaInfo:
    #     return

    _guanKaComInfo = g.m.crosscomfun.getGameConfig({'ctype': 'TIMER_lianhunta_creationGuanKa', 'k': _key})
    if not _guanKaComInfo:
        return {}
    _guanKaComInfo = _guanKaComInfo[0]["v"]
    _maxInfo = getMaxInfo(uid)

    _guankaCon = g.GC["lianhunta"]
    _guankainfo = {}
    for id, info in _guankaCon.items():
        _guankainfo[id] = {"herolist": [], "maxzhanli":0}
        _fmtHeroList = []
        for idx, hero in enumerate(_maxInfo["v"]):
            _herodata = {"lv": hero["lv"], "star": hero["star"], "buff": {}, "dengjielv": hero["dengjielv"]}
            if _maxInfo["shipin"]:
                # 随机一个饰品
                _shiPinFenShu = g.C.RANDLIST(_maxInfo["shipin"])[0]
                _shiPinList = g.GC["pro_pingfen_shipin"][_shiPinFenShu]
                _herodata["shipin"] = g.C.RANDLIST(_shiPinList)[0]
            # 随机一个宝石
            if "6" in hero["weardata"]:
                _lv, _buffid = hero["weardata"]["6"].items()[0]
                _herodata["baoshi"] = {"lv": _lv, "bid": _buffid}
            _herodata["wuhunlv"] = hero["wuhunlv"]
            _herodata["hid"] = _guanKaComInfo[id]["hero"][idx]
            _herodata["weardata"] = hero.get("weardata", {})
            _herodata["buff"] = getBuff(_herodata)

            _heroInfo = makeHeroBuff(_herodata, info)
            _heroInfo["pos"] = int(idx + 1)
            _fmtHeroList.append(_heroInfo)

        _shenqiBuff = {}
        # 加入神器数据
        if _maxInfo["sqinfo"]:
            _shenqiCon = g.GC["shenqicom"]
            _sqid = g.C.RANDLIST(_shenqiCon["shenqi"].keys())[0]
            # 加入神器战斗数据
            _guankainfo[id]["herolist"].append({'sqid': _sqid, 'side': 1, 'djlv': _maxInfo["sqinfo"].get("djlv", 0), 'shenqidpspro': 0})
            # 格式化神器buff
            _shenqiBuff.update(g.GC['shenqibuff'][_sqid][str(_maxInfo["sqinfo"].get("lv", 0))]['buff'])
            _djBuff = g.m.artifactfun.getBuffByDengjie(_sqid, _maxInfo["sqinfo"].get("djlv", 0))
            _shenqiBuff.update(_djBuff)

        for hero in _fmtHeroList:
            hero['side'] = 1
            _tmp = g.m.fightfun.fmtFightData(hero, extdata=_shenqiBuff)



            # 加入飾品技能
            if hero["shipin"]:
                _tmp["skill"] += g.GC['shipin'][str(hero["shipin"])]['skill']

            if hero["wuhunlv"] > 0:
                # 加入武魂技能
                _wid = g.GC['hero'][hero['hid']]["wuhun"]
                if _wid:
                    _tmp["skill"] += g.GC['wuhun'][str(_wid)][str(hero["wuhunlv"])]['skill']
            _guankainfo[id]["herolist"].append(_tmp)
            _guankainfo[id]["maxzhanli"] += hero["zhanli"]

    g.setAttr(uid, {"ctype": "lianhunta_guanka"}, {"v": _guankainfo, "k":_key})
    return _guankainfo








# 获取玩家的援助uid列表
def getBorrowUserList(uid, black):
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
    _userList = []
    _borrowNum = g.GC["lianhuntacom"]["borrownum"]
    if len(black) > _borrowNum:
        return _userList
    for _uid in userList:
        # 如果一个英雄租借了3次就不在显示这个玩家的英雄列表
        if _uid in black:
            continue
        _userList.append(_uid)
    return _userList



# 获取红点
def getHongDian(uid):
    _res = {"lianhunta": 0}
    _con = g.GC["lianhuntacom"]
    _starprize = _con["starprize"]
    _data = getData(uid)
    # 没有通关20关不显示红点
    if "20" not in _data["layerstar"]:
        return _res

    for idx, p in enumerate(_starprize):
        if _data["allstar"] > p["val"] and idx not in _data['rec']:
            _res["lianhunta"] = 1
            return _res

    return _res

def fmtHeroList(uid, herolist, sqid=None):

    _key = getKey()
    _fmtHeroList = []
    _res = {"herolist": [], "maxzhanli": 0}
    for idx, hero in enumerate(herolist):

        _herodata = {"lv": hero["lv"], "star": hero["star"], "buff": {}, "dengjielv": hero["dengjielv"]}
        if "5" in hero.get("weardata", {}):
            _herodata["shipin"] = hero["weardata"]["5"].split('_')[0]
        # 随机一个宝石
        if "6" in hero.get("weardata", {}):
            _lv, _buffid = hero["weardata"]["6"].items()[0]
            _herodata["baoshi"] = {"lv": _lv, "bid": _buffid}

        # 加上皮肤
        _herodata["skin"] = hero.get("skin", "")
        _herodata["wuhunlv"] = g.m.wuhunfun.getWuhunData(hero["wuhun"])["lv"] if hero.get("wuhun", None) else 0
        _herodata["hid"] = hero["hid"]
        _herodata["weardata"] = hero.get("weardata", {})
        _herodata["buff"] = getBuff(_herodata)
        _heroInfo = makeHeroBuff(_herodata)
        if 'pos' in hero:
            _heroInfo["pos"] = int(hero['pos'])
        else:
            _heroInfo["pos"] = int(idx + 1)
        _heroInfo['zhanli'] = hero['zhanli']  # 记录战力
        _fmtHeroList.append(_heroInfo)

    _shenqiBuff = {}
    if sqid:
        _sqfight, _shenqiBuff = g.m.artifactfun.getFightInfo(uid, 0, sqid)
        _res["herolist"].append(_sqfight[0])

    for hero in _fmtHeroList:
        hero['side'] = 0
        _tmp = g.m.fightfun.fmtFightData(hero, extdata=_shenqiBuff)
        _tmp['zhanli'] = hero['zhanli']

        # 加入饰品技能
        if hero["shipin"]:
            _tmp["skill"] += g.GC['shipin'][str(hero["shipin"])]['skill']

        if hero["wuhunlv"] > 0:
            # 加入武魂技能
            _wid = g.GC['hero'][hero['hid']]["wuhun"]
            if _wid:
                _tmp["skill"] += g.GC['wuhun'][str(_wid)][str(hero["wuhunlv"])]['skill']
        _res["herolist"].append(_tmp)
        _res["maxzhanli"] += hero["zhanli"]


    return _res

# 检测获得了多少星
def chkStar(heroinfo, condDict, turn, fighteRes):
    _res = [1]
    _jobDict = {}
    _zhongzuDict = {}
    for hero in heroinfo:
        if str(hero["job"]) not in _jobDict: _jobDict[str(hero["job"])] = 0
        _jobDict[str(hero["job"])] += 1
        if str(hero["zhongzu"])not in _zhongzuDict: _zhongzuDict[str(hero["zhongzu"])] = 0
        _zhongzuDict[str(hero["zhongzu"])] += 1

    for star, info in condDict.items():
        if info["key"] == "win":
            continue
        # 判断种族
        elif info["key"] in ("zhongzu",):
            if _zhongzuDict.get(str(info["cond"][0]), 0) < info["num"]:
                continue
        elif info["key"] in ("job",):
            if _jobDict.get(str(info["cond"][0]), 0) < info["num"]:
                continue
        # 判断种族
        elif info["key"] == "zhongzu3":
            _chk = 0
            for zhongzu in info["cond"]:
                if str(zhongzu) not in  _zhongzuDict:
                    break
            else:
                _chk = 1
            if not _chk:
                continue
        # 判断回合
        elif info["key"] == "turn":
            if turn > info["num"]:
                continue
        # 判断死亡
        elif info["key"] == "dead":
            if len(filter(lambda x: 'hid' in fighteRes['fightres'][x] and fighteRes['fightres'][x]['side'] == 0 and fighteRes['fightres'][x]['dead'], fighteRes['fightres'])) > info['num']:
                continue
        # 判断职业
        elif info["key"] == "nojob":
            if str(info["cond"][0]) in _jobDict:
                continue
        _res.append(int(star))

    return _res













if __name__ == '__main__':
    uid = g.buid("0")


