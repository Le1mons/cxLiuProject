#!/usr/bin/python
# coding:utf-8

'''
劳动节
'''
import g

htype = 73

# 获取配置
def getCon():
    res = g.GC['labour']
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
            'task': {'data':{"4":1}, 'rec': []}, # 生成任务时候把每日登陆加进去
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao':{},                        # 礼包购买次数
            "lottery":{},                      # 抽奖数据
            "fightnum": 0,                      # 每天战斗次数
            "topdps": 0,                     # 历史最大值
            "extrec": [],                    # 领取的特殊奖励

        }
    # 任务跨天重置

    elif _myData.get('date') != _dkey:
        _set['task'] = _myData['task'] = {'data': {"4":1}, 'rec': []}
        _set['date'] = _myData['date'] = _dkey
        _set['fightnum'] = _myData['fightnum'] = 0



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
        g.m.mymq.sendAPI(uid, 'labour_redpoint', '1')

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
    _id = ""
    for id, info in _con["libao"].items():
        if info["proid"] == act:
            _id = id
            break
    if not _id:
        return
    _data = getData(uid, _hd['hdid'])
    # 判断是否达到礼包上限
    if _data['libao'].get(_id, 0) >= _con['libao'][_id]['buynum']:
        g.success[orderid] = False
        return
    setData(uid, _hd['hdid'], {'$inc': {'libao.{}'.format(_id): 1}})
    _send = g.getPrizeRes(uid, _con['libao'][_id]['prize'], {'act': 'labour_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"labour": {"task": 0, "boss":0}}


    _hd = g.m.huodongfun.getHDinfoByHtype(73, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _data = g.m.labourfun.getData(uid, _hd['hdid'])
    _con = g.m.labourfun.getCon()

    _nt = g.C.NOW()

    # 判断道具抽卡
    if _nt < _hd["rtime"]:
        _taskCon = _con["task"]
        for taskid in _con["task"].keys():
            # 任务没有完成
            if _data['task']['data'].get(taskid, 0) >= _taskCon[taskid]['pval'] and taskid not in _data['task']['rec']:
                _res["labour"]["task"] = 1
                break

        # 判断是否免费
        if _data["fightnum"] < _con["freenum"]:
            _res["labour"]["boss"] = 1
        else:
            _need = _con["fightneed"]
            _chk = g.chkDelNeed(uid, _need)
            # 材料不足
            if _chk['res']:
                _res["labour"]["boss"] = 1

    return _res



# 提示兑换 跨服
def timer_labour_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfo = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # _hdinfoList = g.crossDB.find("hdinfo", {"htype": 73, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
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
g.event.on('labour', onChkTask)

if __name__ == '__main__':
    uid = g.buid("lyf")
    getHongDian(uid)