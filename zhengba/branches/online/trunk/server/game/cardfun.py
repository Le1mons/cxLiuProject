#!/usr/bin/python
#coding:utf-8

import g

'''
通用翻牌系统
'''

#获取翻牌配置
def getCardCon(cid=''):
    cid = str(cid)
    _con = g.GC["card"]
    if cid!='':
        return _con[cid]
    
    return _con

#生成翻牌奖励
def genrateCardPrize(lv,cid):
    _con = getCardCon(cid)
    #奖励列表
    _prizeList = g.m.diaoluofun.getGroupPrizeLv(_con["p"],lv)
    #随机洗牌
    g.m.common.random.shuffle(_prizeList)
    for i,prize in enumerate(_prizeList):
        prize["price"] = 0
        prize["idx"] = i
        if i < _con["price"]:
            prize["price"] = _con["price"][i]
        
    return _prizeList

#设置翻牌奖励信息
def setCardInfo(uid,data,newdata=None):
    _setData = {"v":data}
    if newdata!=None:_setData = newdata
    _r = g.setAttr(uid, {"ctype":g.L("playattr_ctype_cardinfo")},_setData)
    return (_r)

#创建新的翻牌信息
def createCardInfo(uid,cid):
    _con = getCardCon(cid)
    gud = g.getGud(uid)
    #生成新翻牌奖励
    _prize = genrateCardPrize(gud["lv"], cid)
    #处理旧的翻牌信息
    _r = processLastCardInfo(uid)
    #设置翻牌奖励信息
    _allprice = _con["allprice"]
    _r = setCardInfo(uid, {"list":_prize,"allprice":_allprice})
    return (_prize)

#获取翻牌信息
def getCardInfo(uid):
    _retVal = None
    _r = g.getAttr(uid, {"ctype":g.L("playattr_ctype_cardinfo")})
    if _r!=None and len(_r[0]["v"])>0:
        _retVal = _r[0]["v"]
        
    return (_retVal)

#删除翻牌信息
def delCardInfo(uid):
    _r = g.delAttr(uid, {"ctype":g.L("playattr_ctype_cardinfo")})
    return (_r)
    
#处理上次未完成翻牌的奖励
def processLastCardInfo(uid,cardinfo=None):
    #获取翻牌信息
    _cardInfo = cardinfo
    if _cardInfo==None:
        _cardInfo = getCardInfo(uid)
        
    if _cardInfo!=None:
        #剩余翻牌奖励个数
        _freeCard = [i for i in _cardInfo["list"] if i["price"] == 0]
        if len(_freeCard) >0:
            _title = g.L("email_card_title")
            _content = g.L("email_card_content")
            #发送系统邮件
            _r = g.m.emailfun.sendXitongEmail(_title,_content,uid,_freeCard)
            #通知新邮件到达
            _r = g.m.emailfun.sendNewEmailMsg(uid,1)

        #删除旧的翻牌信息
        _r = delCardInfo(uid)


if __name__ == "__main__":
    _prize = genrateCardPrize(1,1)
    print _prize