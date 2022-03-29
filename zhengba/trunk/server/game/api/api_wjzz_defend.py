#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 防守阵容
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
    _con = g.GC['five_army']['base']
    # 开区天数不足
    if g.getOpenDay() < _con['openday'] or not data:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 等级不足
    if not g.chkOpenCond(uid, 'wjzz'):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_limitlv')
        return _chkData

    # 没有报名了
    if not g.m.wjzzfun.chkUserIsSignUp(uid):
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('wjzz_signup_-2')
        return _chkData

    _teamData = g.mc.get('wjzz_defend_{}'.format(uid)) or []
    _teamData.append(data[0])
    # 如果没完 不是最后一队
    if not data[1]:
        # 获取之前的缓存
        g.mc.set('wjzz_defend_{}'.format(uid), _teamData, 60)
        _chkData['s'] = 1
        return _chkData
    else:
        g.mc.delete('wjzz_defend_{}'.format(uid))
        data = _teamData

    _team2hero = g.m.wjzzfun.chkFightData(uid, data)
    # 有英雄不合格
    if 's' in _team2hero:
        _chkData['s'] = _team2hero['s']
        _chkData['errmsg'] = _team2hero['errmsg']
        return _chkData

    _chkData['fight'] = _team2hero
    _chkData['data'] = data
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid

    # 检测
    _chkData = _checkCond(uid, data)
    if "s" in _chkData:
        return _chkData

    # 设置数据
    g.m.wjzzfun.setFightData(uid, _chkData['data'], _chkData['fight'], 1)
    return _res


if __name__ == '__main__':
    uid = g.buid('jingqi_1903051750594226')
    g.debugConn.uid = uid
    # _all = g.mdb.find('hero',{'uid':uid})
    # fight = {}
    # # g.mdb.update('hero', {'uid':uid},{'star':8})
    # for i in xrange(0, 6):
    #     fight[str(i%6+1)] = str(_all[i]['_id'])
    # _data = [fight]
    data1 = [{"1":"5e36f59615266772fa88b45f","2":"5e24ab0415266772d39f8e29","3":"5e29d37f15266772d3a06563","4":"5e6bb65b15266758cfa6012a","5":"5e306f5915266772fa87d9f9","6":"5e65248115266771e6bba264"},False]
    data2 = [{"1":"5e74fc151526675076b8aee7","2":"5e5a921f1526671da99bbb73","3":"5e2c78dd15266772d3a0d3db","4":"5e387ce315266772d3a264d2","5":"5e7cd9481526675076ba9f2f","6":"5e8187cd1526673aeba57766"},True]
    print doproc(g.debugConn, data1)
    print doproc(g.debugConn, data2)