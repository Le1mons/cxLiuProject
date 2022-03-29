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
    _data = g.crossDB.find1('crossconfig', {'ctype':'crosszb_zbprize','k':_dkey})
    # 数据已存在
    if _data:
        print 'data:{0}'.format(bool(_data))
        return

    _con = dict(g.m.crosszbfun.getCon())
    _title = _con['zhengba']['email']['title']
    _content = _con['zhengba']['email']['content']
    _allUser = g.crossDB.find('crosszb_zb', {'dkey': _dkey}, fields=['_id','uid','rankprize','rank','sid'])
    _mailList, _insert = [], []

    _qwcj = g.crossDB.find1('crossconfig', {'ctype': 'qwcj'}) or {'v': {}}
    for i in _allUser:
        if "rankprize" in i:
            continue
        # 读取奖励
        _prize = g.m.crosszbfun.getCrossZBRankPrizeCon(i['rank'], _con)
        # g.m.emailfun.sendEmails([i['uid']], 1,_title,g.C.STR(_content,i['rank']),_prize)
        g.crossDB.update('crosszb_zb', {'uid': i['uid'], 'dkey': _dkey}, {'rankprize': _prize})
        _mailList.append({i['uid']: _prize})
        _emailData = {'title': _title, 'uid':i['uid'],'content':g.C.STR(_content,i['rank']),'prize':_prize,
                      'sid':str(i['sid']),'ifpull':0}
        _insert.append(g.m.emailfun.fmtEmail(**_emailData))

        # 趣味成就
        if i['rank'] == 1:
            g.crossDB.update('crossplayattr', {'uid': i['uid'], 'ctype': 'qwcj_data'},{'$push': {'v.zb': _qwcj['v'].get('zb', 0)}},upsert=True)

    if _insert:
        g.crossDB.insert('crossemail', _insert)
    g.crossDB.update('crossconfig', {'ctype': 'crosszb_zbprize'}, {'k': _dkey,'v':_mailList,'lasttime':g.C.NOW()},upsert=True)
    # 记录赛季  趣味成就使用
    g.crossDB.update('crossconfig',{'ctype': 'qwcj'},{'$inc':{'v.zb': 1}},upsert=True)

    print 'crosszb_sendzbrankprize end ...'

if __name__ == '__main__':
    proc(1,2)
    # g.crossDB.update('crosszb_zb',{'dkey':'2018-44'},{'$unset':{'rankprize':1}})