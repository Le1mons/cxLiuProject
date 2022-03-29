#!/usr/bin/python
# coding:utf-8

'''
英雄主题活动
'''
import g


# 获取配置
def getCon(key):
    res = g.GC['stagefund'][key]
    return res


# 获取数据
def getData(uid, key):

    _myData = g.mdb.find1('stagefund', {'uid': uid, 'key': key}, fields=['_id'])
    _set = {}
    _con = getCon(key)
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData or _myData["refreshtime"] <= _nt:
        _set = _myData = {
            "exp":0,
            "pay":[],
            "free":[],
            "ctime": _nt,
            "lasttime":_nt,
            "refreshtime": _zt + _con["refreshday"] * 24 * 3600,
            "buy":0,
            "uid":uid
        }
        g.mdb.update('stagefund', {'uid': uid, 'key': key}, _set, upsert=True)
    return _myData


# 设置玩家的数据
def setData(uid,key, data):
    _setData = {"$set": {}}
    _nt = g.C.NOW()
    if str(data.keys()).find("$") != -1:
        _setData.update(data)
    else:
        _setData["$set"].update(data)

    _setData["$set"]["lasttime"] = _nt

    g.mdb.update("stagefund", {"uid": uid, 'key': key}, _setData)



# 监听战旗购买
def OnFlagSuccess(uid, act, money, orderid, payCon):

    _stagefundCon = g.GC["stagefund"]
    _proList = {v["proid"]: k for k, v in _stagefundCon.items()}
    if act not in _proList:
        return
    _key = _proList[act]
    _con = _stagefundCon[_key]

    _data = getData(uid, _key)
    if _data["buy"]:
        g.success[orderid] = False
        return
    _data["buy"] = 1

    # _data["exp"] += _con["upflagexp"] * 5
    setData(uid, _key,  {"buy":_data["buy"]})


# 监听战旗数据
def OnAddExp(uid, key, num=1):

    _data = getData(uid, key)
    _con = g.m.stagefundfun.getCon(key)

    _addExp = num * _con["upflagexp"]

    setData(uid, key, {"$inc":{"exp":_addExp}})


# 红点数据
def getHongDian(uid):
    _res = {"stagefund": []}
    _con = g.GC['stagefund']
    for key, info in _con.items():
        _flagPrize = info['flagprize']
        _data = g.m.stagefundfun.getData(uid, key)

        _lv = int(_data["exp"] / info["upflagexp"])

        _prize = []
        for id in xrange(1, _lv + 1):
            if str(id) not in _flagPrize:
                continue
            if str(id) not in _data["free"]:
                _prize.extend(_flagPrize[str(id)]["freeprize"])
            if _data["buy"] and str(id) not in _data["pay"]:
                _prize.extend(_flagPrize[str(id)]["payprize"])
        if _prize:
            _res["stagefund"].append(key)

    return _res

# 骰子购买
g.event.on('chongzhi', OnFlagSuccess)
g.event.on('stagefundExp', OnAddExp)

if __name__ == '__main__':
    uid = g.buid("ysr1")
    # g.debugConn.uid = uid
    # print   divmod(15, 8)

    print getHongDian(uid)
