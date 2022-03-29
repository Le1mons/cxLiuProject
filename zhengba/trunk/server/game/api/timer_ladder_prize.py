#!/usr/bin/env python
# coding:utf-8

'''
上传本赛季赛区
'''
import sys

if __name__ == '__main__':
    sys.path.append('..')

import g


def proc(arg, kwarg):
    print 'ladder_prize open......'
    _key = g.C.getWeekNumByTime(g.C.NOW())
    _data = g.crossDB.find1('crossconfig', {'ctype': 'ladder_prize', 'k': _key})
    # 数据已存在.
    if _data:
        print 'data:{0}'.format(bool(_data))
        return

    _name, _uids = [], []
    _insert = []
    _con = g.GC['ladder']
    _all = g.crossDB.find('ladder',{'key':_key,'star':{'$gt':0}},fields=['_id','headdata','sid','maxzhanli','uid','star','division'])
    # 区分赛区
    _division = {1: [], 2: [], 3: [], 4: [], 5: []}
    for i in _all:
        _division[i.pop('division')].append(i)

    for division in _division:
        _division[division].sort(key=lambda x:(x['star'], x['maxzhanli']), reverse=True)

    for _, all in _division.items():
        for rank, i in enumerate(all):
            if len(_name) < 3:
                _name.append(i['headdata']['name'])
                _uids.append(i['uid'])

            _star = min(i['star'], _con['maxstar'])
            _prize = g.m.ladderfun.getRankPrize(i['star'], rank + 1, _con['email']['prize'])
            _emailData = {'title': _con['email']['title'], 'uid': i['uid'],
                          'content': g.C.STR(_con['email']['content'], rank + 1 if _star == _con['maxstar'] else _con['star'][str(_star)]['intr']),
                          'prize': _prize, 'sid': str(i['sid']), 'ifpull': 0}

            _insert.append(g.m.emailfun.fmtEmail(**_emailData))

    if _insert:
        g.crossDB.insert('crossemail', _insert)

        # 发送跑马灯
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': g.C.STR(g.GC['pmd']['ladderrank'], *_name), 'mtype': 4, 'fdata': {'iszqwz': 1},'extarg': {'ispmd': 1}})

    g.crossDB.update('crossconfig', {'ctype': 'ladder_prize'},{'k': _key,'lasttime': g.C.NOW(),'v':_uids}, upsert=True)
    print 'ladder_prize end......'


if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
