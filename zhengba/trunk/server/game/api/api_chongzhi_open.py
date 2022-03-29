#!/usr/bin/python
#coding:utf-8
'''
充值功能 - 打开充值界面
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'d': {'alreadypack':[已经购买的vip礼包代表的等级],
                'paylist':重置信息配置,
                'meirixiangou':{每日限购礼包型号:购买次数},
                'chaozhihaoli':超值好礼礼包
                                                }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    _gameVer = g.getGameVer()
    #支付配置
    _payCon = g.m.payfun.getPayCon("paycon")[_gameVer]
    
    #月卡信息
    #_yuekaTime = g.m.payfun.getMyYuekaInfo(uid)
    #至尊卡信息
    #_zhizunkaState = g.m.payfun.getMyZhizunkaInfo(uid)
    #当前vip的每日奖励是否领取
    #_canRecVip = g.m.vipfun.canRecVipPrize(uid)

    _tmpCon = {}
    _tmpCon.update(dict(_payCon))
    for k,v in _tmpCon.items():
        if "show" not in v:
            del _tmpCon[k]
            continue
        
        if "zs" in v and v["zs"]["rmbmoney"]!=0:
            #获取我的赠送次数
            _zsNum = g.m.payfun.getPayZsNum(uid,k)
            _tmpCon[k]["zs"]["cznum"] = _zsNum
        
    #按价格排序大到小
    _tmpCon = sorted(_tmpCon.values(),key = lambda e:e.__getitem__('unitPrice'),reverse=True)

    #月卡礼包信息
    _openTime = g.getOpenTime()
    _zt = g.C.NOW(g.C.DATE(_openTime)) + 3* 24* 3600
    _resData = {}
    #已经购买的vip礼包
    _resData['alreadypack'] = g.m.vipfun.getAlreadyGetPack(uid)
    #重置信息配置
    _resData['paylist'] = _tmpCon
    #每日限购礼包
    _resData['meirixiangou'] = g.m.chongzhihdfun.getMRXGRecData(uid)
    #超值好礼礼包
    _resData['chaozhihaoli'] = g.m.chongzhihdfun.getCZLBData(uid)

    # 月卡是否激活
    if g.m.yuekafun.chkMonthlyCardAct(uid):
        # 月卡特权
        _resData['yktq'] = bool(g.getAttrByDate(uid, {'ctype': 'yktq_prize'}))

    #_res["d"] = {"alreadypack":_alreadyGetPack,"yuekatime":_yuekaTime,"zhizunka":_zhizunkaState,"paylist":_tmpCon, 'yuekalibaotime': _zt,'vipevery':_canRecVip}
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = g.buid('lsq13')
    g.debugConn.uid = uid
    print g.m.chongzhihdfun.getCZLBData(uid)