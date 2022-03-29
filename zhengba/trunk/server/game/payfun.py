#!/usr/bin/python
#coding:utf-8

'''
支付相关方法
'''
import sys
if __name__ == "__main__":
    sys.path.append("..")
    
import g


#获取支付的配置
def getPayCon(k=''):
    _con = g.GC["pay"]
    if k!='':
        return _con[k]
    
    return _con

#获取首冲送的东西--需要删除的方法
def getShouChongCon():
    return g.GC["shouchong"]['base']

# 发送首充邮件--需要删除的方法
def sendShouchongEmail(uid, idx):
    return
    '''_con = getShouChongCon()
    _pCon = _con[int(idx)][1]
    _title = _pCon['email']['title']
    _content = _pCon['email']['content']
    _prize = _pCon['prize']
    g.m.emailfun.sendEmail(uid,1,_title,_content,prize=_prize)'''

#检查订单id是否存在
def checkOrderId(orderid):
    _rInfo = getPayListInfo({"orderid":orderid})
    if len(_rInfo)>0:
        return True
    
    return False
#获取充值列表信息

def getPayListInfo(where=None,*arg,**kwarg):
    _res = g.m.dball.getPayListInfo(where,*arg,**kwarg)
    return (_res)

#添加充值信息

def addPayListInfo(data):
    _res = g.m.dball.addPayListInfo(data)
    return (_res)

#格式化充值信息
def fmtPayInfo(uid,act,money,orderid,payconf):
    _data = {}
    
    _data["uid"] = uid
    _data["ctype"] = act
    _data["money"] = money
    _data["orderid"] = orderid
    _data["ctime"] = g.C.NOW()
    _data["proid"] = payconf['proid']
    _data["rmbmoney"] = payconf["rmbmoney"]
   
    return _data

#获取已使用充值赠送的次数

def getPayZsNum(uid,proid):
    _defNum = 0
    _r = g.getAttr(uid, {"ctype":g.L("playattr_ctype_payzsnum"),"k":proid}, keys='_id,v')
    if _r !=None:
        _defNum = int(_r[0]["v"])
    
    return (_defNum)

#设置已使用充值赠送的次数

def setPayZsNum(uid,proid,num):
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_payzsnum"),"k":proid},{"v":num})
    return (_r)

#增加累计充值的信息

def addLeijiChongzhi(uid,addyuanbao):
    _r = g.m.statfun.setStat(uid,g.L("stat_ctype_ljczrmbmoney"),{"$inc":{"v":addyuanbao}})
    return (_r)
    

#充值成功事件
#act - 0 普通充值
#act - 1 内部充值
#act - 2 普通月卡充值
#act - 3 内部月卡充值
#act - 4 普通至尊卡充值
#act - 5 内部至尊卡充值

def onChongzhiSuccess(uid,act,money,orderid,payCon):
    #act = int(act)
    act = payCon['proid']
    _retVal = {}
    '''
    #处理月卡逻辑
    if act in (2,3):
        _retVal = onYuekaChongzhi(uid, act, money, orderid, payCon)
    
    #处理至尊卡逻辑
    if act in (4,5):
        _retVal = onZhizunkaChongzhi(uid, act, money, orderid, payCon)
    '''

    # 处理聚义宝箱逻辑
    if payCon['proid'] == 'jybx128':
        g.m.shilijybx.buyJuyibaoxiang(uid)

    _yueka = getMyYuekaInfo(uid)
    if _yueka:
        setYuekaCommbo(uid,1)

    if int(money)>=getYuekaJiHuoCon():
        onYuekaChongzhi(uid,act,money,orderid,payCon)

    chkIfShouchongPrize(uid, money)
    #2018-2-6 月卡连续领取记录初始化-任何重置都会重置
    #g.m.taskfun.setYueKaCommboTime(uid,g.C.NOW())
    return (_retVal)

#至尊卡充值处理逻辑

def onZhizunkaChongzhi(uid,act,money,orderid,payCon):
    #至尊卡档次
    #获取我的至尊卡是否已开通
    _nowZhizunkaInfo = getMyZhizunkaInfo(uid)
    if _nowZhizunkaInfo==0:
        _r = setMyZhizunkaInfo(uid, 1)

#月卡充值处理逻辑

