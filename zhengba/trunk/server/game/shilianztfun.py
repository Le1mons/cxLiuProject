# !/usr/bin/python
# coding:utf-8


'''
试炼之塔相关方法
'''
import g

# 获取关卡数据
def getCon(layer=None):
    if layer:
        return g.GC["shilianzt"][str(layer)]
    return g.GC["shilianzt"]


def getKey(_nt=None):
    if not _nt:
        _nt = g.C.NOW()
    _dKey = g.C.getWeekNumByTime(_nt)
    return _dKey

# 初始数据
def initData(uid, data={}):
    # 获取皇城探宝的配置
    _new = 0
    if not data:
        data = g.mdb.find1("shilianzhita", {"uid": uid}, fields=["_id"]) or {}
        if data: _new = 1  # 有数据说明不是第一次


    _con = g.GC["shilianztcom"]
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)

    _setData = {}
    _setData["ctime"] = _nt
    _setData["lasttime"] = _nt
    _setData["refreshtime"] = _zt + _con["lasttime"]
    # 获取当前层数
    _oldLayer = data.get("layer", 1)
    _layer = _oldLayer - _con["rollbacklayer"]
    _setData["layer"] = _layer if _layer > 0 else 1
    # 获取最大层数
    _setData["toplayer"] = data.get("toplayer", 0)
    # 已经完成的event
    _setData["finishevent"] = []

    # 额外的buff
    _setData["extbuff"] = {}
    # 使用过的英雄
    _setData["usehero"] = []
    # 本轮挑战层数
    _setData["layernum"] = 0
    # 镜灵
    _setData["mirror"] = {}
    # 未出现镜灵的次数
    _setData["mirrornum"] = 0
    # 是否击败boss
    _setData["killboss"] = 0
    # 是否击败镜灵
    _setData["killmirror"] = 0
    # 本层已经生成的事件
    _setData["eventdata"] = generateEvent(_setData)
    #  buff列表
    _setData["bufflist"] = []
    # 插入数据
    g.mdb.update("shilianzhita", {"uid": uid}, _setData, upsert=True)

    # 删除对应活动进度

    if "_id" in _setData:
        del _setData["_id"]
    _setData["new"] = _new

    # 删除领奖信息
    _ctype = "slzt_task"
    g.delAttr(uid, {"ctype": _ctype})

    return _setData


# 设置玩家的数据
def setData(uid, data):
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt

    g.mdb.update("shilianzhita", {"uid": uid}, _setData)

# 获取玩家的数据
def getData(uid, keys='_id', where=None):
    _res = {}

    _w = {"uid": uid,}
    _options = {}
    if keys != '':
        _options["fields"] = keys.split(",")

    if where != None:
        _w.update(where)

    _data = g.mdb.find1("shilianzhita", _w, **_options)
    _res = _data
    _nt = g.C.NOW()
    if not _data or _nt >= _data["refreshtime"]:  # 没有数据新生成
        _res = initData(uid)
    return _res

# 获取当前层数对应的区间
def getLayerCom(layer):
    _con = g.GC["shilianztcom"]
    _layerInfo = _con["layerinfo"]
    _res = _layerInfo[0]
    for i in _layerInfo:
        if i["area"][0] <= layer <= i["area"][1]:
            _res = i
            break
    return _res



def generateEvent(data):
    _res = {}
    _con = dict(g.GC["shilianztcom"])
    _maxEventNum = 4
    _eventInfo = g.C.dcopy(_con["event"])
    _layerCom = getLayerCom(data["layer"])

    _eventMaxNum = _layerCom["eventmaxnum"]
    _buffColor = _layerCom["buffcolor"]
    _shopItem = _layerCom["shopitem"]
    # 随机出来的event的id
    _randEvent = []
    _eventData = {}
    _setData = {}
    # 获取权重
    _useEventNum = {}
    for i in xrange(_maxEventNum):
        # 如果已经随机到了最大数量
        if len(_randEvent) >= _maxEventNum:
            break
        _eventList = [x for x in _eventInfo.values() if _useEventNum.get(x["eid"], 0) < _eventMaxNum.get(x["eid"], 99)]
        _base = sum([x['p'] for x in _eventList])

        # 随机出来的事件
        _event = g.C.getRandArr(_eventList, _base)
        _eid = _event["eid"]
        _useEventNum[str(_eid)] = _useEventNum.get(str(_eid), 0) + 1
        # 如果是buff
        if _eid == "2":

            _blacklist = []
            _buffCon = g.GC["shilianztbuff"]
            _buffColorCon = g.GC["pro_shilianztbuff"]
            _randBuff = []
            for i in xrange(3):
                _buffList = []
                # 获取所有颜色对应的buff类型
                for color in _buffColor:
                    for stype,buffs in _buffColorCon[color].items():
                        if stype in _blacklist:
                            continue
                        _buffList.extend(buffs)

                # 随机3个类型
                _buffId = g.C.RANDLIST(_buffList, 1)[0]
                _blacklist.append(_buffCon[_buffId]["parameter"]["stype"])
                _randBuff.append(_buffId)

            _randEvent.append({"eid": _eid, "bid": _randBuff})
        # 随机答题
        elif _eid == "3":
            # 获取随机出来的idx
            questions = _con["questions"]
            # 获取随机出来的idx
            _idx = g.C.RANDLIST(range(len(questions)))[0]
            _randEvent.append({"eid": _eid, "idx": _idx})
        elif _eid == "4":
            # 获取随机出来的idx
            _shopCon = g.m.shopfun.getShopItemCon()
            _nt = g.C.NOW()
            _zt = g.C.ZERO(_nt)
            _itemlist = []
            for _idx, i in enumerate(_shopItem):
                _itemCon = _shopCon[str(i)]
                _prize = g.C.RANDARR(_itemCon['items'], _itemCon['base'])
                # 加入商品唯一的标识
                _prize['idx'] = len(_itemlist)

                _itemlist.append(_prize)
            _randEvent.append({"eid": _eid, "itemlist": _itemlist})
        else:
            _randEvent.append({"eid": _eid})

    return _randEvent


