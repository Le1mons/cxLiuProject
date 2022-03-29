#!/usr/bin/python
#coding:utf-8
import urllib2
import json,time
import pymongo

import sys
sys.path.append('game')
import g

GAMECODE = 'zhengba'

def getServerInfo (sidlist=[]):
    global GAMECODE
    # url = 'http://gametools.legu.cc/?app=api&act=getServerList&owner=crosserver&gzip=1&game='+ GAMECODE +'&showserver=1&indexkey=serverid'
    url = 'http://gametools.legu.cc/?app=api&act=getServerList&gzip=1&game='+ GAMECODE +'&showserver=1&indexkey=serverid'
    if len(sidlist)>0:
        url += "&serverids="+ (','.join(sidlist))
    
    req = urllib2.Request(url)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    return json.loads(res)

def runEach (datas,func,*a,**k):
    sids = []

    for d in datas:
        _s = d
        #uid先切割
        if d.find('_')!=-1:
            uidArr = d.split('_')
            _s = uidArr[0]

        if _s not in sids:
            sids.append( _s )

    serverinfo = getServerInfo(sids)
    # serverinfo['0']['dbhost'] = '10.0.0.7'
    # serverinfo['0']['db'] = 'zhengba_s0'
    # serverinfo = {'0':serverinfo['0']}

    client = {}
    _allData = (datas if len(datas)>0 else serverinfo)
    
    idx = 1
    for d in _allData:
        _s = d
        #uid先切割
        if d.find('_')!=-1:
            uidArr = d.split('_')
            _s = uidArr[0]

        if _s not in serverinfo:
            print "server is null , d=",d
            continue
        
        _sinfo = serverinfo[_s]
        _key = _sinfo['dbhost'] + ":"+ _sinfo['dbport']

        if _key not in client:
            client[_key] = pymongo.MongoClient(host=_sinfo['dbhost'],port=int(_sinfo['dbport']))
            client[_key].get_database('admin').authenticate(_sinfo['dbuser'],_sinfo['dbpwd'])
        
        mdb = client[_key].get_database(_sinfo['db'])
        func(mdb,d,idx,len(_allData),*a,**k)
        idx+=1

    #断开所有链接
    for key,c in client.items():
        c.close()


def writelog(data):
    line = ""
    line += str(data['uid']) + "," + str(data['itemid']) + ","+ str(data['num']) + "\n"

    f = open('_names3.txt', 'a+')
    f.write( line )
    f.close()    

if __name__=='__main__':
    
    data = []
    nums = 0
    import time,copy

    def getData (mdb,v,n,m):
        
        
        print n,'/',m,v

        #try:
        rss = mdb['gamelog'].find(filter={"type":'tanxian_recgjprize','ctime':1550073600,'data.prize.t':"5002"})
        for rs in list(rss):
            writelog({'uid': rs['uid'], 'num': '', 'itemid': ''})
        # _res = {}
        # for rs in list(rss):
        #     if rs['uid'] not in _res:
        #         _res[rs['uid']] = {g.C.DATE(rs['ctime']): rs['data']['diffattr']['rmbmoney']}
        #     else:
        #         _res[rs['uid']][g.C.DATE(rs['ctime'])] = _res[rs['uid']].get(g.C.DATE(rs['ctime']), 0) + rs['data']['diffattr']['rmbmoney']
        #
        # user = mdb['userinfo'].find(filter={"uid": {'$in': _res.keys()}})
        # user = {i['uid']: i['name'] + '  ' + i.get('ext_servername','') + ' '+i['uid'] for i in list(user)}
        #
        # for i in _res:
        #     a = _res[i].copy()
        #     for j in a:
        #         if _res[i][j] < 50000:
        #             del _res[i][j]
        #     if _res[i]:
        #         writelog({'uid': user[i], 'num': _res[i], 'itemid':''})
        
        # _season = mdb['crossconfig'].count(filter={"ctype":'competing_season'}) + 1
        # rss = mdb['competing_main'].find(filter={"zhanli":0,'season':_season}) #勇气徽章：item  2004
        # aa = mdb['competing_signup'].find(filter={'season':_season}) #勇气徽章：item  2004
        #
        # c = list(aa)
        # if not c or not c[0].get('open'):
        #     return
        # _signUp = c[0]['gh2uid']
        # idlist = []
        # uidList = []
        # for rs in list(rss):
        #     if 'lunkong' in rs:
        #         continue
        #     _rGhid = rs['rival_ghid']
        #     if _rGhid not in idlist:
        #         idlist.append(_rGhid)
        #         a = mdb['competing_main'].find(filter={"ghid": _rGhid,'season':_season})
        #         _sid = str(list(a)[0]['sid'])
        #         for i in _signUp[_sid]:
        #             uidList.extend(_signUp[_sid][i])
        #
        #     _ghid = rs['ghid']
        #     if _ghid not in idlist:
        #         idlist.append(_ghid)
        #         for i in _signUp[str(rs['sid'])]:
        #             uidList.extend(_signUp[str(rs['sid'])][i])

        # c = mdb['competing_signup'].count(filter={}) #勇气徽章：item  2004
        # a = mdb['crossplayattr'].find(filter={'ctype': {'$regex': 'segmentprize_'}, 'k': '2019-02', 'lasttime': {'$gte': 1547560800}})
        # a = list(a)
        # a.sort(key=lambda x:x['lasttime'],reverse=True)
        # if c and not a:
        #     aaa = {'uid': '', 'itemid':'','num': v}
        #     writelog(aaa)
        # rss = mdb['itemlist'].find(filter={"itemid":"4009","num":{"$gt":2000}}) #五星英雄碎片：item 4009
        # for rs in list(rss):
        #     writelog(rs)
        #
        # rss = mdb['itemlist'].find(filter={"itemid":"1003","num":{"$gt":100}}) #红色1星装备礼包：item
        # for rs in list(rss):
        #     writelog(rs)
        #except:
        #    pass

    runEach([],getData)
    
    print 'nums',nums