def onYuekaChongzhi(uid,act,money,orderid,payCon):
    #月卡档次
    #获取我的月卡的剩余时间
    _nowYuekaInfo = getMyYuekaInfo(uid)
    #有月卡信息则不进行操作
    if _nowYuekaInfo: return 

    _nt = g.C.NOW()
    #获取已激活时间和当前时间差,计算已激活月卡多少天
    _zt = g.C.NOW(g.C.DATE(_nt))
    _setData = _zt + 30 * 24*3600
    #计算未过期的时间,防止覆盖
    _r = setMyYuekaInfo(uid, _setData)
    g.event.emit("taskcondchange",uid,'yueka',1)
    setYuekaCommbo(uid,1)

#获取我的月卡信息

def getMyYuekaInfo(uid):
    _retVal = 0
    _nt = g.C.NOW()
    _r = g.getAttr(uid, {"ctype":"playattr_ctype_ykinfo"}, keys='_id,v', isnone=1)
    if _r!=None:
        _retVal = _r[0]["v"]
        #月卡到期时间
        if _retVal < _nt:
            _retVal = 0
            
    return (_retVal)
    
#设置我的月卡信息

def setMyYuekaInfo(uid,passtime):
    passtime = int(passtime)
    _r = g.setAttr(uid, {"ctype":"playattr_ctype_ykinfo"}, {"v":passtime})
    return (_r)

#获取我的至尊卡信息

def getMyZhizunkaInfo(uid):
    _retVal = 0
    _nt = g.C.NOW()
    _r = g.getAttr(uid, {"ctype":g.L("playattr_ctype_zzkinfo")}, keys='_id,v', isnone=1)
    if _r!=None:
        _retVal = 1
            
    return (_retVal)
    
#设置我的至尊卡信息

def setMyZhizunkaInfo(uid,state):
    state = int(state)
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_zzkinfo")}, {"v":state})
    return (_r)

#获取月卡奖励的commbo
def getYuekaCommbo(uid):
    _retVal = 0
    _r = g.getAttr(uid,{'ctype':g.L('playattr_ctype_ykcommbo')})
    if _r:
        _retVal = int(_r[0]['v'])

    return _retVal

#设置月卡奖励暴击
def setYuekaCommbo(uid,value):
    _r = g.setAttr(uid,{'ctype':g.L('playattr_ctype_ykcommbo')},{'v':int(value)})
    return _r

#检查月卡暴击
def ifDouble(uid):
    _retVal = 1
    _r = g.mdb.find1('task',{'uid':uid,'taskid':10051})
    if not _r: return _retVal

    _zt = g.C.NOW(g.C.DATE())
    _yeszt = _zt - 24*3600
    if 'finishtime' in _r and _yeszt < _r['finishtime']< _zt:
        # if getYuekaCommbo(uid): 
        _retVal = 2
    # else:
    #     setYuekaCommbo(uid,0)

    return _retVal


# 检查是否需要发送首充奖励--需要删除的方法
def chkIfShouchongPrize(uid, money):
    return
    '''gud = g.getGud(uid)
    _con = getShouChongCon()
    for idx, ele in enumerate(_con):
        if idx >= gud['shouchong'] and int(money) >= ele[0]:
            # sendShouchongEmail(uid, idx)
            g.m.userfun.updateUserInfo(uid, {'shouchong': idx + 1}, {'act': 'firstpayprize'})
            g.sendUidChangeInfo(uid, {'attr': {'shouchong': idx + 1}})
            break'''

# 新增月卡激活条件判断
def getYuekaJiHuoCon():
    # 开区时间
    _openTime = g.getOpenTime()
    _zt = g.C.NOW(g.C.DATE(_openTime)) + 3* 24* 3600
    _nt = g.C.NOW()
    _price = 98
    if _nt <= _zt:
        _price *= 0.6
    return _price

#获取累计充值多少元
def getAllPayYuan(uid):
    _ctype = 'chongzhi_allpaynum'
    _num = g.m.statfun.getMyStat(uid,_ctype)
    return _num

#设置累计充值（元）
def setAllPayYuan(uid,num):
    _ctype = 'chongzhi_allpaynum'
    _num = g.m.statfun.acStat(uid,_ctype,num)

g.event.on("chongzhi",onChongzhiSuccess)

if __name__ == "__main__":
    uid = g.buid("gch")
    gud = g.getGud(uid)
    print gud['shouchong']
    print gud['shouchongprize']
    # print chkIfShouchongPrize(uid, 30)