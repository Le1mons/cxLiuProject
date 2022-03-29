# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/12:02
'''
#月卡信息
import g


"""
月卡功能 小月卡 大月卡
"""

def getCon(key):
    return g.GC['yuka'][str(key)]



def getYueKaInfo(uid,key):
    # _value = g.getAttrOne(uid, {"ctype": "yueka_xiao"}, keys="_id,v")  #获取累计充值的值
    ctype = 'yueka_' + key
    yueka = g.getAttrByCtype(uid, ctype, bydate=False, default={})
    if not yueka or (yueka['nt']+30*24*3600 < g.C.NOW() and yueka['isjh'] == 1):
        nt = g.C.NOW()
        val = {'rmbmoney':0,'nt':nt,'lqtime':0,'lqnum':30,'isjh':0}
        g.setAttrByCtype(uid, ctype, val,default={}, bydate=False, valCall='override')
        yueka = val

    return yueka

#判断是否激活大小月卡
def isCheckYueka(uid,key):
    yuekaInfo =  getYueKaInfo(uid,key)
    if key == "xiao":
        if yuekaInfo["isjh"] == 1:
            return 1
    if key == "da":
        if yuekaInfo["isjh"] == 1:
            return 1
    return 0


@g.event.on('onGetYueKa')
def onGetYueKa(uid,money):
    xiaoInfo = getYueKaInfo(uid,'xiao')
    daInfo = getYueKaInfo(uid,'da')
    _ntda = g.C.NOW()
    _setData = {}
    
    #处理小月卡
    if xiaoInfo['isjh'] == 1 and _ntda >= g.C.ZERO(xiaoInfo['nt']) + 3600 * 24 * 30:
        #如果是激活过期了的话，重置数据
        xiaoInfo['isjh'] = 0
        xiaoInfo['rmbmoney'] = 0
        _setData['lqtime'] = 0
        _setData['lqnum'] = 30        
    
    newMoney = xiaoInfo['rmbmoney'] + int(money)
    _setData['rmbmoney'] = newMoney
    
    if newMoney >= getCon("xiao")["maxmoney"]:
        if xiaoInfo['isjh']!=1:
            _setData['nt'] = g.C.ZERO(_ntda)
            
        _setData['isjh'] = 1
    else:
        _setData['isjh'] = 0
    
    g.setAttrByCtype(uid, 'yueka_xiao', _setData, default={}, bydate=False, valCall='update')    
    
    
    #处理大月卡
    _setData = {}
    if daInfo['isjh'] == 1 and _ntda >= g.C.ZERO(daInfo['nt']) + 3600 * 24 * 30:
        daInfo['isjh'] = 0
        daInfo['rmbmoney'] = 0
        _setData['lqtime'] = 0
        _setData['lqnum'] = 30           
    
    newMoney = daInfo['rmbmoney'] + int(money)
    _setData['rmbmoney'] = newMoney
    
    if newMoney >= getCon("da")["maxmoney"]:   
        if daInfo['isjh']!=1:
            _setData['nt'] = g.C.ZERO(_ntda)
            
        _setData['isjh'] = 1
        # 英雄招募
        g.event.emit('hero_recruit', uid, '3')
    else:
        _setData['isjh'] = 0
    
    g.setAttrByCtype(uid, 'yueka_da', _setData, default={}, bydate=False, valCall='update')    
    

    
    ## 没有激活
    #if xiaoInfo["isjh"] != 1:
        #xiaoInfo['rmbmoney'] += int(money)
        #_setData['rmbmoney'] = xiaoInfo['rmbmoney']
        #if xiaoInfo["rmbmoney"] >= getCon("xiao")["maxmoney"]:
            #_setData['isjh'] = 1
            #_setData['nt'] = _ntda

        #g.setAttrByCtype(uid, 'yueka_xiao', _setData, default={},
                         #bydate=False, valCall='update')
        ##     g.setAttrByCtype(uid, 'yueka_da', {'rmbmoney': daInfo['rmbmoney'], "isjh": _isjhda, "nt": _ntda}, default={},
        ##                      bydate=False, valCall='update')
        ##
        ## else:
        ##     g.setAttrByCtype(uid, 'yueka_da', {'rmbmoney': daInfo['rmbmoney']}, default={},
        ##                      bydate=False, valCall='update')
    ## 激活了 以过期
    #elif _ntda >= g.C.ZERO(xiaoInfo['nt']) + 3600 * 24 * 7:
        #_setData['isjh'] = 0
        #_setData['rmbmoney'] = int(money)
        #g.setAttrByCtype(uid, 'yueka_xiao', _setData, default={},
                         #bydate=False, valCall='update')

    #_setData = {}
    ## 没有激活
    #if daInfo["isjh"] != 1:
        #daInfo['rmbmoney'] += int(money)
        #_setData['rmbmoney'] = daInfo['rmbmoney']
        #if daInfo["rmbmoney"] >= getCon("da")["maxmoney"]:
            #_setData['isjh'] = 1
            #_setData['nt'] = _ntda
        ##     g.setAttrByCtype(uid, 'yueka_da', {'rmbmoney': daInfo['rmbmoney'], "isjh": _isjhda, "nt": _ntda}, default={},
        ##                      bydate=False, valCall='update')
        ##
        ## else:
        ##     g.setAttrByCtype(uid, 'yueka_da', {'rmbmoney': daInfo['rmbmoney']}, default={},
        ##                      bydate=False, valCall='update')
    ## 激活了 以过期
    #elif _ntda >= g.C.ZERO(daInfo['nt']) + 3600 * 24 * 30:
        #_setData['isjh'] = 0
        #_setData['rmbmoney'] = int(money)
    #else:
        #return

    #g.setAttrByCtype(uid, 'yueka_da',_setData, default={},
                     #bydate=False, valCall='update')


#红点逻辑
def getHongdian(uid):
    hongdian = 0
    _nt = g.C.NOW()
    _yuekaData = g.getAttrOne(uid, {"ctype": "Dayueka_getprize"}, keys="_id,k,v,lasttime")
    lasttime = _yuekaData["lasttime"]
    _diffDay = g.C.getTimeDiff(_nt, lasttime, 0)
    if _diffDay != 0:
        hongdian = 1

    return {"qiandao":hongdian}

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    print getYueKaInfo(uid,'da')