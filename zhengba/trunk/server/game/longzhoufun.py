#!/usr/bin/python
# coding:utf-8

'''
龙舟活动
'''
import g

htype = 74

# 获取配置
def getCon():
    res = g.GC['longzhou']
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
            'task': {'data':{"1":1}, 'rec': []}, # 生成任务时候把每日登陆加进去
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan': {},                        # 兑换
            'libao': {},                        # 礼包购买次数
            "select": "",                       # 选择的龙舟
            "info": {},                         # 每天选择的龙舟和票数
            "num": 0,                           # 今天投票数量
        }
    # 任务跨天重置
    elif _myData.get('date') != _dkey:
        _set['task'] = _myData['task'] = {'data': {"1":1, "5": _myData['task']["data"].get("5", 0)}, 'rec': []}
        _set['date'] = _myData['date'] = _dkey
        _set["libao"] = _myData['libao'] = {}
        _set["select"] = _myData['select'] = ""
        _set["num"] = _myData['num'] = 0
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


# 获取数据
def getCrossData(uid, hdid):
    _myData = g.crossDB.find1('longzhou_user', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0, "headdata":0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            'date': g.C.DATE(),                 # 每日刷新标识
            "select": "",                       # 选择的龙舟
            "pinfo": {},                         # 权重
            "num": 0,                           # 今天票数
            "headdata":g.m.userfun.getShowHead(uid,svr=True),  # 获取头像信息
            "sid":g.getHostSid(),

        }
    # 任务跨天重置
    elif _myData.get('date') != _dkey:

        _set['date'] = _myData['date'] = _dkey
        _set["select"] = _myData['select'] = ""
        _set["num"] = _myData['num'] = 0
    if _set:
        g.crossDB.update('longzhou_user', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    return _myData

# 更新数据 带上日期
def setCrossData(uid, hdid, data):

    for i in data:
        if i.startswith('$'):
            data['$set'] = data.get('$set', {})
            break
    else:
        _temp = data
        data = {}
        data['$set'] = _temp

    data['$set']['date'] = g.C.DATE()

    g.crossDB.update('longzhou_user', {'uid': uid, 'hdid': hdid}, data, upsert=True)


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
    _send = g.getPrizeRes(uid, _con['libao'][_id]['prize'], {'act': 'longzhou_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"longzhou": {"task": 0, "duihuan":0}}


    _hd = g.m.huodongfun.getHDinfoByHtype(74, "etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _data = g.m.longzhoufun.getData(uid, _hd['hdid'])
    _con = g.m.longzhoufun.getCon()

    _nt = g.C.NOW()

    # 判断道具抽卡
    if _nt < _hd["rtime"]:
        _taskCon = _con["task"]
        for taskid in _con["task"].keys():
            # 任务没有完成
            if _data['task']['data'].get(taskid, 0) >= _taskCon[taskid]['pval'] and taskid not in _data['task']['rec']:
                _res["longzhou"]["task"] = 1
                break
    else:
        _data = g.getAttrOne(uid, {"ctype": "longzhou_huodong", "k": _hd['hdid']})
        if not _data:
            _res["longzhou"]["duihuan"] = 1

    return _res



# 提示兑换 跨服
def timer_longzhou_tishi():
    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfo = g.m.huodongfun.getHDinfoByHtype(htype, "etime")
    # _hdinfoList = g.crossDB.find("hdinfo", {"htype": 74, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
    #                              fields=['_id', "stime", "hdid"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return
    # 如果不是第一天就直接返回
    if _nt < _hdinfo["rtime"]:
        return

    _con = getCon()
    _email = _con["email"]

    # 发送跨服工会邮件
    _title = _email["tishi"]["title"]
    _content =_email["tishi"]['content'].format(g.C.DATE(_hdinfo["etime"]))
    # 发送邮件
    _userlist = g.mdb.find("hddata", {"hdid": _hdinfo["hdid"]})

    for user in _userlist:
        g.m.emailfun.sendEmails(user["uid"], 1,  _title, _content)



# 龙舟赛生成结果
def timer_longzhou_star():
    # 获取战斗结果
    # def getResult():
    #
    #     _data = {}
    #     # 用来判断是否有平局
    #
    #     for id, info in _longzhouinfo.items():
    #         _buff = {}
    #         _log = {}
    #         _n = 0
    #         _time = 0
    #         _event = []
    #         _baseSpeed = info["basespeed"]
    #         fmtLog = []
    #         while _length * 1000 > _n:
    #             _speed = int(_baseSpeed * 1000)
    #
    #             _time += 1
    #             _itemInterval = (len(_event) + 1) * info["iteminterval"] * 1000
    #             # 判断是否触发
    #             if _n >= _itemInterval:
    #                 _randombuff = g.C.getRandArrNum(info["randomitem"], 1)[0]
    #                 if _randombuff["key"]:
    #                     _buff.update({_randombuff["key"]: info[_randombuff["key"]].copy()})
    #                     _event.append({_randombuff["key"]: info[_randombuff["key"]].copy()})
    #                     _log[str(_time)] = {"buff": {_randombuff["key"]: info[_randombuff["key"]].copy()}}
    #
    #
    #             _dingshen = 0
    #
    #             for k, v in _buff.items():
    #                 # 如果是海草
    #                 v["time"] -= 1
    #                 if v["time"] <= 0:
    #                     del _buff[k]
    #                 if k == "haicao":
    #                     _speed = 0
    #                     _dingshen = 1
    #                 elif k == "shunfeng" and not _dingshen:
    #                     _speed = int(_speed * (1000 + v["speedpro"]) / 1000)
    #
    #             _n += _speed
    #             # _chkLog = {"buff": _buff, "speed":_speed, "sum":_n}
    #             # _chkLog = g.C.dcopy(_chkLog)
    #             # fmtLog.append([_time, _chkLog])
    #
    #
    #         _data[id] = {"time": _time, "log": _log.copy()}
    #         # from pprint import pprint
    #         # pprint(_data[id])
    #         _timelist.append(_time)
    #
    #     return _data

    def getResult():

        _data = {}
        # 用来判断是否有平局
        _idlist = []
        for id, info in _longzhouinfo.items():
            # _buff = {}
            # _log = {}
            # _n = 0
            # _time = 0
            # _event = []
            # _baseSpeed = info["basespeed"]
            _idlist.append(id)
        _ranklist = g.C.RANDLIST(_idlist, 4)
        # {"0":
        _buffCon = {"haicao": {"time": 20}, "shunfeng": {"speedpro": 200, "time": 40}}
        _con = {
            "0": {"haicao": 1, "shunfeng": 4},
            "1": {"haicao": 2, "shunfeng": 3},
            "2": {"haicao": 3, "shunfeng": 2},
            "3": {"haicao": 4, "shunfeng": 1},
        }
        for idx, id in enumerate(_ranklist):
            _log = {}
            _randomList = []

            for k, v in _con[str(idx)].items():
                _buff = g.C.dcopy(_buffCon[k])
                for i in xrange(v):
                    _randomList.append({"buff": {k: _buff}})

            _random = g.C.RANDLIST(_randomList, 5)
            for i in xrange(5):
                _log[str(i)] = _random[i]

            _data[id] = {"time": idx, "log": _log.copy()}

        return _data
    _con = getCon()
    _length = _con["length"]
    _longzhouinfo = _con["longzhouinfo"]
    _dkey = g.C.getDate()
    _ctype2 = "TIMER_LONGZHOU_RES"
    # 设置今天已经生成数据的表示
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, "k":_dkey})
    # if _chkData:
    #     return

    _nt = g.C.NOW()
    _hdinfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                                 fields=['_id', "stime", "hdid","rtime"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return

    if _hdinfo["rtime"] < _nt:
        return

    _data = {}

    # 用来判断是否有平局
    _timelist = []
    _result = getResult()
    # # 如果有平局，重新随机一遍
    # if len(set(_timelist)) != len(_longzhouinfo):
    #     _result = getResult()

    _con = g.GC["longzhou"]
    _ranklist = sorted(_result.items(), key=lambda x: int(x[1]["time"]), reverse=False)
    _rankList = []

    _title = _con["email"]["prize"]["title"]
    _content = _con["email"]["prize"]["content"]

    _extTitle = _con["email"]["ext"]["title"]
    _extContent = _con["email"]["ext"]["content"]

    _allnum = getAllNum(_hdinfo['hdid'])
    for idx1, _rank in enumerate(_ranklist):
        _rank[1]["id"] = _rank[0]
        _rank[1]["extprize"] = {}
        _rank[1]["allnum"] = _allnum.get(_rank[1]["id"], 0)

        _basenum = _con["longzhouinfo"][_rank[0]]["basenum"]
        _maxnum = _con["longzhouinfo"][_rank[0]]["maxnum"]
        _randomlist = {}
        _userlist = g.crossDB.find("longzhou_user", {"hdid": _hdinfo["hdid"], "date": _dkey, "select": _rank[0]})
        _black = []

        # 总人数
        _usernum = len(_userlist)
        _lottery = {}
        for idx, info in enumerate(_con["extprize"][_rank[0]]):
            _lottery[str(idx)] = []
            _randomlist = []
            _extprize = info[1]

            for user in _userlist:
                if user["pinfo"].get(str(_rank[0]), {}).get(str(idx), 0) <= 0:
                    continue
                # 判断是否是在黑名单
                if user["uid"] in _black:
                    continue

                _randomlist.append({"p": user["pinfo"].get(str(_rank[0]), {}).get(str(idx), 0), "uid": user["uid"], "sid": user["sid"], "name": user["headdata"].get("name", "神秘玩家"),
                                    "servername": user["headdata"].get("svrname", "暂无区服")})

            _prizelist = []
            if _usernum > 0 and _randomlist:
                # # 总人数除以每多少个人抽一个奖励的基数
                # _prizenum, _lessnum = divmod(_usernum, _basenum)
                # if _lessnum > 0:
                #     _prizenum += 1
                _prizenum = int(_usernum / _basenum) if int(_usernum / _basenum) > 0 else 1
                # 不能超过最大的发奖个数
                if _prizenum > _maxnum:
                    _prizenum = _maxnum
                _prizenum = int(_prizenum * (100 + _con["longzhouprize"][idx1][2]) / 100)
                if _prizenum > len(_randomlist):
                    _prizenum = len(_randomlist)

                # 随机出发奖的uid
                _prizelist = g.C.getRandArrNum(_randomlist, _prizenum)
                _lottery[str(idx)] = _prizelist
            for user in _prizelist:
                _black.append(user["uid"])
                # g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _extTitle, _extContent, prize=_extprize)


        _rank[1]["extprize"] = _lottery
        _rankList.append(_rank[1])

    _ctype = "HUODONG_LONGZHOU_RES"
    _chkInfo = g.m.crosscomfun.getGameConfig({'ctype': _ctype, "k": _hdinfo['hdid']})
    _old = {}
    if _chkInfo:
        _old = _chkInfo[0]["v"]
    g.m.crosscomfun.setGameConfig({'ctype': _ctype}, {"v": _rankList, "old":_old, 'k': _hdinfo['hdid']})

    # 设置今天已经生成数据的表示
    g.m.crosscomfun.setGameConfig({'ctype': _ctype2}, {"v": 1,  "k": _dkey})




# 获取龙舟赛的数据
def getLongZhouRes(_hdid):
    _res = {"old":{}, "jieguo":{}}

    _ctype = "HUODONG_LONGZHOU_RES"
    _dkey = g.C.DATE()
    _chkInfo = g.crossMC.get("LONGZHOU_RES_{}".format(_dkey))
    if not _chkInfo or g.C.HOUR() >= 22:
        _chkInfo = g.m.crosscomfun.getGameConfig({'ctype': _ctype, "k": _hdid})
    if _chkInfo:
        _res["old"] = _chkInfo[0].get("old", {})
        _res["jieguo"] = _chkInfo[0].get("v", {})
        if 22 > g.C.HOUR() >= 0:
            _res["old"] = _res["jieguo"]
            _res["jieguo"] = {}
        g.crossMC.set("LONGZHOU_RES_{}".format(_dkey), _chkInfo, time=2 * 3600)
    return _res


# 邮件发奖，要求22点15发
def timer_longzhou_sendPrize():
    _nt = g.C.NOW()
    _hdinfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}},
                              fields=['_id', "stime", "hdid", "rtime"])
    if not _hdinfo or "hdid" not in _hdinfo:
        return

    if _hdinfo["rtime"] < _nt:
        return

    # 判断今天是否发奖
    _dkey = g.C.getDate()
    _ctype2 = "TIMER_LONGZHOU_SENDPRIZE"
    # 设置今天已经生成数据的表示
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, "k": _dkey})
    if _chkData:
        return

    _result = getLongZhouRes(_hdinfo["hdid"])

    _ranklist = _result["jieguo"]
    _con = g.GC["longzhou"]
    _title = _con["email"]["prize"]["title"]
    _content = _con["email"]["prize"]["content"]

    _extTitle = _con["email"]["ext"]["title"]
    _extContent = _con["email"]["ext"]["content"]

    _allnum = getAllNum(_hdinfo['hdid'])
    # 名次奖励
    _longzhouprize = _con["longzhouprize"]

    for idx, info in enumerate(_ranklist):
        _id = info["id"]
        _fmtContent = _content.format(idx + 1)
        _fmtExtContent = _extContent.format(idx + 1)
        _extprize = info["extprize"]
        _userlist = g.crossDB.find("longzhou_user", {"hdid": _hdinfo["hdid"], "date": _dkey, "select": _id, "num":{"$gt":0}})
        _prize = []
        # 发奖
        for ele in _longzhouprize:
            if ele[0][0] <= idx + 1 <= ele[0][1]:
                _prize += ele[1]
                break
        if _prize:
            for user in _userlist:

                g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _title, _fmtContent, prize=_prize)
                # 删除随机数值
                setCrossData(user["uid"], _hdinfo["hdid"], {"pinfo.{}".format(_id): {}})
        # 发送惊喜奖励
        _extPrizeCon = _con["extprize"][_id]
        for idx, users in _extprize.items():
            _prize = _extPrizeCon[int(idx)][1]
            for user in users:
                g.m.emailfun.sendCrossEmail(user["uid"], user["sid"], _extTitle, _fmtExtContent, prize=_prize)


    # 设置今天已经生成数据的表示
    g.m.crosscomfun.setGameConfig({'ctype': _ctype2}, {"v": 1, "k":_dkey})



# 获取总的投票人数
def getAllNum(hdid):
    _dkey = g.C.getDate()
    _ctype = 'HUODONG_LONGZHOU_NUM'
    _chkInfo = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': hdid, "dkey": _dkey})
    _allNum = {}
    if _chkInfo:
        _allNum = _chkInfo[0]["v"]
    return _allNum


g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('longzhou', onChkTask)

if __name__ == '__main__':
    uid = g.buid("lyf")
