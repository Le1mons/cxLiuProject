#! /usr/bin/python
# -*-coding:utf-8-*-
"""
寻龙定穴
"""
if __name__ == '__main__':
    import sys
    sys.path.append('..')


htype = 49
import g



def getOpenList(uid, hdinfo):
    if hdinfo['isxianshi'] == 0:
        return hdinfo
    return False

def getOpenData(uid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,trace,num,over,target,step,targetact,buynum,gotarr')
    _retVal = {"info": hdinfo["data"], "myinfo": hdData}
    return _retVal

def getPrize(uid, hdinfo, *args, **kwargs):
    _res = {'s': 1}
    _rData = {}
    idx = kwargs['idx']
    act = kwargs['act']
    hdid = hdinfo['hdid']
    _con = g.GC['find_dragon']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id')
    # 挑选目标
    if act == 1:
        _tid = str(idx)
        # 这一层已经拿到目标奖励了
        if hdData.get('over', 0):
            _res['s'] = -1
            _res['errmsg'] = g.L('global_algetprize')
            return _res

        # 层数没达到
        if hdData['val'] < hdinfo['data']['target'][_tid]['step']:
            _res['s'] = -2
            _res['errmsg'] = g.L('global_valerr')
            return _res

        if 'target' in hdData:
            # 奖励相同
            if hdData['target'] == _tid:
                _res['s'] = -3
                _res['errmsg'] = g.L('global_argserr')
                return _res

            # 目标奖励次数用光
            if hdData['targetact'].get(_tid, 0) >= hdinfo['data']['target'][_tid]['num']:
                _res['s'] = -4
                _res['errmsg'] = g.L('global_argserr')
                return _res

        _set = {'target': _tid}
    # 抽奖
    elif act == 2:
        # 还没挑选目标奖励
        if 'target' not in hdData:
            _res['s'] = -4
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 抽奖次数用光了
        if hdData['num'] >= _con['maxnum']:
            _res['s'] = -5
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # trace参数错误
        if str(idx) in hdData['trace']:
            _res['s'] = -8
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _chk = g.chkDelNeed(uid, _con['need'])
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _sendData = g.delNeed(uid, _con['need'], 0)

        _changeInfo = {"item": {}, "attr": {}, "equip": {}, "hero": {}, 'shipin': {}}
        for k, v in _sendData.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _list, _p = [], 0
        for i in _con['dlz'][str(_con['step'][hdData['val']-1])]:
            # 次数用光了
            if hdData['gotarr'].get(i['id'], 0) >= i['num']:
                continue
            _p += i['p']
            _list.append(i)

        # 抽满了限制次数 并且之前没有抽到过
        if hdData['num'] >= _con['limit'] and 'over' not in hdData:
            _prize = hdinfo['data']['target'][hdData['target']]['prize']
            _list.append({'p': _con['weight'], 'good': 2, 'prize': _prize})
            _p += _con['weight']

        _prize = g.C.RANDARR(_list, _p)
        _send = g.getPrizeRes(uid, [_prize['prize']], {'act': 'xldx_act', 'num': hdData['num']})
        for k, v in _send.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}

            for k1, v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1] += v1

        _set = {'$set':{'num': hdData['num'] + 1,'trace.{}'.format(idx):_prize['prize']}}
        # 如果是目标奖励
        if _prize['good'] == 2:
            _set['$set']['over'] = 1
            _set['$inc'] = {'targetact.{}'.format(hdData['target']): 1}
        else:
            _set['$set']['gotarr'] = hdData['gotarr']
            _set['$set']['gotarr'][_prize['id']] = hdData['gotarr'].get(_prize['id'], 0) + 1
        _rData['prize'] = [_prize['prize']]
        _rData["cinfo"] = _changeInfo
        _rData['good'] = _prize['good']
    # 到下一层
    else:
        # 这一层还没结束
        if not hdData.get('over', 0):
            hdData['s'] = -6
            hdData['errmsg'] = g.L('global_argserr')
            return hdData

        hdData['val'] += 1
        # 已达到最大层数
        if hdData['val'] > len(_con['step']):
            _res['s'] = -7
            _res['errmsg'] = g.L('global_argserr')
            return _res

        _set = {'$set':{"val": hdData['val'],'gotarr':{},'num':0,'trace':{}},'$unset':{'over':1,'target':1}}

    g.m.huodongfun.setMyHuodongData(uid, int(hdid), _set)
    _rData["myinfo"] = g.m.huodongfun.getHDData(uid, hdid, keys='_id,val,trace,num,over,target,step,targetact,buynum,gotarr')
    return _rData


def getHongdian(uid, hdid, hdinfo):
    _res = False
    return _res

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {'val':1,'gotarr':{},'num':0,'trace':{},'targetact':{},'buynum':{}}
    if data:
        setData.update(data)
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    # 只处理充值事件
    if etype != 'chongzhi':
        return
    # 充值配置
    payCon = args[2]
    if payCon['proid'] not in hdinfo['data']['arr']:
        return
    _data = g.m.huodongfun.getMyHuodongData(uid, int(hdinfo['hdid']), keys='_id,buynum')
    g.m.huodongfun.setMyHuodongData(uid, int(hdinfo['hdid']), {'$inc':{'buynum.{}'.format(payCon['proid']): 1}})

    if _data['buynum'].get(payCon['proid'], 0) >= hdinfo['data']['arr'][payCon['proid']]['num']:
        g.success[kwargs['orderid']] = False
        return

    _prize = hdinfo['data']['arr'][payCon['proid']]['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': 'xunlongdingxue'})

    g.sendUidChangeInfo(uid, _send)


if __name__ == "__main__":
    uid = g.buid("xuzhao")
    hdid = 1000
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = hdEvent(uid, hdidinfo)
    print a