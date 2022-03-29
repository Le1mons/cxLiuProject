#!/usr/bin/python
# coding:utf-8
'''
公会 - 解散公会
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    # 不是会长
    if gud['ghpower'] != 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghui_disband_-2')
        return _res

    _ghInfo = g.m.gonghuifun.getGongHuiByUid(uid)
    # 没有工会
    if not _ghInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_disband_-1')
        return _res

    # 报名公会争锋不能解散
    if not g.m.competingfun.isCanSignUpGame(gud['ghid']):
        _res['s'] = -3
        _res['errmsg'] = g.L('gonghui_disband_-3')
        return _res

    _ghid = gud['ghid']
    g.mdb.delete('gonghui', {'_id': g.mdb.toObjectId(_ghid)})
    g.mdb.delete('gonghuilog', {'ghid': _ghid})
    g.mdb.delete('gonghuiexp', {'ghid': _ghid})
    g.mdb.delete('gonghuiapply', {'ghid': _ghid})
    g.mdb.delete('gonghuiattr', {'ghid': _ghid})

    g.m.gud.reGud(uid)
    _name = _ghInfo['name']
    _allUser = g.mdb.find('gonghuiuser',{'ghid':_ghid},fields=['_id', 'uid'])
    g.mdb.delete('gonghuiuser', {'ghid': _ghid})

    _con = g.GC['gonghui']['base']['email']
    _title = _con['title']
    _content = g.C.STR(_con['content'], _name, gud['name'])

    _attrMap = {"ghid": '', 'ghname': '', 'ghpower': -1}
    g.sendChangeInfo(conn, {"attr": _attrMap})
    _nt = g.C.NOW()
    for i in _allUser:
        g.m.gonghuifun.setChkJoinCD(i['uid'], _nt + 4 * 3600)
        if i['uid'] == uid:
            continue
        _uid = i['uid']
        g.m.emailfun.sendEmails([_uid], 1, _title, _content)
        g.m.gud.reGud(_uid)
        # 更新缓存ghid
        # _kickGud = g.getGud(_uid)
        # _attrMap = {"ghid": _kickGud['ghid'], 'ghname': _kickGud['ghname'], 'ghpower': _kickGud['ghpower']}
        g.sendUidChangeInfo(_uid, {"attr": _attrMap})


    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao001')
    print g.debugConn.uid
    print doproc(g.debugConn, [])