def getTaskRec(uid):
    # 获取商店数据
    _res = []
    _ctype = "slzt_task"
    _w = {"ctype": _ctype}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
    return _res

# 设置记录领奖
def setTaskRec(uid, _idx):
    _ctype = "slzt_task"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"$push": {"v": _idx}})


# 获取成就任务领奖情况
def getFoeverTaskRec(uid):
    # 获取商店数据
    _res = []
    _ctype = "slzt_foevertask"
    _w = {"ctype": _ctype}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
    return _res

# 设置成就任务领奖情况
def setFoeverTaskRec(uid, _idx):
    _ctype = "slzt_foevertask"
    _w = {"ctype": _ctype}
    g.setAttr(uid, _w, {"$push": {"v": _idx}})


# 获取今天的挑战次数
def getLayertNum(uid):
    return g.getAttrByCtype(uid,'slzt_fightnum',default=0)

# 设置今天的挑战次数
def setLayerNum(uid,num):
    g.setAttr(uid, {"ctype": 'slzt_fightnum'}, {"v":num})


# 获取红点
def getHongDian(uid):
    _res = {"slzt": {'task': 0, 'forevertask': 0}}
    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        return _res
    # _data = getData(uid)
    # _nt = g.C.NOW()
    # if not _data or _data and _data["refreshtime"] < _nt:
    #     _res["hltb"] = 1
    #     return _res
    _data = getData(uid)
    _con = dict(g.GC["shilianztcom"])

    _taskCon = _con["task"]
    _recList = g.m.shilianztfun.getTaskRec(uid)
    for idx,_i in enumerate(_taskCon):
        if _data["layernum"] >= _i['pval'] and idx not in _recList:
            _res['slzt']['task'] = 1
            break

    _ftaskCon = _con['foevertask']
    _frecList = g.m.shilianztfun.getFoeverTaskRec(uid)
    for idx,_i in enumerate(_ftaskCon):
        if _data["toplayer"] >= _i['pval'] and idx not in _frecList:
            _res['slzt']['forevertask'] = 1
            break
    return _res


# 增加buff
def addBuff(uid, herolist, data):
    if data["extbuff"]:
        _res = []
        for role in herolist:
            if "hid" not in role:
                _res += [role]
                continue
            # 判断根据job的buff
            _buff = {}
            _job = str(role["job"])
            for k, v in data["extbuff"].items():
                _buffInfo = k.split("_")
                # 如果有根据职业加的buff
                if len(_buffInfo) >= 2 and _buffInfo[1] != _job:
                    continue
                _key = _buffInfo[0]
                if _key not in _buff: _buff[_key] = 0
                _buff[_key] += v

            _heroInfo = g.m.herofun._reSetHerosBuff(uid, [role], isset=0, extbuff=_buff).values()
            role.update(_heroInfo[0])
            # _heroInfo[0]['lv'] = role['lv']
            # _heroInfo[0]['pos'] = role['pos']
            # _heroInfo[0]['job'] = role['job']
            # _heroInfo[0]['zhongzu'] = role['zhongzu']
            # _heroInfo[0]['dengjielv'] = role['dengjielv']
            # _heroInfo[0]['xpskill'] = role['xpskill']
            # _heroInfo[0]['normalskill'] = role['normalskill']
            _res.append(role)
    else:

        _res = herolist
    return _res



if __name__ == '__main__':
    # uid = g.buid("ysr1")
    # g.debugConn.uid = uid
    # print generateEvent({"layer":1})
    g.toup.send()



