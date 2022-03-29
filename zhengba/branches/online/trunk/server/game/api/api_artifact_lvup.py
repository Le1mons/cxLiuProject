#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
神器 - 升级
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 神器的章节
    _zj = str(data[0])
    # 升级类型
    _type = data[1]
    # 参数有误
    if _type not in ('lv', 'djlv'):
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

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

    _con = g.GC['shenqicom']
    _comCon = _con['shenqi'][_zj]
    if _type == 'lv':
        _curLV = _artifactDict[_zj]['lv']
        _maxLv = _comCon['maxlv']
        # 升至最大等级
        if _curLV >= _maxLv:
            _res['s'] = -3
            _res['errmsg'] = g.L('artifact_lvup_res_-3')
            return _res

        _need = _con['base']['lvneed'][str(_curLV)]

    else:
        _curLV =_artifactDict[_zj]['djlv']
        _maxLv = _comCon['maxdengjie']
        _module = _comCon['lv2dengjie']
        # 升至最大等级
        if _artifactDict[_zj]['lv'] // _module <= _curLV:
            _res['s'] = -4
            _res['errmsg'] = g.L('artifact_lvup_res_-4')
            return _res

        _need = _con['base']['dengjieneed'][str(_curLV)]

    _curLV += 1
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

    _sendData = g.delNeed(uid, _need,logdata={'act': 'artifact_lvup'})
    g.sendChangeInfo(conn, _sendData)

    g.m.artifactfun.setArtifactInfo(uid, {g.C.STR('artifact.{1}.{2}',_zj,_type): _curLV})

    _artifactDict[_zj].update({_type: _curLV})
    _res['d'] = _artifactDict[_zj]
    return _res

if __name__ == '__main__':
    uid = g.buid("pjy1")
    g.debugConn.uid = uid
    # for i in  g.GC['shenqitask']:
    #     for type in g.GC['shenqitask'][i]:
    #         _w = {'uid':uid,'ctype':type}
    #         if g.GC['shenqitask'][i][type]['cond']:
    #             _w.update({'k': g.GC['shenqitask'][i][type]['cond'][0]})
    #         g.mdb.update('stat',_w,{'v':100},upsert=True)
    for i in xrange(10):
        print g.getPrizeRes(uid, [{'a':'attr','t':'jifen','n':1}])