#!/usr/bin/python
# coding:utf-8
'''
    英雄招募-打开接口
'''
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g



def proc(conn, data):
    """

    :param conn:
    :param data: [要领取的id:str]
    :return:
    ::

        {'d': {{'time': 结束时间, 'can':[可以领取的id], 'gotarr':[已经领取得]}}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # _ctype = 'hero_recruit'
    # _data = g.getAttrOne(uid, {'ctype': _ctype}, keys='_id,data')
    # _data = _data or {'data': {'gotarr': []}}
    # _gotarr = _data['data']['gotarr']
    # gud = g.getGud(uid)
    # _kfTime = g.C.getZeroTime(gud['ctime'])
    # _time = _kfTime + 24*3600*3
    # _nt = g.C.NOW()
    # _day = (_nt - _kfTime) // (24* 3600) + 1  #角色创建的第几天
    _hrInfo = g.m.signdenglufun.getHeroRecruitInfo(uid)
    # 全部领取完毕
    if len(_hrInfo['gotarr']) == 4:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    _con = g.GC['giverarepet']
    _canRecList = []
    # _hrInfo = g.m.signdenglufun.getHeroRecruitInfo(uid)

    _res['d'] = _hrInfo
    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    # print doproc(g.debugConn, [])
    g.mc.flush_all()