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
    _data = g.crossDB.find1('crossconfig', {'ctype':'crosszb_jfprize','k':_dkey})
    # 数据已存在
    if _data or g.C.HOUR() < 23 or g.C.WEEK(_nt) != 5:
        print 'data:{0} hour:{1} week:{2}'.format(bool(_data), g.C.HOUR(), g.C.WEEK(_nt))
        return

    _con = dict(g.m.crosszbfun.getCon())
    _title = _con['jifen']['email']['title']
    _content = _con['jifen']['email']['content']
    _allUser = g.crossDB.find('crosszb_jifen', {'dkey': _dkey,'jifen':{'$exists':1}}, fields=['_id','uid','rankprize','sid','jifen'],sort=[['jifen',-1],['zhanli',-1]])
    _mailList, _insert = [], []
    for _myrank,i in enumerate(_allUser):
        _myrank += 1
        if "rankprize" in i:
            continue
        # 读取奖励
        _myjifen = i['jifen']
        _prize = g.m.crosszbfun.getJFRankPrize(_myrank, _con)
        # g.m.emailfun.sendEmails([i['uid']], 1,_title,g.C.STR(_content,_myrank),_prize)
        _mailList.append({i['uid']: _prize})
        g.crossDB.update('crosszb_jifen', {'uid': i['uid'], 'dkey': _dkey}, {'rankprize': _prize})
        _emailData = {'title': _title, 'uid':i['uid'],'content':g.C.STR(_content,_myrank),'prize':_prize,
                      'sid':str(i['sid']),'ifpull':0}
        _insert.append(g.m.emailfun.fmtEmail(**_emailData))

    if _insert:
        g.crossDB.insert('crossemail', _insert)
    g.crossDB.update('crossconfig', {'ctype': 'crosszb_jfprize'}, {'k': _dkey,'v':_mailList},upsert=True)
    print 'crosszb_sendjfrankprize end ...'

if __name__ == '__main__':
    proc(1,2)