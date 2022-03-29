# !/usr/bin/python
# coding:utf-8


'''
每日基础资源礼包
'''
import g

# 获取礼包数据
def getToDayLiBao(uid):
    _res = g.getAttrByDate(uid, {'ctype': 'taday_giftpackage'})
    if not _res:
        _res = [{'v':  {i: 0 for i in g.GC['todaylibao']['data']}}]
    return _res[0]['v']

# 判断是否开启
def isOpen(uid):
    _con = g.GC['todaylibao']
    # 开服时间不对
    if g.getOpenDay() < _con['openday']:
        return 0

    if g.getOpenDay() > _con['endday']:
        return 0
    # 东西买完了
    _data = getToDayLiBao(uid)
    for key in _data:
        if _data[key] < len(_con['data'][key]['arr']):
            break
    else:
        return 0

    return 1

def getHongDian(uid):
    _res = 0
    _con = g.GC['todaylibao']
    if g.getOpenDay() < _con['openday']:
        return {'todaylibao': 0}

    if g.getOpenDay() > _con['endday']:
        return {'todaylibao': 0}

    _data = getToDayLiBao(uid)
    if _data['0'] == 0:
        _res = 1
    return {'todaylibao': _res}

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    a = isOpen(uid)
    print a





