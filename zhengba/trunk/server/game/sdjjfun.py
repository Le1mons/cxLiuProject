#!/usr/bin/python
# coding:utf-8

'''
神殿基金
'''
import g

# 红点
def getHongDian(uid):
    _res = {'sdjj': {'sdjj': 0, 'djjj': 0}}

    _type = []
    _sdCon,_djCon = g.GC['sdjj'],g.GC['djjj']
    _lv = g.getGud(uid)['lv']
    if _lv >= _djCon['minlv']:
        _type.append('fund_djjj')
    _fashita = g.mdb.find1('fashita', {'uid': uid}, fields=['_id', 'layernum']) or {'layernum': 0}
    _val = {'sdjj': _fashita['layernum'], 'djjj': _lv}
    # 第一个条件都不满足
    if _fashita['layernum'] >= _sdCon['minlv']:
        _type.append('fund_sdjj')
    if not _type:
        return _res

    _data = g.getAttr(uid, {'ctype': {'$in': _type}}, keys='_id,v,ctype') or []
    _data = {i.pop('ctype').replace('fund_',''): i['v'] for i in _data}
    _con = {'sdjj':_sdCon,'djjj':_djCon}

    for t,con in _con.items():
        for proid in con['data']:
            for idx,i in enumerate(con['data'][proid]['arr']):
                if _val[t] < i['val']:
                    continue
                if _data.get(t,{}).get(proid,{}).get('pay') and idx not in _data.get(t,{}).get(proid,{}).get('paid', []):
                    _res['sdjj'][t] = 1
                    break

                if idx not in _data.get(t,{}).get(proid,{}).get('free', []):
                    _res['sdjj'][t] = 1

    return _res


# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    if act not in g.GC['sdjj']['data'] and act not in g.GC['djjj']['data']:
        return

    for t in ('sdjj', 'djjj'):
        if act in g.GC[t]['data']:
            g.setAttr(uid, {'ctype': 'fund_{}'.format(t)}, {'v.{}.pay'.format(act): 1})
            _prize = g.GC[t]['data'][act]['prize']
            _sendData = g.getPrizeRes(uid, _prize, act={'act':'sdjj','idx':t,'arg':act})
            g.sendUidChangeInfo(uid, _sendData)
            return


# 检测是否开启
def checkOpen(uid):
    _res = {'sdjj': 1, 'djjj': 1}
    _data = g.mdb.find('playattr',{'uid':uid,'ctype':{'$in':['fund_sdjj','fund_djjj']}},fields=['_id','v','ctype'])
    _data = {i.pop('ctype').replace('fund_',''): i['v'] for i in _data}
    for i in _res:
        if i == 'sdjj' and not g.chkOpenCond(uid,'fashita'):
            _res[i] = 0
            continue
        if i not in _data:
            continue
        _con = g.GC[i]['data']
        for proid in _con:
            if len(_data[i].get(proid, {}).get('paid',[])) < len(_con[proid]['arr']) or len(_data[i].get(proid, {}).get('free',[])) < len(_con[proid]['arr']):
                break
        else:
            _res[i] = 0

    return _res


# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)

if __name__ == '__main__':
    print getHongDian(g.buid('5444'))
    OnChongzhiSuccess(g.buid('xuzhao'),'shendianjijin_1',1,1,1)