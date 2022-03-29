# !/usr/bin/python
# coding:utf-8

'''
    红点公用方法
'''

import g, sys

import monthfund

# 获取所有未读邮件
def getAllUnreadEmail(uid):
    _res = {'system':0,'chat':0}
    # 获取与我相关的未读全部邮件或者未领取奖励的邮件   系統邮件
    _nt = g.C.NOW()
    _where = {
        "$and":[
            {"uid": uid, 'passtime': {'$gte': _nt}},
            {"$or": [{"isread": 0}, {"getprize": 0}]},
            {'$or':[{'needlv': {'$lte': g.getGud(uid)['lv']}}, {'needlv': {'$exists': 0}}]}
        ]
    }
    _emails = g.mdb.find('email', _where,fields=['_id','senduid','prize','dlist','isread','etype','getprize'])
    for i in _emails:
        if uid in i.get('dlist',[]):
            continue
        if 'senduid' in i and _res['chat'] == 0 and i['isread'] == 0:
            _res['chat'] = 1
        elif 'prize' in i and _res['system'] == 0 and i['getprize'] == 0:
            _res['system'] = 1

        if _res['chat'] == 1 and _res['system'] == 1:
            break

    return _res


# 获取月卡紅點
def getUnGetYueKa(uid, key):
    yuekaInfo = g.m.yuekafun.getYueKaInfo(uid, key)
    # 月卡未激活
    if not yuekaInfo or not yuekaInfo["isjh"]:
        return 0

    # 当天已经领取
    nt = g.C.NOW()
    zt = g.C.ZERO(nt)
    if (zt < yuekaInfo['lqtime'] < zt + 3600 * 24):
        return 0

    return 1


# 获取签到红点
def getUnSignDenglu(uid):
    _data = g.getAttrByDate(uid, {'ctype':'login_gift'})
    if _data and _data[0].get('v') == 0:
        return 1
    _loginNum = g.m.signdenglufun.getLoginNum(uid)
    _recvNum = g.m.signdenglufun.getRecSignNum(uid)
    if _loginNum <= _recvNum["v"]:
        return 0
    return 1


# 获取等级基金红点
def getUnGetDengjiPrize(uid, hdid):
    _val = 0
    gud = g.gud.get(uid)
    _hdInfo = g.m.huodongfun.getInfo(hdid)
    if not _hdInfo:
        return _val
    _valInfo = g.m.dengjijijin.getOpenData(uid, _hdInfo)
    _valInfo = _valInfo['myinfo']
    g_lv = gud["lv"]
    hdarr = _hdInfo["data"]["arr"]
    for idx,i in enumerate(hdarr):
        if g_lv >= i['val'] and (i['val'] not in _valInfo.get('rec',[]) or (-1 in _valInfo['gotarr'] and i['val'] not in _valInfo['gotarr'])):
            _val = 1
            break

    return _val


# 首充礼包红点
def getUngetShouchong(uid):
    _nt = g.C.NOW()
    # 活动结束
    _cacheKey = g.C.STR('SHOUCHONGOVER')
    _cache = g.m.sess.get(uid, _cacheKey)
    if _cache:
        return 0
    _scData = g.m.shouchongfun.getShouChongData(uid)
    # 活动未结束，是否领奖
    _payNum = None

    _con = g.GC['shouchong']
    _res = {}
    for k, v in _scData.items():
        if len(v['chkrectime']) == 0:
            # 未激活
            _res[k] = 0
            continue
        # 可领取的长度
        _canRecNum = 0
        for tm in v["chkrectime"]:
            if _nt < tm:
                continue
            _canRecNum += 1

        if _canRecNum == 0:
            _res[k] = 0
            continue
        if _canRecNum <= len(v["rec"]):
            _res[k] = 0
            continue

        if _payNum == None:
            _payNum = g.m.payfun.getAllPayYuan(uid)

        if _payNum < _con[str(k)]['paynum']:
            _res[k] = 0
            continue
        # 可领取
        _res[k] = 1

    return _res


# 积天返利
#def getUngotJitian(uid):
    #_retVal = 0
    #htype = 11
    #_w = {'htype': htype,'etime':{'$gte': g.C.NOW()}}
    #_hdInfo = g.mdb.find1('hdinfo', _w)
    #if not _hdInfo:
        #return _retVal
    #hdid = _hdInfo['hdid']
    #_valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    #hdarr = _hdInfo["data"]["arr"]

    #for arr in hdarr:
        #if _valInfo['val'] >= arr['val'] and arr['val'] not in _valInfo.get("gotarr", []):
            #_retVal = 1
            #break

    #return _retVal

