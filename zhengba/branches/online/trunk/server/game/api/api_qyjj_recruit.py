#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
群英集结 - 招募队友
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 发送招募的副本类型
    _type = str(data[0])
    _con = g.GC['tuanduifuben']['base']['group']
    # 类型不对
    if _type not in _con:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 等级不够
    if not g.chkOpenCond(uid, 'tuanduifuben'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _copyData = g.m.qyjjfun.getCopyData(uid, k=_type, fields=['_id','rnum','uid','opennum'])
    # 没有此类型副本
    if not _copyData:
        _res['s'] = -4
        _res['errmsg'] = g.L('qyjj_recruit_-4')
        return _res

    # 不是团长
    if _copyData['uid'] != uid:
        _res['s'] = -5
        _res['errmsg'] = g.L('qyjj_recruit_-5')
        return _res

    # 招募次数
    _rnum = _copyData.get('rnum', 0)
    # 招募次数已达上限
    if _rnum >= _con[_type]['recruit_num']:
        _res['s'] = -6
        _res['errmsg'] = g.L('qyjj_recruit_-6')
        return _res

    g.m.qyjjfun.CATTR().setAttr(uid, {'ctype':'qyjj_copy','k':_type},{'$inc':{'rnum': 1}})
    gud = g.getGud(uid)
    _fdata = {"uid": gud["uid"],
              "name": gud["name"],
              "lv": gud["lv"],
              "vip": gud.get("vip",0),
              "ctime": g.C.NOW(),
              "head": gud["head"],
              "sendType":0,
              "sid": gud["sid"],
              "headborder": gud["headborder"],
              "chatborder": gud["chatborder"],
              "hidevip": 1,
              'svrname':g.m.crosscomfun.getSNameBySid(gud["sid"])
              }
    _content = g.C.STR(_con[_type]['content'], gud["name"], _copyData['opennum'])
    g.m.crosschatfun.chatRoom.addCrossChat({'msg': _content, 'mtype': 4, 'fdata': _fdata, 'extarg': {}})

    return _res

if __name__ == '__main__':
    uid = g.buid("pjy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])