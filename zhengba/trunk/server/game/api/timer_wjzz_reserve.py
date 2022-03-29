#!/usr/bin/env python
#coding:utf-8

'''
五军之战  预备役转正
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')

import g

def proc(arg, kwarg):
    return
    print 'wjzz_reserve open......'
    # 周3.4.5才运行
    if g.C.WEEK() not in (3,4,5,6):
        return

    _key = g.m.wjzzfun.getSeasonNum()
    _all = g.crossDB.find('wjzz_reserve',{'key': _key},fields=['_id'])
    if not _all:
        return

    if g.C.WEEK() == 6:
        # 增加赛季
        g.crossDB.update('crossconfig', {'ctype': 'wjzz_season'}, {'v': _key}, upsert=True)
    else:
        g.crossDB.delete('wjzz_defend')
        g.crossDB.insert('wjzz_defend', _all)
        # # 记录驻防部队数量
        _faction2num = {}
        for i in _all:
            if str(i['group']) not in _faction2num:
                _faction2num[str(i['group'])] = {'1':0,'2':0,'3':0,'4':0,'5':0}
            _faction2num[str(i['group'])][i['faction']] += 1

        for group in _faction2num:
            for faction,num in _faction2num[group].items():
                g.crossDB.update('wjzz_crystal',{'key':_key,'group':int(group),'faction':faction},{'team': num,'live':num,'num':0},upsert=True)

    print 'wjzz_reserve end......'



if __name__ == '__main__':
    arg = [0]
    kwarg = {}
    proc(arg, kwarg)
