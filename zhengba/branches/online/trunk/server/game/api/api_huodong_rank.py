# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
悬赏任务——接取任务
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    _hdid = data[0]
    uid = conn.uid
    _info = g.mdb.find('hddata', {'hdid': _hdid},sort=[['val',-1],['lasttime',1]],limit=50)
    _myRank = -1
    _myval = 0
    _resList = []
    for idx, i in enumerate(_info):
        _temp = {}
        _temp['headdata'] = g.m.userfun.getShowHead(i['uid'])
        _temp['val'] = i['val']
        _resList.append(_temp)
        if uid and uid == i['uid']:
            _myRank = idx + 1
            _myval = i['val']

    _rData = {'ranklist': _resList, 'myrank': _myRank,'myval':_myval}
    _res['d'] = _rData
    return _res



if __name__ == '__main__':
    uid = g.buid("8")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[1400])