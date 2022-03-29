# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/6/16:34
'''
import g
'''
每日登录好礼
'''
def getCon(key):
    _peizhiInfo = g.GC["qiandao"][key]

    return


#获取用户登陆的次数
def getLoginNum(uid):
    _loginNum = 0
    _data = g.getAttrOne(uid, {"ctype": "sign_login_num"})
    if _data is None:
        g.setAttr(uid,{"ctype": "sign_login_num"},{"$inc":{"v": 1}})
        _loginNum = 1
    else:
        _ndate = g.C.DATE()
        _chkDate = g.C.DATE(_data['lasttime'])
        # 数据存在 不是同一天
        if _ndate != _chkDate:
            _loginNum = int(_data['v'])
            # 多加一个毫秒条件  防止数据错误
            _w = {"ctype": "sign_login_num"}
            if _data.get('chktime'):
                _w['chktime'] = _data['chktime']
            g.setAttr(uid, _w, {"v": _loginNum+1})
            # bug 登陆多加了一天 这边记录时间
            nt = g.C.NOW()
            logres = g.m.dball.writeLog(uid, 'sign_login_num', {'nt': nt,'lt':_data['lasttime'],'cv':_data['v']})

            _loginNum = _loginNum + 1 if _loginNum + 1 <= 30 else 30
        else:
            _loginNum = _data['v'] if _data['v'] <= 30 else 30

    return _loginNum


'''
1 代表第一组配置  默认为第一组配置
2 代表第二组配置
 v代表已经领取过的礼包
