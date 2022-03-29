#!/usr/bin/python
# coding:utf-8
'''
神器 - 激活
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

        {'s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 激活哪个神器
    _zj = str(data[0])
    _con = g.GC['shenqicom']
    # 参数错误
    if _zj not in _con['base']['actneed']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _artifactInfo = g.m.artifactfun.getArtifactInfo(uid)
    # 神器不存在
    if not _artifactInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('artifact_lvup_res_-1')
        return _res

    _artifactDict = _artifactInfo['artifact']
    # 神器已激活
    if _zj in _artifactDict:
        _res['s'] = -2
        _res['errmsg'] = g.L('artifact_act_-2')
        return _res

    # 必须激活前面5章
    if len({'1','2','3','4','5'} & set(_artifactDict.keys())) != 5:
        _res['s'] = -3
        _res['errmsg'] = g.L('artifact_act_-3')
        return _res

    _need = list(_con['base']['actneed'][_zj])
    for i in _need:
        if i['t'] == '':
            i['t'] = _con['shenqi'][_zj]['needitem']

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

    _sendData = g.delNeed(uid, _need, 0, {'act':'artifact_act','zj':_zj})
    gud = g.getGud(uid)
    gud['artifact'] = int(_zj)
    g.m.gud.setGud(uid, gud)
    g.sendChangeInfo(conn, {'attr': {'artifact': _zj}})
    g.mdb.update('userinfo', {'uid': uid}, {'artifact': int(_zj)})
    g.sendChangeInfo(conn, _sendData)

    g.m.artifactfun.setArtifactInfo(uid, {'artifact.{}'.format(_zj): {'lv':1,'djlv':0}})

    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6])