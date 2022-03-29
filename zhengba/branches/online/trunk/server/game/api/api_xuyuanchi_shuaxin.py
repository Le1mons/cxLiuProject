#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
许愿池--刷新
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _poolname = data[0]
    _xycInfo = g.m.xuyuanchifun.getXuyuanchiData(uid, _poolname)

    _nt = g.C.NOW()
    _freeTime = _xycInfo['freetime']
    # 如果还处在cd时间内
    if _freeTime > _nt:
        _con = g.m.xuyuanchifun.getXYCcon(_poolname)
        _need = _con['rfneed']
        _chk = g.chkDelNeed(uid, _need)

        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _sendData = g.delNeed(uid, _need, issend=False,logdata={'act': 'xuyuanchi_shuaxin'})
        g.sendChangeInfo(conn, _sendData)
        # 不重置cd时间
        _xycData = g.m.xuyuanchifun.getXuyuanchiData(uid, _poolname, isref=True, data={'freetime': _freeTime})
    else:
        _xycData = g.m.xuyuanchifun.getXuyuanchiData(uid, _poolname, isref=True)

    _res['d'] = {'xycdata': _xycData}
    return _res

if __name__ == '__main__':
    uid = g.buid("8")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['high',10])