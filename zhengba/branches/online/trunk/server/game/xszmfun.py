#!/usr/bin/python
#coding:utf-8

'''
限时招募
'''
from random import shuffle
import g

# 获取活动数据
def getHuodongData():
    _htype = 31
    _key = 'huodong_' + str(_htype)
    _hdInfo = g.mc.get(_key)
    _nt = g.C.NOW()
    if not _hdInfo or _nt >= _hdInfo['rtime']:
        _hdInfo = g.mdb.find1('hdinfo', {'htype': _htype, 'rtime': {'$gt': _nt}, 'stime': {'$lt': _nt}},
                              fields=['_id', 'rtime', 'hdid', 'stime','model','data'])
        # 活动已过期
        if not _hdInfo:
            g.mc.set(_key, {'rtime': g.C.ZERO(_nt)}, g.C.ZERO(_nt + 3600 * 24) - _nt)
            return
        else:
            g.mc.set(_key, _hdInfo, _hdInfo['rtime'] - _nt)

    if _nt > _hdInfo['rtime']:
        return

    return _hdInfo


# 获取排行信息
def getRankData(hdid,uid=None,myrank=True):
    _con = g.GC['xianshi_zhaomu']['rankprize']
    _myRank = -1
    _list = g.mdb.find('hddata',{'hdid':hdid,'val':{'$gt': 0}},sort=[['val',-1],['lasttime',1]],limit=10,fields=['_id','uid','val'])
    # 按照段位分开
    _val2seg = {i:[] for i in xrange(1, len(_con) + 1)}
    for i in _list:
        # 只有大于对应分数的人 才能获得对应名次
        for idx,x in enumerate(_con):
            if i['val'] >= x[2]:
                if len(_val2seg[idx + 1]) >= x[0][1] - x[0][0] + 1:
                    continue
                i['rank'] = len(_val2seg[idx + 1]) + x[0][0]
                i['name'] = g.getGud(i['uid'])['name']
                if uid == i['uid']:
                    _myRank = i['rank']
                _val2seg[idx + 1].append(i)
                break

    _res = []
    for seg in _val2seg:
        if len(_val2seg[seg]) < _con[seg-1][0][1] - _con[seg-1][0][0] + 1:
            _val2seg[seg] += [None] * (_con[seg-1][0][1] - _con[seg-1][0][0] + 1 - len(_val2seg[seg]))
        _res += _val2seg[seg]

    # 如果我的排行已经发生了变化
    if _myRank == -1 and myrank:
        _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val')
        if _valInfo['val'] >= 500:
            _myRank = g.mdb.count('hddata',{'val':{'$gte':_valInfo['val']},'hdid':hdid}) + 1
            if _myRank > 50:
                _myRank = -1
    return {'myrank': _myRank, 'ranklist': _res}

# 通过次数获取奖励
def getPrizeByNum(num, idx):
    _con = g.GC['xianshi_zhaomu']['data'][str(num)]
    _5starNum = 0
    _res = []
    for i in xrange(num):
        # 特殊积分的奖励
        if idx == _con['special']:
            _item = g.C.RANDARR(_con['prize'],sum(map(lambda x:x['p'], _con['prize'])))
            _prize = _con['atn'] if not _item['isdlz'] else (
                g.m.diaoluofun.getGroupPrize(_con['dlz'][idx])
            )
        else:
            _dlz = _con['dlz'][idx]
            _prize = g.m.diaoluofun.getGroupPrize(_dlz)
        # 最多一个五星
        while _5starNum == 1 and _prize[0]['t'].endswith('5'):
            # '37' 掉落组全是4星歌手
            _prize = g.m.diaoluofun.getGroupPrize(_con['dlz'][0])

        if _prize[0]['t'].endswith('5'):
            _5starNum = 1

        _res.extend(_prize)
        idx = (idx + 1) % 15
    # 如果全部是四星就必出一个五星
    if num != 1 and map(lambda x:x['t'][-1:], _res).count('5') == 0:
        del _res[0]
        _res.extend(g.m.diaoluofun.getGroupPrize(_con['dlz'][_con['special']]))
    shuffle(_res)
    return _res

# 判断活动是否开启
def isOpen():
    _hdInfo = getHuodongData()
    if not _hdInfo:
        return 0
    else:
        return _hdInfo['rtime']

# 判断是否有免费次数
def isFreeNumExists(uid):
    return not bool(g.getPlayAttrDataNum(uid, 'xianshi_zhaomu_freenum'))

# 发送每周活动奖励
def timer_sendPrize(_htype):
    _nt = g.C.NOW()
    _dKey = g.C.DATE(_nt)
    _w = {'ctype': 'huodong_' + str(_htype), 'k': _dKey}
    _data = g.mdb.find1('rankprize', _w)
    if _data:
        print "xianshizhaomu Already Send==", _dKey, _htype
        return

    # 结束时间上下十分钟
    _info = g.mdb.find1('hdinfo', {'htype': _htype, 'etime': {"$gte": _nt - 300,'$lte': _nt + 300}})
    if not _info:
        print "xianshizhaomu Not Send==", _dKey, _htype
        return

    _con = g.GC['xianshi_zhaomu']
    _resList = []
    _hdid = _info['hdid']
    _rank = getRankData(hdid=_hdid, myrank=False)['ranklist']
    _title = _con['email']['title']
    for i in _rank:
        if not i:
            continue
        _content = g.C.STR(_con['email']['content'], i['rank'])
        _prize = getPrizeByRank(i['rank'], _con['rankprize'])
        g.m.emailfun.sendEmails([i['uid']], 1, _title, _content, _prize)
        i['issend'] = 1
        _resList.append(i)

    g.mdb.update('rankprize', _w, {'v': _resList, 'lasttime': _nt}, upsert=True)

# 根据排名获取奖励
def getPrizeByRank(rank, con):
    _con = g.GC['xianshi_zhaomu']
    if rank >= con[-1][0][0]:
        return con[-1][1]
    for i in con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]
    return []

if __name__ == '__main__':
    # print getRankData(1547877286)
    print getHuodongData()