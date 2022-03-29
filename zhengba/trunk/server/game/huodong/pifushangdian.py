#!/usr/bin/python
#coding:utf-8


'''
    皮肤商店
'''

htype = 101
import g
hdfun = g.m.huodongfun


# 一系列默认方法
def isover(*args, **kwargs):
    return args[1]


def getOpenList(uid, hdinfo):
    # 默认显示在列表
    return hdinfo


# 预处理数据被preData 调用， 重写preData 方法的时候可以不调用此方法
def initHdData(uid, hdinfo, *arg, **kwargs):
    return {'val': 0, 'gotarr': {}}

# 重置检测条件  默认每天过点重置
def chkReset(hdinfo, myinfo, *args, **kwargs):
    if myinfo['lasttime'] < g.C.ZERO(g.C.NOW()):
        return True

    return False

# 活动数据预处理， 被getOpenData 调用，重写getOpenData的时候可以不调用此方法
def preData(uid, hdinfo, hddata, myinfo, *arg, **kwargs):
    if not myinfo or ('reset' in hddata and hddata['reset'] != -1 and chkReset(hdinfo, myinfo)):
        myinfo = initHdData(uid, hdinfo, *arg, **kwargs)
        hdfun.setHDData(uid, hdinfo['hdid'], myinfo)
    return myinfo


# 玩家数据
def getOpenData(uid, hdinfo, *arg, **kwargs):
    hddata = hdinfo['data']
    hdid = hdinfo['hdid']
    _myInfo = hdfun.getHDData(uid, hdid)
    _myInfo = preData(uid, hdinfo, hddata, _myInfo, *arg, **kwargs)
    _valInfo = _myInfo
    _valInfo["my"] = _myInfo['val']
    _tmpVal = []
    for idx, con in enumerate(hddata['arr']):
        if str(idx) not in _myInfo['gotarr'] or con['num'] - _myInfo['gotarr'].get(str(idx), 0) > 0:
            _tmpVal.append(1)
        else:
            _tmpVal.append(0)
    _myInfo['val'] = _tmpVal
    return _valInfo


# 活动领奖检测， 被getPrize 方法调用，重写getPrize方法的时候可以不调用此方法
def chkData(uid, hdid, hdinfo, hddata, *arg, **kwargs):
    # 默认无其他条件
    return (1, "")


# 默认领奖方法
def getPrize(uid, hdinfo, *arg, **kwargs):
    _res = {'s': 1}
    idx = kwargs['idx']
    hdid = hdinfo['hdid']
    idxStr = str(idx)
    act = int(kwargs.get('act', 1))  # 动作  1 兑换  2 购买

    _hdMainData = hdfun.HDOPENFUNC[hdinfo['htype']](uid, hdinfo)
    if _hdMainData['gotarr'].get(idxStr, 0) >= hdinfo['data']['arr'][idx]['num']:
        # 已经领取过奖励
        _res['s'] = -3
        _res['errmsg'] = g.L('huodong_gettenprize')
        return _res

    need = hdinfo['data']['arr'][idx]['duihuan']
    # 检查消耗
    _chk = g.chkDelNeed(uid, g.fmtPrizeList(need))
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    # 领奖条件检测
    chkRes = chkData(uid, hdid, hdinfo, _hdMainData, *arg, **kwargs)
    if not chkRes[0]:
        _res['s'] = -4
        _res['errmsg'] = g.L(chkRes[1])
        return _res

    needChange = g.delNeed(uid, need, 0, {'act':'pifushangdian_{}'.format(hdid), 'idx':idxStr})

    if _hdMainData['gotarr'].get(idxStr, 0) + 1 >= hdinfo['data']['arr'][idx]['num']:
        _hdMainData["val"][idx] = 0

    _hdMainData["gotarr"][idxStr] = _hdMainData['gotarr'].get(idxStr, 0) + 1

    _rData = {"gotarr": _hdMainData["gotarr"], "val": _hdMainData["val"]}

    #记录已领取的状态
    _r = hdfun.setHDData(uid, hdid, {"$inc": {"gotarr.{}".format(idxStr): 1}})

    # 奖励
    _prize = hdinfo['data']['arr'][idx]['prize']
    _cinfo = g.getPrizeRes(uid, _prize, {'act': 'huodong_prize_{0}'.format(hdid), 'idx':idxStr})
    _cinfo.update(needChange)
    _rData['cinfo'] = _cinfo
    _rData['prize'] = _prize

    return _rData


# 红点数据
def getHongdian(uid, hdid, hdinfo, *arg, **kwargs):
    return 0


# 活动事件
def hdEvent(uid, hdinfo, etype, proid, *arg, **kwargs):
    # 默认不监听任何事件
    if etype != 'chongzhi':return  # 不是充值事件

    proidCond = [ele['buy']['proid'] for ele in hdinfo['data']['arr']]
    if proid not in proidCond:return  # 不是指定充值

    myinfo = getOpenData(uid, hdinfo)
    for idx, conf in enumerate(hdinfo['data']['arr']):
        if conf['buy']['proid'] != proid: continue

        # 已经卖完
        if myinfo['gotarr'].get(str(idx), 0) >= conf['num']:
            g.m.dball.writeLog(uid, 'pifushangdian', {'proid':proid, 'idx':idx, 'gotarr':myinfo['gotarr']})
            break

        rinfo = g.getPrizeRes(uid, conf['prize'], {'act': 'huodong_prize_{0}'.format(hdinfo['hdid']), 'idx':idx})
        g.sendUidChangeInfo(uid, rinfo)

        hdfun.setHDData(uid, hdinfo['hdid'], {'$inc':{'gotarr.{}'.format(str(idx)):1}})
        break

    return 0
