# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品———  分解
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [饰品id:str]
    :return:
    ::

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 饰品id
    spid = data[0]
    # 饰品不能分解
    if not g.m.shipinfun.getShipinCon(spid)['fjprize']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _spInfo = g.m.shipinfun.getShipinInfo(uid, spid, keys='_id,weardata')
    # 英雄不存在 或者没有饰品
    if not _spInfo or _spInfo['num'] <= 0:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _prize = g.m.shipinfun.getShipinCon(spid)['fjprize']
    _pData = g.getPrizeRes(uid, _prize, {'act':'shipin_fenjie','spid':spid})

    # 设置穿戴信息
    _send = {'shipin': {}}
    _send['shipin'] = g.m.shipinfun.changeShipinNum(uid, spid, -1)
    g.mergeDict(_send, _pData)
    g.sendChangeInfo(conn, _send)
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    data = ["632603",{"1001":19}]
    _r = doproc(g.debugConn, data)
    print _r