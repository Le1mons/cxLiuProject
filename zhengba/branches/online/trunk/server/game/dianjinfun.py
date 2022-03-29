#!/usr/bin/python
#coding:utf-8

'''
点金模块
'''
import g

# 获取点金配置
def getDianjinCon(_type):
    return g.GC['dianjin']['type2dianjin'][_type]


# 获取点金数量
def getDjPrize(uid, lv, type):
    _res = {}
    _act = {
        "jinbi": 'DianJinExtJinBi',
        'useexp': 'DianJinExtUseEXP'
    }
    _con = getDianjinCon(type)
    _res['normal'] = _con['prize']
    _num = eval((_con['prize']['n']))
    _res['normal']['n'] = _num
    # 获取vip加成
    _addition = g.m.vipfun.getTeQuanNumByAct(uid, _act[_con['prize']['t']])
    _num = int(_num*(1+_addition*0.01))
    _res['vip'] = _con['prize']
    _res['vip']['n'] = _num
    return _res


# 获取普通点金的cd时间
def getDjCD(uid):
    _maxNum = getMaxDianJinNum(uid)
    #是否有活动标识
    _hdCd = g.m.huodongfun.chkZCHDopen('dianjin')
    _ctype = 'dianjin_cd'
    _data = g.getAttrOne(uid, {'ctype': _ctype,'k':_hdCd})
    if not _data:
        return [0,_maxNum]
    
    _nt = g.C.NOW()
    #等却CD
    _cd = g.GC['dianjin']['cd']
    #点金每个重置时段第一次点金时间戳
    _djTime = int(_data['v']['cd'])
    _act = _data['v']['act']
    if _nt > _djTime:
        #cd时间已到，更新数据
        _djTime = 0
        _act = _maxNum

    return [_djTime, _act]

#获取点金上限次数
def getMaxDianJinNum(uid):
    _con = g.GC['dianjin']['dianjinnum']
    if g.m.huodongfun.chkZCHDopen('dianjin'):
        #有活动
        return _con['activity']
    
    return _con['normally']


#设置普通点金的cd时间
def setDjCD(uid,data):
    #是否有活动标识
    _hdCd = g.m.huodongfun.chkZCHDopen('dianjin')
    _ctype = 'dianjin_cd'
    _setData = {'v':data,'k':_hdCd}
    g.setAttr(uid,{'ctype':_ctype},_setData)
    if _hdCd:
        g.m.huodongfun.setZCHDval(uid, 'dianjin')



if __name__ == '__main__':
    uid = g.buid('xuzhao')
    print getDjCD (uid)
    