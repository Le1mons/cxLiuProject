#!/usr/bin/python
#coding:utf-8

# 检查公会争锋是否开启
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'competing_mirror start ...'
    # 周末休战期
    if g.C.getWeek() == 0:
        return
    _season = g.m.competingfun.getSeasonNum()
    _data = g.crossDB.find1('competing_signup',{'season': _season}, fields=['_id','gh2uid','open'])
    # 未开启
    if not _data or (_data and not _data.get('open')) or not _data.get('gh2uid'):
        print 'season:{} is no open......'.format(_season)
        return

    _ghData = {}
    for sid in _data['gh2uid']:
        for ghid in _data['gh2uid'][sid]:
            _ghData[ghid] = _data['gh2uid'][sid][ghid]

    g.timerlog.info('sidlist--->:{}'.format(_data['gh2uid'].keys()))
    g.timerlog.info('ghidlist--->:{}'.format(_ghData.keys()))
    g.m.competingfun.mirrorUserFightData(_season, _ghData)
    # g.crossDB.update('competing_signup', {'season': _season}, {'gh2uid': {}})

    print 'competing_mirror end ...'

if __name__ == '__main__':
    proc(1,2)
    # g.crossDB.update('competing_signup', {'season': 1}, {'guild': {}})