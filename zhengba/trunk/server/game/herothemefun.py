#!/usr/bin/python
# coding:utf-8

'''
英雄主题活动
'''
import g


htype=80
# 获取配置
def getCon():
    res = g.GC['herotheme']
    return res


# 获取数据
def getData(uid, hdid, keys=None, hdinfo=None):


    # 默认读取的key
    dfeilds = []
    if keys:
        dfeilds += keys.split(',')

    if not hdinfo:
        hdinfo = g.m.huodongfun.getHDinfoByHtype(80, "etime")

    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            'task': {'data':{"1":1},'rec':[]},     # 任务数据
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao': {},                        # 礼包购买次数
            "flag": {"exp": 0, "free": [], "pay": [], "buy":0},  # 战旗
            'cifu': {"free": [], "pay": []},       # 赐福
            "jifen":0,                           # 积分
            "shilian": {"win":[], "fightnum": 6}, # 试炼
            "guankarec": {"win": [], "boxrec": []},# 赢得关卡和领取的宝箱
            "lasttime": _nt,                    # 设置时间
            "val":0,                            # 英雄星级
        }
    # 任务跨天重置
    if _myData.get('date') != _dkey:
        # # 补发宝箱奖励邮件
        _prize = []

        # 如果有奖励就发送邮件
        if _prize:
            _title = _con["todayemail"]["title"]
            _content = _con["todayemail"]["content"]
            g.m.emailfun.sendEmails(uid, 1, _title, _content, prize=_prize)

        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':[]}
        _set['date'] = _myData['date'] = _dkey
        _myData["shilian"]["fightnum"] += 6
        if _myData["shilian"]["fightnum"] > 12:
            _myData["shilian"]["fightnum"] = 12
        _set["shilian"] = _myData["shilian"]

        # 重置每天的战斗次数
        _myData['guankarec']["fightnum"] = 0
        _set["guankarec"] = _myData['guankarec']


    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    _res = {}
    if dfeilds:
        for key in dfeilds:
            _res[key] = _myData.get(key, {})
    else:
        _res = _myData


    return _res


# 获取排名
# 获取排行榜
def getRanklist(uid, hdid, limit=50):

    _groupId = g.m.crosscomfun.getServerGroupId(uid)
    _ckey = "herotheme_rank_{}_{}_{}".format(hdid, limit, _groupId)
    _cacheRank = g.crossMC.get(_ckey)
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}
        _list = g.crossDB.find('crossplayattr', {'k': _groupId, "ctype": "herotheme_jifen", "hdid": hdid},
                               fields=['_id', 'v', "uid"], sort=[['v', -1], ['lasttime', 1]], limit=limit)
        _rank = 1
        # _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _list:
            _temp = {}
            _temp['headdata'] = {}
            try:
                _temp['headdata'] = \
                    g.crossDB.find1("cross_friend", {"uid": i["uid"]}, fields={'_id': 0, 'head.defhero': 0})["head"]
            except:
                print i["uid"], "herotheme"

            _temp['rank'] = _rank
            _temp['val'] = i['v']
            _temp['name'] = _temp['headdata'].get("svrname", "暂无区服")

            _uid2rank[i["uid"]] = {"rank": _rank, "val": i["v"]}
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set(_ckey, {"list": _rankList, 'uid2rank': _uid2rank}, 60)

    _myRank = -1
    _myData = g.crossDB.find1('crossplayattr', {'hdid': hdid, "ctype": "herotheme_jifen", "uid": uid},
                              fields=['_id', 'v'])
    _num = 0
    if _myData:
        _num = _myData['v']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]["rank"]
        _num = _uid2rank[uid]["val"]
    # elif _num > 0:
    #     _myRank = g.crossDB.count('crossplayattr',
    #                               {'k': hdid, "ctype": "herotheme_jifen", "v": {"$gt": _num}}) + 1

    _res = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _num}
    return _res


