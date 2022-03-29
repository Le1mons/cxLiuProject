#!/usr/bin/python
# coding:utf-8

'''
双11
'''
import g

HTYPE = 66


# 获取配置
def getCon():
    res = g.GC['double11']
    return res


# 获取数据
def getData(uid, hdid, pool=False):
    if not pool:
        _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
        _set = {}
        # 没有数据
        if not _myData:
            _set = _myData = {
                'task': {"1": 1},   # 任务数据
                'receive': [],      # 任务领奖记录
                'date': g.C.DATE(),
                'exchange':{},      # 兑换记录
                'libao':{},         # 礼包购买记录
                'allowance':{},     # 礼包购买记录
            }
        # 任务跨天重置
        elif _myData.get('date') != g.C.DATE():
            _myData['task'] = {"1": 1}
            _myData['receive'] = []
            _set = {'task': {"1": 1}, 'receive': [], 'date': g.C.DATE()}

        if _set:
            g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    else:
        _myData = g.crossDB.find1('crossconfig',{'ctype':'double11_pool','k':hdid},fields=['_id','v','log','send']) or {'v': {},'log':[]}
        _myData['sum'] = {k:sum(v.values()) for k,v in _myData['v'].items()}
        for k in _myData['v']:
            if uid in _myData['v'][k]:
                _myData['v'][k] = {uid: _myData['v'][k][uid]}
            else:
                _myData['v'][k] = {}
    return _myData


# 更新数据 带上日期
def setData(uid, data, hdid):
    # for i in data:
    #     if i.startswith('$'):
    #         data['$set'] = data.get('$set', {})
    #         break
    # else:
    #     _temp = data
    #     data = {}
    #     data['$set'] = _temp

    g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, data, upsert=True)


# 获取天数
def CanLottery(data=None):
    _hd = data or g.m.huodongfun.getHDinfoByHtype(HTYPE)
    _res = False
    if _hd and 'hdid' in _hd:
        _res = True
        if g.C.getDateDiff(_hd['rtime'], g.C.NOW()) == 0:
            _res = False
    return _res


# 登陆
def onAnniversaryTask(uid, taskId, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(HTYPE)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    getData(uid, _hd['hdid'])
    setData(uid, {'$inc': {'task.{}'.format(taskId): val}}, _hd['hdid'])


# 获取红点
def getHongDian(uid):
    _hd = g.m.huodongfun.getHDinfoByHtype(HTYPE)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return {'double11': 0}

    _con = getCon()
    _myData = None
    if _con['openday']['task'][0] <= g.C.getDateDiff(_hd['stime'], g.C.NOW()) + 1 <= _con['openday']['task'][1]:
        _myData = getData(uid, _hd['hdid'])
        # 可以领取登录奖励
        for tid, num in _myData.get('task', {}).items():
            if num >= _con['task'][tid]['pval'] and tid not in _myData.get('receive', []):
                return {'double11': 1}

    _myData = _myData or getData(uid, _hd['hdid'])
    if _con['openday']['prizepool'][0] <= g.C.getDateDiff(_hd['stime'], g.C.NOW()) + 1 < _con['openday']['prizepool'][1]-1:
        # 有骰子可用时
        if g.chkDelNeed(uid, _con['poolneed'])['res']:
            return {'double11': 2}

    return {'double11': 0}


# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(HTYPE)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _cons = getCon()['libao']
    for idx,con in enumerate(_cons):
        if act == con['proid'] and con['needrmbmoney'] == 0:
            break
    else:
        return

    _data = getData(uid, _hd['hdid'])
    if _data['libao'].get(str(idx), 0) >= con['num']:
        g.success[orderid] = False
        return

    _itemSend = {}
    _num = 0
    if con['allowance'] > 0:
        _item = g.mdb.find1('itemlist',{"uid":uid,'itemid':g.GC['double11']['allowance']},fields=['num'])
        if _item:
            _num = min(con['allowance'], _item['num'])
            _itemSend = g.m.itemfun.changeItemNum(uid,g.GC['double11']['allowance'], -_num, _item)

    setData(uid, {'$inc': {'libao.{}'.format(idx): 1, 'allowance.{}'.format(idx): _num}}, _hd['hdid'])
    _send = g.getPrizeRes(uid, con['prize'], {'act': 'buy_double11'})
    g.mergeDict(_send, {'item': _itemSend})
    g.sendUidChangeInfo(uid, _send)

# 检测是否开启
def checkOpen(*args):
    _res = {'act': 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(HTYPE)
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res
    _res['act'], _res['stime'],_res['etime'] = 1, _hd['stime'],_hd['etime']
    return _res


# 骰子购买
g.event.on('DOUBLE_11', onAnniversaryTask)
g.event.on('chongzhi', OnChongzhiSuccess)

if __name__ == '__main__':
    print getHongDian(g.buid('xuzhao'))