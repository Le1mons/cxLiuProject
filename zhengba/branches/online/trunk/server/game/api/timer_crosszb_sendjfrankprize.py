#!/usr/bin/python
#coding:utf-8

#跨服争霸-- 发送积分赛排名奖励

if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'crosszb_sendjfrankprize start ...'
    _nt = g.C.NOW()
    _dkey = str(g.C.getWeekNumByTime(_nt))
    _data = g.mdb.find1('gameconfig', {'ctype':'crosszb_jfprize','k':_dkey})
    # 数据已存在
    if _data or g.C.HOUR() < 23 or g.C.WEEK(_nt) != 5:
        print 'data:{0} hour:{1} week:{2}'.format(bool(_data), g.C.HOUR(), g.C.WEEK(_nt))
        return

    _con = _con = g.m.crosszbfun.getCon()
    _title = _con['jifen']['email']['title']
    _content = _con['jifen']['email']['content']
    sid = g.getSvrIndex()
    _allUser = g.crossDB.find('crosszb_jifen', {'dkey': _dkey,'sid':sid}, fields=['_id','uid','rankprize'])
    _mailList = []
    for i in _allUser:
        if "rankprize" in i:
            continue
        # 读取奖励
        _myjifen, _myrank = g.m.crosszbfun.getMyJFRankAndJF(i['uid'])
        _prize = g.m.crosszbfun.getJFRankPrize(_myrank)
        g.m.emailfun.sendEmails([i['uid']], 1,_title,g.C.STR(_content,_myrank),_prize)
        _mailList.append({i['uid']: _prize})
        g.crossDB.update('crosszb_jifen', {'uid': i['uid'], 'dkey': _dkey}, {'rankprize': _prize})

    g.mdb.update('gameconfig', {'ctype': 'crosszb_jfprize'}, {'k': _dkey,'v':_mailList},upsert=True)
    print 'crosszb_sendjfrankprize end ...'

if __name__ == '__main__':
    # proc(1,2)
    print g.C.getWeekNumByTime(g.C.NOW())