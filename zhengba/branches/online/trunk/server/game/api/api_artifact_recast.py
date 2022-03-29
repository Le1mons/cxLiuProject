#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
神器 - 重铸
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 神器的章节  id
    _zj = str(data[0])
    _artifactInfo = g.m.artifactfun.getArtifactInfo(uid)
    # 神器不存在
    if not _artifactInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('artifact_lvup_res_-1')
        return _res

    _artifactDict = _artifactInfo['artifact']
    # 神器未激活
    if _zj not in _artifactDict:
        _res['s'] = -2
        _res['errmsg'] = g.L('artifact_lvup_res_-2')
        return _res

    _lv = _artifactDict[_zj]['lv']
    _dengjie = _artifactDict[_zj]['djlv']
    # 获取重铸返还的材料 不要金币
    _prize = g.m.artifactfun.getRecastPrize(_lv, _dengjie)
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'artifact_recast','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    g.m.artifactfun.setArtifactInfo(uid,{g.C.STR('artifact.{1}',_zj): {'lv':1,'djlv':0}})

    _res['d'] = {'prize': _prize,'artifact':{_zj:{'lv':1,'djlv':0}}}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b068661c0911a2e18cd4224'])