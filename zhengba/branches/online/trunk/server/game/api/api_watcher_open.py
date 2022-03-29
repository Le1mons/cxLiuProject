#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
守望者秘境 - 开启界面
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'watcher'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_limitlv')
        return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id'])
    # 数据不存在
    if not _data or 'herolist' not in _data:
        _res['s'] = -2
        return _res

    # 超过两天了  需要轮回
    if g.C.NOW() > _data['rebirthtime']:
        _res['s'] = -2
        return _res

    # 扫荡奖励 如果有box就直接获得
    if 'box' in _data:
        _sendData = g.getPrizeRes(uid, _data['box'], {'act': 'watcher_open'})
        g.sendChangeInfo(conn, _sendData)

    # 删除扫荡的显示奖励
    if 'prize' in _data:
        g.mdb.update('watcher', {'uid': uid}, {'$unset':{'prize': 1,'box':1}})
    _res['d'] = _data

    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])