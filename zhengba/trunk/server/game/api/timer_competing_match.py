#!/usr/bin/python
#coding:utf-8

# 公会争锋 分配赛区对手
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'competing_match start ...'
    # 周末休战期
    if g.C.getWeek() == 0:
        return
    _season = g.m.competingfun.getSeasonNum()
    _round = str(g.m.competingfun.getRoundNum(_season))
    _data = g.crossDB.find1('competing_signup',{'season': _season}, fields=['_id','guild','open','fail','matched','finish','after'])
    # 未开启 或者匹配结束
    if not _data or not _data.get('open') or _data.get('finish', {}).get(_round, 0):
        print 'round:{}......'.format(_round)
        return

    _signupGuild, _fail = [], []
    for i in _data.get('fail', {}):
        _fail.extend(map(lambda x:x['ghid'], _data.get('fail', {})[i]))

    _guilds = g.crossDB.find('competing_main',{'season':_season, 'ghid':{'$nin':_fail}},fields=['_id','segment','ghid','sid','guildinfo','alljifen','advance','pre_seg','pre_jifen','pre_group','pre_div'])
    _guildId = map(lambda x:x['ghid'], _guilds)
    for i in _data['guild']:
        for ghid in _data['guild'][i]:
            if ghid['ghid'] in _guildId:
                continue
            _signupGuild.append({'sid':int(i),'ghid':ghid['ghid'],'segment':ghid.get('segment',1),'guildinfo':ghid['guildinfo'],'alljifen':ghid.get('alljifen',0)})

    # 已经开打过的公会
    _guilds += _signupGuild

    _matched = g.m.competingfun.timer_matchGuild(_guilds, _season)
    # 今天凌晨的数据
    _after = _data.get('after', {})
    g.crossDB.update('competing_signup', {'season': _season}, {'$set':{'finish.{}'.format(_round): 1,'guild':_after,'matched':_matched},
                                                               '$unset':{'after': 1}})
    print 'competing_match end ...'

if __name__ == '__main__':
    g.crossMC.flush_all()
    proc(1,2)