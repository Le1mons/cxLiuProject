#!/usr/bin/python
# coding:utf-8
'''
活动 - 王者招募-打开
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
htype = 63
def proc(conn, data,key=None):

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _hdinfo = g.m.wangzhezhaomufun.getHuoDongInfo()
    # 判断活动是否开启
    if not _hdinfo:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('challenghero_fight_res_1')
        return _chkData
    if len(data) > 0:
        _type = data[0]
        if _type not in _hdinfo["data"]["openinfo"]:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('challenghero_fight_res_1')
            return _chkData
        _chkData["type"] = _type

    _chkData["hdinfo"] = _hdinfo
    _chkData["hdid"] = _hdinfo["hdid"]
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _hdinfo = _chkData["hdinfo"]
    _hdid = _chkData["hdid"]

    _resData = {}
    _resData['info'] = _hdinfo
    hdData = g.m.huodongfun.getHDData(uid, _hdid, keys='_id,val,gotarr,lasttime')
    # 如果数据没有生成
    if not hdData:
        hdData = g.m.wangzhezhaomu63.initHdData(uid, _hdid)


    if "zhouka" in _hdinfo["data"]["openinfo"]:
        _Info = g.m.wangzhezhaomufun.getZhouKaInfo(uid, _hdinfo)
        # 周卡领完就不显示了
        if len(_Info["reclist"]) >= len(_hdinfo["data"]["openinfo"]["zhouka"]["arr"]):
            del _hdinfo["data"]["openinfo"]["zhouka"]
            if "type" in _chkData and _chkData["type"] == "zhouka":
                _res["d"] = _resData
                return _res


    if "type" not in _chkData:
        _res["d"] = _resData
        return _res


    _hdData = {
        # 获取玩家任务数据
        "task": g.m.wangzhezhaomufun.getTaskInfo,
        "zhouka":g.m.wangzhezhaomufun.getZhouKaInfo,
        "zhaomu":g.m.wangzhezhaomufun.getZhaoMuInfo,
        "boss": g.m.wangzhezhaomufun.getBossInfo,
        "libao": g.m.wangzhezhaomufun.getLiBaoInfo,
        "peiyang": g.m.wangzhezhaomufun.getPeiYangInfo,
    }
    # for key in _hdinfo["data"]["openinfo"]:
    #     _resData[key] = _hdData[key](uid, _hdinfo)
    _resData[_chkData["type"]] = _hdData[_chkData["type"]](uid, _hdinfo)

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    data = ["zhaomu"]
    _r = doproc(g.debugConn, data)
    pprint(_r)
    print 'ok'