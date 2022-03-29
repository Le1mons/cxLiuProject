#!/usr/bin/python
#coding:utf-8

#跨服争霸-- 发送争霸赛排名奖励
if __name__ == '__main__':
    import sys
    sys.path.append('..')
import g


def proc(arg,karg):
    print 'crosszb_sendzbrankprize start ...'
    _nt = g.C.NOW()
    _dkey = g.m.crosszbfun.getQMKey()
    _data = g.mdb.find1('gameconfig', {'ctype':'crosszb_zbprize','k':_dkey})
    # 数据已存在
    if _data or g.C.HOUR() < 22 or g.C.WEEK(_nt) != 0:
        print 'data:{0} hour:{1} week:{2}'.format(bool(_data), g.C.HOUR(), g.C.WEEK(_nt))
        return

    _con = _con = g.m.crosszbfun.getCon()
    _title = _con['zhengba']['email']['title']
    _content = _con['zhengba']['email']['content']
    sid = g.getSvrIndex()
    _allUser = g.crossDB.find('crosszb_zb', {'dkey': _dkey,'sid':sid}, fields=['_id','uid','rankprize','rank'])
    _mailList = []
    for i in _allUser:
        if "rankprize" in i:
            continue
        # 读取奖励
        _prize = g.m.crosszbfun.getCrossZBRankPrizeCon(i['rank'])
        g.m.emailfun.sendEmails([i['uid']], 1,_title,g.C.STR(_content,i['rank']),_prize)
        g.crossDB.update('crosszb_zb', {'uid': i['uid'], 'dkey': _dkey}, {'rankprize': _prize})
        _mailList.append({i['uid']: _prize})

    g.mdb.update('gameconfig', {'ctype': 'crosszb_zbprize'}, {'k': _dkey,'v':_mailList,'lasttime':g.C.NOW()},upsert=True)
    print 'crosszb_sendzbrankprize end ...'

if __name__ == '__main__':
    proc(1,2)
    # g.crossDB.update('crosszb_zb',{'dkey':'2018-44'},{'$unset':{'rankprize':1}})