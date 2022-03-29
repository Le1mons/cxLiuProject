#!/usr/bin/python
#coding:utf-8

import g

def proc(arg,karg):
    idxs = g.conf['ALLSVRINDEX']
    ids = []
    _qwcj = g.crossDB.find1('crossconfig', {'ctype': 'qwcj'}) or {'v': {}}
    for serveridx in idxs:
        #遍历当前所有区服
        r = g.crossDB.find("crossemail",{"sid":str(serveridx),"ifpull":0})
        _con = g.GC['crosswz']['base']
        for ele in r:
            #如果有没拉取的邮件
            ids.append(ele['_id'])
            if ele['etype'] == 3:
                g.m.emailfun.sendEmail(ele['uid'], 3, ele['title'], ele['content'], data={"name": ele['name'],'senduid':ele['senduid']})
            # 跨服集团邮件
            elif ele["etype"] == 2:
                if "ghid" not in ele:
                    continue
                _userList = g.mdb.find("gonghuiuser", {"ghid": ele["ghid"]})
                if not _userList:
                    continue
                for user in _userList:
                    g.m.emailfun.sendXitongEmail(ele['title'], ele['content'], uid=user['uid'], prize=ele.get("prize"), data={'ctime': ele['ctime']})

            else:
                if "prize" in ele:
                    g.m.emailfun.sendXitongEmail(ele['title'], ele['content'],uid=ele['uid'],prize=ele['prize'],data={'ctime':ele['ctime']})
                else:
                    g.m.emailfun.sendXitongEmail(ele['title'], ele['content'], uid=ele['uid'],data={'ctime': ele['ctime']})

            # 趣味成就  竞猜获胜
            if ele['title'] == _con['email']['jingcai']['title'] and ele['content'].find(g.L('crosswz')) != -1:
                g.mdb.update('qwcj', {'uid': ele['uid']}, {'$push': {'data.3': _qwcj['v'].get('wz',1) - 1}}, upsert=True)
            # 监听龙舟邮件
            if ele['title'] == g.GC['longzhou']['email']["prize"]['title'] and ele['content'].find("第1名") != -1:
                # 龙舟活动监听
                g.event.emit('longzhou', ele["uid"], "5")



    if len(ids)>0:
        g.crossDB.update('crossemail',{'_id':{"$in":ids}},{"ifpull":1})


if __name__ == "__main__":
    print proc([],{})