。。。
'''
#获取已经领取礼包的次数
def getRecSignNum(uid):
    _res = {'k':1,'v':0}
    _data = g.getAttrOne(uid,{"ctype":"sign_recv_num"})
    if _data != None:
        _res = {'k':_data['k'],'v':_data['v']}
        _prizeQiandao = g.GC["qiandao"][str(_data['k'])]
        _ndate = g.C.DATE()
        _chkDate = g.C.DATE(_data['lasttime'])
        #是否领完这一组奖励，初始化登陆次数
        if _data['v'] >= len(_prizeQiandao) and _ndate != _chkDate:
            #标识今天未领取
            _res = {'k': 2, 'v': 0}
            _peizhiInfo = g.GC["qiandao"]['2']
            _gid = g.GC["qiandao"]["diaoluozu"]

            #初始化特殊奖励
            _reshero = g.m.diaoluofun.getGroupPrizeNum(_gid)
            g.setAttr(uid, {"ctype": "qiandao_prize"}, {"prize": _reshero})

            g.setAttr(uid, {"ctype": "sign_recv_num"}, _res)
            g.setAttr(uid, {"ctype": "sign_login_num"}, {"v": 1,'chktime':g.C.MNOW()})
            return _res
    else:
        g.setAttr(uid, {"ctype": "sign_recv_num"}, {"k": 1, "v": 0})

    return _res



"""
设置礼包领取数量
"""
def setResSignNum(uid):
    _res= {"k":1,"v":0}
    _data = g.getAttrOne(uid, {"ctype": "sign_recv_num"}, keys="_id,v,lasttime,k")
    _nt = g.C.NOW()
    if _data != None:
        _val = _data["v"]
        _val = _val + 1
        _res.update({"v":_val,"k":_data["k"]})

        _r = g.setAttr(uid,{"ctype":"sign_recv_num"},_res)
    else:
        g.setAttr(uid, {"ctype": "sign_recv_num"}, {"k":1,"v":0})


    return _res

# 次日登陆信息
def getCRDLisOpen(uid):
    _cache = g.mc.get(g.C.STR('giverarepet_{1}', uid))
    if _cache:
        return {'time': g.C.ZERO(g.C.NOW())}

    _hrInfo = getHeroRecruitInfo(uid)
    if _hrInfo['time'] > g.C.NOW():
        return _hrInfo

    # 三天后没有领的发邮件
    if g.C.NOW() > _hrInfo['time'] and len(_hrInfo['gotarr']) != 4:
        _con = g.GC['giverarepet']
        _prize = []
        for i in _hrInfo['can']:
            _prize.extend(_con[i]['prize'])

        if _prize:
            g.m.emailfun.sendEmails([uid], 1, _con['email']['title'], _con['email']['content'], _prize)
            _hrInfo['gotarr'].extend(_hrInfo['can'])
            # 更新用户数据
            g.setAttr(uid, {'ctype': 'hero_recruit'}, {'data': {'gotarr': _hrInfo['gotarr'],'cd':_hrInfo['time']}})
            g.m.mymq.sendAPI(uid, 'newemail', '1')
        g.mc.set(g.C.STR('giverarepet_{1}', uid), 1)

    return {'time':_hrInfo['time'],'gotarr':_hrInfo['gotarr']}

# 获取英雄招募的信息
def getHeroRecruitInfo(uid):
    _data = g.mc.get(g.C.STR('herorecruit_{1}', uid))
    if not _data:
        _ctype = 'hero_recruit'
        _data = g.getAttrOne(uid, {'ctype': _ctype}, keys='_id,data')
        if not _data:
            _data = {'data': {'gotarr': [],'cd':g.C.ZERO(g.C.NOW()) + 3*24*3600}}
            g.setAttr(uid,{'ctype': _ctype},_data)
        g.mc.set(g.C.STR('herorecruit_{1}', uid), _data)

    _gotarr = _data['data']['gotarr']
    if len(_gotarr) == 4:
        return {'time': g.C.ZERO(g.C.NOW()), 'can':[], 'gotarr':_gotarr}

    gud = g.getGud(uid)
    _cd = _data['data']['cd']
    _nt = g.C.NOW()
    # 次日登陆了
    # if _nt > _cd - 24*3600*2 and '2' not in _gotarr:
    #     onHeroRecruit(uid, '2')

    _con = g.GC['giverarepet']
    _canRecList = []
    # 奥丁战神 通关
    if '1' not in _gotarr and gud['maxmapid'] > _con['1']['pval']:
        _canRecList.append('1')
    # 寒冰法师 次日登陆就送
    if '2' not in _gotarr and _nt > _cd - 24*3600*2:
        _canRecList.append('2')
    # 邪灵法师 激活大月卡
    if '3' not in _gotarr and g.m.yuekafun.getYueKaInfo(uid, 'da')['isjh'] == 1:
        _canRecList.append('3')
    # 恶魔此刻  领取完前三个
    if '4' not in _gotarr and len(_canRecList + _gotarr) == 3:
        _canRecList.append('4')

    return {'time':_cd,'can':_canRecList,'gotarr':_gotarr}


#红点逻辑
def getHongdian(uid):
    loginNum = getLoginNum(uid)
    recNum = getRecSignNum(uid)["v"]
    hongdian = 0
    if loginNum > recNum:
        hongdian = 1

    return {"qiandao":hongdian}

# 监听英雄招募
def onHeroRecruit(uid, _type):
    _data = g.mc.get(g.C.STR('herorecruit_{1}', uid))
    if not _data:
        _ctype = 'hero_recruit'
        _data = g.getAttrOne(uid, {'ctype': _ctype}, keys='_id,data')
        _data = _data or {'data': {'gotarr': [],'cd':0}}
        g.mc.set(g.C.STR('herorecruit_{1}', uid), _data)

    _send = False
    # 月卡
    if _type == '3' and '3' not in _data['data']['gotarr']:
        _send = True
    elif _type == '4' and '4' not in _data['data']['gotarr']:
        _send = True
    elif _type == '2' and '2' not in _data['data']['gotarr']:
        _send = True
    elif _type == '1' and '1' not in _data['data']['gotarr']:
        _send = True

    if not _send:
        return
    g.m.mymq.sendAPI(uid, 'herorecruit_redpoint', '1')

g.event.on('hero_recruit', onHeroRecruit)


if __name__ == "__main__":
    uid = g.buid('xuzhao')
    print getLoginNum(uid)