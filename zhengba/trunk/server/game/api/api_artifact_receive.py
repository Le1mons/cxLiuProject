#!/usr/bin/python
# coding:utf-8
'''
神器 - 领取任务
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [任务类型:str, 神器号码:str]
    :return:
    ::

        {'d': {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 任务type
    _type = data[0]
    # 任务章节
    _zj = str(data[1])
    _shenqiInfo = g.m.artifactfun.getArtifactInfo(uid, fields=['_id'])
    # 数据不存在
    if not _shenqiInfo:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res
    _con = g.GC['shenqitask']
    _taskCon = _con[_zj][_type]['cond']
    _w = {'uid': uid,'ctype':_type}
    if _taskCon: _w.update({'k': _taskCon[0]})
    _taskInifo = g.m.statfun.getStatInfo(_w, fields=['_id'])
    # 数据不存在
    if not _taskInifo:
        _res['s'] = -1
        _res['errmsg'] = g.L('artifact_receive_res_-1')
        return _res

    # 任务已完成
    if _taskInifo[0].get('finish', 0) == int(_zj):
        _res['s'] = -4
        _res['errmsg'] = g.L('artifact_receive_res_-4')
        return _res

    _pval = _con[_zj][_type]['val']
    # 条件未达成
    if _taskInifo[0]['v'] < _pval:
        _res['s'] = -2
        _res['errmsg'] = g.L('artifact_receive_res_-2')
        return _res

    g.m.statfun.setStat(uid,_type,{'finish': int(_zj)})
    # 获取已完成神器的任务信息
    _ctypeList = _con[_zj].keys()
    _finishNum = g.mdb.count('stat',{'uid':uid,'finish':int(_zj),'ctype':{"$in":_ctypeList}})
    # 判断神器是否激活
    if len(_con[_zj]) == _finishNum and _zj in _con:
        gud = g.getGud(uid)
        gud['artifact'] = int(_zj)
        g.m.gud.setGud(uid, gud)
        g.sendChangeInfo(conn, {'attr': {'artifact': _zj}})
        g.mdb.update('userinfo',{'uid':uid},{'artifact': int(_zj)})
        _nextZj = int(_zj) + 1
        if str(_nextZj) in _con:
            # 激活下一章节神器
            _data = {g.C.STR('artifact.{1}',_nextZj): {'lv':1,'djlv':0},'current':_nextZj}
            g.m.artifactfun.setArtifactInfo(uid, _data)

    _prize = _con[_zj][_type]['prize']
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'artifact_receive','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _res['d'] = {'prize':_prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("jxx")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['ronghe','5'])