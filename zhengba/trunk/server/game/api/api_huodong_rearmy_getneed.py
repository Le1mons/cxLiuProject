#!/usr/bin/python
#coding:utf-8
'''
魔镜置换 - 获取所需钻石
'''

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {"d": {"need": [],'needarmynum':需求英雄数量,'zhongzu':种族,'star':星级}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def doproc(conn, data):
    _res = {"s": 1}
    if not hasattr(conn, "uid"):
        _res["s"] = -102
        _res["errmsg"] = g.L('global_unlogin')
        return _res

    uid = conn.uid
    # if g.getGud(uid)['ctime'] >= g.GC['flag']['base']['timestamp'] and g.C.getDateDiff(g.getGud(uid)['ctime'],g.C.NOW()) < 7:
    #     _res["s"] = -10
    #     _res["errmsg"] = g.L('global_noopen')
    #     return _res

    # hdid = int(data[0])
    _tid = str(data[0])
    #获取已开启的活动列表
    # _hdList = g.m.huodongfun.getOpenList(uid, 1)
    # #活动未开放无法获取列表
    # if hdid not in _hdList:
    #     _res["s"] = -1
    #     _res["errmsg"] = g.L('global_nohuodong')
    #     return _res

    #判断是否上阵
    defhero = set()
    _rivalInfo = g.mdb.find1('zypkjjc', {'uid': uid})
    if _rivalInfo:
        _def = _rivalInfo.get('defhero', {})
        defhero = set(_def[t] for t in _def)

    if _tid in defhero:
        _res["s"]=-4
        _res["errmsg"]=g.L('huodong_rearmy_change_-4')
        return _res

    #主佣兵
    _army = g.m.herofun.getMyHeroList(uid, '_id', {'_id': g.mdb.toObjectId(_tid)})
    if _army == None:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_armyerr')
        return _res

    _army = _army[0]
    if 'islock' in _army and _army['islock'] == 1:
        _res["s"]=-4
        _res["errmsg"]=g.L('huodong_rearmy_change_-4')
        return _res

    # 获取活动数据
    # _hdInfo = g.m.huodongfun.getHuodongInfoById(hdid)
    _hdData = g.GC['mjzh']['data']
    _needInfo = {tmp['val']: (tmp['needrate'], tmp['need']) for tmp in _hdData['arr']}
    _needInfo = _needInfo[int(_army['star'])]
    _resData = {}
    _resData['need'] = _needInfo[1]
    _resData['needarmynum'] = _needInfo[0]
    _resData['zhongzu'] = _army['zhongzu']
    _resData['star'] = _army['star']
    _res['d'] = _resData
    return _res
