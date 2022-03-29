#!/usr/bin/python
# coding:utf-8

'''
扭蛋
'''
import g

# 获取配置
def getCon():
    res = g.GC['niudan']
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
            'task': {'data':{"1": 1}, 'rec': {"pt": [], "tq": []}},     #
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao':{},                        # 礼包购买次数
            "tq": 0,                           # 特权
            "niudan":{},                      # 扭蛋数据
            "over":{},                        # 是否完成对应扭蛋
            "finishtask":{},                   # 记录完成的任务数量
            "click":0,                          # 点击史莱姆次数
            "todayfight":0                      # 每日战斗


        }
    # 任务跨天重置

    elif _myData.get('date') != _dkey:
        _finishTask = _myData['finishtask']
        # 记录每个任务的领奖次数
        for taskid in _myData['task']["rec"]["pt"]:
            if taskid not in _finishTask: _finishTask[taskid] = 0
            _finishTask[taskid] += 1
        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':{"pt":[],"tq":[]}}
        _set['date'] = _myData['date'] = _dkey
        _set['click'] = _myData['click'] = 0
        _set['todayfight'] = _myData['todayfight'] = 0
        _set["finishtask"] = _finishTask

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
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
    return _res



# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'niudanhd_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _con = getCon()
    if act not in _con['libao'] and act != _con["tq"]["proid"]:
        return
    _data = getData(uid, _hd['hdid'])
    # 如果是购买特权
    if act == _con["tq"]["proid"]:
        if _data["tq"]:
            g.success[orderid] = False
            return
        setData(uid, _hd['hdid'], {'tq': 1})
        _send = g.getPrizeRes(uid, _con['tq']['prize'], {'act': 'niudan_tq'})
        # 补发任务高级奖励
        _title = _con["email"]["title"]
        _content = _con["email"]["content"]
        _prize = []
        for taskid, num in _data["finishtask"].items():
            _prize += _con["task"][taskid]["tqprize"] * num

        # 合并奖励
        _prize = g.mergePrize(_prize)
        _send = g.getPrizeRes(uid, _prize, {'act': 'niudan_tequan'})

    else:
        if _data['libao'].get(act, 0) >= _con['libao'][act]['buynum']:
            g.success[orderid] = False
            return
        setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(act): 1}})
        _send = g.getPrizeRes(uid, _con['libao'][act]['prize'], {'act': 'niudan_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"niudan": {"task": 0}}
    _hd = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _nt = g.C.NOW()
    if _nt >= _hd["rtime"]:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])
    for k,v in _myData['task']['data'].items():
        if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']["pt"]:
            _res["niudan"]["task"] = 1
            break

    # _duihuancon = _con['duihuan']
    # for id, v in _duihuancon.items():
    #     if _myData['duihuan'].get(id, 0) < _duihuancon[id]['maxnum']:
    #         _need = _duihuancon[id]["need"]
    #         _chk = g.chkDelNeed(uid, _need)
    #         if _chk['res']:
    #             _res["niudan"]["duihuan"] = 1
    #             break


    return _res



# 提示兑换 跨服
def timer_niudan_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfo = g.m.huodongfun.getHDinfoByHtype(72, "etime")
    # _hdinfoList = g.crossDB.find("hdinfo", {"htype": 72, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
    #                              fields=['_id', "stime", "hdid"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return
    _stime = _hdinfo["stime"]
    _day = g.C.getTimeDiff(_nt, _stime) + 1
    # 如果不是第一天就直接返回
    if _nt < _hdinfo["rtime"]:
        return

    _con = getCon()
    _email = _con["email"]

    _stime = _hdinfo["stime"]
    _hdid = _hdinfo["hdid"]

    # 发送跨服工会邮件
    _title = _email["title"]
    _content =_email['content'].format(g.C.DATE(_hdinfo["etime"]))
    # 发送邮件
    _userlist = g.mdb.find("hddata", {"hdid": _hdid})

    for user in _userlist:
        g.m.emailfun.sendEmails(user["uid"], 1,  _title, _content)



# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('niandanhd', onChkTask)

if __name__ == '__main__':
    uid = g.buid("0")
    getHongDian(uid)