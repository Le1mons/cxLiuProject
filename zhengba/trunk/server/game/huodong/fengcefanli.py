#! /usr/bin/python
# -*-coding:utf-8-*-


"""
封测返利

"""



htype = 666
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):
    gud = g.getGud(uid)
    hdData = hdinfo['data']
    hdid = hdinfo['hdid']

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr,lasttime')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


def getPrize(uid, hdinfo, *args, **kwargs):
    pass


def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {"$set": {"gotarr": [],"val": 0}}
    if data:
        setData.update(data)
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)
    

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a