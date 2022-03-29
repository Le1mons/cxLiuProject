#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g
'''
限时招募-抽奖
'''
def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {'s': 1}
    uid = conn.uid
    num = int(data[0])
    # 参数不符合规范
    if num < 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _geziNum = g.m.userfun.getGeziNum(uid)
    _heroNum = g.mdb.count('hero',{'uid':uid})
    # 英雄数量超过了格子数量
    if _heroNum + num > _geziNum['maxnum']:
        _res['s'] = -2
        _res['errmsg'] = g.L('jitan_chouka_res_-2')
        return _res

    hdinfo = g.m.xszmfun.getHuodongData()
    # 活动未开启
    if not hdinfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,idx')

    _con = g.GC['xianshi_zhaomu']

    # num in ('1' '15')
    if str(num) not in _con['data']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 有免费次数 并且是一次
    if g.m.xszmfun.isFreeNumExists(uid) and num == 1:
        g.setAttr(uid, {'ctype': 'xianshi_zhaomu_freenum'}, {'v': 1})
    else:
        _need = _con['data'][str(num)]['need']
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res
        _sendData = g.delNeed(uid, _need, 0,{'act': "xszm_lottery"})
        g.sendChangeInfo(conn, _sendData)

    _idx = hdData.get('idx', 0)
    _prize = g.m.xszmfun.getPrizeByNum(num, _idx)
    # 积分
    hdData['val'] += _con['jifen'] * num
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'xszm_lottery', 'jifen': hdData['val']})
    g.sendChangeInfo(conn, _sendData)

    _idx = (_idx + num) % len(_con['data'][str(num)]['dlz'])
    # 增加积分
    g.m.huodongfun.setMyHuodongData(uid, hdid, {'val': hdData['val'],'idx':_idx})
    # 四星和五星
    _5starHero,  _4starHero= [], []
    for i in _prize:
        if i['t'].endswith('5'):
            _5starHero.append(i['t'])
        elif i['t'].endswith('4'):
            _4starHero.append(i['t'])

    # 激活统御
    if _5starHero:
        g.event.emit("hero_tongu", uid, _5starHero[0], 5)
        # 养成礼包
        g.event.emit('yangcheng', uid, 5)
        g.event.emit('gethero', uid, _5starHero[0])
    if _4starHero:
        # 监听英雄获取
        g.event.emit('gethero', uid, _4starHero[0], len(_4starHero))
    # 激活头像
    g.event.emit("adduserhead", uid, _4starHero + _5starHero)

    _res['d'] = {'prize': _prize}
    return _res

if __name__ == "__main__":
    uid = g.buid('pjy1')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[15])