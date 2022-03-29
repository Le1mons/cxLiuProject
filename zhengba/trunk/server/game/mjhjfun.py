#!/usr/bin/python
#coding:utf-8
'''
名将绘卷功能
'''

import g

# 获取名将绘卷列表
def getMjhjList(uid):
    _res = {}
    _ctype = "mjhj_list"
    _w = {"ctype":_ctype}
    _data = g.getAttrOne(uid, _w)
    if _data:
        _res = _data["v"]
    return _res



# 设置名将绘卷
def onAddMjhjList(uid, hid, num=1):
    _ctype = "mjhj_list"

    _heroCon = g.GC["hero"][str(hid)]
    _plid = _heroCon["pinglunid"]
    _color = _heroCon["color"]
    if _color != 4:
        return
    # 获取当前名将绘卷数据
    _mjhjData = getMjhjList(uid)

    _setData = _mjhjData.get(_plid, {"getnum": 0, "lv": 0})
    _setData["getnum"] += num
    # 设置次数
    g.setAttr(uid, {"ctype": _ctype}, {"v.{0}".format(_plid): _setData})
    g.m.mymq.sendAPI(uid, 'mjhj_redPoint', '1')



# 获取buff
def getBuff(uid):
    _mjhjdata = getMjhjList(uid)
    _heroCon = g.GC["hero"]
    _mjhjCon = g.GC["mjhj"]
    _allbuff = {}
    for plid, v in _mjhjdata.items():
        _hid = plid + "5"
        _hjtype = _heroCon[_hid]["huijuantype"]
        _buff = _mjhjCon["buffinfo"][str(_hjtype)][str(v["lv"])]
        for k, v in _buff.items():
            if k not in _allbuff:_allbuff[k] = 0
            _allbuff[k] += v
    return _allbuff

# 红点
def getHongDian(uid):
    _res = {"mjhj": 0}
    _mjhjData = g.m.mjhjfun.getMjhjList(uid)
    for _plid, _info in _mjhjData.items():
        if _info["lv"] >= len(g.GC["mjhj"]["upinfo"]):
            continue
        _upCon = g.GC["mjhj"]["upinfo"][_info["lv"]]
        if _upCon["mainnum"] > 0:
            continue
        if _info["getnum"] >= _upCon["getnum"]:
            _res["mjhj"] = 1
            return _res
    return _res



#监听充值成功事件
g.event.on("addmjhj",onAddMjhjList)


if __name__ == '__main__':

    uid = g.buid('ysr1')
    #

    print getHongDian(uid)
    # _mjhjData = g.m.mjhjfun.getMjhjList(uid)
    # for _plid, _info in _mjhjData.items():
    #     _info["lv"] = 3
    # g.setAttr(uid, {"ctype": "mjhj_list"}, {"v":_mjhjData})
