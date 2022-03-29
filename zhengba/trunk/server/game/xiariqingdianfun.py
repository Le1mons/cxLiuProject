#!/usr/bin/python
# coding:utf-8

'''
夏日庆典
'''
import g

htype = 75
# 获取配置
def getCon():
    res = g.GC['xiariqingdian']
    return res


# 获取数据
def getData(uid, hdid):
    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            "qiandao": [],                      # 签到奖励
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao':{},                        # 礼包购买次数
            "zuanshinum":0,                     # 每日钻石购买次数
            "val": 0                            # 每日钻石购买次数


        }
    # 任务跨天重置

    elif _myData.get('date') != _dkey:
        _set['zuanshinum'] = _myData['zuanshinum'] = 0
        _set['date'] = _myData['date'] = _dkey

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    return _myData

# 更新数据 带上日期
def setData(uid, hdid, data):
    # for i in data:
    #     if i.startswith('$'):
    #         data['$set'] = data.get('$set', {})
    #         break
    # else:
    #     _temp = data
    #     data = {}
    #     data['$set'] = _temp
    #
    # data['$set']['date'] = g.C.DATE()

    g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, data, upsert=True)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
    return _res



# 监听任务
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = _hd["data"]['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'xiariqingdian_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _con = g.GC["xiariqingdian"]['libao']
    if act not in _con:
        return
    _nt = g.C.NOW()
    if _nt >= _hd["rtime"]:
        return

    _data = getData(uid, _hd['hdid'])
    if _data['libao'].get(act, 0) >= _con[act]['buynum']:
        g.success[orderid] = False
        return

    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(act): 1}})
    _send = g.getPrizeRes(uid, _con[act]['prize'], {'act': 'xiariqingdian_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"xiariqingdian": 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res


    _con = g.GC["xiariqingdian"]
    _needItem = _con["youxiitemneed"]
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])
    _chk = g.chkDelNeed(uid, _needItem)
    # 材料不足
    _nt = g.C.NOW()
    if _chk['res'] and _nt < _hd["rtime"]:
        _res["xiariqingdian"] = 1
        return _res
    _nt = g.C.NOW()
    _day = g.C.getDateDiff(_hd["stime"], _nt)

    for i in xrange(_day + 1):
        if i not in _myData["qiandao"]:
            _res["xiariqingdian"] = 1
            return _res

    return _res






# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)


if __name__ == '__main__':
    uid = g.buid('lsq0')
    print getHongDian(uid)


