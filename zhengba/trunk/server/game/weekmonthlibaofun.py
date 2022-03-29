# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/20:39

周礼包 一周一个周期 到达时间重置 购买有限制次数

'''
import g


def getCon(key, week):
    res = g.GC['weekmonthlibao'].get(key,None)
    if res:
        res = res[week]
    return res

def getWMLiBao(uid,key):
    ctype = 'libao_' + key
    liBao = g.getAttrByCtype(uid, ctype, bydate=False, default={})
    if not liBao:
        nt = g.C.NOW()
        con = getCon(key, getWeekNum(key))
        # 从开服时间计算
        zt = g.C.ZERO(g.getOpenTime())
        # 如果打开时间超过一个月
        if nt - zt > con['date'] * 3600 * 24:
            _multiple = (nt - zt)/(con['date'] * 3600 * 24)+1
        else:
            _multiple = 1
        et = zt + (con['date'] * 3600 * 24)*_multiple
        setDict = {'itemdict':{},'et':et}
        for k,v in con['itemdict'].iteritems():
            setDict['itemdict'].update({k:{'num':v['bymaxnum']}})
        g.setAttrByCtype(uid, ctype, setDict,default={}, bydate=False, valCall='override')
        liBao = setDict

    return liBao

def initData(uid,key):
    ctype = 'libao_' + key
    nt = g.C.NOW()
    con = getCon(key, getWeekNum(key))
    zt = g.C.ZERO(g.getOpenTime())
    # 如果打开时间超过一个月
    if nt - zt > con['date'] * 3600 * 24:
        _multiple = (nt - zt) / (con['date'] * 3600 * 24) + 1
    else:
        _multiple = 1
    et = zt + (con['date'] * 3600 * 24) * _multiple
    # et = time + con['date'] * 3600 * 24
    setDict = {'itemdict': {}, 'et': et}
    for k, v in con['itemdict'].iteritems():
        setDict['itemdict'].update({k: {'num': v['bymaxnum']}})
    g.setAttrByCtype(uid, ctype, setDict, default={}, bydate=False, valCall='override')
    return setDict



@g.event.on('weekmonthlibao')
def onWeekMonthLiBao(uid,act,orderid,**kwargs):
    payCon = kwargs.get('payCon',None)
    if not payCon:
        return
    proid = payCon['proid']
    key = payCon['proid'].split('_')[0]
    con = getCon(key, getWeekNum(key))
    if not con:
        return

    ctype = 'libao_' + key
    liBao = g.getAttrByCtype(uid, ctype, bydate=False, default={})
    if key == 'month':
        for _,item in liBao['itemdict'].items():
            item['num'] += g.m.vipfun.getTeQuanNumByAct(uid,'MAXVIPBUYNUM')

    if liBao['itemdict'][proid]['num'] - 1 < 0:
        g.success[orderid] = False
        return

    prize = con['itemdict'][proid]['p']
    changeInfo = g.getPrizeRes(uid, prize, {'act': key})
    g.sendUidChangeInfo(uid,changeInfo)

    g.setAttr(uid, {'ctype':ctype}, {'$inc': {'v.itemdict.{}.num'.format(proid):-1}})

# 获取现在是第几周
def getWeekNum(gtype):
    if gtype not in g.GC['weekmonthlibao']:
        return 

    # 月礼包只有第五套
    if gtype == 'month':
        return '5'

    _day = g.getOpenDay()
    _res = str(len(g.GC['weekmonthlibao'][gtype]))
    # 开区时间大于五周了
    if (_day - 1) / 7 + 1 > len(g.GC['weekmonthlibao'][gtype]):
        return _res

    _res = str((_day - 1) / 7 + 1)
    return _res


# 红点
def getHongDian(uid):
    _res = {'weekmonthlibao': {'week':0,'month':0, "day":0}}
    if g.getGud(uid)['vip'] < 2:
        return _res

    _con = g.GC['weekmonthlibao']
    _week = {i: {'num': j['bymaxnum']} for i,j in _con['week'][getWeekNum('week')]['itemdict'].items()}
    _month = {i: {'num': j['bymaxnum']} for i,j in _con['month'][getWeekNum('month')]['itemdict'].items()}

    _all = g.mdb.find('playattr',{"uid":uid,'ctype': {'$in': ['libao_week', 'libao_month', 'libao_day']}},fields=['_id','ctype','v'])
    _hdInfo = {}
    for x in _all:
        if g.C.NOW() > x['v']['et']:
            continue
        if x['ctype'].endswith('week'):
            _hdInfo["week"] = x['v']['itemdict']
        elif x["ctype"].endswith('day'):
            _hdInfo["day"] = x['v']['itemdict']
        else:
            _hdInfo["month"] = x['v']['itemdict']


    # for _key, x in _hdInfo.items():
    #     _proid = [i for i,j in _con[_key][getWeekNum(_key)]['itemdict'].items() if j['rmbmoney']==0]
    #     if _proid and x.get(_proid[0], {}).get('num', 1) == 1:
    #         _res['weekmonthlibao'][_key] = 1

    for _key in ["week", "month", "day"]:
        x = _hdInfo.get(_key, {})
        _proid = [i for i, j in _con[_key][getWeekNum(_key)]['itemdict'].items() if j['rmbmoney'] == 0]
        if _proid and x.get(_proid[0], {}).get('num', 1) == 1:
            _res['weekmonthlibao'][_key] = 1

    return _res



if __name__ == "__main__":
    uid = g.buid('vg3')
    # onWeekMonthLiBao(uid,"week",**{'payCon':{'proid':'week_68'}})
    print getHongDian(uid)