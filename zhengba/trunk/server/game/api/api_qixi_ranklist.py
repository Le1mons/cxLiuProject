#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
七夕活动 -ranklist
'''

def proc(conn, data, key=None):
    """

    :param conn:
    :param 参数1: 必须参数	类型: <type 'str'>	说明:
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        {'d': {'myrank': 1,
       'myval': 1,
       'ranklist': [{'headdata': {u'chatborder': u'1',
                                  u'chenghao': u'',
                                  u'guildname': u'\u6c34\u7535\u8d39',
                                  u'head': u'1000',
                                  u'headborder': u'43',
                                  u'lasttime': 1614700785,
                                  u'logintime': 1614663872,
                                  u'lv': 280,
                                  u'model': u'11023',
                                  u'name': u'temp_a1f2bd50',
                                  u'svrname': u'\u6d4b\u8bd5',
                                  u'title': 1,
                                  u'uid': u'0_5e8e10f49dc6d64d2395de58',
                                  u'uuid': u'0821784',
                                  u'vip': 14,
                                  u'wzyj': 0,
                                  u'zhanli': 1507691},
                     'name': u'\u6d4b\u8bd5',
                     'rank': 1,
                     'val': 1}]},
        's': 1}

    """



    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _hd = g.m.huodongfun.getHDinfoByHtype(76,ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData["hdid"] = _hd["hdid"]
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
    _ctype = "qixi_toupiaonum"
    _cacheRank = g.crossMC.get("qixi_rank_{}".format(_chkData["hdid"]))
    if _cacheRank:
        _rankList = _cacheRank["list"]
        _uid2rank = _cacheRank['uid2rank']
    else:
        _rankList = []
        _uid2rank = {}

        _list = g.crossDB.find('crossplayattr', {'k': _chkData["hdid"], "ctype": _ctype},fields=['_id', 'v', "uid"], sort=[['v', -1], ['lasttime', 1]], limit=50)
        _rank = 1

        # _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _list:
            _temp = {}
            _temp['headdata'] = {}
            try:
                _temp['headdata'] = \
                g.crossDB.find1("cross_friend", {"uid": i["uid"]}, fields={'_id': 0, 'head.defhero': 0})["head"]
            except:
                print i["uid"], "getGpjjcRank"

            _temp['rank'] = _rank
            _temp['val'] = i['v']
            _temp['name'] = _temp['headdata'].get("svrname", "暂无区服")

            _uid2rank[i["uid"]] = {"rank":_rank, "val":i["v"]}
            _rankList.append(_temp)
            _rank += 1

        if len(_rankList) > 0:
            g.crossMC.set("qixi_rank_{}".format(_chkData["hdid"]), {"list": _rankList, 'uid2rank': _uid2rank}, 60)

    _myRank = -1

    _myData = g.m.crosscomfun.CATTR().getAttrOne(uid, {'ctype': _ctype, "k":_chkData["hdid"]})
    _num = 0
    if _myData:
        _num = _myData['v']
    if uid in _uid2rank:
        _myRank = _uid2rank[uid]["rank"]
        _num = _uid2rank[uid]["val"]
    # elif _num > 0:
    #     _myRank = g.crossDB.count('crossplayattr', {'k': _chkData["hdid"], "ctype": _ctype,  "v":{"$gt": _num}}) + 1

    _res["d"] = {'ranklist': _rankList, 'myrank': _myRank, 'myval': _num}

    return _res


if __name__ == '__main__':

    g.debugConn.uid = g.buid('1')
    from pprint import pprint

    _data = ['0_5aec54eb625aee6374e25dff']
    pprint (doproc(g.debugConn,_data))