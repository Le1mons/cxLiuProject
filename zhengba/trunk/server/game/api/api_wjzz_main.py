#!/usr/bin/python
# coding:utf-8
'''
五军之战 - 攻打界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data,key=None):
    """

    :param conn:
    :param data: [阵营]
    :param key:
    :return:
    ::
        {'d': {
            'crystal': [{'team':剩余队伍数量,'num':受到的伤害,'faction':阵营}],
            'log':{
                    "from": 攻打方阵营,
                    "to": 防守方阵营,
                    "dps":  伤害,
                    "winside": 胜利方,
                    "name": 姓名,
                    "type": 是否挑战水晶,
                }
            'num':已使用的挑战次数
        }
        's': 1}


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
    if g.getOpenDay() < _con['openday']:
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

    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _data = g.m.wjzzfun.getUserData(uid)
    _key = g.m.wjzzfun.getSeasonNum()
    _faction = str(data[0])
    _rData = {}
    # 敌方阵营打我方  或者我方阵营打敌方
    _kwargs = {'sort':[['ctime',-1]], 'limit':20 ,'fields': '_id,name,from,to,winside,dps,type'.split(',')}
    _rData['log'] = g.crossDB.find('wjzz_log',{'key':_key,'group':_data['group'],'$or':[{'from':_faction,'to':_data['faction']},{'from':_data['faction'],'to':_faction}]},**_kwargs)
    _rData['crystal'] = g.crossDB.find('wjzz_crystal',{'key':_key,'group':_data['group'],'faction':{'$in':[_faction,_data['faction']]}},fields=['_id','num','team','faction'])
    _rData['num'] = g.getPlayAttrDataNum(uid, 'wjzz_daynum')
    _res['d'] = _rData
    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    _data = [1]
    print doproc(g.debugConn, _data)