def getUngotJitian(uid,_hdInfos):
    hongDianHDIDS = []
    
    _hdidList = map(lambda x: x['hdid'], _hdInfos)
    _valInfos = g.mdb.find('hddata', {'hdid': {'$in': _hdidList}, 'uid': uid})

    for _hdInfo in _hdInfos:
        for _valInfo in _valInfos:
            if _hdInfo['hdid'] == _valInfo['hdid']:
                _myVal = _valInfo.get("val", 0)
                hdarr = _hdInfo["data"]["arr"]
                for arr in hdarr:
                    if _myVal >= arr['val'] and arr['val'] not in _valInfo.get("gotarr", []):
                        hongDianHDIDS.append( _hdInfo['hdid'] )
                        break
                        
    return hongDianHDIDS

# 累积充值
#def __getUngotLeijichongzhi(uid, hdid):
    #retVal = 0

    #_hdInfo = g.m.huodongfun.getInfo(hdid)
    ## 如果活动未上架
    #if not _hdInfo:
        #return retVal

    #_nt = g.C.NOW()
    #hdarr = _hdInfo["data"]["arr"]
    ## 未到领取时间
    #if _nt > _hdInfo['etime']:
        #return retVal

    #_valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    #_myVal = _valInfo.get("val", 0)
    ## 充值金额满足某一档
    #for ele in hdarr:
        #if _myVal >= ele['val'] and ele['val'] not in _valInfo.get("gotarr", []):
            #retVal = 1
            #break

    #return retVal


# 充值与礼包
def getUngotCzLb(uid):
    res = {"meiribx": 0, "meirisd": 1, 'yktq': 0}

    meiRiData = g.m.chongzhihdfun.getMRXGRecData(uid)
    if "free" not in meiRiData:
        res["meiribx"] = 1

    _shopInfo = g.m.shopfun.getShopData(uid, '6')
    if _shopInfo["shopitem"][0]["buynum"] == 0:
        res["meirisd"] = 0

    # 月卡是否激活
    yuekaInfo = g.m.yuekafun.getYueKaInfo(uid, 'xiao')
    if yuekaInfo['isjh'] and not g.getAttrByDate(uid, {'ctype': 'yktq_prize'}):
        res['yktq'] = 1
    return res


