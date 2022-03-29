#! /usr/bin/python
# -*-coding:utf-8-*-
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('game')

"""
英雄预热
"""


htype = 79
import g



def getOpenList(uid, hdinfo):
    return None


def getOpenData(uid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,date,task,duihuan,val,qiandao,dianzan,finish')
    # 任务跨天重置
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)

    _idx = g.C.getDateDiff(hdinfo["stime"], _nt)
    hdData["idx"] = _idx if _idx < 7 else 6
    _con = hdinfo["data"]
    _set = {}
    if hdData.get('date') != _dkey:
        # # # 补发奖励邮件
        # _prize = []
        # for taskid, info in _con['task'].items():
        #     if taskid not in hdData["task"]["rec"] and hdData["task"]["data"].get(taskid, 0) >= info["pval"]:
        #         _prize += info["prize"]
        #

        _set['task'] = hdData['task'] = {'data': {"1": 1}, 'rec': []}
        _set['date'] = hdData['date'] = _dkey
        _set["dianzan"] = hdData["dianzan"] = 0

    if _set:
        g.m.huodongfun.setMyHuodongData(uid, hdinfo["hdid"], _set)


    _allnum = 0
    _configData = g.m.crosscomfun.getGameConfig({'ctype': 'heropreheat_allnum'})
    if _configData:
        _allnum = _configData[0]["v"]

    _retVal = {"info": hdinfo["data"], "myinfo": hdData, "allnum": _allnum}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}

    act = kwargs['act']

    hdid = hdinfo['hdid']
    _openData = getOpenData(uid, hdinfo)
    hdData = _openData["myinfo"]

    _setData = {}
    _prize = []
    # 兑换
    if int(act) == 1:
        _id = str(kwargs['idx'])
        _num = kwargs['wxcode']
        _con = hdinfo["data"]["duihuan"][str(_id)]
        # 任务没有完成
        if hdData['duihuan'].get(_id, 0) >= _con['maxnum']:
            _res['s'] = -2
            _res['errmsg'] = g.L('planttrees_res_-3')
            return _res

        _need = _con["need"] * _num
        _need = g.mergePrize(_need)
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res
        hdData["duihuan"][_id] = hdData["duihuan"].get(_id, 0) + _num
        _setData["duihuan"] = hdData["duihuan"]

        _sendData = g.delNeed(uid, _need, logdata={'act': 'heropreheat', 'id': _id, "num": _num})
        g.sendUidChangeInfo(uid, _sendData)
        _prize = _con["prize"] * _num
        _prize = g.mergePrize(_prize)
        # 设置数据库
    # 点赞
    elif int(act) == 2:
        # 领取免费得奖励
        # 不免费
        _con = hdinfo["data"]["libaoinfo"]
        if hdData['dianzan']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res
        _setData["dianzan"] = hdData["dianzan"] = 1
        _prize = _con["dianzanprize"]
        g.m.crosscomfun.setGameConfig({'ctype': 'heropreheat_allnum',"k":hdid}, {'v':_openData["allnum"]+ 1})
        # 任务监听
        g.m.huodongfun.event(uid, 'heropreheat', "3")

        _openData["allnum"] += 1
    # 回馈奖励
    elif int(act) == 3:
        _con = hdinfo["data"]["libaoinfo"]

        if _openData["allnum"] < _con["needval"]:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        if hdData['finish']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _setData["finish"] = hdData["finish"] = 1
        _prize = _con["prize"]

    # 任务领奖
    elif int(act) == 4:
        _id = str(kwargs['idx'])
        _con = hdinfo["data"]["task"][_id]
        # 判断任务是否领奖
        if _id in hdData['task']["rec"]:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 判断任务是否达到领奖进度
        if hdData["task"]["data"].get(_id, 0) < _con["pval"]:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res
        hdData['task']["rec"].append(_id)
        _setData["task"] = hdData['task']
        _prize = _con["prize"]

    # 签到领奖
    elif int(act) == 5:
        _idx = int(kwargs['idx'])
        # 判断奖励是否领取
        if _idx in hdData["qiandao"]:
            _res['s'] = -1
            _res['errmsg'] = g.L('global_qiandao')
            return _res

        # 判断是可以领奖
        if _idx > hdData["idx"]:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 如果是补领，就需要消耗道具
        if _idx != hdData["idx"]:
            _need = hdinfo["data"]["buqianneed"]
            _chk = g.chkDelNeed(uid, _need)
            # 材料不足
            if not _chk['res']:
                if _chk['a'] == 'attr':
                    _res['s'] = -100
                    _res['attr'] = _chk['t']
                else:
                    _res["s"] = -104
                    _res[_chk['a']] = _chk['t']
                return _res
            _sendData = g.delNeed(uid, _need, logdata={'act': 'heropreheat', 'idx': _idx})
            g.sendUidChangeInfo(uid, _sendData)

        hdData["qiandao"].append(_idx)
        _setData["qiandao"] = hdData["qiandao"]
        _prize = hdinfo["data"]["qiandao"][_idx]

    g.m.huodongfun.setHDData(uid, hdid, _setData)

    _prizeMap = g.getPrizeRes(uid, _prize, {"act": "heropreheat", "hdid": hdid, 'type':act, "id": kwargs['idx'], "num": kwargs["wxcode"]})
    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "army": {}, 'hunshi': {}}


    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["prize"] = _prize

    _rData["myinfo"] = hdData
    _rData["allnum"] = _openData["allnum"]

    return _rData

