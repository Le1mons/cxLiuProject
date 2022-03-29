#coding:utf-8
#!/usr/bin/python
'''
    跨服争霸 - 战斗回放接口
'''
if __name__ == "__main__":
    import sys
    sys.path.append("..")


import g


def proc(conn,data):
    """

    :param conn:
    :param data: [日志tid:str]
    :return:
    ::

        {'d': [{fightres}],
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    fid = str(data[0]) #战斗日志唯一id
    # 优先查找本服
    _saveFlag = 0
    _r = g.mdb.find("fightlog", {"_id": g.mdb.toObjectId(fid)})
    if not _r:
        _saveFlag = 1
        _r = g.crossDB.find("fightlog",{"_id":g.mdb.toObjectId(fid)})
    if len(_r)==0:
        _res['s'] = -1
        _res['errmsg'] = g.L("fightreplay_res_-1")
        return _res

    _r = _r[0]

    # 保存到本服
    if _saveFlag:
        try:
            g.mdb.insert('fightlog', _r)
        except:
            pass

    resFight = None
    if 'fightres' in _r:
        resFight = _r['fightres']
        for log in resFight:
            if log['winside'] == -2:
                log['winside'] = int(log['headdata'][0]['zhanli'] <= log['headdata'][1]['zhanli'])

    else:
        resFight = _r['flog']

    _res['d'] = resFight
    return _res
