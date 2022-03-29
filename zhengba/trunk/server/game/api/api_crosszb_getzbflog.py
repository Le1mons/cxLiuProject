#!/usr/bin/python
#coding:utf-8
'''
跨服战争霸赛战斗日志
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g


def proc(conn,data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': 'log': [{'flogid':日志tid,
                        'uid': 玩家uid，
                        ‘iswin’:是否胜利,
                        'pkname':对手名字，
                        ‘pkuid’:对手uid，
                        ‘ctime’:日志时间，
                        ‘rank’:排名，
                        ‘prize’：奖励}],
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1,"d":{}}
    uid = conn.uid
    _resData = {}
    _resData['log'] = g.m.crosszbfun.getZBFightLog(uid)
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = g.mdb.find1("userinfo", {"binduid": "666"})['uid']
    g.debugConn.uid = uid
    print doproc(g.debugConn,['57b3fce96a5d0905cc74c975'])