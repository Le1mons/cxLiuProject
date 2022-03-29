#! /usr/bin/python
# -*-coding:utf-8-*-
"""
周年庆 60
"""

htype = 60
import g


def getOpenList(uid, hdinfo):
    return False

def getOpenData(uid, hdinfo):
    return False


def getPrize(uid, hdinfo, *args, **kwargs):
    return

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """
    初始活动数据
    :param uid:
    :param hdid: int
    :return:
    """
    return


def getHongdian(uid, hdid, hdinfo):
    _retVal = 0
    # _hdInfo = g.m.huodongfun.getInfo(hdid)
    # # 如果活动未上架
    # if not _hdInfo:
    #     return _retVal
    # _valInfo = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    # hdarr = _hdInfo["data"]["arr"]
    #
    # for arr in hdarr:
    #     if _valInfo['val'] >= arr['val'] and arr['val'] not in _valInfo.get("gotarr", []):
    #         _retVal = 1
    #         break

    return _retVal

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    return