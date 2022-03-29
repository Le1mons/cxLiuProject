#!/usr/bin/python
#coding:utf-8

'''
    私聊打开接口
'''

import sys
sys.path.append('..')

import g

def proc(conn, data, key=None):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def doproc(conn,data):
    _res = {"s":1}
    if not hasattr(conn,"uid"):
        _res["s"]=-102
        return (_res)

    uid = conn.uid
    gud = g.getGud(uid)
    #获取
    _nt = g.C.NOW()
    _rData = []
    if len(data)==0:
        _where = {'uid':uid}
        _r = g.mdb.find('chat',_where,fields=['_id','uid','touid','data', 'newchat'],sort=[['lasttime',-1]])
        for ele in _r:
            _uidlist = [ele['uid'],ele['touid']]
            _uidlist.remove(uid)
            _touid = _uidlist[0]
            _tmp = {}
            _tmpgud = g.getGud(_touid)
            _tmp['uid'] = _touid
            _tmp['newchat'] = ele.get('newchat', 1)
            # _keys = ['name','head','servername','border','sid','city','headborder','lv','vip']
            _tmp['headdata'] = g.m.userfun.getShowHead(_touid)
            _rData.append(_tmp)
        # 获取跨服的聊天数据
        _uidList = []
        _crossData = g.crossDB.find('chat', _where, fields=['_id','uid','touid','data', 'newchat'], sort=[['lasttime', -1]])
        _uidList = []
        for d in _crossData:
            _uidList.append(d["uid"])
            _uidList.append(d["touid"])

        # 获取跨服聊天的头像信息
        _userHead = g.crossDB.find("cross_friend", {"uid": {"$in": _uidList}},fields={'_id':0,'head':1,'uid':1})
        for i in _userHead:
            if 'defhero' in i['head']:
                del i['head']['defhero']
        _userHead = {user["uid"]: user for user in _userHead}
        for ele in _crossData:
            _uidlist = [ele['uid'], ele['touid']]
            _uidlist.remove(uid)
            _touid = _uidlist[0]
            _tmp = {}
            _tmpgud = g.getGud(_touid)
            _tmp['uid'] = _touid
            _tmp['newchat'] = ele.get('newchat', 1)
            if _touid not in _userHead:
                continue
            _tmp["headdata"] = _userHead.get(_touid, {})["head"] if _userHead.get(_touid, {}) else {}
            _rData.append(_tmp)

    else:
        _touid = str(data[0])
        _rData = []
        _where = {'uid': uid, "touid": _touid}

        # 如果是本服的
        if g.m.crosscomfun.chkIsThisService(_touid):
            DB = g.mdb
        else:
            DB = g.crossDB
        _r = DB.find1('chat', _where, fields=["_id"])
        if _r:
            _rData = _r['data']
            # 清除私聊条数
            DB.update('chat', _where, {'newchat': 0})

    _res['d'] = _rData
    return _res

if __name__ == '__main__':
    uid = g.buid("lyf")
    g.debugConn.uid = uid
    data = ["0_5d6f5e7c9dc6d62468d2a36d"]

    _r = doproc(g.debugConn, data)

    from pprint import pprint
    pprint(_r)