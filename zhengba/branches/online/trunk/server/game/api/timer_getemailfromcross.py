#!/usr/bin/python
#coding:utf-8

import g

def proc(arg,karg):
    idxs = g.conf['ALLSVRINDEX']
    ids = []
    for serveridx in idxs:
        #遍历当前所有区服
        r = g.crossDB.find("crossemail",{"sid":str(serveridx),"ifpull":0})
        for ele in r:
            #如果有没拉取的邮件
            ids.append(ele['_id'])
            g.m.emailfun.sendXitongEmail(ele['title'], ele['content'],uid=ele['uid'],prize=ele['prize'],data={'ctime':ele['ctime']})

    if len(ids)>0:
        g.crossDB.update('crossemail',{'_id':{"$in":ids}},{"ifpull":1})


if __name__ == "__main__":
    print proc([],{})
