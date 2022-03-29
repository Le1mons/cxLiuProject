#!/usr/bin/python
# coding:utf-8

'''
元宵活动3
'''
import g

htype = 83
# 获取配置
def getCon():
    res = g.GC['yuanxiao3']
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
            'libao':{},                        # 礼包购买次数
            'task': {'data': {}, 'rec': []},  # 任务数据
            'duihuan': {},                         # 兑换
            "choose": {},                         # 选择礼包
        }
    # 任务跨天重置
    elif _myData.get('date') != _dkey:
        _set['task'] = _myData['task'] = {'data': {}, 'rec': []}
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
        _res["etime"] = _hd["etime"]
    return _res



# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'longzhou_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt > _hd["rtime"]:
        return

    _con = getCon()
    _idx = ""
    for idx, info in enumerate(_con["libao"]):
        if info["proid"] == act:
            _idx = idx
            break
    if _idx == "":
        return
    _data = getData(uid, _hd['hdid'])
    # 判断是否达到礼包上限
    if _data['libao'].get(_idx, 0) >= _con['libao'][_idx]['num']:
        g.success[orderid] = False
        return
    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(_idx): 1}})
    _prize = []
    _prize.extend(_con['libao'][_idx]['prize'])
    if str(_idx) in _data["choose"]:

        for idx2pos, idx3p in _data["choose"][str(_idx)].items():
            _prize.append(_con['libao'][_idx]["choose"][int(idx2pos)][int(idx3p)])

    _send = g.getPrizeRes(uid, _con['libao'][_idx]['prize'], {'act': 'yuanxiao3_libao', "idx":_idx})
    g.sendUidChangeInfo(uid, _send)

# 获取红点
def getHongDian(uid):
    _res = {"yuanxiao3": 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res
    _nt = g.C.NOW()

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])
    if _nt < _hd['rtime']:
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["yuanxiao3"] = 1
                return _res
        _day = g.C.getDateDiff(_hd["stime"], _nt)
        for i in xrange(_day + 1):
            if i not in _myData["qiandao"]:
                _res['yuanxiao3'] = 1
                return _res

    else:
        _duihuancon = _con['duihuan']
        for id, v in _duihuancon.items():
            if _myData['duihuan'].get(id, 0) < _duihuancon[id]['maxnum']:
                _need = _duihuancon[id]["need"]
                _chk = g.chkDelNeed(uid, _need)
                if _chk['res']:
                    _res["yuanxiao3"] = 1
                    break

    return _res



# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('yuanxiao3', onChkTask)


if __name__ == '__main__':
    uid = g.buid('ysr2')
    print OnChongzhiSuccess(uid, "zixuanlibao_30", 1231, "345345345", {})


