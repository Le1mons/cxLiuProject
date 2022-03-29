#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g

'''
充值功能
'''

import copy

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def doproc(conn, data):
    _res = {"s": 1}
    # 充值用户
    uid = str(data[0])
    # 充值商品唯一配置id
    proid = str(data[1])
    # 充值订单
    orderid = str(data[2])

    '''
    正式版本中 3=unitPrice（分） 4=校验key
    '''
    emitUnitPrice = 0  # 广播事件时广播的金额（元）
    _viplvchangeEmit = None
    _gameVer = g.getGameVer()
    # 支付配置
    _payConJSON = g.m.payfun.getPayCon("paycon")[_gameVer]
    # 实际支付版本
    if len(data) == 5:
        # 实际价额
        unitPrice = int(data[3])  # 分
        # ===============
        # 订单id已存在
        if g.m.payfun.checkOrderId(orderid):
            _res["s"] = -3
            _res["errmsg"] = g.L("chongzhipay_res_-3")
            return _res

        # ===============
        # 验证key

        secKey = str(data[4])

        _secKey = g.C.md5(uid + proid + orderid + str(unitPrice) + g.config["APIKEY"])
        # _secKey = g.C.md5(uid + proid + orderid + str(unitPrice) + "uutown123456")
        if _secKey.lower()!=secKey.lower() and g.getGameVer()!="debug":
            #无法充值
            _res["s"] = -1
            _res["errmsg"] = g.L("chongzhipay_res_-1")
            return _res

        # ===============
        # 唯一id不存在,直接加钻石
        act = 0
        if proid not in _payConJSON:
            proid = "rmbmoney"
            _payCon = {"name": proid, "rmbmoney": unitPrice / 10, "unitPrice": unitPrice, "proid": proid}
        else:
            # 当前支付配置
            _payCon = _payConJSON[proid]

            # 充值金额与配置不符，直接加钻石
        if _payCon["unitPrice"] != unitPrice:
            proid = "rmbmoney"
            _payCon = {"name": "rmbmoney", "rmbmoney": unitPrice / 10, "unitPrice": unitPrice, "proid": "rmbmoney"}
            act = 0

            '''
            proid2act = {
                "yueka":2,
                "zhizunka":4
            }
            if proid in proid2act and _payCon['unitPrice']==unitPrice:
                act = proid2act[proid]
            '''
        # ===============
        money = str(_payCon['unitPrice'] / 100)  # 支付价格（元）
        emitUnitPrice = money

    # ===============
    # 兼容GM后台
    if len(data) == 4:
        act = 0
        proid = data[1]
        orderid = str(data[3])
        
        if not orderid.startswith('GM_'):
            return
        
        
        if proid not in _payConJSON:
            _mixPayConf = {
                "czlb600":{"unitPrice":600,"proid":"czlb600","name":"超值礼包6","rmbmoney":60},
                "czlb3000":{"unitPrice":3000,"proid":"czlb3000","name":"超值礼包30","rmbmoney":300},
                "czlb6800":{"unitPrice":6800,"proid":"czlb6800","name":"超值礼包68","rmbmoney":680},
                "czlb19800":{"unitPrice":19800,"proid":"czlb19800","name":"超值礼包198","rmbmoney":1980},
                "czlb32800":{"unitPrice":32800,"proid":"czlb32800","name":"超值礼包328","rmbmoney":3280},
                "czlb44800":{"unitPrice":44800,"proid":"czlb44800","name":"超值礼包448","rmbmoney":4480},
                "czlb64800":{"unitPrice":64800,"proid":"czlb64800","name":"超值礼包648","rmbmoney":6480},                
            }
            if proid in _mixPayConf:
                _payCon = _mixPayConf[proid]
            else:
                unitPrice = int(data[2])
                _payCon = {"name": proid, "rmbmoney": unitPrice / 10, "unitPrice": unitPrice, "proid": proid}
        else:
            _payCon = copy.deepcopy(_payConJSON[proid])       
        
        unitPrice = int(_payCon['unitPrice'])
        money = str(_payCon['unitPrice'] / 100)  # 支付价格（元）
        emitUnitPrice = money            
        
    # ===============

    gud = g.getGud(uid)

    # 充值用户不存在,无法充值
    if gud == None:
        _res["s"] = -2
        _res["errmsg"] = g.L("chongzhipay_res_-2")
        return _res

    # 发送首充奖励邮件
    '''if gud['ischongzhi'] == 0:
        # g.m.payfun.sendShouchongEmail(uid)
        pass'''

    # 充值的钻石
    _addRmbmoney = _payCon["rmbmoney"]
    _addPayexp = int(_payCon['unitPrice'] * .1)  # 修改为以单价计算

    _isshouchong = 0
    _isdangri = 0
    # 判断是否是首充
    if gud["payexp"] <= 0:
        _isshouchong = 1
    # 判断是否是当日首充
    _zt = g.C.ZERO(g.C.NOW())
    if not g.m.payfun.getPayListInfo(where={"uid": uid, "ctime": {"$gte": _zt}}):
        _isdangri = 1

    # 增加的奖励
    _prizeArr = [
        {"a": "attr", "t": "rmbmoney", "n": _addRmbmoney},
        {"a": "attr", "t": "payexp", "n": _addPayexp}
    ]

    # 有赠送次数
    _isZs = 0
    if "zs" in _payCon and _payCon["zs"]["rmbmoney"] != 0:
        # 获取我的赠送次数
        _zsNum = g.m.payfun.getPayZsNum(uid, proid)
        # 可以赠送钻石
        if _zsNum < _payCon["zs"]["num"]:
            _isZs = 1
            _addRmbmoney += _payCon["zs"]["rmbmoney"]
            _prizeArr += [{"a": "attr", "t": "rmbmoney", "n": _payCon["zs"]["rmbmoney"]}]

    _vipCon = g.m.vipfun.getVipCon()
    # 如果下一级有配置
    _nvipLv = gud["vip"]
    if str(gud["vip"] + 1) in _vipCon:
        # 如果经验超过下一级的配置,增加vip等级
        _nowPayExp = gud["payexp"]
        while True:
            _addvipExp = _nowPayExp + _addPayexp
            if str(_nvipLv + 1) in _vipCon and _addvipExp >= _vipCon[str(_nvipLv + 1)]["payexp"]:
                _nvipLv += 1
            else:
                break

        if _nvipLv != gud["vip"]:
            _prizeArr += [{"a": "attr", "t": "vip", "n": _nvipLv}]
            # 广播viplvchange事件
            _viplvchangeEmit = [uid, gud["vip"], _nvipLv]

    # 格式化充值数据
    _fmtData = g.m.payfun.fmtPayInfo(uid, proid, money, orderid, _payCon)
    # 添加充值信息
    _r = g.m.payfun.addPayListInfo(_fmtData)
    # 记录累计充值的钻石
    _r = g.m.payfun.addLeijiChongzhi(uid, _addRmbmoney)
    # 记录赠送次数
    if _isZs == 1:
        _r = g.m.payfun.setPayZsNum(uid, proid, _zsNum + 1)

    # 获取奖励
    _prizeRes = g.getPrizeRes(uid, _prizeArr, {"act": "pay", "money": money,"orderid":orderid,"proid":proid})
    # 2017-6-2增加首充标识
    '''if gud['ischongzhi'] == 0:
        _prizeRes['attr']['ischongzhi'] = 1
        g.m.userfun.updateUserInfo(uid,{'ischongzhi':


        1},{'act':'firstpay'})
        gud['ischongzhi'] = 1'''

    # 发送改变信息
    _r = g.sendUidChangeInfo(uid, _prizeRes)

    # 设置累计充值金额
    g.m.payfun.setAllPayYuan(uid, money)

    g.success[orderid] = True
    # 通知充值成功事件
    g.event.emit("chongzhi", uid, proid, str(emitUnitPrice), orderid, _payCon)
    # 活动事件
    g.m.huodongfun.event(uid, 'chongzhi', proid, money, _payCon, orderid=orderid)
    # 周礼包月礼包
    g.event.emit("weekmonthlibao", uid, act, orderid,payCon=_payCon)

    _sendData = {"name": _payCon["name"], "money": money, "rmbmoney": _addRmbmoney, "orderid": orderid, "success":g.success.pop(orderid, True)}
    g.m.mymq.sendAPI(uid, "paysuccess", _sendData)

    # 充值月卡事件
    g.event.emit("onGetYueKa", uid, unitPrice)

    # 开服狂欢活动 记录累计充值
    _day = g.m.kfkhfun.getKfkhDay(uid)
    g.event.emit('kfkh',uid,2,_day,int(money))
    # 日常任务监听
    g.event.emit('dailytask', uid, 18)
    # 节日狂欢
    g.event.emit('planttreeshd', uid, '2', val=int(money))
    # 植树节活动
    g.event.emit('jierikuanghuan', uid, '14', val=int(money))
    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "115", val=int(money))
    # 周年庆
    g.event.emit('MID_AUTUMN', uid, '2', val=int(money))
    # 中秋节2
    g.event.emit('midautumn2', uid, '3', val=int(money))
    # 双11
    g.event.emit('DOUBLE_11', uid, '3', int(money))
    # 扭蛋活动监听
    g.event.emit('niandanhd', uid, "3", int(money))
    g.event.emit('qixihd', uid, "4", int(money))
    g.event.emit('herotheme', uid, "4", int(money))

    # 任务监听
    g.m.huodongfun.event(uid, 'heropreheat', "5", int(money))

    # 客户端数据统计
    g.m.mymq.sendAPI(uid, "gift_package", {'payItem': proid,'newVipLv':_nvipLv,'islishishouci':_isZs == 1,'isdangrishouci':not bool(g.getAttrByDate(uid,{'ctype':'chongzhi_dailyfirst'}))})
    g.setAttr(uid, {'ctype':'chongzhi_dailyfirst'}, {'v': 1})

    # g.m.huodongfun.event(uid, '12', proid=proid, unitPrice=unitPrice)


    if _viplvchangeEmit != None:
        # 已到下面来操作，之前为修改数据就操作
        g.event.emit("viplvchange", _viplvchangeEmit[0], _viplvchangeEmit[1], _viplvchangeEmit[2])

    # x数据平台数据上报逻辑
    try:
        del _fmtData["_id"]
        _fmtData["islishishouci"] = _isshouchong
        _fmtData["isdangrishouci"] = _isdangri
        _fmtData["unitPrice"] = int(_payCon['unitPrice'])
        _nt = g.C.NOW()
        _zt = g.C.ZERO(_nt)
        _fmtData["reg_date"] = gud.get("ctime", -1)
        _fmtData["is_today_reg"] = 1 if g.C.chkSameDate(_zt, gud.get("ctime", -1)) else 0


        g.xLog.track(account_id=uid, event_name="pay", data=_fmtData)
    except:
        import traceback
        traceback.print_exc()

    return _res


if __name__ == "__main__":

    uid = g.buid('lyf')
    g.debugConn.uid = uid
    import time

    nt = g.C.NOW()
    debugcz = 'debugPay' + str(nt)
    # data = [uid,"gold68","debugPay85729991842",100,'hommDebugSecKey123']
    data = [uid,"zhounianka198","debugPay8932111111196148",12800,"hommDebugSecKey123"]
    _r = doproc(g.debugConn, data)
    print _r
    if 'errmsg' in _r: print _r['errmsg']