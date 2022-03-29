# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/20:39

周礼包 一周一个周期 到达时间重置 购买有限制次数

'''
import g


def getCon(key):
    res = g.GC['weekmonthlibao'].get(key,None)
    return res

def getWMLiBao(uid,key):
    ctype = 'libao_' + key
    liBao = g.getAttrByCtype(uid, ctype, bydate=False, default={})
    if not liBao:
        nt = g.C.NOW()
        con = getCon(key)
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
    con = getCon(key)
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
def onWeekMonthLiBao(uid,act,**kwargs):
    payCon = kwargs.get('payCon',None)
    if not payCon:
        return
    proid = payCon['proid']
    key = payCon['proid'].split('_')[0]
    con = getCon(key)
    if not con:
        return

    ctype = 'libao_' + key
    liBao = g.getAttrByCtype(uid, ctype, bydate=False, default={})
    prize = con['itemdict'][proid]['p']
    changeInfo = g.getPrizeRes(uid, prize, {'act': key})
    g.sendUidChangeInfo(uid,changeInfo)

    liBao['itemdict'][proid]['num'] -= 1
    if liBao['itemdict'][proid]['num'] <= 0:
        liBao['itemdict'][proid]['num'] = 0
    g.setAttrByCtype(uid, ctype, liBao, default={}, bydate=False, valCall='update')



if __name__ == "__main__":
    uid = g.buid('xuzhao')
    onWeekMonthLiBao(uid,"week",**{'payCon':{'proid':'week_68'}})
