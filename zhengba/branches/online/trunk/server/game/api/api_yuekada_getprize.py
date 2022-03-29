# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/15:50
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _nt = g.C.NOW()
    _yuekaData = g.getAttrOne(uid, {"ctype": "Dayueka_getprize"}, keys="_id,k,v,lasttime")
    _yuekaInfo = g.m.yuekafun.getDayuekaInfo(uid)
    if not _yuekaInfo:
        _res["s"] = -2
        _res["errmsg"] = g.L("signmrqd_res_-2")
        return (_res)

    etime = _yuekaInfo["etime"]
    # 判断是否激活大月卡
    if _yuekaInfo["k"] != 2:
        _res["s"] = -1
        _res["errmsg"] = g.L("signmrqd_res_-1")
        return (_res)

    # 月卡已激活
    if _yuekaData != None:
        lasttime = _yuekaData["lasttime"]
        _diffDay = g.C.getTimeDiff(_nt, lasttime, 0)
        # 判断今天是否领取
        if _diffDay == 0:
            _setData = {"k": 2, "isgot": 1}
            _res["s"] = -2
            _res["errmsg"] = g.L("signmrqd_res_-2")
            return (_res)

    # 获取配置的奖励
    _prizeData = g.GC["xiaoyuka"]["prize"]

    _setData = {"k": 2,"isgot":1}

    _rInfo = g.setAttr(uid, {"ctype": "Dayueka_getprize"}, _setData)


    _prizeData = list({'a': i['a'], 't': i['t'], 'n': i['n']} for i in _prizeData)
    # _prizeData = [{'a': 'attr', 't': 'rmbmoney', 'n': 10}]
    _changeInfo = g.getPrizeRes(uid, _prizeData, {'act': "DAYUEKA"})
    # 判断是否已经到达过期时间
    if _nt > _yuekaInfo["etime"]:
        _rInfo = g.setAttr(uid, {"ctype": "Dayueka_getprize"}, {"lasttime": 0})

    g.sendChangeInfo(conn, _changeInfo)
    isget = 1
    _res["d"] = {"prize": _prizeData, "isget": isget, "etime": etime}
    return _res


if __name__ == "__main__":
    g.debugConn.uid = "0_5aea7b67625aee5548970d49"
    print doproc(g.debugConn, [])
