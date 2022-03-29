#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
神器 - 开启
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _artifactInfo = g.m.artifactfun.getArtifactInfo(uid,fields=['_id'])
    if not _artifactInfo:
        _curId = '1'
        _data = {'uid':uid,'artifact':{"1":{'lv':1,'djlv':0}},
                'lasttime':g.C.NOW(),'current': '1'}
        g.mdb.insert('artifact', _data)
        _artifact = {"1": {'lv':1,'djlv':0}}

    else:
        _artifact = _artifactInfo['artifact']
        _curId = _artifactInfo['current']
    _taskInfo = g.m.artifactfun.getAllZjTask(uid, _curId)
    _res['d'] = {'task': _taskInfo,'artifact': _artifact}
    return _res



if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b068661c0911a2e18cd4224'])