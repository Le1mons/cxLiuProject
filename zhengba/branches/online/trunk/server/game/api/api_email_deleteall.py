#!/usr/bin/python
# coding:utf-8

import sys

sys.path.append('..')

import g

'''
邮件 - 删除所有已读and (领奖 or 没有奖励)的邮件

'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    gud = g.getGud(uid)
    # 检查是否有可以删除的邮件
    _r = g.mdb.find("email", {'$or':[{"uid": uid},{'etype':3,'senduid':uid}]})
    _sysEmail = []
    _sr = g.mdb.find("email", {"uid": "SYSTEM"})
    for ele in _sr:
        if "prize" not in ele or ("prize" in ele and 'plist' in ele and uid in ele['plist']):  # 判断没有奖励或者奖励已经领取
            if "dlist" not in ele or ("dlist" in ele and uid not in ele['dlist']):
                _sysEmail.append(ele)

    if len(_r) == 0 and len(_sysEmail) == 0:
        _res['s'] = -1
        _res['errmsg'] = g.L("emaildeleteall_res_-1")
        return _res

    # 删除邮件
    _w = {"$and": [
        {"$or": [
            {"prize": {"$exists": 0}},
            {"getprize": 1}
        ]},
        {'$or':[{"uid": uid},{'etype':3,'senduid':uid}]}
    ]}


    _rInfo = g.mdb.delete("email", _w)
    # 删除全服邮件

    _nt = g.C.NOW()
    for ele in _sysEmail:
        if "dlist" not in ele or ("dlist" in ele and uid not in ele['dlist']):
            _r = g.mdb.update("email", {"_id": ele['_id']}, {"$push": {"dlist": uid}}, upsert=True)

    return _res


if __name__ == '__main__':
    g.debugConn.uid = "0_5b8e4d2ce1382315b2c2790b"
    print doproc(g.debugConn, [])