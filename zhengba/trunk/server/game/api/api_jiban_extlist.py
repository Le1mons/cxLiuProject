#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
羁绊 - 额外列表
'''

def proc(conn, data, key=None):
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

    _plid = str(data[0])
    gud = g.getGud(uid)

    # 获取评论id对应的那些英雄id
    _hidData = g.GC["pre_hero_pinglun"][_plid]
    # 只要橙色以上的
    _hidList = [hid for hid, color in _hidData.items() if color >= 4]
    #容错处理
    g.event.emit("chkherojiban", uid, _plid)
    # 获取自己英雄列表
    _heroData = g.m.herofun.getMyHeroList(uid, where={"hid": {"$in": _hidList}, "star": {"$gte": 5}}, keys="lv,uid,color,hid,star,jiban")
    for hero in _heroData:
        hero["plid"] = _plid
        hero["tid"] = str(hero["_id"])
        hero["name"] = gud["name"]
        hero["star"] = hero["star"]
        hero["ext"] = 0
        # 如果已经上阵就跳过
        if "jiban" in hero and hero["jiban"]:
            continue
        del hero["_id"]
        _resData.update({hero["tid"]: hero})

    # 获取玩家的援助uid列表
    userList = g.m.jibanfun.getBorrowUserList(uid)

    # 获取派遣列表
    data = g.crossDB.find("crossplayattr", {"ctype": "jiban_rechero", "uid": {"$in": userList}})
    for heroinfo in data:
        for tid, hero in heroinfo["v"].items():
            if hero["uidinfo"] or hero["plid"] != _plid:
                continue
            hero["ext"] = 1
            hero["name"] = heroinfo["name"]
            _resData.update({tid: hero})

    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid('320')

    g.debugConn.uid = uid
    _data = ['3110']
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'