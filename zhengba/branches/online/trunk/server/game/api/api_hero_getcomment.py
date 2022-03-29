#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
英雄--获取评论
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _hid = data[0]
    # 判断是否十星
    _con = g.GC['pre_hero']
    if _hid not in _con:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _hid = _con[_hid]['pinglunid']
    _key = 'hero_comment_' + str(_hid)
    _mcInfo = g.crossMC.get(_key)
    _heroInfo = {'hid':_hid,'like':0}
    if not _mcInfo:
        _Info = g.crossDB.find1('hero_comment', {'hid': _hid},fields=['_id'])
        if _Info:
            _heroInfo = _Info
            g.crossMC.set(_key, _Info, 600)
    else:
        _heroInfo = _mcInfo

    _data = g.getAttrOne(uid, {'ctype': 'comment_jiaxin'})
    _comment = _data['v'] if _data else {}
    if _hid in _comment:
        for i in _heroInfo.get('comment', []):
            if i['id'] in _comment[_hid]:
                i['isdone'] = 1

    _res['d'] = _heroInfo
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao0")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['11011'])