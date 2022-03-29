#!/usr/bin/python
# coding:utf-8
'''
公会争锋 - 王者信息
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要查看的赛季:int]
    :return:
    ::

        {'d': [{'zhanli':战力,'guildinfo':{'flag':旗帜,'svrname':区服名,'name':公会名,'chairman':会长名}}]
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 要查看的赛季
    _season = int(data[0])
    _data = g.crossDB.find('competing_toplog',{'season':_season},fields=['_id'])
    _res['d'] = _data

    return _res

if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])