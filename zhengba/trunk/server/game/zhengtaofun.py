#!/usr/bin/python
# coding:utf-8


import g

# 获取征讨令数据
def getZhengtaoData(uid, reset=0):
    _data = g.mdb.find1('zhengtao',{'uid':uid},fields={'_id':0})
    # 没有数据或者过期了
    if not _data or _data['endtime'] <= g.C.NOW() or reset:
        # 过期就发邮件
        if _data:
            handleData(_data)
            sendEmail(uid, _data)

        _con = g.GC['zhengtao']['base']
        _cd = g.C.ZERO(g.C.NOW()) + _con['daynum'] * 24 * 3600
        _buytime = g.C.ZERO(g.C.NOW()) + _con['buydaynum'] * 24 * 3600
        _prize = _con['prize']
        _data = {
            'lv': 0,
            'exp': 0,
            'prize': _prize,
            'receive': {'base': [], 'jinjie': []},
            'endtime': _cd,
            'buytime': _buytime,
            'ctime': g.C.NOW(),
            'jinjie': 0
        }
        g.mdb.update('zhengtao', {'uid': uid}, _data, upsert=True)

    # 实时计算等级
    if _data['exp'] > 0:
        handleData(_data)

    return _data


# 处理经验和等级
def handleData(_data):
    _con = g.GC['zhengtao']['base']
    # 升级
    while str(_data['lv'] + 1) in _con['exp'] and _data['exp'] >= int(_con['exp'][str(_data['lv'] + 1)]):
        _data['exp'] -= int(_con['exp'][str(_data['lv'] + 1)])
        _data['lv'] += 1


# 发送未领取的奖励
def sendEmail(uid, info):
    _prize = []
    for i in range(0, info['lv'] + 1):
        # 普通奖励
        if i not in info['receive']['base']:
            _prize += info['prize'][str(i)]['base']

        # 进阶奖励
        if info['jinjie'] and i not in info['receive']['jinjie']:
            _prize += info['prize'][str(i)]['jinjie']

    _prize = g.fmtPrizeList(_prize)
    if _prize:
        _con = g.GC['zhengtao']['base']['email']
        g.m.emailfun.sendEmails([uid], 1, _con['title'], _con['content'],_prize)

# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    if act != 'zhengtao_128':
        return

    _flag = getZhengtaoData(uid)

    _prize = g.GC['zhengtao']['base']['flagprize']
    g.mdb.update('zhengtao',{'uid':uid},{'jinjie': 1})
    _send = g.getPrizeRes(uid, _prize, {'act': 'buy_zhengtao'})
    g.sendUidChangeInfo(uid, _send)


# 红点
def getHongDian(uid):
    _res = 0
    _con = g.GC['zhengtao']['base']
    # 开区8天后才能进来
    if g.getOpenDay() < _con['openday']:
        return {'zhengtao': _res}

    _flag = getZhengtaoData(uid)

    # 有未领取的奖励
    _set = set(i for i in xrange(0, _flag['lv']+1) if _con['prize'][str(i)]['base'])
    if _set-set(_flag['receive']['base']) or (_flag['jinjie'] and set(xrange(0, _flag['lv']+1)) - set(_flag['receive']['jinjie'])):
        _res = 1

    return {'zhengtao': _res}



# 战旗购买
g.event.on('chongzhi', OnChongzhiSuccess)


if __name__ == '__main__':
    uid = g.buid('lsq111')
    print getHongDian(uid)