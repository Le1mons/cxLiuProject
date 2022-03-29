#!/usr/bin/python
# coding:utf-8
'''
公会争锋 - 打开段位奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要打开的奖励段位:str]
    :return:
    ::

        {"d":{
            'prizedata': {'已领取的索引':{'uid':玩家uid,'prize':[奖励信息]}}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要领取的段位
    _segment = str(data[0])
    gud = g.getGud(uid)
    _dKey = g.C.getWeekNumByTime(g.C.NOW())
    _data = g.m.gonghuifun.GHATTR.getAttrOne(gud['ghid'],{'k':_dKey,'ctype':'segmentprize_{}'.format(_segment)},keys='maxnum,prizedata',fields=['_id'])
    # 没有该段位奖励 查看跨服数据库有没有信息
    if not _data:
        _ghData = g.m.gonghuifun.getGongHuiInfo(gud['ghid'])
        _data = {'maxnum':_ghData['maxusernum']}
        _crossData = g.m.competingfun.CATTR().getAttrOne(gud['ghid'], {'k': _dKey, 'ctype': 'segmentprize_{}'.format(_segment)},fields=['_id','uid'])
        # 没有就立即增加一条
        if _crossData:
            _set = {'k': _dKey, 'maxnum': _ghData['maxusernum'],'prizedata':{}}
            g.m.gonghuifun.GHATTR.setAttr(gud['ghid'],{'ctype':'segmentprize_{}'.format(_segment)},_set)

    for idx,temp in _data.get('prizedata',{}).items():
        temp['headdata'] = g.m.userfun.getShowHead(temp['uid'])
        del temp['uid']

    _res['d'] = _data
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq10")
    gud = g.getGud(uid)
    g.debugConn.uid = uid
    # print doproc(g.debugConn, data=['1','djlv'])