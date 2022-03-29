#!/usr/bin/python
#coding:utf-8
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
登陆接口
'''

# 判断是否加入的黑名单
def isUidInBlackList(uid):
    _list = g.mc.get('black_list')
    if not _list:
        _list = g.mdb.find('blacklist',{'ctype':3,'$or':[{'etime':0},{'etime':{'$gt':g.C.NOW()}}]},fields=['_id','uid','etime'])
        _list = {x['uid']:g.C.DATE(x['etime']) if x['etime']!=0 else 0 for x in _list}
        g.mc.set('black_list', _list, 60)
    return _list.get(uid)

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def doproc(conn,data):
    _res = {"s":1}
    _binduid = data[0]
    _t = data[1]
    _k = data[2]
    _serverid = int(data[3])# int(data[3]) #区服的编号
    #所有config里配置的允许的sid
    _userData = {}
    if len(data) > 4:
        _userData = data[4]

    _allServerids = g.getSvrList()
    if _serverid not in _allServerids:
        _res['s']=-1
        _res['errmsg']=g.L('ERROR_SERVERID')
        return _res


    conn.SERVERIDX = _serverid
    '''_key = g.C.md5(_binduid+str(_t)+g.config['APIKEY'])
    if _k!=_key and _k!='7dd395bfc1c214b9cf64ae50d13bd7ea':
        _res['s']=-1
        _res['errmsg']=g.L('LOGIN_KEYERR')
        return _res'''
    
    _isNewPlayer = False
    conn.binduid = str(_binduid)
    hasUser = g.m.userfun.hasUser(_binduid,serverid=_serverid)
    _sid = g.creatHttpSid(_binduid)

    g.mc.set(g.C.STR("{1}_binduid",_sid),str(_binduid))
    g.mc.set(g.C.STR("{1}_serverid",_sid),_serverid) ##xxxxxxxxx_serverid = serverid

    #不存在用户则创建新用户
    if hasUser==None:
        # _binduid = g.mc.get(g.C.STR("{1}_binduid", _serverid))
        _binduid = str(_binduid)
        sex = 1
        uname = "temp" + "_" + g.C.getUniqCode()
        _isNewPlayer = True
        # 设置默认头像

        heads = list(g.GC["pre_defshowhead"])
        _rhead = g.C.getRandList(heads)
        if type(_userData) == type({}) and len(_userData) > 0:
            for k, v in _userData.items():
                if k.find('ext_') != 0:
                    del (_userData[k])
        # 创建用户并初始化数据
        uid = g.m.userfun.creatPlayer(conn.SERVERIDX,_binduid, uname, sex, head=_rhead[0],ip=conn.clientip,**_userData)
        # 生成所有的任务
        g.m.taskfun.generateAllTask(uid)
        # 玩家第一次打开赠送3个幸运币
        _prize = [{'a': 'item', 't': '2007', 'n': 3}]
        g.getPrizeRes(uid, _prize, act={'act':'user_login','prize':_prize})
        # 特定渠道特定时间发送奖励邮件
        if g.config['OWNER'] == 'blyinghe' and g.C.NOW('2018-12-17 00:00:00') <= g.C.NOW() <= g.C.NOW('2018-12-24 23:59:59'):
            _title = '欢迎来到《暗黑超神》！'
            _content = '　　亲爱的各位勇士们，经过数月的测试与优化，《暗黑超神》现正式上线和大家见面了！感谢各位勇士一直以来的支持和等待！为了表示对各位勇士的感谢，我们对首发上线一周内进入游戏的勇士发放如下奖励，祝各位勇士游戏愉快！\r\n　　《暗黑超神》是一款高品质放置角色扮演手游！自然、邪能、亡灵、奥术、光明、黑暗6个不同阵营，每位英雄都有属于自己的专属个性技能，不同阵营的克制与搭配，千百种组合策略等你来发现！选择你熟悉的英雄，进行培养、提升以及历练，在战场上拼命守卫，保卫你的美好家园！\r\n\r\n《暗黑超神》官方运营组'
            _prize = [{'a':'item','t':'42015','n':50},{'a':'item','t':'2004','n':100},{'a':'attr','t':'jinbi','n':50000},{'a':'attr','t':'useexp','n':50000}]
            g.m.emailfun.sendEmails([uid],1,_title,_content,prize=_prize)

    else: #存在则取uid的值
        uid =  str(hasUser["uid"])

    # 判断是否再黑名单里面
    _time = isUidInBlackList(uid)
    if _time is not None:
        _res['s']=-6
        _res['errmsg'] = g.L('user_login_-6')
        return _res

    _cacheKey = "UIDLOGIN_%s" % uid
    _cacheInfo = g.mc.get(_cacheKey)
    _nt = g.C.NOW()
    #缓存信息未删除,3秒内无法重复登陆
    if _cacheInfo!=None and _nt - _cacheInfo["t"]<3 and g.conf['VER'] != 'debug':
        _res['s']=-5
        return _res

    g.mc.set(_cacheKey,{"t":_nt})
    _sess = g.m.sess.Session(uid)
    _lastSid = _sess.get("sid")
    if _lastSid!=None:
        g.mc.delete(_lastSid)

    _nt = g.C.NOW()
    _sess.set("sid",str(_sid))
    _sess.set("uid",uid)
    #清除gud缓存
    g.m.gud.reGud(uid)
    gud = g.getGud(uid)
    gud["logintime"] = _nt
    gud['lastloginip'] = conn.clientip
    g.m.gud.setGud(uid,gud)
    g.mc.set(str(_sid),uid)
    #更新登陆时间
    _r = g.m.userfun.updateUserInfo(uid,{"logintime":_nt,"lastloginip":conn.clientip})
    _optime = g.getOpenTime()
    g.event.emit("firstlogin",uid)
    # 生成当日开服狂欢数据
    # g.m.kfkhfun.genrateDayInfo(uid)
    
    '''
    ===========================================
    你想在这里加方法？考虑下：
    
    确定需要在login的时候就初始化？
    是否所有玩家都需要调用你的方法？
    能否通过GUD数据判断该不该调用你的方法？
    刚开区时那一堆新号玩家是否需要调用你的方法？
    如果是获取全服数据，每个玩家都是一样的判断，有没有做缓存？
    
    项目的login逻辑，往往是最大的性能瓶颈，仔细斟酌！
    ===========================================
    '''
    rdata = {
        "gud":gud,
        "sid":_sid,
        "opentime":_optime,
        'isNewPlayer':_isNewPlayer
    }
    _res["d"] = rdata
    return _res



if __name__ == "__main__":
    uid = g.buid("xuzhao")
    _title = '欢迎来到《暗黑超神》！'
    _prize = [{'a': 'item', 't': '42015', 'n': 50}, {'a': 'item', 't': '2004', 'n': 500},
              {'a': 'attr', 't': 'jinbi', 'n': 300000}, {'a': 'attr', 't': 'useexp', 'n': 300000}]
    # g.m.emailfun.sendEmails([uid], 1, _title, _content, prize=_prize)
    # print isUidInBlackList(uid)
    g.mc.flush_all()