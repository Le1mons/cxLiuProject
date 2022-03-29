#!/usr/bin/python
# coding:utf-8
'''
玩家 - 是否展示vip
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [新名字:str]
    :return:
    ::

        {s': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid


    gud = g.getGud(uid)

    if gud["showvip"]:
        gud["showvip"] = 0
    else:
        gud["showvip"] = 1

    _data = {'showvip': gud["showvip"]}

    # 设置信息
    # g.mdb.update('userinfo', {'uid': uid}, _data)
    g.m.userfun.updateUserInfo(uid, _data)
    _r = g.sendChangeInfo(conn, {"attr": _data})
    # 更新跨服数据
    _head = g.m.userfun.getShowHead(uid)
    _head['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid'])
    g.crossDB.update('jjcdefhero',{'uid':uid},{'headdata': _head})
    g.crossDB.update('crosszb_jifen', {'uid': uid, 'dkey': g.C.getWeekNumByTime(g.C.NOW())}, {'headdata': g.m.userfun.getShowHead(uid)})
    g.crossMC.delete(g.m.crosszbfun.getCrossUserKey(uid))
    # 将玩家信息上传至跨服服务器
    g.m.crosswzfun.uploadUserData(uid)
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    data = [u'虚招']
    a = doproc(g.debugConn, data)
    print a