#! /usr/bin/python
# -*-coding:utf-8-*-
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('game')


htype = 59
import g



def getOpenList(uid, hdinfo):
    return hdinfo


def getOpenData(uid, hdinfo):

    _res = {"info":hdinfo, "myinfo":{}}
    return _res


def getPrize(uid, hdinfo, *args, **kwargs):
    return

def getHongdian(uid, hdid, hdinfo):
    _retVal = False
    return _retVal

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    # setData = {'gotarr': {},'val':{}}
    # _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)
    pass

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    """
    活动监听 在 ``api_chongzhi_pay`` 中加入 ``g.m.huodongfun.event(uid,'12',proid=proid,unitPrice=unitPrice)``

    :param uid:
    :param hdinfo:
    :param etype:
    :param args:
    :param kwargs:
    :return:
    """
    return

if __name__ == "__main__":
    uid = g.buid("liu200")
    hdid = 1200
    a = rePeatHuoDong()

    # hdidinfo = g.m.huodongfun.getInfo(hdid)
    # a = getOpenData(uid, hdidinfo)
    print a