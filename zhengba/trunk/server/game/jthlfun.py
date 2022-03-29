#!/usr/bin/python
#coding:utf-8

'''
积天豪礼模块
'''
import g

# 获取数据
def getData(uid):
    _data = g.getAttrByCtype(uid, 'jthl_data', bydate=0)
    _con = g.GC['jthl']
    # 数据不存在
    if not _data:
        _data = {
            "key":      '1',
            "money":    0,
            "rec":      [],
            "val":      0,
            "date":     g.C.DATE(),
        }
        _data['data'] = _con[_data['key']]['prize']
    # 领奖满了并且不是同一天
    elif len(_data['rec']) >= len(_con[_data['key']]['prize']) and g.C.DATE() != _data['date']:
        _data = {
            "key":      str(int(_data['key']) % len(g.GC['jthl']) + 1),
            "money":    0,
            "rec":      [],
            "val":      0,
            "date":     g.C.DATE(),
        }
        _data['data'] = _con[_data['key']]['prize']
        g.setAttr(uid, {'ctype': 'jthl_data'}, {'v': _data})
    # 过天了
    elif g.C.DATE() != _data['date']:
        _data['money'] = 0
        _data['date'] = g.C.DATE()
        g.setAttr(uid, {'ctype': 'jthl_data'}, {'v': _data})

    return _data

# 判断是否
def onRecChongZhi(uid, act, money, orderid, payCon):
    # 重置每天得进度
    _data = getData(uid)
    _con = g.GC['jthl']
    # 已经超过了 或者今天已经领取了
    if _data['money'] >= _con[_data['key']]['money']:
        return

    _data["money"] += int(money)
    # 超过了就可以领取
    if _data["money"] >= _con[_data['key']]['money']:
        _data['val'] += 1

    g.setAttr(uid, {'ctype': 'jthl_data'}, {'v': _data})


# 红点
def getHongDian(uid):
    _res = 0
    _data = getData(uid)
    for idx, i in enumerate(g.GC['jthl'][_data['key']]['prize']):
        if idx not in _data['rec'] and _data['val'] >= i['val']:
            _res = 1
            break
    return {'jthl': _res}

g.event.on("chongzhi", onRecChongZhi)

if __name__ == "__main__":
    print getData(g.buid('xuzhao'))