# 获得所有的红点
def getAllHongdian(uid, types=[], iscache=1):
    _rData = {}
    _all = (len(types) == 0)

    _key = 'email'  # 邮件
    if _all or _key in types:
        _rData[_key] = getAllUnreadEmail(uid)

    _key = 'kfkh'  # 开服狂欢
    if _all or _key in types:
        _rData[_key] = getKFKHhongdian(uid)

    _key = 'yueka'  # 小月卡
    if _all or _key in types:
        _rData[_key] = 0
        if getUnGetYueKa(uid, 'xiao') or getUnGetYueKa(uid, 'da') or g.m.lifetimecardfun.getHD(uid):
            _rData[_key] = 1

    _key = "sign"  # 签到
    if _all or _key in types:
        _rData[_key] = getUnSignDenglu(uid)

    # _key = "dengjiprize"  # 等级基金
    # if _all or _key in types:
    #     _rData[_key] = getUnGetDengjiPrize(uid, 400)

    _key = "shouchonghaoli"  # 首充好礼
    if _all or _key in types:
        _rData[_key] = getUngetShouchong(uid)

    #_key = "jitianfanli"  # 积天返利  #需要合并到huodog
    #if _all or _key in types:
    #    _rData[_key] = getUngotJitian(uid)

    #_key = "leijichongzhi"  # 累积充值  #需要合并到huodong
    #if _all or _key in types:
    #    _rData[_key] = getUngotLeijichongzhi(uid, 1300)

    _key = "chongzhiandlibao"  # 充值与礼包
    if _all or _key in types:
        _rData[_key] = getUngotCzLb(uid)

    # 英雄祭坛
    _key = 'herojitan'
    if _all or _key in types:
        _rData[_key] = getJitanRedPoint(uid)

    # 法师塔
    _key = 'fashita'
    if _all or _key in types:
        _rData[_key] = getFashitaHD(uid)

    # 点金
    _key = 'dianjin'
    if _all or _key in types:
        _rData[_key] = getDianjinHD(uid)

    # 好友
    _key = 'friend'
    if _all or _key in types:
        _rData[_key] = getFriendHD(uid)

    # 每日试炼
    _key = 'mrsl'
    if _all or _key in types:
        _rData[_key] = getMRSLhongdian(uid)

    # 日常任务
    _key = 'dailytask'
    if _all or _key in types:
        _rData[_key] = getDailyTaskHD(uid)

    # 成就任务
    _key = 'succtask'
    if _all or _key in types:
        # 不满等级要求
        if g.chkOpenCond(uid, 'succtask'):
            _taskList = g.mdb.find('task', {'uid': uid, 'type': 1, 'isreceive': 0})
            _rData[_key] = len([i for i in _taskList if i['nval'] >= i['pval']])

    # 十字军远征
    _key = 'shizijun'
    if _all or _key in types:
        _rData[_key] = getShizijunHD(uid)

    # 探险
    _key = 'tanxian'
    if _all or _key in types:
        _rData[_key] = getTanxianHD(uid)

    # 挂机时间
    _key = 'guajitime'

    if _all or _key in types:
        _rData[_key] = getTanxianTimeHD(uid)

    # 工会
    _key = 'gonghui'
    if _all or _key in types:
        _rData[_key] = getGuildHD(uid)

    # 周常活动
    #_key = 'zhouchanghuodong'  #需合并到huodong
    #if _all or _key in types:
    #    _rData[_key] = getZChuodong(uid)

    # 限时活动
    _key = 'huodong'
    if _all or (_key in types or 'qingdian' in types):
        hdhuodong = g.m.huodongfun.getHongDian(uid)
        #-------------------
        #将原来单独的活动红点逻辑合并到huodong中
        specHuoDong = g.m.huodongfun.getIDSByHypes([14,11])
        _htype14List = []
        _htype13List = []
        _htype11List = []
        for __hinfo in specHuoDong:
            if __hinfo['htype'] == 14:
                _htype14List.append( __hinfo )
            if __hinfo['htype'] == 11:
                _htype11List.append( __hinfo )          
        
        # 周常活动红点
        if len(_htype14List)>0 : hdhuodong['huodong'] += getZChuodong(uid,_htype14List)
        #积天返利
        if len(_htype11List)>0 : hdhuodong['huodong'] += getUngotJitian(uid,_htype11List)
        #---------//----------
        _rData.update(hdhuodong)

    # 排行膜拜
    _key = 'worship'
    if _all or _key in types:
        _rData[_key] = getWorshipHD(uid)

    # 神器红点
    _key = 'artifact'
    if _all or _key in types:
        _rData[_key] = getArtifactHD(uid)

    # 月基金红点
    _key = 'monthfund'
    if _all or _key in types:
        _rData.update(getMonthFundHD(uid))

    # 跨服积分赛
    _key = 'crosszbjifen'
    if _all or _key in types:
        _rData[_key] = getCanSCJJ(uid)

    # 跨服积分赛
    _key = 'meirishouchong'
    if _all or _key in types:
        _rData[_key] = getMRSChongdian(uid)

    # 守望者秘境
    _key = 'watcher'
    if _all or _key in types:
        _rData[_key] = getWatcherHD(uid)

    # 天命奖励
    _key = 'destiny'
    if _all or _key in types:
        _rData[_key] = getDestinyHD(uid)

    # 英雄招募
    _key = 'herorecruit'
    if _all or _key in types:
        _rData[_key] = getHeroRecruitHD(uid)

    # 巅峰王者
    _key = 'crosswz'
    if _all or _key in types:
        _rData[_key] = g.m.crosswzfun.getWangZheRongYaoHongDian(uid)

    # 限时招募
    # _key = 'xszm'
    # if _all or _key in types:
    #     _rData[_key] = getXszmHD(uid)

    # 悬赏任务
    _key = 'xstask'
    if _all or _key in types:
        _rData[_key] = g.m.xstaskfun.getXstaskHD(uid)

    # 王者雕像
    _key = 'kingstatue'
    if _all or _key in types:
        _rData[_key] = g.m.crosswzfun.getKingStatueHD(uid)

    # 风暴战场
    _key = 'storm'
    if _all or _key in types:
        _rData[_key] = g.m.stormfun.getStormHD(uid)

    # 团队副本
    # _key = 'teamcopy'
    # if _all or _key in types:
    #     _rData[_key] = g.m.qyjjfun.getTeamCopyHD(uid)

    # 部落战旗
    _key = 'flag'
    if _all or _key in types:
        _rData[_key] = g.m.flagfun.getFlagHD(uid)

    # 节日狂欢
    _key = 'jrkh'
    if _all or _key in types:
        _rData[_key] = getLRKHHD(uid)

    # 雕文
    _key = 'glyph'
    if _all or _key in types:
        _rData[_key] = g.m.glyphfun.getGlyphHD(uid)

    # 试炼活动
    # _key = 'trial'
    # if _all or _key in types:
    #     _rData[_key] = g.m.trialfun.getHongDian(uid)

    # 爵位红点
    _key = 'title'
    if _all or _key in types:
        _rData[_key] = getTitleHD(uid)

    # 王者归来
    _key = 'return'
    if _all or _key in types:
        _rData[_key] = getKingsReturnHD(uid)

    # 寻龙定穴
    _key = 'xldx'
    if _all or _key in types:
        _rData[_key] = getXLDXHD(uid)

    # # 公平竞技场
    # _key = 'gpjjc'
    # if _all or _key in types:
    #     _rData[_key] = g.m.gongpingjjcfun.getHongDian(uid)
    # 小游戏红点
    _key = "xiaoyouxi"
    if _all or _key in types:
        _rData[_key] = getXiaoYouXiHD(uid)

    # 试炼之塔
    _key = 'slzt'
    if _all or _key in types:
        _rData.update(g.m.shilianztfun.getHongDian(uid))

    # 英雄预热
    _key = 'heropreheat'
    if _all or _key in types:
        _rData[_key] = g.m.heropreheat_79.getHD(uid)

    # 获取从限时活动挪到精彩活动里面的红点
    _con = g.GC['showhd']

    hdtypes = _con['keydata'].keys() if _all else types
    for k in hdtypes:
        if k not in _con['keydata']:
            continue
        _data = g.m.huodongfun.getHDinfoByHtype(_con['keydata'][k]['htype'])
        if not _data or 'hdid' not in _data:
            continue
        _rData[k] = int(bool(g.m.huodongfun.HDHDFUNC[_con['keydata'][k]['htype']](uid, _data['hdid'], _data)))

    apps = types if types else g.x.REDPOINT_MODULE
    for i in apps:
        app = i + 'fun' if not i.endswith('fun') else i
        if app not in sys.modules:continue
        # 活动红点不管
        if app.startswith('huodong'):
            continue
        func = sys.modules[app]
        if not hasattr(func, 'getHongDian'):continue
        try:
            _rData.update(func.getHongDian(uid))
        except:
            print func.getHongDian(uid)

    return _rData

