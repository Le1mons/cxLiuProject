#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 下阵
'''
def proc(conn, data,key=None):
    """
    获得通告函的信息

    :param conn:
    :param data:
    :param key:
    :return:
    ::
        {'d': {'tonggaohan': {'num': 1598, 'refreshtime': -1}}, 's': 1}


    """


    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1
    # 羁绊id
    _jid = str(data[0])
    # 位置
    _pos = int(data[1])

    # 获取羁绊的数据
    _jiBanInfo = g.m.jibanfun.getJiBanData(uid, _jid)
    _uphero = _jiBanInfo["uphero"]
    _downTid = ""
    _downData = {}
    # 判断当前位置是否有人
    for _downTid, _downData in _uphero.items():
        if _downData["pos"] == _pos:
            # 先卸下之前歌手
            del _uphero[_downTid]
            break

    # 判断当前位置是否有人
    if not _downTid:
        # 不需要下阵
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('jiban_downhero_res_-1')
        return _chkData

    _chkData["uphero"] = _uphero
    _chkData["hero"] = _downData
    _chkData["jid"] = _jid
    _chkData["tid"] = _downTid
    _chkData["jibaninfo"] = _jiBanInfo

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    gud = g.getGud(uid)

    _uphero = _chkData["uphero"]
    _hero = _chkData["hero"]
    _jid = _chkData["jid"]
    _tid = _chkData["tid"]
    _jiBanInfo = _chkData["jibaninfo"]

    _sendData = {}
    _setData = {}
    # 如果当前位置有人
    if _tid:
        # 判断是租借的
        if "isext" in _hero and _hero["isext"]:
            _dispatch2Info, name = g.m.jibanfun.getDispatchHero(uid)
            if _tid in _dispatch2Info:
                # 删除租借状态
                del _dispatch2Info[_tid]["uidinfo"][_hero["uid"]]
        else:
            # 设置英雄解绑羁绊
            g.m.herofun.updateHero(uid, _tid, {"jiban": ""})
            #  刷新英雄数据
            _heroChange = g.m.herofun.reSetHeroBuff(uid, _tid, ["jiban"])
            _sendData.update(_heroChange)

    _setData["uphero"] = _uphero
    _setData["lv"] = g.m.jibanfun.chkJiBan(_jid, _uphero)
    # 设置羁绊
    g.m.jibanfun.setJiBanData(uid, _jid, _setData)

    # 等级发生改变就刷新英雄数据
    if _jiBanInfo["lv"] != _setData["lv"]:
        # 计算英雄属性
        for tid, v in _uphero.items():
            if v["isext"]:
                continue
            _heroChange = g.m.herofun.reSetHeroBuff(uid, tid, ['jiban'])
            _sendData.update(_heroChange)
    # 推送事件
    g.sendChangeInfo(conn, {"hero": _sendData})

    _jiBanInfo["lv"] = _setData["lv"]
    _jiBanInfo["uphero"] = _uphero
    _res["d"] = _jiBanInfo
    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    _data = ['2']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'