#!/usr/bin/python
# coding:utf-8
'''
神器 - 重铸
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [神器号码:str]
    :return:
    ::

        {'d': {'prize':[], 'artifact':{神器号码:{lv:1,djlv:0,jxlv:0}}}
        's': 1}

    """
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
    _prize = g.m.artifactfun.getRecastPrize(_zj, _lv, _dengjie, _artifactDict[_zj].get('jxlv',0),_artifactDict[_zj].get('rank',0))
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'artifact_recast','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    # 取消觉醒提供的buff
    if _artifactDict[_zj].get('jxlv') or _artifactDict[_zj].get('rank'):
        g.mdb.update('buff', {'uid':uid},{'$unset':{'buff.artifact.{}'.format(_zj):1}})
        _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}}) or {}
        g.sendChangeInfo(conn, {'hero': _r})

    _artifactDict[_zj] = {'lv':1,'djlv':0,'jxlv':0}
    _set = {g.C.STR('artifact.{1}',_zj): {'lv':1,'djlv':0,'jxlv':0,'rank':0}}
    # # 已经共鸣了
    # if 'djlvsum' in _artifactInfo:
    #     _set['djlvsum'] = sum(_artifactDict[i]['djlv'] for i in _artifactDict)
    g.m.artifactfun.setArtifactInfo(uid,_set)

    _res['d'] = {'prize': _prize,'artifact':{_zj:{'lv':1,'djlv':0,'jxlv':0}}}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq222")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['2'])