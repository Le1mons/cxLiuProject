#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
法师塔 - 录像
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 法师塔层数
    _layer = int(data[0])
    _recording = g.mdb.find('fashitalog',{'layernum':_layer},sort=[['zhanli',1]], limit=3)
    if not _recording:
        _recording = []
    else:
        _tidList = map(lambda x:x['_id'], _recording)
        # 删除其余的录像
        g.mdb.delete('fashitalog', {'_id':{'$nin': _tidList},'layernum':_layer})
        for i in _recording:
            i['_id'] = str(i['_id'])

    _res['d'] = {'recording': _recording}
    return _res

if __name__ == '__main__':
    uid = g.buid("3")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2])