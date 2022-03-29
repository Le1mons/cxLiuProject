#!/usr/bin/python
#coding:utf-8

import g

'''
元宵活动之谜语人
'''
htype=70
#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    _libaoCon = g.GC["riddles"]["libao"]

    if act not in _libaoCon:
        return

    # 判断是否开启
    _nt = g.C.NOW()
    hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    if not hdinfo:
        return
    _hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr,lasttime')
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _val = hdData["val"]
    if hdData["lasttime"] < _zt:
        # 随机3个谜语
        _topic = g.GC["riddles"]["topic"]
        _day = g.C.getDateDiff(hdinfo["stime"], _nt)
        if _day >= len(_topic):
            _randomList = _topic[-1]
        else:
            _randomList = _topic[_day]
    # 判断是否超过购买次数
    if hdData["gotarr"]["libao"].get(act, 0) >= _libaoCon[act]["buynum"]:
        return
    _prize = _libaoCon[act]["prize"]

    hdData["gotarr"]["libao"][act] = hdData["gotarr"]["libao"].get(act, 0) + 1
    # 设置购买数据
    g.m.huodongfun.setHDData(uid, _hdid, {"gotarr.libao": hdData["gotarr"]["libao"]})
    _sendData = g.getPrizeRes(uid, _prize, act={'act': 'riddles_libao', 'prize': _prize, "proid": act, "hdid": _hdid})
    # 推送
    g.sendUidChangeInfo(uid, _sendData)


def getHongDian(uid):
    _res = {"riddles": 0}
    _openinfo = g.m.riddles_70.isOpen(uid)
    if not _openinfo.get('act'):
        return _res

    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    hdid = _openinfo["hdid"]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime,topic')
    if hdData["lasttime"] < _zt:
        # 随机3个谜语
        _topic = g.GC["riddles"]["topic"]
        _day = g.C.getDateDiff(_openinfo["stime"], _nt)
        if _day >= len(_topic):
            _randomList = _topic[-1]
        else:
            _randomList = _topic[_day]
        # 设置今天的vip等级
        g.m.huodongfun.setHDData(uid, hdid, {"gotarr.riddle": {}, "topic": _randomList})
        hdData["gotarr"]["riddle"] = {}
        hdData["topic"] = _randomList
    if len(hdData["gotarr"]["riddle"]) < 3:
        _res["riddles"] = 1
    return _res







g.event.on('chongzhi', onChongzhiSuccess)

if __name__ == "__main__":
    _prize = genrateCardPrize(1,1)
    print _prize