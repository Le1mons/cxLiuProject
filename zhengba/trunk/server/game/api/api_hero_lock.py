# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
英雄——解锁
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: ['5d2da49d0ae9fe3a60067a83'加锁英雄tid]
    :return:
    ::

        {'s': 1, 'd': {'hero': {'5d2da49d0ae9fe3a60067a83': {'islock'锁定状态: 1}}}}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄唯一id
    tid = data[0]
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄不存在
    if not _heroInfo:
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _islock = _heroInfo['islock']
    if _islock == 1:
        _islock = 0
    else:
        _islock = 1
    g.m.herofun.updateHero(uid, tid, {'islock':_islock})

    _res['d'] = {'hero': {tid: {'islock': _islock}}}
    return _res


if __name__ == '__main__':
    uid = g.buid("xcy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5d2da49d0ae9fe3a60067a83'])
