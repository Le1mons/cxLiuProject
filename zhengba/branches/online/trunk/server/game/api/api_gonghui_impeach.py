#!/usr/bin/python
#coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g

'''
公会 - 弹劾会长
'''


def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    #没有公会无法弹劾会长
    if len(gud["ghid"]) == 0:
        _res["s"]=-1
        _res["errmsg"]=g.L('chat_global_nogonghui')
        return _res

    #获取会长信息
    _gUserInfo = g.mdb.find1('gonghuiuser',{'ghid':gud['ghid'],'power':0},fields=['_id','uid'])
    if not _gUserInfo:
        _res["s"]=-2
        _res["errmsg"]=g.L('global_argserr')
        return _res

    _temp = g.mdb.find1('gonghuiuser',{'ghid':gud['ghid'],'uid':uid},fields=['_id','ctime'])
    # 新入会玩家不能参加
    if g.C.ZERO(_temp['ctime']) + 24 * 3600 >= g.C.NOW():
        _res['s'] = -7
        _res['errmsg'] = g.L('gonghui_impeach_res_-7')
        return _res

    _tmpGud = g.getGud(_gUserInfo["uid"])
    #无法弹劾自己
    if _tmpGud['name'] == gud['name']:
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_impeach_res_-4')
        return _res

    _nt = g.C.NOW()
    _con = g.m.gonghuifun.getCon()
    _offlineTime = _con['impeach_time']
    #如果当前时间小于会长最后登录时间,无法弹劾
    if _nt < _tmpGud["logintime"] + _offlineTime:
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_impeach_res_-3')
        return _res

    _impeachInfo = g.m.gonghuifun.getImpeachInfo(gud['ghid'])
    # 不能重复弹劾
    if uid in map(lambda x:x['uid'], _impeachInfo['v']):
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghui_impeach_res_-6')
        return _res

    _impeachList = _impeachInfo['v']

    _hzGud = gud
    _fdata = {"uid":_hzGud["uid"],
              "name":_hzGud["name"],
              "ghpower":_hzGud["ghpower"],
              "maxzhanli":_hzGud["maxzhanli"],
              "head":_hzGud["head"]}
    _impeachList.append(_fdata)
    g.m.gonghuifun.setImpeachInfo(gud['ghid'],_impeachList)

    # 第一次弹劾
    if len(_impeachList) == 1:
        # 获取公会人员列表
        _allGonghuiUser = g.mdb.find('gonghuiuser', {'ghid': gud['ghid']}, fields=['_id', 'uid'])
        _allGhUser = [x['uid'] for x in _allGonghuiUser]
        # 增加公会日志--弹劾
        g.m.gonghuifun.addGHLog(gud['ghid'], 8, [gud['name'],_tmpGud['name']])
        _msg = g.C.STR(_con['impeach_email']['content'],gud['name'])
        g.m.emailfun.sendEmails(_allGhUser,1,_con['impeach_email']['title'],_msg)

    _res['d'] = {'impeach':_impeachList}
    return _res

if __name__ == '__main__':
    uid = g.buid("pjy1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc1548ac0911a1710920989'])
    # g.mdb.update('userinfo',{},{'logintime':1541260800})