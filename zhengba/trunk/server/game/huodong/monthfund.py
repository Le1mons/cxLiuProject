#!/usr/bin/python
# coding:utf-8

'''
月基金相关方法
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")
    import time
import g

htype = 170
HTYPE = g.Const()
HTYPE.MonthFund128 = 170
HTYPE.MonthFund328 = 180


def getOpenList(uid, hdinfo):

    return hdinfo



# 获取用户活动数据
def getOpenData(uid, hdid):
    # 获取当前时间
    _nt = g.C.NOW()
    # 获取用户活动数据
    # _valInfo = g.m.huodongfun.getUserHuoDong(uid, {'hdid': hdid, }, fields=['val', 'gotarr', 'mfetime', 'mfstime', 'usetime', 'isbuy'])
    _valInfo = getUserHuoDong(uid, {'hdid': hdid, 'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}, fields=['val', 'gotarr', 'mfetime', 'mfstime', 'usetime', 'isbuy','lqval'])
    # 月卡和至尊卡数据
    _yueka = 1 if g.m.yuekafun.isCheckYueka(uid,'xiao') else 0
    # _zhizunka = 1 if g.m.payfun.getMyZhizunkaInfo(uid) else 0
    # 大月卡 至尊卡
    _zhizunka = 1 if g.m.yuekafun.isCheckYueka(uid,'da') else 0
    _canBuy = {'yueka': _yueka, 'zhizunka': _zhizunka}
    # 用户首次开启活动
    if len(_valInfo) <= 0:
        # 用户未购买月基金，显示原始信息
        _canBuy['val'] = 0
        _canBuy['gotarr'] = []
        return _canBuy

    _valInfo = _valInfo[0]
    _valInfo.update(_canBuy)
    _mfstime = _valInfo['mfstime']
    _nowDay = (g.C.ZERO(_nt) - g.C.ZERO(_mfstime)) // (24* 3600) + 1
    # 显示累计登录的天数 不是当前天数
    # _valInfo['val'] = _nowDay

    # 检查是否可以领取奖励
    return _valInfo


# 获取玩家活动数据
def getUserHuoDong(uid, where, fields=[], chklogin=1):
    _where = where
    _where['uid'] = uid
    _fields = fields + ['_id', 'daytime', 'hdid']
    _data = g.mdb.find('hddata', _where, fields=_fields)
    # if chklogin: g.m.monthfund.onFirstLogin(uid, _data)
    if chklogin: onFirstLogin(uid, _data)
    return _data


# 领取月基金
def getPrize(uid, hdid):
    # idx += 1
    _res = {'s': 1}
    # 获取当前时间
    _nt = g.C.NOW()
    # 获取用户数据
    # _userData = g.m.huodongfun.getUserHuoDong(uid, {'hdid': hdid, }, fields=['val', 'gotarr', 'mfetime', 'mfstime', 'daytime', 'htype'])
    _userData = getUserHuoDong(uid, {'hdid': hdid,'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}, fields=['val', 'gotarr', 'mfetime', 'mfstime', 'daytime', 'htype','lqval'])
    # 检查是否可以领取奖励
    if len(_userData) <= 0:
        # 没有数据
        _res['s'] = -1
        _res['errmsg'] = g.L('monthfund_res_-1')
        return _res

    _userData = _userData[0]
    _mfstime = _userData['mfstime']

    # 当天
    # _nowDay = (g.C.ZERO(_nt) - g.C.ZERO(_mfstime)) // (24* 3600) + 1
    # idx = _nowDay
    idx = _userData['val']
    # _userData['val'] = idx

    idxPrize = _userData.get('lqval', 0)
    # idx = idxPrize

    if idx in _userData['gotarr']:
        # 今日奖励已经领取了
        _res['s'] = -3
        _res['errmsg'] = g.L('monthfund_res_-3')
        return _res
    _con = g.GC['monthfund']
    _hdInfo = [tmp for tmp in _con if tmp['htype'] == _userData['htype']]
    _hdInfo = _hdInfo[0]
    if idx > len(_hdInfo['data']['arr']):
        # 奖励全部领取完毕
        _res['s'] = -2
        _res['errmsg'] = g.L('monthfund_res_-2')
        return _res


    _setData = {"$set": {'gotarr': _userData['gotarr'],'lqval':idxPrize+1}}
    # 最后一个
    if (_userData['mfetime'] - _nt) <= (24* 3600 - 1) or idx >= len(_hdInfo['data']['arr']):
        _setData['$set'].update({'mfetime': _nt})
        _userData['mfetiem'] = _nt
        _userData['isover'] = 1
    # 更新兑换次数
    _userData['gotarr'].append(idx)
    g.m.huodongfun.setMyHuodongData(uid, hdid, _setData)
    # 获取奖品
    _prize = _hdInfo['data']['arr'][idx - 1]['p']
    # _prize = _hdInfo['data']['arr'][idxPrize - 1]['p']
    # 发放奖品
    _r = g.getPrizeRes(uid, _prize, act='monthfund')
    _res['d'] = {'myinfo': _userData, 'cinfo': _r, 'prize': _prize}
    return _res


# 月基金红点
def getHongdian(uid,hdid,hdinfo):
    _nt = g.C.NOW()
    # 获取用户数据
    _htype = [HTYPE.MonthFund128, HTYPE.MonthFund328]
    _where = {'htype': {'$in': _htype}, 'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}
    # _userData = g.m.huodongfun.getUserHuoDong(uid,_where, fields=['val', 'gotarr', 'mfstime'])
    _userData = getUserHuoDong(uid,_where, fields=['val', 'gotarr', 'mfstime'])
    if len(_userData) <= 0:
        return 0
    _hdid = []
    for _tmpData in _userData:
        _mfstime = _tmpData['mfstime']
        _nowDay = (g.C.ZERO(_nt) - g.C.ZERO(_mfstime)) // (24* 3600) + 1
        # 检查是否可以领取奖励
        if _nowDay not in _tmpData['gotarr']:
            # 有可以领取的
            _hdid.append(_tmpData['hdid'])
    return _hdid

def initHdData(uid,hdid,data=None,*args,**kwargs):
    pass


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    payCon = args[1]
    if payCon['proid'] not in ['monthfund128','monthfund328']:
        return
    htypePayDict = {
        'monthfund128':170,
        'monthfund328':180,
    }

    hdid = htypePayDict[payCon['proid']]
    # val = g.m.huodongfun.getHDData(uid, hdid)
    proid = payCon['proid']
    _htype = htypePayDict[proid]

    _nt = g.C.NOW()
    _userInfo = getUserHuoDong(uid, {'htype': _htype, 'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}})
    # 如果玩家购买了不做处理
    if len(_userInfo) > 0:
        return

    # _retVal = onMonthFundChongzhi(uid, act, money, orderid, payCon)

    # _hdData = g.m.huodongfun.getHuodongInfoFromDB({'htype': _htype, 'stime': {'$lt': _nt}}, keys='_id,htype,hdid', sort=[['etime',-1], ['hdid', -1]], limit=1)
    _hdData = getHuodongInfoFromDB({'htype': _htype, 'stime': {'$lt': _nt}}, keys='_id,htype,hdid', sort=[['etime',-1], ['hdid', -1]], limit=1)
    if len(_hdData) <= 0:
        # 当活动下架时GM特殊处理
        _con = g.GC['monthfund']
        _conList = [tmp for tmp in _con if tmp['htype'] == _htype]
        _htypeCon = _conList[0]
        _htypeCon['hdid'] = _nt
        _hdData = [_htypeCon]
    _hdData = _hdData[0]
    _ntZero = g.C.getZeroTime(_nt)
    # 时间周期为30天
    _etime = _ntZero + 30 * 24 * 3600 - 1
    # 设置玩家活动信息
    _hdid = _hdData['hdid']
    _data = {
        'ctime': _nt,
        'mfstime': _ntZero,
        'mfetime': _etime,
        'htype': _hdData['htype'],
        'val': 1,        # 登录天数
        'lqval': 0,      # 领取天数
        'gotarr': [],
        'usetime': g.C.getDate(_ntZero, g.L('monthfund'))+ '-'+ g.C.getDate(_etime, g.L('monthfund')),
        'isbuy': 1,
        'daytime': _nt
    }
    # 保存数据
    g.m.huodongfun.setMyHuodongData(uid, hdid, _data)


# 获取活动信息
def getHuodongInfoFromDB(where=None, keys='', *arg, **kwargs):
    if keys != '':
        kwargs["fields"] = keys.split(",")

    _res = g.m.dbhuodong.getHuodongInfo(where, *arg, **kwargs)
    return (_res)


# 获取月基金关闭时间戳信息
def getMonthFundInfo(uid, keys=None):
    _nt = g.C.NOW()
    _htype = [HTYPE.MonthFund128, HTYPE.MonthFund328]
    # 获取月基金信息
    _monthFundId = []
    _mfWhere = {'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}
    _mfWhere['htype'] = {'$in': _htype}
    # 获取玩家月基金数据
    _userData = getUserHuoDong(uid, _mfWhere, fields=['mfetime', 'mfstime', 'htype'])
    _con = g.GC['monthfund']
    _conDict = {tmp['htype']: tmp for tmp in _con}
    _rMFData = []
    # 依据用户数据格式化信息
    for _tmpUserData in _userData:
        _userDataHtype = _conDict[_tmpUserData['htype']]
        _userDataHtype['etime'] = _tmpUserData['mfetime']
        _userDataHtype['rtime'] = _tmpUserData['mfetime']
        _userDataHtype['hdid'] = _tmpUserData['hdid']
        _rMFData.append(_userDataHtype)
    # 如果找到所需的全部数据（目前为2个）直接返回
    if len(_userData) >=2:
        _rMFData.sort(key=lambda x: x['htype'])
        if keys == 'login':
            _rMFData = [{'etime': tmp['etime']} for tmp in _rMFData]
        return _rMFData

    _userHtype = [tmp['htype'] for tmp in _userData]
    _monthFundHtype = [tmp for tmp in _htype if tmp not in _userHtype]
    _w = {'htype': {'$in': _monthFundHtype}}
    _keys = '_id,showtime,hdid,stype,etime,stime,htype,rtime'
    _monthFundInfo = getHuodongInfoFromDB(_w,_keys,sort=[["etime", -1],['hdid', -1]])

    htypes = []
    # 格式化hdinfo里面的信息
    for _monthFundEle in _monthFundInfo:
        _htype = _monthFundEle['htype']
        if _htype in htypes:continue
        _infoCon = _conDict[_htype]
        _infoCon['stime'] = _monthFundEle['stime']
        _infoCon['hdid'] = _monthFundEle['hdid']
        _infoCon['etime'] = _monthFundEle['etime']
        _infoCon['rtime'] = _monthFundEle['rtime']
        _infoCon['showtime'] = _monthFundEle['showtime']
        htypes.append(_htype)

        _rMFData.append(_infoCon)
        # 排序显示的活动
        _rMFData.sort(key=lambda x: x['htype'])
    if keys == 'login':
        _rMFData = [{'etime': tmp['etime']} for tmp in _rMFData]
    return _rMFData



# 登陆了累计天数
def onFirstLogin(uid, hddata=None):
    _nt = g.C.NOW()
    _hdData = hddata
    if _hdData == None:
        _htype = [HTYPE.MonthFund128, HTYPE.MonthFund328]
        _where = {'htype': {'$in': _htype}, 'mfetime': {'$gt': _nt}, 'mfstime': {'$lte': _nt}}
        # _hdData = g.m.huodongfun.getUserHuoDong(uid, _where, chklogin=0)
        _hdData = getUserHuoDong(uid, _where, chklogin=0)
    _setData = {"$inc": {'val': 1}, '$set': {'daytime': _nt}}
    for _hdinfo in _hdData:
        _hdid = _hdinfo['hdid']
        _ntZero = g.C.getZeroTime(_nt)
        if _hdinfo['daytime'] < _ntZero:
            g.mdb.update('hddata', {'uid': uid, 'hdid': _hdid, 'daytime': {'$lt': _ntZero}}, _setData)


g.event.on("chongzhi", hdEvent)
# getFundShow
def getFundShow(uid):
    # 小基金 大基金
    _smallHtype, _bigHtype = 170, 180
    _nt = g.C.NOW()
    _data = g.mdb.find('hdinfo',{'htype':{'$in':[_smallHtype,_bigHtype]},'rtime':{'$gt':_nt},'stime':{'$lt':_nt}},fields=['_id','hdid'])
    if not _data or len(_data) == 1:
        return 0

    for i in _data:
        hdid = i['hdid']
        _hdInfo = getUserHuoDong(uid, {'hdid':hdid})
        if _hdInfo and _hdInfo[0].get('isbuy', 0) != 1:
            return 0
    return 1


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    a = hdEvent(uid,1,1,1,{'proid':'monthfund128'})
    # a = getHongdian(uid,1,1)
    print a
