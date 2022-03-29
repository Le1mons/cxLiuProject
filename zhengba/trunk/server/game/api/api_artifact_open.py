#!/usr/bin/python
# coding:utf-8
'''
神器 - 开启
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [神器号码:str, 升级类型:str(lv,djlv,jxlv,rank)]
    :return:
    ::

        {'d': {'task': {任务类型:{'val':完成值,'finish':是否完成}},
                'artifact': {u'1号神器': {u'lv': 51, u'djlv': 0, 'jxlv':觉醒等级, 'rank':觉醒等阶},
                            u'3': {u'lv': 50, u'djlv': 0},
                            u'2': {u'lv': 50, u'djlv': 0},
                            u'5': {u'lv': 50, u'djlv': 0},
                            u'4': {u'lv': 50, u'djlv': 0}}}}
        's': 1}

    """
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
    _rData = {'task': _taskInfo,'artifact': _artifact}

    if _artifactInfo and 'djlvsum' in _artifactInfo:
        _rData['djlvsum'] = _artifactInfo['djlvsum']
    _rData["isresonance"] = g.m.artifactfun.getResonance(uid)
    _res['d'] = _rData
    return _res


if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b068661c0911a2e18cd4224'])