# 获取英雄属性
def makeHeroBuff(herodata):
    _hid = str(herodata["hid"])
    _heroCon = g.m.herofun.getPreHeroCon(_hid)


    _heroData = dict(_heroCon)
    _heroData['hid'] = _hid
    # 显示星级
    _heroData['star'] = herodata['star']
    # 显示等阶
    _heroData['dengjie'] = 10
    # dengjielv用于升阶和升星读取配置使用
    _heroData['dengjielv'] = herodata['star']
    _heroData['lv'] = herodata["lv"]
    # _heroData["baoshi"] = herodata["baoshi"]
    # _heroData["shipin"] = herodata["shipin"]
    _heroData["skin"] = herodata.get("skin", {})


    # 成长id
    _growid = str(_heroCon['growid'])
    # 基础属性值
    _lv = _heroData['lv']
    _dengjielv = _heroData['dengjielv']

    _growCon = g.GC['herogrow'][_growid]
    _tmpBuff = dict(g.GC['table']['herobuff'])

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
    # # 升级配置
    # _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]
    # _tmpBuff['xpskill'] = _djBuffCon['xpskill']
    # _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
    # _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
    # _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']

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
    # _con = g.GC["pro_gpjjc_jobequip"][str(_heroData["job"])]
    # tzid = ""
    # for i in _con:
    #     _equipBuff = i["buff"]
    #     for bk,bv in _equipBuff.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #     _equipBuff = i["jobbuff"]
    #     for bk, bv in _equipBuff.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #     tzid = i["tzid"]
    #
    # _equipBuff = {}
    # # 如果有套装信息
    # _tmpCon = g.m.equipfun.getEquipTzCon(tzid)
    # for i in _tmpCon["buff"].values():
    #     for bk, bv in i.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #
    # for bk, bv in _equipBuff.items():
    #     _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

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


    # 战力 = A1 + B1 + C1 + 其他
    _zhanli = int(_A1 + _B1 + _C1)
    _tmpBuff['zhanli'] = _zhanli
    _heroData.update(_tmpBuff)
    return _heroData


# 更新数据 带上日期
def setData(uid, hdid, data):
    g.m.huodongfun.setHDData(uid, hdid, data)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")

    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res["stime"] = _hd["stime"]
    return _res



# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'qixi_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        return

    _con = getCon()
    if act not in _con["libao"]:
        return

    _data = getData(uid, _hd['hdid'])
    if _data["libao"].get(act, 0) >= _con["libao"][act]['buynum']:
        g.success[orderid] = False
        return

    setData(uid, _hd['hdid'], {'$inc': {"libao" + ".{}".format(act): 1}})
    _send = g.getPrizeRes(uid, _con["libao"][act]['prize'], {'act': 'herotheme_libao'})
    g.sendUidChangeInfo(uid, _send)



# 监听战旗购买
def OnFlagSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        return

    _con = getCon()
    if act not in _con["flagpayinfo"]["proid"]:
        return

    _data = getData(uid, _hd['hdid'])
    if _data["flag"]["buy"]:
        g.success[orderid] = False
        return
    _data["flag"]["buy"] = 1

    _data["flag"]["exp"] += _con["upflagexp"] * 5
    setData(uid, _hd['hdid'],  {"flag": _data["flag"]})




