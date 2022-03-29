#!/usr/bin/python
# coding:utf-8
'''
英雄——增加格子
'''

import sys

sys.path.append('..')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务类型:str]
    :return:
    ::

        {'d': {'maxnum': 格子数量, 'buynum':已购买次数}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _heroCon = g.m.herofun.getHeroComCon()['herocell']
    _userInfo = g.getGud(uid)
    buyednum = _userInfo.get('buynum')
    if not buyednum: buyednum = 0

    _addNum = _heroCon['addnum']
    _need = [{'a':i['a'],'t':i['t'],'n':eval(i['n'])} for i in _heroCon['need']]
    _chk = g.chkDelNeed(uid, _need)
    # 消耗不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _sendData = g.delNeed(uid, _need,logdata={'act': 'user_addgezinum'})
    g.sendChangeInfo(conn, _sendData)
    _w = {'uid': uid}
    _geziInfo = g.m.userfun.getGeziNum(uid)
    _geziInfo['maxnum'] += _addNum
    _geziInfo['buynum'] += 1
    # 添加格子购买次数
    data = {'$inc':{'buynum': 1}}
    g.mdb.update('userinfo', _w, data,upsert=True)

    # 更新缓存buynum
    _gud = g.getGud(uid)
    if 'buynum' in _gud:
        _gud['buynum'] += 1
    else:
        _gud['buynum'] = 1
    g.gud.setGud(uid,_gud)

    _res['d'] = _geziInfo
    return _res

if __name__ == '__main__':
    uid = g.buid("19")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[])