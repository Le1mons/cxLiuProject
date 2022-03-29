#! /usr/bin/python
# -*-coding:utf-8-*-
"""
节日狂欢
"""



import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 44
import g



def getOpenList(uid, hdinfo):
    if not hdinfo['isxianshi']:
        return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,date')
    if g.C.DATE(g.C.NOW()) != hdData.get('date', '') and g.C.NOW() < hdinfo['rtime']:
        g.m.huodongfun.setHDData(uid, hdid, {'$inc': {'val.fuli': 1},'$set': {'date': g.C.DATE(g.C.NOW()), 'val.task':{}, 'gotarr.task':[]}})
        hdData['val']['fuli'] = hdData['val'].get('fuli', 0) + 1
        hdData['val']['task'] = {"6":1}
        hdData['date'] = g.C.DATE(g.C.NOW())
        hdData['gotarr']['task'] = []
        g.m.huodongfun.setHDData(uid, hdid, {'val': hdData['val'], 'gotarr': hdData['gotarr'], 'date': g.C.DATE(g.C.NOW())})

    _hdinfData = hdinfo["data"]
    _hdinfData['rtime'] = hdinfo['rtime']
    _hdinfData['intr'] = hdinfo.get('intr','')
    _retVal = {"info":_hdinfData,"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = int(kwargs['act'])
    hdid = hdinfo['hdid']
    hdData = getOpenData(uid, hdinfo)['myinfo']

    # 超过时间了  只能兑换
    if act != 3 and g.C.NOW() > hdinfo['rtime']:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 1领取福利
    if act == 1:
        _val = str(idx)
        if 'fuli' not in hdData['val'] or hdData['val']['fuli'] < int(_val):
            # 条件不足
            _res['s'] = -1
            _res['errmsg'] = g.L('global_valerr')
            return _res

        # 奖励已领取
        if _val in hdData['gotarr'].get('fuli', []):
            _res['s'] = -2
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        _set = {'$push': {'gotarr.fuli': _val}}
        _prize = hdinfo["data"]['fuli'][_val]
    # 领取任务
    elif act == 2:
        taskid = str(idx)
        # 领取大奖
        if taskid in hdData['gotarr'].get('task', []):
            # 奖励已领取
            _res['s'] = -3
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        # 条件不足
        if hdData['val'].get('task',{}).get(taskid, 0) < hdinfo['data']['task'][taskid]['pval']:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_valerr')
            return _res

        _set = {'$push': {'gotarr.task': taskid}}
        _prize = hdinfo['data']['task'][taskid]['prize']

    # 节日兑换
    else:
        idx = abs(idx)
        _num = abs(int(kwargs.get('wxcode', 1)))
        _type = 'duihuan' if act == 3 else 'libao'
        _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in hdinfo['data'][_type][idx]['need']]
        _prize = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in hdinfo['data'][_type][idx]['prize']]
        # 次数不足
        if int(hdinfo['data'][_type][idx]['num']) > 0 and hdData['gotarr'].get(_type,{}).get(str(idx), 0)+_num > int(hdinfo['data'][_type][idx]['num']):
            _res['s'] = -5
            _res['errmsg'] = g.L('global_numerr')
            return _res

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

        if act == 4 and g.getGud(uid)['vip'] < hdinfo['data'][_type][idx]['needvip']:
            _res['s'] = -6
            _res['errmsg'] = g.L('global_limitvip')
            return _res

        _sendData = g.delNeed(uid, _need,logdata={'act': 'jierikuanghuan', 'type':_type})
        g.sendUidChangeInfo(uid, _sendData)
        _set = {'$inc': {'gotarr.{0}.{1}'.format(_type, idx): _num}}


    _r = g.m.huodongfun.setHDData(uid, hdid, _set)

    _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}

    _prizeMap = g.getPrizeRes(uid, _prize,{"act": "hdgetprinze", "hdid": hdid, "val": hdData["val"]})
    for k, v in _prizeMap.items():
        if k not in _changeInfo:
            _changeInfo[k] = {}

        for k1, v1 in v.items():
            if k1 not in _changeInfo[k]:
                _changeInfo[k][k1] = v1
            else:
                _changeInfo[k][k1] += v1

    _rData["cinfo"] = _changeInfo
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid)

    return _rData


def getHongdian(uid, hdid, hdinfo):
    return False

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {'val': {'task':{"6":1},'fuli':1}, 'gotarr': {}, 'date':g.C.DATE(g.C.NOW())}
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass

def hdTask(uid, tid, val=1, inc=True):
    _hdinfo = getHDinfoByHtype(htype)
    if not _hdinfo or 'hdid' not in _hdinfo or g.C.NOW() > _hdinfo['rtime']:
        return

    if tid not in _hdinfo['data']['task']:
        return

    _hddata = getOpenData(uid, _hdinfo)['myinfo']
    _date = g.C.DATE(g.C.NOW())
    # 今天的任务
    if _hddata.get('date', '') == _date:
        _hddata['val']['task'][tid] = _hddata['val']['task'].get(tid,0)+val if inc else val
        _set = {'$set': {'date': _date, 'val.task.{}'.format(tid):_hddata['val']['task'][tid]}}
    else:
        if not inc and val <= _hddata['val']['task'].get(tid, 0):
            return
        _hddata['val']['task'][tid] = val
        _set = {'$set': {'date': _date, 'val.task':{tid: val},'gotarr.task':[]}}

    g.m.huodongfun.setHDData(uid, _hdinfo['hdid'], _set)
    if _hddata['val']['task'][tid] >= _hdinfo['data']['task'][tid]['pval'] and tid not in _hddata['gotarr'].get('task',[]):
        g.m.mymq.sendAPI(uid, 'jrkh_redpoint', '1')

def getHDinfoByHtype(htype):
    _key = 'huodong_' + str(htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo['etime']:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': htype, 'etime': {'$gt': _nt}, 'stime': {'$lt': _nt}},fields=['_id','etime','hdid','stime','data','rtime'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {'etime': g.C.ZERO(_nt)}, g.C.ZERO(_nt + 3600*24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo['etime'] - _nt)

    if _nt > _hdInfo['etime']:
        return

    return _hdInfo


if __name__ == "__main__":
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    hdidinfo = g.m.huodongfun.getHDinfoByHtype(htype)
    a = hdTask(uid, '1')
    print a