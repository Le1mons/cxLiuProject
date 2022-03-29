#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g

'''送神宠获取奖励'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _id = str(data[0])
    gud = g.getGud(uid)
    # 建号时间
    # _kfTime = g.C.getZeroTime(gud['ctime'])
    # _nt = g.C.NOW()
    # _day = (_nt - _kfTime) // (24* 3600) + 1
    # 获取送神宠数据
    _hrInfo = g.m.signdenglufun.getHeroRecruitInfo(uid)
    # 超过三天
    if g.C.NOW() > _hrInfo['time']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 此奖励已领取
    if _id in _hrInfo.get('gotarr'):
        _res['s'] = -1
        _res['errmsg'] = g.L('giverarepet_get_-1')
        return _res

    if _id not in _hrInfo['can']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_valerr')
        return _res

    _prize = g.GC['giverarepet'][_id]['prize']
    _hrInfo['gotarr'].append(_id)
    # 英雄招募
    if len(_hrInfo['gotarr']) == 3:
        g.event.emit('hero_recruit', uid, '4')

    # 更新用户数据
    g.setAttr(uid, {'ctype': 'hero_recruit'}, {'data.gotarr': _hrInfo['gotarr']})
    # 发送奖励
    _changeInfo = g.getPrizeRes(uid, _prize, {'act': 'giverarepet_getprize','id':_id})
    g.sendChangeInfo(conn, _changeInfo)
    # 删除缓存
    g.mc.delete(g.C.STR('herorecruit_{1}', uid))
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid('lsq13')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [3])