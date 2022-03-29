#!/usr/bin/python
# coding:utf-8
'''
装备 - 一键合成装备
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [装备id:str, 要合成的数量:int]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # # 装备的id
    # eid = data[0]
    # 装备类型
    _type = str(data[0])
    _isyulan = int(data[1])


    gud = g.getGud(uid)
    _con = g.GC["pro_typeequip"]
    # 装备不存在
    if _type not in _con:
        _res['s'] = -1
        _res['errmsg'] = g.L('equip_hecheng_res_-1')
        return _res

    # 获取当前玩家拥有对应的type的装备
    _equipList = g.mdb.find("equiplist", {"uid":uid, "type":_type})
    # 格式化装备数据
    _equipData = {}
    for equip in _equipList:
        if equip["num"] - equip["usenum"] > 0:
            _equipData[equip["eid"]] = equip["num"] - equip["usenum"]

    # 获取初始数据
    _baseEquipData = g.C.dcopy(_equipData)
    _need = {}

    _chkjinbi = {}
    _oldEid = "99999999"
    _allHcNum = 0
    for i in _con[_type]:
        # 本次合成的个数
        _chkContinue = 0
        _chkBreak = 0
        _hcnum = _equipData.get(_oldEid, 0) // 3

        _oldEid = i["id"]
        if _hcnum <= 0:
            continue
        # 判断是否有消耗
        if not i['need']:
            continue
        _delEquipData = {}
        _delJinBi = 0
        for n in i['need']:
            if n["a"] == "equip":
                _delEquipData[n["t"]] = _delEquipData.get(n["t"], 0) + n["n"]
            elif n["t"] == "jinbi":
                _delJinBi += n["n"]
        _realNum = 0
        for val in xrange(_hcnum):
            # _num = _delEquipData.values()[0] if _delEquipData.values() else 0
            if not _delEquipData.keys():
                break
            _delid = _delEquipData.keys()[0]
            _num = _delEquipData[_delid]
            if _num * val > _equipData.get(_delid, 0):
                break
            if _chkjinbi.get("jinbi", 0) + _delJinBi > gud["jinbi"]:
                break
            _realNum += 1
            _chkjinbi["jinbi"] = _chkjinbi.get("jinbi", 0) + _delJinBi

            _equipData[i["id"]] = _equipData.get(i["id"], 0) + 1

        # _need += list(i['need']) * _hcnum
        # _prize += [{"a":"equip", "t": i["eid"], "n": _hcnum}]
        # 加上本次合成的数据
        _equipData[_delid] = _equipData.get(_delid, 0) - _num * _realNum
        _allHcNum += _realNum

    if _allHcNum <= 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('equip_hecheng_res_-3')
        return _res

    _need = []
    _prize = []

    for eid, num in _equipData.items():

        _diffNum = num - _baseEquipData.get(eid, 0)
        if _diffNum > 0:
            _prize += [{"a": "equip", "t": eid, "n": abs(_diffNum)}]

        elif _diffNum < 0:
            _need += [{"a": "equip", "t": eid, "n": abs(_diffNum)}]

    _need += [{"a": "attr", "t": "jinbi", "n": _chkjinbi.get("jinbi", 0)}]

    _chkRes = g.chkDelNeed(uid, _need)

    # 合成材料不足
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chkRes['t']
        else:
            _res["s"] = -104
            _res[_chkRes['a']] = _chkRes['t']
        return _res

    _resData = {}
    # 如果是預覽
    if _isyulan:
        _resData["need"] = _need
        _resData["prize"] = _prize
        _res["d"] = _resData
        return _res


    _delData = g.delNeed(uid, _need,logdata={'act': 'equip_yjhecheng', "type": _type})

    g.sendChangeInfo(conn, _delData)

    _prizeMap = g.getPrizeRes(uid, _prize, act={'act': 'equip_yjhecheng', "type": _type, "old": _baseEquipData, "new": _equipData})
    g.sendChangeInfo(conn, _prizeMap)
    #监听装备获得成就
    # g.m.taskfun.chkTaskHDisSend(uid)
    for p in _prize:
        g.event.emit("GetEquip", uid, p["t"], val=p["n"])
    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "118", _allHcNum)
    #日常任务合成装备监听
    g.event.emit("dailytask", uid, 8, _allHcNum)
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr2")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1", "1"])