#!/usr/bin/python
#coding:utf-8

import g

'''
vip功能
'''
VIPTYPE = {
    "FastFight":1,
    "PT10XuYuanChi":2,
    "JiTanNLOpen":3,
    "GJXuYuanChiOpen":4,
    "HeroBagMaxAdd":101,
    "DianJinExtJinBi":102,
    "GuaJiExtJinBi":103,
    "GuaJiExtUserExp":104,
    "GuaJiExtHeroExp":105,
    "MRSLBuyPkNum":106,
    "DianJinExtUseEXP":109,
    "MAXJIFEN":111,
    "MAXVIPBUYNUM":112,
}



#获取vip配置
def getVipCon(viplv=''):
    viplv = str(viplv)
    _con = g.GC["vip"]
    if viplv!='':
        return _con[viplv]
    
    return _con

#获取vip特权配置
def getVipTequan(viplv=''):
    viplv = str(viplv)
    _con = g.GC["pre_vip_tequan"]
    if viplv!='':
        return _con[viplv]
    
    return _con
    
#获取酒馆vip折扣信息
def getJiuguanVip(uid):
    #sum 折扣次数 sale 折扣 k 为酒馆类型 rtime 重置时间
    _res = None
    _vipNum = getTeQuanNumByAct(uid, 'JiuGuanHalf')
    if _vipNum>0:
        _res = {"10":{"rsnum":_vipNum,"snum":_vipNum,"sale":5,"rtime":0}}

    return _res


#获取我已领取的vip礼包
def getAlreadyGetPack(uid):
    _retVal = []
    _res = g.getAttrOne(uid, {"ctype":"vip_alreadypack"}, keys='_id,v')
    if _res!=None:
        _retVal = _res["v"]
    
    return _retVal

#增加已领取的vip礼包
def addGetVipPack(uid,viplv):
    viplv = int(viplv)
    _res = g.setAttr(uid,{"ctype":"vip_alreadypack"},{"$push":{"v":viplv}})
    return _res

#获取特权加成值
#tqid 为特权id
#目前特权列表在vip_tequan配置中
#2015年11月30日9:47:23 目前特权编号为1-25
def getTequanNum(uid,tqid):
    tqid = str(tqid)
    _retVal = 0
    gud = g.getGud(uid)
    if gud["vip"]>0:
        _con = getVipTequan(gud["vip"])
        if tqid in _con:_retVal = _con[tqid]
    
    return _retVal

def getTequanNumByVip(vip,tqid):
    _retVal = 0
    tqid = str(tqid)
    if vip>0:
        _con = getVipTequan(vip)
        if tqid in _con:_retVal = _con[tqid]
    
    return _retVal

#根据特权类型获取特权信息
def getTeQuanNumByAct(uid,act):
    _res = 0
    if act in VIPTYPE:_res = getTequanNum(uid,VIPTYPE[act])
    return _res


#获取vip增加的将领buff 
def getVipBuff(uid):
    _retVal = {}
    #获取特权增加的百分比
    _pro = getTeQuanNumByAct(uid,'VipBuff')
    if _pro >0:
        _retVal = {"bingli":_pro,"atk":_pro,"def":_pro}
    
    return _retVal

#是否领取vip每日奖励
def canRecVipPrize(uid):
    gud = g.getGud(uid)
    _vip = gud['vip']
    if _vip < 1:
        return 0
    
    _rec = getVipEveryPrizeRec(uid)
    if _rec == None or _rec != _vip:
        return 1

    return 0
    

#获取当天领取vip每日奖励的信息
def getVipEveryPrizeRec(uid):
    _ctype = 'vip_mrprizerec'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if len(_data) == 0:
        return
    
    _res = int(_data[0]['v'])
    return _res

#设置当天领取vip每日奖励的信息
def setVipEveryPrizeRec(uid,vip):
    _ctype = 'vip_mrprizerec'
    g.setAttr(uid,{'ctype':_ctype},{'v':vip})
    return 1

# 发送大月卡的奖励
def dayueka_sendPrize(data):
    return
    _con = g.GC['vip']
    _argsCon = g.GC['vipargs']['base']
    _title = _argsCon['title']
    _content = _argsCon['content']
    _res = []
    for i in data:
        if g.C.NOW() > g.C.ZERO(i['v']['nt']) + 3600*24*30 - 120:
            continue
        uid = i['uid']
        gud = g.getGud(uid)
        _vip = gud.get('vip', 0)
        if _vip <= 1:
            continue
        _prize = _con[str(_vip)]['tqmonth']
        g.m.emailfun.sendEmails([uid], 1, _title, g.C.STR(_content, _vip), _prize)
        _res.append({'uid':uid,"prize":_prize})
    return _res


'''
# 补发特定vip等级的vip福利奖励
def vipfuli_buchang(uid, viprange):
    title = g.L('vip_email_title')
    content = g.L('vip_email_content')
    newMail = False
    _con = g.GC["vip"]
    for vip in viprange:
        _vip = str(vip)
        if _vip not in _con:
            continue
        
        _prize = list(_con[_vip]['mrprize'])
        _content = g.C.STR(content,vip)
        g.m.emailfun.sendEmail(uid, 1, title, _content, _prize)
        newMail = True

    if newMail:
        g.m.emailfun.sendNewEmailMsg(uid, 1)
'''

'''
# vip等级发生变化时对没领到vip每日奖励进行邮件补偿
def onVipLvChange(uid, oldviplv, newviplv):
    oldviplv = int(oldviplv)
    newviplv = int(newviplv)
    _recVip = getVipEveryPrizeRec(uid)
    # 如果老vip等级福利没领取，则邮件补偿
    _viplv = range(oldviplv, newviplv)
    _viprange = list(_viplv)
    if _recVip != None and _recVip in _viprange:
        _viprange.remove(_recVip)
        
    vipfuli_buchang(uid, _viprange)
    '''

#g.event.on("viplvchange", onVipLvChange)
# g.event.on("viplv_upgrade", onVipLvUpGrade)

if __name__ == "__main__":
    uid = g.buid('xuzhao1')
    #onVipLvChange(uid,0,10)
    print getTequanNum(uid, 107)
    
    