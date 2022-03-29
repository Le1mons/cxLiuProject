#!/usr/bin/python
# coding:utf-8
'''
法师塔 - 录像
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [层数:int]
    :return:
    ::

        {'d':{'recording': {
                    'zhanli': 战力,
                    'fightdata':fightres{}
        }
        's': 1}

    """
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
    # print doproc(g.debugConn, data=[2])
    # print g.C.getWeekNumByTime(1559540986)
    #
    for i in xrange(1, 2):
        _recording = g.mdb.find('fashitalog', {'layernum': i}, sort=[['zhanli', 1]], limit=3)
        _tidList = map(lambda x: x['_id'], _recording)
        # 删除其余的录像
        g.mdb.delete('fashitalog', {'_id': {'$nin': _tidList}, 'layernum': i})