def getHongdian(uid, hdid, hdinfo):
    return
    _retVal = False
    _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid)
    for idx, i in enumerate(hdinfo['data']['arr']):
        if i['price'] == 0 and str(idx) not in _valInfo['gotarr']:
            _retVal = True
            break

    return _retVal

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {
        'task': {'data': {"1": 1}, 'rec': []},
        'date': g.C.DATE(),
        'duihuan': {},
        "qiandao": [],
        "finish":0,
        "dianzan":0,
    }
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):

    if etype != 'heropreheat':
        # 只处理充值事件
        return 0
    _id = args[0]
    _val = 1
    if len(args) > 1:
        _val = args[1]
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'],
                                             keys='_id,date,task,duihuan,val,qiandao,dianzan,finish')
    # 任务跨天重置
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)

    _con = hdinfo["data"]
    _set = {}
    if hdData.get('date') != _dkey:
        # # # 补发奖励邮件
        # _prize = []
        # for taskid, info in _con['task'].items():
        #     if taskid not in hdData["task"]["rec"] and hdData["task"]["data"].get(taskid, 0) >= info["pval"]:
        #         _prize += info["prize"]
        #
        _set['task'] = hdData['task'] = {'data': {"1": 1}, 'rec': []}
        _set['date'] = hdData['date'] = _dkey
        _set["dianzan"] = hdData["dianzan"] = 0
    if _set:
        g.m.huodongfun.setMyHuodongData(uid, hdinfo["hdid"], _set)

    _con = hdinfo["data"]["task"]
    hdid = hdinfo["hdid"]
    if hdData['task']['data'].get(_id, 0) + _val >= _con[_id]['pval'] and _id not in hdData['task']['rec']:
        g.m.mymq.sendAPI(uid, 'heropreheat_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(_id): _val}}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), _set)

# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")

    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res["stime"] = _hd["stime"]
        _res["hdid"] = _hd["hdid"]
    return _res



def getHD(uid):
    _res = 0
    hdinfo = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not hdinfo or 'hdid' not in hdinfo:
        return _res

    _openData = getOpenData(uid, hdinfo)
    hdData = _openData["myinfo"]
    if not hdData["dianzan"]:
        return 1
    _allNum = _openData["allnum"]
    _needval = hdinfo["data"]["libaoinfo"]["needval"]

    if _allNum >= _needval and not hdData["finish"]:
        return 1
    # 判断是否有任务可以领奖
    for taskid, val in hdData["task"]["data"].items():
        if val >= hdinfo["data"]["task"][taskid]["pval"] and taskid not in hdData["task"]["rec"]:
            return 1

    # 判断签到是否可以
    _idx = hdData["idx"]
    if _idx < len(hdinfo["data"]["qiandao"]) and _idx not in hdData["qiandao"]:
        return 1
    return _res



# 借阴兵
def timer_heropreheat_commonval():

    # 判断活动是否开启
    _nt = g.C.NOW()
    _hdinfoInfo = g.crossDB.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "rtime": {"$gte": _nt - 3600}},
                                  fields=['_id', "stime", "hdid"])
    if not _hdinfoInfo:
        return


    _day = g.C.getTimeDiff(_nt, _hdinfoInfo["stime"])

    _hdid = _hdinfoInfo["hdid"]
    todaycommonval = {
        "1": 16000,
        "2": 32000,
        "3": 48000,
        "4": 60000,
        "5": 70000,
        "6": 85000,
        "7": 100000,
    }
    if str(_day) not in todaycommonval:
        return
    _ctype2 = 'heropreheat_allnum'
    _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
    _allval = 0
    if _conData:
        _allval = _conData[0]["v"]

    if _allval > todaycommonval[str(_day)]:
        return
    # 判断是否已经执行过
    _ctype = 'TIMER_heropreheat_commonval'
    _chkData = g.m.crosscomfun.getGameConfig({'ctype': _ctype, 'k': _hdid})
    if _chkData and _chkData[0]["v"] > 6:
        return
    ##(指定绿化率  - 当前绿化率) / 6

    _addVal = int((todaycommonval[str(_day)] - _allval) / 6)

    if _addVal > 0:
        g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"$inc": {"v": _addVal}})
    # 加上添加次数
    g.m.crosscomfun.setGameConfig({'ctype': _ctype, 'k': _hdid},  {"v": _day})



if __name__ == "__main__":
    uid = g.buid("liu200")
    hdid = 1200
    a = timer_heropreheat_commonval()

    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    print a