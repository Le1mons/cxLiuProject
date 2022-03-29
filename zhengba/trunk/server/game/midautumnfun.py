#!/usr/bin/python
# coding:utf-8

'''
周年庆
'''
import g

# 获取配置
def getCon(ctype='midautumn'):
    res = g.GC[ctype]
    return res


# 获取数据
def getData(uid, hdid, con='midautumn'):
    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon(con)
    # 没有数据
    if not _myData:
        _set = _myData = {
            'task': {'data':{i:1 for i in _con['toTheMoon']['task']['1']},'rec':[]},     # 任务数据
            'moon': 0,                          # 奖池领取记录
            'date': g.C.DATE(),                 # 奖池编号
            'xixi': False,                      # 月兔是否嬉戏了
            'xixinum': 0,                       # 嬉戏次数
            'store':[0] * len(_con['store']),   # 商店购买次数
            'giftpack':{},                      # 礼包次数
            'workshop':{},                      # 月饼工坊
        }
    # 任务跨天重置
    elif _myData.get('date') != g.C.DATE():
        _set['task'] = _myData['task'] = {'data':{i:1 for i in _con['toTheMoon']['task']['1']},'rec':[]}
        _set['date'] = _myData['date'] = g.C.DATE()
        _set['xixi'] = _myData['xixi'] = False
        _set['xixinum'] = _myData['xixinum'] = 0
        _set['store'] = _myData['store'] = [i if not _con['store'][idx]['refresh'] else 0 for idx,i in enumerate(_myData['store'])]

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
    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res['data'] = _hd['data']['con']
    return _res


# 获取天数
def getDay(data=None):
    _hd = data or g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    _res = 0
    if _hd and 'hdid' in _hd:
        _res = g.C.getDateDiff(_hd['stime'], g.C.NOW()) + 1
    return _res


# 登陆
def onMidautumnTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return
    _conKey = _hd['data'].get('con', 'midautumn')
    _data = getData(uid, _hd['hdid'], _conKey)
    _con = getCon(_hd["data"].get('con', 'midautumn'))['toTheMoon']['task'][ttype]
    for i in _con:
        if _data['task']['data'].get(i, 0) + val >= _con[i]['pval'] and i not in _data['task']['rec']:
            g.m.mymq.sendAPI(uid, 'midautumn_redpoint', '1')
            break

    _set = {'$inc': {'task.data.{}'.format(i): val for i in _con}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return
    if _hd["data"].get("con"):
        _con = getCon(_hd["data"]["con"])['giftpack']
    else:
        _con = getCon()['giftpack']

    if act not in _con:
        return
    _conKey = _hd['data'].get('con', 'midautumn')
    _data = getData(uid, _hd['hdid'], _conKey)
    if _data['giftpack'].get(act, 0) >= _con[act]['num']:
        g.success[orderid] = False
        return

    setData(uid, _hd['hdid'], {'$inc': {'giftpack.{}'.format(act): 1}})
    _send = g.getPrizeRes(uid, _con[act]['prize'], {'act': 'buy_midautumn'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return {'midautumn': 0}

    _nt = g.C.NOW()
    if _nt > _hd["rtime"]:
        return {'midautumn': 0}

    _con = getCon(_hd["data"].get('con', 'midautumn'))
    # 可以领取任务奖励
    _conKey = _hd['data'].get('con', 'midautumn')
    _myData = getData(uid, _hd['hdid'],_conKey)
    for k,v in _myData['task']['data'].items():
        if v >= _con['toTheMoon']['task'][k[0]][k]['pval'] and k not in _myData['task']['rec']:
            return {'midautumn': 1}

    # 可以月兔嬉戏
    if not _myData['xixi']:
        return {'midautumn': 1}

    # 可以制作月饼
    # if g.getPlayAttrDataNum(uid, 'midautumn_redpoint'):
    #     return {'midautumn': 2}

    return {'midautumn': 0}

# 获取月兔嬉戏排行榜
def getXixiRank():
    _rank = g.mdb.find1('gameconfig', {'ctype':'midautumn_xixi','k':g.C.DATE()})
    if not _rank:
        g.mdb.update('gameconfig', {'ctype': 'midautumn_xixi'},{'k': g.C.DATE(),'v':[]},upsert=True)
        _rank = {'v': []}
    return _rank['v']

# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('MID_AUTUMN', onMidautumnTask)

if __name__ == '__main__':
    print onMidautumnTask(g.buid('yyw'), '1', 10)