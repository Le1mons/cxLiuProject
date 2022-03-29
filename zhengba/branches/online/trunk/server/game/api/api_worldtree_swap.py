#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
世界树--置换
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄tid
    tid = data[0]
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄信息不存在
    if not _heroInfo:
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _zhongzu = str(_heroInfo['zhongzu'])
    _wtCon = g.m.worldtreefun.getWorldTreeCon()
    _swapZzCon = _wtCon['swap']
    # 阵营错误
    if _zhongzu not in _swapZzCon:
        _res['s'] = -1
        _res['errmsg'] = g.L('worldtree_swap_res_-1')
        return _res

    _star = str(_heroInfo['star'])
    # 非4星或5星英雄
    if _star not in _swapZzCon[_zhongzu]:
        _res['s'] = -2
        _res['errmsg'] = g.L('worldtree_swap_res_-2')
        return _res

    _need = _wtCon['swapneed'][_star]
    # 检查世界树果实是否充足
    _chk = g.chkDelNeed(uid, _need)
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _hid = _heroInfo['hid']
    _dlzId = _swapZzCon[_zhongzu][_star]
    _con = g.m.diaoluofun.getDiaoLuo(_dlzId)
    _con['list'] = [i for i in _con['list'] if i['t'] != _hid]
    _base = sum([x['p'] for x in _con['list'] if x['t'] != _hid])
    _prize = g.C.RANDARR(_con['list'], _base)
    _delData = g.delNeed(uid, _need,issend=0,logdata={'act': 'worldtree_swap','delete':_heroInfo['hid'],'prize':_prize})
    g.m.dball.writeLog(uid, 'worldtree_swap', {'delete':_heroInfo['hid'],'prize':_prize})
    g.sendChangeInfo(conn, _delData)
    # _prize = g.m.diaoluofun.getGroupPrize(_dlzId)
    g.m.worldtreefun.setSwapHero(uid, _prize['t'])
    _res['d'] = {'hero': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5bc157e9c0911a2ef4ae947a'])