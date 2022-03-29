#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 报名
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [阵容:{},阵容:{},阵容:{}]
    :param key:
    :return:
    ::
        {'s': 1}


    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    return
    _chkData = {}
    _chkData["s"] = 1
    _con = g.GC['five_army']['base']
    # 开区天数不足
    if g.getOpenDay() < _con['openday'] or not data:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _nt = g.C.NOW()
    # 周六0点到周一22点报名
    if _con['time']['not_signup'][0] <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['not_signup'][1]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 等级不足
    if not g.chkOpenCond(uid, 'wjzz'):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    # 已经报名了
    if g.m.wjzzfun.chkUserIsSignUp(uid):
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('wjzz_signup_-5')
        return _chkData

    _tids = []
    for i in data:
        _tids.extend([i[x] for x in i if x != 'sqid'])

    for i in _tids:
        try:
            a = g.mdb.toObjectId(i)
        except:
            print "api_wjzz_signup error"
            print '--{}__'.format(i)
            print 'data:',data

    _team2hero = g.m.wjzzfun.chkFightData(uid, data)
    # 有英雄不合格
    if 's' in _team2hero:
        _chkData['s'] = _team2hero['s']
        _chkData['errmsg'] = _team2hero['errmsg']
        return _chkData

    _chkData['fight'] = _team2hero
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    # 设置数据
    g.m.wjzzfun.setFightData(uid, data, _chkData['fight'])

    _key = g.m.wjzzfun.getSeasonNum()
    # 添加报名数据
    gud = g.getGud(uid)
    g.crossDB.insert('wjzz_signup', {
        'uid':uid,
        'zhanli':gud['maxzhanli'],
        'key':_key,
        'sid':gud['sid'],
        'ttltime':g.C.TTL(),
        'ctime':gud['ctime'],
        'headdata':g.m.userfun.getShowHead(uid)
    })

    # g.mdb.insert('wjzz',{'uid':uid,'key':_key,'team':data,'ctime':g.C.NOW(),'num':len(data),'ttltime':g.C.TTL()})

    _nt = g.C.NOW()
    g.mc.set('wjzz_signup_{0}_{1}'.format(uid, _key), 1, g.C.getWeekFirstDay(_nt) + 7 * 3600 * 24 - _nt)
    return _res


if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _all = g.mdb.find('hero',{'uid':uid},limit=50)
    fight = {}
    # g.mdb.update('hero', {'uid':uid},{'star':8})
    for i in xrange(6):
        fight[str(i % 6 + 1)] = str(_all[i]['_id'])
    _data = [fight]
    print doproc(g.debugConn, _data)