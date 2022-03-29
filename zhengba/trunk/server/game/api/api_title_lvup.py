#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
爵位升级接口
'''


def proc(conn,data):
    '''

    :param conn:
    :param data: [tid:str]:tid:英雄tid
    :param key:
    :return: dict
    ::

       {'s': 1}

    '''

    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1

    _con = g.GC["title"]
    gud = g.getGud(uid)

    _titleLv = gud["title"]
    # _ctime = gud["ctime"]
    # 获取当前零点时间戳
    # _nt = g.C.NOW()
    # _zt = g.C.ZERO(_nt)

    # 获取创建账号的是零点时间戳
    # _czt = g.C.ZERO(_ctime)
    # 判断玩家是否满足了创建账号22后开启的条件
    if g.getOpenDay() < 22:
        # 不满足开启条件
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('title_lvup_res_-1')
        return _chkData

    # 判断是否已经达到最大爵位等级
    if len(_con) <= _titleLv:
        # 已经达到了最大等级
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('title_lvup_res_-2')
        return _chkData

    # 获取消耗
    _need = _con[str(_titleLv)]["need"]

    # 判定消耗是否满足
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _chkData['s'] = -100
            _chkData['attr'] = _chkRes['t']
        else:
            _chkData["s"] = -104
            _chkData[_chkRes['a']] = _chkRes['t']
        return _chkData

    _chkData["need"] = _need
    _chkData["con"] = _con

    return _chkData



@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    gud = g.getGud(uid)

    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _need = _chkData["need"]
    # 删除消耗
    _sendData = g.delNeed(uid, _need, 1, logdata={'act': 'title_lvup', 'lv': gud["title"] + 1})


    _title = gud["title"]
    _nextTitle = _title + 1

    _con = _chkData["con"]
    _buff = _con[str(_nextTitle)]["buff"]
    g.m.userfun.setCommonBuff(uid, {'buff.title': [_buff]})
    # 更新所有英雄buff
    _heroAtt = g.m.herofun.reSetAllHeroBuff(uid, {"lv": {"$gt": 1}})

    # 提升等级
    _sendData = {"attr": {"title": _title + 1}}
    _sendData.update({"hero": _heroAtt})
    g.m.userfun.updateUserInfo(uid, {"title": _nextTitle})

    g.event.emit('trial', uid, '4', val=_nextTitle)
    # 推送前端
    g.sendChangeInfo(conn, _sendData)

    return _res


if __name__ == "__main__":
    from pprint import pprint
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    # g.getPrizeRes(uid, [{"a":"attr", "t": "jinbi", "n": 100000000000}])
    gud = g.getGud(uid)
    data = ["5d77521c0ae9fe4150e7b0bb", 5]

    _r = doproc(g.debugConn, data)
    pprint(_r)
    if 'errmsg' in _r: print _r['errmsg']