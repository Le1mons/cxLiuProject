#!/usr/bin/python
# coding:utf-8
'''
玩家 - 变羊
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str, name:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 玩家uid
    _toUid = data[0]
    # 没有权限
    _time = g.getAttrByCtype(uid, 'guinsoo_expire', bydate=False)
    if not _time or g.C.NOW() > _time:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 该玩家已经被羊了
    if g.crossDB.find1('crossplayattr', {'uid': _toUid, 'ctype': 'cross_guinsoo', 'v':{'$gt':g.C.NOW()}}, fields={'_id':1}):
        _chkData['s'] = -3
        _chkData['errmsg'] = g.L('user_guinsoo_-3')
        return _chkData

    # 次数不足了
    if g.getPlayAttrDataNum(uid, 'cross_guinsoo') >= 3:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('user_guinsoo_-2')
        return _chkData

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    g.setPlayAttrDataNum(uid, 'cross_guinsoo')
    # 变羊10分钟
    g.crossDB.update('crossplayattr',{'uid': data[0], 'ctype': 'cross_guinsoo'}, {'$set':{'v':g.C.NOW()+60*10},'$inc':{'num':1}},upsert=True)
    # 跨服聊天加系统提是
    g.m.crosschatfun.chatRoom.addCrossChat({'msg': g.C.STR(g.GC['pmd']['guinsoo'], data[1], g.getGud(uid)['name']), 'mtype': 4, 'fdata': {}, 'extarg': {'ispmd': 1}})
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = [g.buid("lsq1"), u'lyf大傻逼']
    a = doproc(g.debugConn, data)
    print a