def getXLDXHD(uid):
    _res = 0
    _data = g.m.huodongfun.getHDinfoByHtype(49)
    if _data and 'hdid' in _data:
        hdid = _data['hdid']
        _data = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,hd')
        # 开启后显示一次红点
        if 'hd' not in _data:
            _res = 1
            g.m.huodongfun.setMyHuodongData(uid, int(hdid), {'hd':1})
        else:
            # 消耗足够显示一次红点
            _chk = g.chkDelNeed(uid, g.GC['find_dragon']['need'])
            if _chk['res']:
                _res = 1
    return _res

# 王者归来红点
def getKingsReturnHD(uid):
    _res = {'login':0,'return':0,'daily':0,'recharge':0}
    _con = g.GC['returnhome']
    if not g.m.userfun.chkKingdReturn(uid):
        return _res

    _data = g.m.userfun.getKingsRerurnData(uid)
    # 已经过期了
    if _data['v'] <= g.C.NOW():
        return _res

    if _data['login'] > 0:
        for i in _con['login']:
            if _data['login'] >= int(i) and int(i) not in _data['receive']['login']:
                _res['login']  = 1
    if not _data['receive']['return']:
        _res['return'] = 1
    if _data['daily'] > 0:
        for idx, i in enumerate(_con['daily']):
            if _data['daily'] >= i['pval'] and idx not in _data['receive']['daily']:
                _res['daily'] = 1
    if _data['recharge'] > 0:
        for idx, i in enumerate(_con['recharge']):
            if _data['recharge'] >= i['pval'] and idx not in _data['receive']['recharge']:
                _res['recharge'] = 1
    return _res



# 爵位红点
def getTitleHD(uid):
    # 创建22天之后
    _res = {"up": 0, "prize": 0, 'libao': 0, 'aims': 0}
    gud = g.getGud(uid)
    if g.getOpenDay() >= 22:
        _con = g.GC["title"]
        # 没有升满级并且消耗足够
        if str(gud["title"] + 1) in _con and g.chkDelNeed(uid, _con[str(gud["title"])]["need"])['res']:
            _res["up"] = 1

        _res["libao"] = g.m.titlefun.getHD(uid)

        _con = g.GC['titlecom']
        if all([g.m.titlefun.chkDailyTaskOver(uid), not g.m.titlefun.chkFreeDayPrize(uid)]):
            _res['prize'] = 1

        _reclist = g.getAttrByCtype(uid, 'title_aimsprize', bydate=False, default=[])
        for idx,i in enumerate(_con['aimsprize']):
            if gud['title'] >= i['cond'] and idx not in _reclist:
                _res['aims'] = 1
                break

    return _res

# 获取节日狂欢红点
def getLRKHHD(uid):
    _retVal = []
    _hdinfo = g.m.jierikuanghuan_44.getHDinfoByHtype(44)
    if not _hdinfo or 'hdid' not in _hdinfo or g.C.NOW()>=_hdinfo['rtime']:
        return []
    _valInfo = g.m.huodong.jierikuanghuan_44.getOpenData(uid, _hdinfo)['myinfo']
    # 每日福利
    _fuli = str(_valInfo['val'].get('fuli',0))
    if _fuli in _hdinfo['data']['fuli'] and _fuli not in _valInfo['gotarr'].get('fuli',['0']):
        _retVal.append(1)
    # 活动任务
    for tid,val in _valInfo['val'].get('task',{}).items():
        if val >= _hdinfo['data']['task'][tid]['pval'] and tid not in _valInfo['gotarr'].get('task',[]):
            _retVal.append(2)
            break
    return _retVal


