#!/usr/bin/python
# coding:utf-8
'''
公会争锋 - 公会战斗信息
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [阵容:dict, 对手信息:{'uid':对手uid, 'ghid':对手公会id}]
    :return:
    ::

        {"d":{
            'mygh': [{'rival_name':对手名字,'name':己方队友名字,'winside':获胜方,'ghid':己方公会id,'dps':伤害,'jifen':积分}],
            'rival 对方公会': [{'rival_name':对手名字,'name':己方队友名字,'winside':获胜方,'ghid':己方公会id,'dps':伤害,'jifen':积分}]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _season = g.m.competingfun.getSeasonNum()
    _res['d'] = g.m.competingfun.getGuildFightInfo(gud['ghid'], _season)
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq6")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])