# 监听音箱
def onHeroStar(uid, hid, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _heroCon = g.GC["pre_hero"][hid]
    _plid = _heroCon["pinglunid"]
    if _plid != getCon()['plid']:
        return
    _data = getData(uid, _hd['hdid'])
    if val <= _data["val"]:
        return
    _set = {"val": val}
    setData(uid, _hd['hdid'], _set)



# 增加buff
def addBuff(uid, herolist, buff):

    _res = []
    for role in herolist:
        if "hid" not in role:
            _res += [role]
            continue

        _heroInfo = g.m.herofun._reSetHerosBuff(uid, [role], isset=0, extbuff=buff).values()
        role.update(_heroInfo[0])

        _res.append(role)

    return _res

def getWeekKey():
    _nt = g.C.NOW()
    return g.C.getWeekNumByTime(_nt)

# 发奖逻辑
def timer_sendRankPrize():
    _dkey = getWeekKey()

    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "etime": {"$lte": _nt}}, fields=['_id', "stime", "hdid"], sort=[["etime", -1]])
    if not _hdinfoInfo:
        return
    _hdid = _hdinfoInfo["hdid"]
    _con = getCon()
    _rankPrize = _con["rankprize"]
    _email = _con["email"]

    _title = _email["title"]
    _content = _email["content"]
    # 判断是否已经执行过
    _ctype = 'TIMER_herotheme_SENDPRIZE'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData:
        return

        # 获取当前最大的分组
    _maxGroupId = 0
    _maxServerGroup = g.crossDB.find("servergroup", {"dkey": _dkey}, fields=['_id', 'gid'])
    if _maxServerGroup:
        _maxGroupId = int(max(_maxServerGroup, key=lambda x: int(x['gid']))['gid'])
    # 分发不同组的奖励
    for _groupid in xrange(_maxGroupId + 1):
        _groupid = str(_groupid)
        _ranklist = g.crossDB.find("crossplayattr", {"ctype": "herotheme_jifen", "k": _groupid, "hdid":_hdid},
                                   sort=[["v", -1], ["lasttime", 1]], fields=["uid", "v", "sid"])

        _num = len(_ranklist)
        _rank = 1
        for idx, d in enumerate(_ranklist):

            _uid = d["uid"]

            _area = float(_rank) / _num
            _prize, _val = get2Prize(_rankPrize, _area * 100, _rank)

            # 判断是否有奖励
            if not _prize:
                continue

            _fmtContent = g.C.STR(_content, _val)
            # 发送邮件

            sid = d.get("sid", 0)
            if "sid" not in d:
                _userinfo = g.crossDB.find1("jjcdefhero", {"uid": _uid}, fields=["_id"]) or {}
                if not _userinfo:
                    continue
                sid = _userinfo.get("sid", 0)

            g.m.emailfun.sendCrossEmail(_uid, sid, _title, _fmtContent, prize=_prize)

            g.m.crosscomfun.CATTR().setAttr(_uid, {'ctype': "herotheme_jifen", "hdid": _hdid}, {"finish": 1})

            _rank += 1

    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid}, {"v": 1})



# 计算玩家的奖励
def get2Prize(_rankPrize, val, rank):
    _prize = []
    _val = 0
    for ele in _rankPrize:
        if ele["percentum"] == 0:
            _val2 = rank
        else:
            _val2 = val

        if ele["val"] >= _val2:
            _prize = ele["p"]


            if ele["percentum"] == 0:
                _val = "第{0}名".format(_val2)
            else:
                _val = "前{0}%".format(ele["val"])
            break
    return _prize, _val


# 获取红点
def getHongDian(uid):
    _res = {"herotheme": 0}

    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])


    _nt = g.C.NOW()
    if _nt < _hd['rtime']:
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["herotheme"] = 1
                return _res

       # 战旗红点
        _prize = []
        _flagPrize = _con['flagprize']
        _lv = int(_myData["flag"]["exp"] / _con["upflagexp"]) + 1
        for id in xrange(1, _lv + 1):
            id = str(id)
            if str(id) not in _flagPrize:
                continue
            if id not in _myData["flag"]["free"]:
                _prize.extend(_flagPrize[str(id)]["freeprize"])
                _myData["flag"]["free"].append(id)
            if _myData["flag"]["buy"] and id not in _myData["flag"]["pay"]:
                _prize.extend(_flagPrize[str(id)]["payprize"])
                _myData["flag"]["pay"].append(id)
        if _prize:
            _res["herotheme"] = 1
            return _res

        # 关卡宝箱红点
        guankapassprize = _con["guankapassprize"]
        for idx , info in enumerate(guankapassprize):
            _chk = 0
            for idx2 in info["val"]:
                if idx2 not in _myData["guankarec"]["win"]:
                    break
            else:
                _chk = 1
            if idx not in _myData["guankarec"]["boxrec"] and _chk:
                _res["herotheme"] = 1
                return _res

        # 判断挑战次数
        if _myData["shilian"]["fightnum"] > 0:
            _res["herotheme"] = 1
            return _res


    return _res



# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('chongzhi', OnFlagSuccess)
# g.event.on('chongzhi', OnChongzhiSuccess1)
g.event.on('herotheme', onChkTask)
g.event.on('herotheme_star', onHeroStar)
if __name__ == '__main__':
    uid = g.buid("ysr1")
    # g.debugConn.uid = uid
    # print   divmod(15, 8)

    print timer_sendRankPrize()