# 获取公会争锋的红点
def getCompetingHD(uid):
    gud = g.getGud(uid)
    # 没有加入公会 或者开服不到7天
    if not gud['ghid'] or g.getOpenDay() < 8:
        return 0

    # 有未领取的段位奖励
    _dkey = g.C.getWeekNumByTime(g.C.NOW())
    _topSegment = g.m.competingfun.getTopSegment(gud['ghid'])
    _prizeNum = g.mdb.find('playattr', {'k': _dkey, 'ctype': {
        "$in": ['competing_prize_{}'.format(i) for i in xrange(2, _topSegment + 1)]}, 'uid': uid})
    if len(_prizeNum) != _topSegment - 1:
        return 3

    _openOnce = not bool(g.getAttrByDate(uid, {'ctype': 'ghcompeting_openonce'}))
    # 周一到周五且未报名
    if g.chkOpenCond(uid, 'ghcompeting') and g.C.WEEK != 6 and gud['ghpower'] < 3 and g.m.competingfun.isCanSignUpGame(gud['ghid']) and _openOnce:
        return 1

    _nt = g.C.NOW()
    _con = g.GC['guildcompeting']['base']
    _season = g.m.competingfun.getSeasonNum()
    # 公会匹配了  并且开战时间   有挑战次数  并且今天没打开过
    if g.crossDB.find1('competing_main', {'season': _season,'ghid':gud['ghid']}, fields={'_id':1}) is not None:
        if g.C.ZERO(_nt) + _con['time']['fight'][0] <= _nt <= g.C.ZERO(_nt) + _con['time']['fight'][1] and (
                g.m.competingfun.getCanFightNum(uid) > 0 and _openOnce
        ):
            return 2

    return 0

# 英雄招募红点
def getHeroRecruitHD(uid):
    _data = g.m.signdenglufun.getHeroRecruitInfo(uid)
    return int(bool(_data['can']))

# 许愿池红点
def getXuyuanchiHD(uid):
    _res = 0
    gud = g.getGud(uid)
    _lv = gud['lv']
    _lvCon = g.GC['opencond']['base']['xuyuanchi']['main']
    # 判断等级是否足以开启
    _lvLimit = _lvCon[0][1]
    if _lv >= _lvLimit:
        _data = g.getAttrOne(uid,{'ctype':'xuyuanchi_cishu','k':g.C.getWeekNumByTime(g.C.NOW())},keys='_id,v,reclist')
        if _data:
            for idx,i in enumerate(g.GC['xuyuanchi']['common']['passprize']):
                if _data['v'] >= i[0][0] and idx not in _data.get('reclist', []):
                    _res = 1
                    break
    return _res


# 天命奖励
def getDestinyHD(uid):
    if not g.chkOpenCond(uid, 'tonyu'):
        return 0
    elif g.getAttrByDate(uid, {'ctype':'destiny_prize'}):
        return 0
    elif g.m.herofun.getDestinyData(g.getGud(uid).get('destiny', 0))['prize']:
        return 1
    else:
        return 0

# 守望者秘境
def getWatcherHD(uid):
    _res = {'target':0,'trader':0,'reset':0}
    if not g.chkOpenCond(uid, 'watcher'):
        return _res

    _data = g.mdb.find1('watcher',{'uid':uid},fields=['_id','winnum','reclist','trader','rebirthtime'])
    if _data:
        if _data['winnum'] != 0 and g.C.NOW() < _data['rebirthtime']:
            _target = g.m.watcherfun.getWatcherTarget()
            for i in _target:
                if _data['winnum'] >= i and i not in _data.get('reclist',[]):
                    _res['target'] = 1
                    break

    if not _data or g.C.NOW() >= _data['rebirthtime']:
        _res['reset'] = 1

        # if len(_data.get('trader',[])) != 0:
        #     _res['trader'] = 1
    return _res


# 每日首充红点
def getMRSChongdian(uid):
    if not g.m.shouchongfun.chkOpen(uid):
        return 0

    _scData = g.getAttrByDate(uid, {'ctype':'meirishouchong'})
    if not _scData or len(_scData[0].get('receive', [])) >= 2:
        return 0

    for idx, i in enumerate(g.GC['meirishouchong']['data'][g.m.shouchongfun.getKey()]):
        if _scData[0]['v'] >= i['val'] and idx not in _scData[0].get('receive', []):
            return 1

    return 0

