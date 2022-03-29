#!/usr/bin/env python
# coding:utf-8

'''
五军之战  赛季发奖
'''
import sys

if __name__ == '__main__':
    sys.path.append('..')

import g


def proc(arg, kwarg):
    return
    print 'wjzz_prize open......'
    # 周2,3.4.5才运行
    if g.C.WEEK() not in (2, 3, 4, 5):
        return

    _data = g.crossDB.find1('crossconfig', {'ctype': 'wjzz_prize', 'k': g.C.DATE()})
    # 数据已存在.
    if _data:
        print 'data:{0}'.format(bool(_data))
        return

    _key = g.m.wjzzfun.getSeasonNum()
    _all = g.crossDB.find('wjzz_crystal', {'key': _key}, fields={'ttltime': 0})
    if not _all:
        return

    # 分组 分排名
    _groups = {}
    for i in _all:
        _group = i.pop('group')
        if _group not in _groups:
            _groups[_group] = []
        _groups[_group].append(i)

    _allusers = g.crossDB.find('wjzz_data', {'key': _key},fields=['_id', 'group', 'uid', 'faction', 'sid', 'num', 'lasttime','sumdps'])
    _users = {}
    # 分组 分人
    for i in _allusers:
        _group = i.pop('group')
        _faction = i.pop('faction')
        if _group not in _users:
            _users[_group] = {}
        if _faction not in _users[_group]:
            _users[_group][_faction] = []
        _users[_group][_faction].append(i)

    _con = g.GC['five_army']['base']
    _insert = []

    for group in _groups:
        _groups[group].sort(key=lambda x: (x['live'], -x['num'], x.get('lasttime',g.C.NOW())), reverse=True)
        # 周5 赛季奖励  其余的单日奖励
        if g.C.WEEK() == 5:
            for idx, faction in enumerate(_groups[group]):
                faction['integral'] += _con['integral'][idx]
                faction['sumlive'] += faction['live']
                faction['sumdps'] += faction['num']
                g.crossDB.update('wjzz_crystal', {'_id': faction['_id']}, {'$inc': {'sumlive': faction['live'], 'integral': _con['integral'][idx],'sumdps':faction['num']}})

            _groups[group].sort(key=lambda x: (x['integral'], x['sumlive'], -x['sumdps']), reverse=True)

        for idx, i in enumerate(_groups[group]):
            # 给此军团的人发奖
            if g.C.WEEK() == 5:
                _prize = _con['prize']['season'][idx]
                _title = _con['email']['season']['title']
                _content = g.C.STR(_con['email']['season']['content'], idx + 1)
            else:
                # 增加累计存活 将存活人数还原 增加积分
                g.crossDB.update('wjzz_crystal', {'_id': i['_id']}, {'$inc': {'sumlive': i['live'], 'integral': _con['integral'][idx],'sumdps':i['num']}})

                _prize = _con['prize']['daily'][idx]
                _title = _con['email']['daily']['title']
                _content = g.C.STR(_con['email']['daily']['content'], idx + 1)

            for user in _users[group][i['faction']]:
                _emailData = {'title': _title, 'uid': user['uid'], 'content': _content,
                              'prize': _prize, 'sid': str(user['sid']), 'ifpull': 0}
                _insert.append(g.m.emailfun.fmtEmail(**_emailData))

    if g.C.WEEK() == 5:
        # 发放连击奖励
        _title = _con['email']['lianji']['title']
        for group in _users:
            _all = []
            for faction in _users[group]:
                _all.extend(_users[group][faction])
            _all.sort(key=lambda x: (x['num'], -x['lasttime']), reverse=True)
            for idx, user in enumerate(_all):
                # 只有大于0的才发
                if user['num'] <= 0:
                    continue
                _prize = g.m.wjzzfun.getRankPrize(idx + 1, _con['prize']['lianji'])
                _emailData = {'title': _title, 'uid': user['uid'],
                              'content': g.C.STR(_con['email']['lianji']['content'], idx + 1),
                              'prize': _prize, 'sid': str(user['sid']), 'ifpull': 0}
                _insert.append(g.m.emailfun.fmtEmail(**_emailData))

    if _insert:
        g.crossDB.insert('crossemail', _insert)

    g.crossDB.update('crossconfig', {'ctype': 'wjzz_prize'},{'k': g.C.DATE(), 'v': repr(_groups), 'lasttime': g.C.NOW()}, upsert=True)

    print 'wjzz_prize end......'


if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
