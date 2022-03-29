#!/usr/bin/python
# coding:utf-8
'''
风暴战场 - 查看空闲要塞
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [奖励的索引:int]
    :return:
    ::

        {"d":{'last':{区域: [要塞品质]}}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    # 没有领奖并且还没到时间
    _specialArea = str(g.GC['storm']['base']['special'])
    _w = {'over':{'$exists':0},'etime':{'$gt':g.C.NOW()},'stime':{'$lt':g.C.NOW()},'$or':[{'area':{'$ne':_specialArea}},{'uid':uid,'area':_specialArea}]}
    _myData = g.mdb.find('storm',_w,fields=['_id','area','color'])
    _last = {}
    for i in _myData:
        if i['area'] not in _last:
            _last[i['area']] = [i['color']]
        else:
            _last[i['area']].append(i['color'])
    _rData = {}
    # 剩下的要塞
    for area,colors in g.GC['storm']['base']['region'].items():
        colors = list(colors)
        for v in _last.get(area, []):
            colors.remove(v)
        _rData[area] = colors

    if len(_rData.get(_specialArea, [])) >= 6:
        _rData[_specialArea] = ['7']
    else:
        _rData[_specialArea] = []

    _res['d'] = {'last':_rData}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print doproc(g.debugConn, data=[])