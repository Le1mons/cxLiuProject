#coding:utf-8
#!/usr/bin/python
import sys
if __name__ == "__main__":
    sys.path.append("..")


import g
'''
    跨服争霸 - 战斗回放接口
'''


def proc(conn,data):
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

    # 保存到本服
    if _saveFlag:
        try:
            g.mdb.insert('fightlog', _r[0])
        except:
            pass
    _res['d'] = _r[0]['fightres'] if 'fightres' in _r[0] else _r[0]['flog']

    return _res

if __name__ == "__main__":
    uid = g.buid('wqew12334')
    g.debugConn.uid = uid
    print doproc(g.debugConn,["5c3221c7a5b3dd11cc05da32"])