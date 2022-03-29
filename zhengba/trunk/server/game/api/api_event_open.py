# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
答题事件——主界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d":{'topic': {"事件点": '事件id'}, 'jindu': {'事件id': 事件的进度}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = g.m.eventfun.getTopicData(uid)
    _nt = g.C.NOW()
    _resTopic = []
    _con = g.GC['event']
    for i in _resData['topic']:
        _resTopic.append(i)
    _resData['topic'] = _resTopic
    _resData['jugg'] = bool(g.getAttrByDate(uid,{'ctype': 'event_answer'}))
    _res['d'] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])