def getMonthFundHD(uid):
    """
    没有购买的时候 每天第一次上线有红点
    购买了 有奖励可以领取的时候有红点


    :param uid:
    :return: dict
    {'monthfund':{'170':{'isbuy':0,'canlq':1,'180':{'isbuy':1,'canlq':1}}}}
    """

    resHDInfo = monthfund.getMonthFundInfo(uid, [170, 180])

    resHDDict = {'monthfund_{0}'.format(hd['hdid']): 0 for hd in resHDInfo}

    _nt = g.C.NOW()
    # 获取用户数据
    _htype = [monthfund.HTYPE.MonthFund128, monthfund.HTYPE.MonthFund328]


    resDict = {}

    _where = {'htype': {'$in': _htype}, 'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}
    # _userData = g.m.huodongfun.getUserHuoDong(uid,_where, fields=['val', 'gotarr', 'mfstime'])
    _userData = monthfund.getUserHuoDong(uid,_where, fields=['val', 'gotarr', 'mfstime','isbuy'])
    if len(_userData) <= 0:
        return resHDDict
    _hdid = []
    for _tmpData in _userData:
        _mfstime = _tmpData['mfstime']
        # _nowDay = (g.C.ZERO(_nt) - g.C.ZERO(_mfstime)) // (24* 3600) + 1
        _nowDay = _tmpData['val']
        # 检查是否可以领取奖励
        if _nowDay not in _tmpData['gotarr']:
            # 有可以领取的
            hdid = _tmpData['hdid']
            isbuy = _tmpData['isbuy']
            resDict.update({'monthfund_{0}'.format(hdid): _tmpData['isbuy']})

            # _hdid.append(_tmpData['hdid'])

    resHDDict.update(resDict)

    return resHDDict


# 获取神器任务红点
def getArtifactHD(uid):
    gud = g.getGud(uid)
    _sqid = gud.get('artifact', 0) + 1
    if _sqid > 5: _sqid = 5
    _con = g.GC['shenqitask'][str(_sqid)]
    _typeList = _con.keys()
    _w = {'uid': uid, 'ctype': {'$in': _typeList}}
    _allTask = g.m.statfun.getStatInfo(_w, keys='_id,v,ctype,finish')
    _res = 0
    for i in _allTask:
        _pval = _con[i['ctype']]['val']
        if _pval <= i['v'] and i.get('finish',0) != _sqid:
            _res = _sqid
            break
    return _res


# 获取排行膜拜
def getWorshipHD(uid):
    if not g.chkOpenCond(uid, 'ranklist'):
        return range(g.GC['rankcom']['ranknum'])

    _res= []
    _con = g.GC['rankcom']['ranktype']
    _rankNum = g.GC['rankcom']['ranknum']
    _ctype = 'rank_worship'
    _worshipInfo = g.getAttrByDate(uid,{'ctype':_ctype})
    _worshipList = []
    if _worshipInfo:
        _worshipList = _worshipInfo[0]['v']
    for i in xrange(_rankNum):
        if i == 3 and not g.getGud(uid).get('ghid'):
            _res.append(3)
            continue
        if (str(i) in _con and not g.chkOpenCond(uid, _con[str(i)])) or i in _worshipList:
            _res.append(i)
        # 公会单独判断

    return _res

# 获取公会红点
def getGuildHD(uid):
    _res = {'donate': 0, 'apply': 0,'fuben':0,'box':0,'treasure':0,'competing':0}
    gud = g.getGud(uid)
    if gud['ghid'] == '':
        return _res

    _guildID = gud['ghid']
    _power = gud['ghpower']
    # 官员或者会长
    if _power in (0, 1):
        if g.mdb.find1('gonghuiapply', {'ghid': _guildID}):
            _res['apply'] = 1

    if not g.m.gonghuifun.getJuanXianData(uid):
        _res['donate'] = 1

    # 公会宝库
    _con = g.GC['gonghui']['base']
    _cd = _con['boxcd']
    _maxRecNum = _con['boxrecnum']
    _boxInfo = g.mdb.find('gonghuibox', {'ghid': _guildID,'ctime':{'$gt':g.C.NOW() - _cd}},fields=['_id','reclist'])
    for i in _boxInfo:
        _recList = map(lambda x:x['uid'], i.get('reclist'))
        if uid not in _recList and len(_recList) < _maxRecNum:
            _res['box'] = 1
            break

    _maxNum = len([i for i in g.GC['gonghui_fuben']['base']['pkneed'] if i[0]['n'] == 0])
    _res['fuben'] = _maxNum - g.m.gonghuifun.getPkNum(uid) if int(g.m.gonghuifun.getMaxGongHuiFuBen(_guildID)) <= 60 else 0

    # 公会探宝
    _where = {'uid': uid, '$or': [{'treasure.boss': {'$exists': 1}}, {'treasure.freetime': {'$gt': g.C.NOW()}}]}
    # 可以探宝搜寻时
    if g.chkOpenCond(uid, 'friendhelp') and ((not g.getAttrByDate(uid,{'ctype':'treasure_openonce'}) and g.m.friendfun.getTiliNum(uid)) or not g.mdb.find1('friend', _where)):
        _res['treasure'] = 1

    # 公会争锋
    _res['competing'] = getCompetingHD(uid)
    # 团队任务
    if g.mdb.find1('gonghuiattr', {'ghid': _guildID, 'ctype': 'teamtask_leader','ispass':{'$exists':0},'k':{'$exists':1}}, sort=[['k', -1]], fields={'_id':1}) and g.m.teamtaskfun.getFightNum(uid) > 0:
        _res['teamtask'] = 1

     # 工会——攻城掠地
    _res["siege"] = g.m.gonghuisiegefun.getSiegeHongDian(uid)
    return _res


# 获取祭坛红点
def getJitanRedPoint(uid):
    _res = 0
    _jtInfo = g.getAttrByDate(uid, {'ctype': {'$in': ['jitan_freenum_1', 'jitan_freenum_3']}})
    if not _jtInfo or len(_jtInfo) < 2:
        _res = 1
        return _res

    _con = g.GC['jitan']
    for i in _jtInfo:
        _type = i['ctype'][-1]
        _maxNum = _con[_type]['freenum']
        if _maxNum - i['v'] >= 1:
            _res = 1
            return _res
    return _res


# 获取周常活动红点
# 刺鸟：该方法整个到huodong中，由原来的返回1/0 修改为返回有活动的hdid list
def getZChuodong(uid,_hdInfos):
    hongDianHDIDS = []
    
    _retVal = 0
    #_hdInfos = g.mdb.find('hdinfo', {'htype': 14, 'etime': {"$gte": g.C.NOW()}})
    _hdidList = map(lambda x: x['hdid'], _hdInfos)
    _valInfos = g.mdb.find('hddata', {'hdid': {'$in': _hdidList}, 'uid': uid})

    for _hdInfo in _hdInfos:
        for _valInfo in _valInfos:
            if _hdInfo['hdid'] == _valInfo['hdid']:
                hdarr = _hdInfo["data"]["arr"]
                for arr in hdarr:
                    if _valInfo['val'] >= arr['val'] and arr['val'] not in _valInfo.get("gotarr", []):
                        _retVal = 1
                        #return _retVal
                        hongDianHDIDS.append(_hdInfo['hdid'])
                        break
    #return _retVal
    return hongDianHDIDS


# 获取开服狂欢红点
def getKFKHhongdian(uid):
    _res = {}
    if g.m.kfkhfun.checkIsOpen(uid):
        # htype 非登录 全名半价和vip半价
        _kfkhData = g.m.kfkhfun.getKfkhData(uid, where={'htype': {"$nin": [3]}}, fields=['_id'])
        for i in xrange(1, g.m.kfkhfun.getKfkhDay(uid) + 1):
            _res[str(i)] = 0
            for ele in _kfkhData:
                if i == ele['day'] and ele['nval'] >= ele['pval'] and ele['finish'] == 0:
                    _res[str(i)] = 1
                    break
    return _res


# 获取探险领奖时间红点
def getTanxianTimeHD(uid):
    _res = 0
    _gjTime = g.m.tanxianfun.getGuaJiTimeData(uid)
    if _gjTime >= 10 * 60:
        _res = 1
    return _res


# 获取法师塔红点
def getFashitaHD(uid):
    _res = {'fashita':0,'devil':0,'dungeon':0, 'maze':0}
    if g.chkOpenCond(uid, 'fashita'):
        _fashitaInfo = g.m.fashitafun.getFashitaInfo(uid)
        if _fashitaInfo:
            _layerNum = _fashitaInfo.get('layernum', 0)
            _prizeList = _fashitaInfo.get('prizelist', [])
            _layerList = [i[0] for i in g.GC['fashitacom']['passprize']]
            for i in _layerList:
                if _layerNum >= i and i not in _prizeList:
                    _res['fashita'] = 1
                    break

    _res['dungeon'] = g.m.dungeonfun.getDungeonHD(uid)
    _res['maze'] = g.m.mazefun.getMazeHD(uid)
    # 如果处于降临阶段 或者等级不足就不显示红点
    _con = g.GC['shendianmowang']['base']['time']
    _nt = g.C.NOW()
    if not _con[0] + g.C.ZERO(_nt) <= _nt <= _con[1] + g.C.ZERO(_nt):
        return _res

    # 老区判断等级
    if g.getOpenTime() < g.GC['shendianmowang']['base']['timestamp'] and g.chkOpenCond(uid, 'temple_devil'):
        _res['devil'] = g.m.devilfun.getFightNum(uid)
    elif g.getOpenTime() >= g.GC['shendianmowang']['base']['timestamp'] and g.getOpenDay() >= 8:
        _res['devil'] = g.m.devilfun.getFightNum(uid)
    return _res


# 获取点金红点
def getDianjinHD(uid):
    _res = 0
    _act = g.m.dianjinfun.getDjCD(uid)[1]
    # 免费点金类型
    if _act['1'] > 0:
        _res = 1
    return _res


# 获取好友红点
def getFriendHD(uid):
    _nt = g.C.NOW()
    _res = {'yinji': 0, 'apply': 0}
    # 获取已接受的好友列表
    _giftInfo = g.m.friendfun.getGiftAndAccept(uid)
    _filterList = _giftInfo['accept']
    # 有未领取的好友印记
    _max = g.GC['friend']['base']['acceptnum']
    if g.m.friendfun.getCanReceiveYinji(uid) and len(_filterList) < _max:
        _res['yinji'] = 1
    if g.m.friendfun.getApplyList(uid):
        _res['apply'] = 1
    return _res

# 获取每日试炼红点
def getMRSLhongdian(uid):
    _res = {}
    _con = g.GC['meirishiliancon']['openlv']
    _lv = g.getGud(uid)['lv']
    for i in ('jinbi', 'exp', 'hero'):
        if _con[i] <= _lv:
            _res[i] = g.m.mrslfun.getLessNum(uid, i)
    return _res


# 获取日常任务红点
def getDailyTaskHD(uid):
    _time = g.C.ZERO(g.C.NOW())
    _w = {'uid': uid, 'type': 2, 'isreceive': 0, 'lasttime': {'$gte': _time}}
    _taskList = g.mdb.find('task', _w)
    return len([i for i in _taskList if i['nval'] >= i['pval']])


# 获取十字军红点
def getShizijunHD(uid):
    _res = 0
    if g.chkOpenCond(uid, 'shizijun_1'):
        # if g.getAttrByDate(uid, {'ctype':'shizijun_hongdian'}):
        #     return _res

        _data = g.getAttrByDate(uid, {'ctype': 'shizijun_data'})
        if not _data:
            _res = 1
        # elif _data and len(_data[0].get('passlist', [])) < 1:
        #     _res = 1
    return _res


# 获取探险红点
def getTanxianHD(uid):
    _res = 0
    if g.m.tanxianfun.getCanFreeNum(uid):
        _res = 1
        return _res

    _idxList = g.m.tanxianfun.getPassPrizeIdx(uid)
    # _mapId = g.m.tanxianfun.getMaxGjMapid(uid) - 1
    gud = g.getGud(uid)
    _mapId = gud['mapid']
    _con = g.GC['tanxiancom']['base']['passprize']
    for _idx, ele in enumerate(_con):
        if _idx not in _idxList and _mapId >= ele[0]:
            _res = 1

    return _res

#获取胜场奖励是否可领取
def getCanSCJJ(uid):
    _ret = {'jifen': 0, 'zb': 0}
    if not g.m.crosszbfun.ifOpen(uid):
        return _ret
    _recList = g.m.crosszbfun.getJiFenRecPrizeList(uid)
    _winnum = g.m.crosszbfun.getJiFenWinNum(uid)
    _con = g.m.crosszbfun.getCon()['jifen']['dateprize']
    _canprizelist = []
    idx = 0
    for ele in _con:
        if _winnum>=ele[0]:
            _canprizelist.append(idx)
        idx += 1

    if len(_canprizelist) > len(_recList):
        _ret['jifen'] = 2

    if g.m.crosszbfun.ifOpen(uid):
        _nt = g.C.NOW()
        _con = g.GC['crosszb']['base']['jifen']['opentime']
        if g.C.getWeekFirstDay(_nt)+_con[0]<=_nt<=g.C.getWeekFirstDay(_nt)+_con[1] and not _ret['jifen'] and g.m.crosszbfun.getCanJFPkNum(uid)>0:
            _ret['jifen'] = 1

        _con = g.GC['crosszb']['base']['zhengba']['opentime']
        if g.C.getWeekFirstDay(_nt)+_con[0]<=_nt<=g.C.getWeekFirstDay(_nt)+_con[1] and g.crossDB.find1('crosszb_zb',{'uid':uid,'dkey':g.C.getWeekNumByTime(g.C.NOW())}) and g.m.crosszbfun.getCanZBPkNum(uid) > 0:
            _ret['zb'] = 1

    return _ret

# 小游戏红点
def getXiaoYouXiHD(uid):
    _res = 0
    gud = g.getGud(uid)
    _con = g.GC['xiaoyouxi']
    _ctype = "xiaoyouxi_jstl"
    for _idx, _v in enumerate(_con):
        _level = _con[_idx]['level']
        for idx, _one in enumerate(_level):
            _cond = _one['cond'][0]
            if gud['maxmapid'] > _cond:
                _w = {'ctype': _ctype, 'k': str(_idx)}
                _rec = g.getAttrOne(uid, _w, keys="_id,v") or {}
                _gotarr = _rec.get('v', [])
                if idx not in _gotarr:
                    _res = 1
                    break
    return _res


if __name__ == "__main__":
    uid = g.buid('1')
    print getXiaoYouXiHD(uid)