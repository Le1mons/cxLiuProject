#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
公会争锋 - 打开界面
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    gud = g.getGud(uid)
    # 只有会长和官员才能报名
    if gud['ghpower'] not in [0, 1]:
        _res['s'] = -1
        _res['errmsg'] = g.L('ghcompeting_signup_-1')
        return _res

    _con = g.GC['guildcompeting']['base']
    # 周六不能报名
    if g.C.WEEK() == 6:
        _res['s'] = -2
        _res['errmsg'] = g.L('ghcompeting_signup_-2')
        return _res

    # 已报名
    if not g.m.competingfun.isCanSignUpGame(gud['ghid']):
        _res['s'] = -3
        _res['errmsg'] = g.L('ghcompeting_signup_-3')
        return _res

    _ghUser = g.mdb.find('gonghuiuser', {'ghid': gud['ghid']},fields=['_id','uid','power'])
    _users = g.mdb.find('userinfo',{'lv':{'$gte':_con['cond']['lv']},'uid':{"$in":map(lambda x:x['uid'], _ghUser)}},fields=['_id','uid'])
    # 判断公会内满足三十级得人数
    if len(_users) < _con['cond']['player_num']:
        _res['s'] = -4
        _res['errmsg'] = g.L('ghcompeting_signup_-4')
        return _res

    _chairman = filter(lambda x:x['power']==0, _ghUser)[0]
    _chairmanGud = g.getGud(_chairman['uid'])
    sid = g.getSvrIndex()
    _season = g.m.competingfun.getSeasonNum()
    _gh = g.m.gonghuifun.getGongHuiInfo(gud['ghid'])
    _data = {'ghid':gud['ghid'],'guildinfo':{'name':_gh['name'],'flag':_gh['flag'],'chairman':_chairmanGud['name'],
                                             'svrname':g.m.crosscomfun.getSNameBySid(sid),'time':g.C.NOW()}}

    _round = str(g.m.competingfun.getRoundNum(_season))
    _signData = g.crossDB.find1('competing_signup', {'season': _season},fields=['_id','finish'])
    # 如果是0点到6点间  或者此轮匹配还没开始
    if 0 <= g.C.HOUR() < 6 and g.C.WEEK() != 0 and _signData != None and _signData.get('finish', {}).get(_round, 0) == 0:
        _signUp = g.C.STR('after.{1}',sid)
    else:
        _signUp = g.C.STR('guild.{1}',sid)
    g.crossDB.update('competing_signup',{'season':_season},{'$push':{_signUp :_data},'$set':{'lasttime':g.C.NOW()}},upsert=True)

    return _res

if __name__ == '__main__':
    uid = g.buid("pjy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])