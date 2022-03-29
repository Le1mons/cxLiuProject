#! /usr/bin/python
# -*- coding:utf-8 -*-
import g


"""
等级礼包 养成礼包
"""
# 监听礼包充值事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    if any([act.startswith('djlb'), act.startswith('txlb'), act.startswith('zjlb'), act.startswith('yclb'), act.startswith('tslb')]):
        _type = {'djlb':'dengjilibao','txlb':'tanxianlibao','zjlb':'zhanjianglibao','yclb':'yangchenglibao','tslb':'tianshulibao'}
        _con = g.GC['chongzhihd'][_type[act[:4]]]
        _k = {_con[i]['chkkey']: i for i in _con}
        _info = g.getAttrOne(uid, {'ctype': _type[act[:4]], 'k': _k[act]})
    else:
        return
        
    # 数据不存在
    if not _info:
        return

    _buyNum = _info['buynum']
    _buyNum -= 1
    if _buyNum <= -1:
        g.mdb.delete('playattr', {'_id':_info['_id'],'uid':uid})
    else:
        g.setAttr(uid, {'_id':_info['_id']}, {'$inc': {'buynum': -1}})

    _prize = _con[str(_info['k'])]['prize']
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'libaofun','prize':_prize})
    g.sendUidChangeInfo(uid, _sendData)
    return

# 监听礼包充值事件
def onKaifulibao(uid,act,money,orderid,payCon):
    _day = g.m.kfkhfun.getKfkhDay(uid)
    if _day > 6:
        _day = 6
    if str(_day) not in g.GC['kaifulibao'] or act not in g.GC['kaifulibao'][str(_day)]:
        return

    g.setAttr(uid, {'ctype': 'kaifulibao_data'},{'$inc': {'v.{0}.{1}'.format(_day,act): 1}})

    _prize = g.GC['kaifulibao'][str(_day)][act]['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': 'kaifulibao','cztype':act})
    g.sendUidChangeInfo(uid, _send)

# 监听升级礼包事件
def onGiftPackage(uid,gtype,key,*args,**kwargs):
    _con = g.GC['chongzhihd'][gtype]
    _vip = g.getGud(uid)['vip']

    _key = []
    for k,val in _con.items():
        if val['val'] == key and val['vip'][0] <= _vip <= val['vip'][1]:
            _key.append(k)

    if not _key:
        return

    _info = g.mdb.find('playattr', {'ctype':gtype,'k': {'$in': _key}, 'uid': uid}, fields=['_id'])

    _info = {i['k']: i for i in _info}
    _nt = g.C.NOW()

    # 一天一次
    _today = g.getAttrByDate(uid, {'ctype': 'libao_today'}) or [{'v': []}]
    _push = []
    for k in _key:
        if k in _today[0]['v']:
            continue
        if k not in _info or _info[k]['rtime'] < _nt or _info[k]['buynum'] <= 0:
            _buyNum = _con[k]['buynum']
            g.setAttr(uid,{'ctype': gtype,'k':k},{'v':key,'rtime':_con[k]['cd'] + _nt,'buynum':_buyNum})

            if kwargs.get('send', 1):
                g.m.mymq.sendAPI(uid, "gift_package", {'type': gtype, 'key': k})

            if _con[k].get('dayonly'):
                _push.append(k)

    if _push:
        g.setAttr(uid, {'ctype': 'libao_today'}, {'$push': {'v': {'$each': _push}}})



# 获取礼包的数据
def getLibaoData(uid):
    _res = []
    _nt = g.C.NOW()
    # 获取等级礼包
    _info = g.getAttr(uid,{'ctype':{'$in': ['dengjilibao','yangchenglibao','tanxianlibao','zhanjianglibao','tianshulibao']}})
    if not _info:
        return _res

    _czCon = g.GC['chongzhihd']
    for ele in _info:
        _con = _czCon[ele['ctype']]
        # 还没有结束就添加
        if ele['rtime'] > _nt and ele['buynum'] > 0:
            _hdInfo = {}
            _hdInfo.update(_con[ele['k']])
            _hdInfo['rtime'] = ele['rtime']
            _hdInfo['buynum'] = ele['buynum']
            _hdInfo['key'] = ele['k']
            _hdInfo['ctype'] = ele['ctype']
            _res.append(_hdInfo)
        else:
            g.mdb.delete('playattr', {'_id': ele['_id'],'uid':uid})
        del ele['_id']

    return _res

# 获取开服礼包数据
def getKaiFuLibao(uid):
    return {}
    _day = g.m.kfkhfun.getKfkhDay(uid)
    if str(_day) not in g.GC['kaifulibao']:
        return {}
    _data = g.getAttrOne(uid, {'ctype': 'kaifulibao_data'},keys='_id,v') or {'v':{}}
    _res = _data['v'].get(str(_day),{})
    _res.update({'day': _day})
    return _res
    

g.event.on("chongzhi", onChongzhiSuccess)
g.event.on("chongzhi", onKaifulibao)
g.event.on("GIFT_PACKAGE", onGiftPackage)

if __name__ == '__main__':
    uid = g.buid('test88')
    # print onGiftPackage(uid, 'yangchenglibao', 5)
    # print g.getPrizeRes(uid,[{'a':'attr','t':'useexp','n':5000000000},{'a':'attr','t':'rmbmoney','n':5000000000},{'a':'attr','t':'jinbi','n':5000000000},{'a':'attr','t':'lv','n':150}],{'act':'test8'})
    for i in g.mdb.find('hdinfo',fields=['stime','rtime','etime']):
        if i['etime'] == i['rtime']:
            g.mdb.update('hdinfo',{'_id':i['_id']},{'stime':1608480000,'rtime':1640793600,'etime':1640793600})
        else:
            g.mdb.update('hdinfo',{'_id':i['_id']},{'stime':1608480000,'rtime':1640793600-24*3600,'etime':1640793600})
