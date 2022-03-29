#!/usr/bin/python
# coding:utf-8


import sys
sys.path.append('game')
import g

print 'competing_upload start ...'
def a():
    # 周末休战期
    if g.C.getWeek() == 0:
        return
    _season = g.m.competingfun.getSeasonNum()
    _data = g.crossDB.find1('competing_signup', {'season': _season},
                            fields=['_id', 'guild', 'open', 'matched', 'fail', 'gh2uid'])
    # 未开启
    if not _data or (_data and not _data.get('open')):
        print 'season {} competing is no open......'.format(_season)
        return

    sid = g.getSvrIndex()

    if str(sid) in _data.get('gh2uid',{}):
        return

    # 已经开打过的公会
    _fightGuilds = g.crossDB.find('competing_main', {'sid': sid, 'season': _season},
                                  fields=['_id', 'ghid', 'guildinfo', 'segment', 'alljifen'])
    _ghList = _data['guild'].get(str(sid), []) + _data.get('fail', {}).get(str(sid), []) + _fightGuilds
    # 本服没有公会
    if not _ghList:
        print 'competing have no guild......'
        return

    _gh2uid = _data.get('gh2uid', {}).get(str(sid), {})
    _ghData, _fail, _matched = g.m.competingfun.uploadUidList(_season, _ghList)
    # 删除匹配失败的公会
    for i in _fail:
        if i['ghid'] in _gh2uid:
            del _gh2uid[i['ghid']]
    _gh2uid.update(_ghData)
    g.crossDB.update('competing_signup', {'season': _season},
                     {g.C.STR('gh2uid.{1}', sid): _gh2uid, g.C.STR('guild.{1}', sid): _matched,
                      g.C.STR('fail.{1}', sid): _fail})

a()

print 'competing_upload end ...'