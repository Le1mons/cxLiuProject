#!/usr/bin/python
# coding:utf-8
'''
冠军的试练 - 查看录像
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

        {'d': {'recording':[{
                                tid:录像tid,
                                jifenchange:{积分变化信息},
                                ctime:挑战时间,
                                enemyuid:对手uid,
                                uid:我方uid,
                                headdata:对方头像信息,
                                winside:0 我方胜利 1 对方胜利
                            }]}
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
    _recording = g.mdb.find('ctlog',_w,sort=[['ctime',-1]],limit=10)
    if not _recording:
        _resList = []
    else:
        # _tidList = map(lambda x:x['_id'], _recording)
        # 删除其余的录像
        # g.mdb.delete('ctlog', {'_id':{'$nin': _tidList}})
        _resList = []
        for i in _recording:
            _temp = {}
            _temp['tid'] = str(i['_id'])
            _temp['jifenchange'] = i['jifeninfo']
            _temp['ctime'] = i['ctime']
            _temp['enemyuid'] = i['enemyuid']
            _temp['uid'] = i['uid']
            # 对手的headdata
            _headUid = i['enemyuid'] if i['uid']==uid else i['uid']
            _temp['headdata'] = g.m.userfun.getShowHead(_headUid)
            _winsideList = [i['winside'] for i in i['fightres']]
            _temp['winside'] = 0 if _winsideList.count(0) >1 else 1
            _resList.append(_temp)

    _res['d'] = {'recording': _resList}
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq333")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b0cfa5cc0911a3c14543884', 1])