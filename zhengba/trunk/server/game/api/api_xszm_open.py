#!/usr/bin/python
#coding:utf-8
'''
限时招募-开启界面
'''

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g
def proc(conn,data):
    """

    :param conn:
    :param data: [抽奖次数:int(1, 15)]
    :return:
    ::

        {'d': {'myinfo': {},'rank':{},'num':还剩多少次必出五星,'hdinfo':{活动信息}},
         's': 1}
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {'s': 1}
    uid = conn.uid
    hdinfo = g.m.xszmfun.getHuodongData()
    # 活动未开启
    if not hdinfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('xszm_open_-1')
        return _res

    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,idx')
    # 免费次数
    _con = g.GC['xianshi_zhaomu']
    hdData['freenum'] = 1 if g.m.xszmfun.isFreeNumExists(uid) else 0
    # 排行信息
    _rankInfo = g.m.xszmfun.getRankData(hdinfo, uid, hdData)
    # 还剩多少次必出五星
    _num = _con['data']['15']['special'] - hdData.get('idx', 0)
    if _num < 0:
        _num = len(_con['data']['1']['dlz']) - hdData['idx'] + _con['data']['15']['special']

    _res['d'] = {"myinfo":hdData,'rank':_rankInfo,'num':_num,'hdinfo': hdinfo}
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])