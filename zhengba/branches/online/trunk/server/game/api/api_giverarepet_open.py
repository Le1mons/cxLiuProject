#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


'''
    送神宠-打开接口
'''

def proc(conn, data):
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
    # 超过第三天
    if _hrInfo['time'] < g.C.NOW():
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _con = g.GC['giverarepet']
    _canRecList = []
    _hrInfo = g.m.signdenglufun.getHeroRecruitInfo(uid)

    _res['d'] = _hrInfo
    return _res

if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    # print doproc(g.debugConn, [])
    g.mc.flush_all()