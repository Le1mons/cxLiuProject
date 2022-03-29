#!/usr/bin/python
# coding:utf-8
'''
竞技场 - 查看录像
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append(".\game")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'recording':[{'jifenchange':积分变化,'ctime':挑战时间,'headdata':head信息,'winside':胜利边}]},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _w = {'$or':[{'uid':uid},{"enemyuid":uid}]}
    _recording = g.mdb.find('zypkjjclog',_w,sort=[['ctime',-1]],limit=10)
    if not _recording:
        _resList = []
    else:
        _tidList = map(lambda x:x['_id'], _recording)
        # 删除其余的录像
        g.mdb.delete('zypkjjclog', {'_id':{'$nin': _tidList},'uid':uid})
        _resList = []
        for i in _recording:
            _temp = {}
            _temp['tid'] = str(i['_id'])
            _temp['jifenchange'] = i['jifeninfo']
            _temp['ctime'] = i['ctime']
            _temp['enemyuid'] = i['enemyuid']
            _temp['uid'] = i['uid']
            _temp['winside'] = i['fightres']['winside']
            # 对手的headdata
            _side = 1 if i['uid']==uid else 0
            _temp['headdata'] = i['fightres']['headdata'][_side]
            _resList.append(_temp)

    _res['d'] = {'recording': _resList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,1)
