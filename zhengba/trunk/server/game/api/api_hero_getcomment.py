#!/usr/bin/python
# coding:utf-8
'''
英雄--获取评论
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        {'d': {u'comment'评论列表: [{u'content': u'\u54c8\u54c8\u54c8\u54c8\u54c8\u54c8\u54c8\u54c8',
                                 u'ctime': 1563269647,
                                 u'headdata': {u'chatborder': u'1',
                                               u'guildname': u'',
                                               u'head': u'41023',
                                               u'headborder': u'1',
                                               u'lasttime': 1563269623,
                                               u'lv': 60,
                                               u'model': u'',
                                               u'name': u'\u6073\u5207\u4e39',
                                               u'uid': u'0_5d2d985b0ae9fe3a6006791d',
                                               u'uuid': u'024221',
                                               u'vip': 0,
                                               u'wzyj': 0},
                                 u'id': 1563269647,
                                 u'jiaxin': 0,
                                 u'svrname': u'\u4e89\u9738\u6d4b\u8bd51'}],
               u'hid'英雄id: u'2507',
               u'like'英雄心的数量: 3},
         's': 1}
    """
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
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['25075']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
