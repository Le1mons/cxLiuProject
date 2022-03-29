#!/usr/bin/python
#coding:utf-8
'''
公会 - 公会科技主界面
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'resetnum': 每个职业科技重置过的次数
                'kejidata': {技能id: 等级}
        }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    _data = g.getAttr(uid,{'ctype':'keji_data'})
    _resData = {}
    _resData['resetnum'] = g.m.gonghuifun.getResetNum(uid)
    _resData["ismax"] = g.m.ghkejifun.isSkillMax(uid)
    _resData['kejidata'] = {}
    if _data != None:
        for d in _data:
            _resData['kejidata'].update(d['v'])
            
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('ysr1')
    print g.debugConn.uid
    _data = ['1','1']
    print doproc(g.debugConn,_data)