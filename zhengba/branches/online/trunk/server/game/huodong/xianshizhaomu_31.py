#! /usr/bin/python
# -*-coding:utf-8-*-


"""
限时招募
"""
from random import shuffle
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 31
import g



def getOpenList(uid, hdinfo):
    pass


def getOpenData(uid, hdinfo):
    pass


def getPrize(uid, hdinfo, *args, **kwargs):
    pass

def getHongdian(uid, hdid, hdinfo):
    pass

def initHdData(uid,hdid,data=None,*args,**kwargs):
    """

    :param uid:
    :param hdid:
    :param data:
    :param args:
    :param kwargs:
    :return:
    """
    setData = {"val": 0, "gotarr": []}
    g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    pass


# 通过次数获取奖励
def getPrizeByNum(num, con, data):
    pass

# 获取排行信息
def getRankData(uid, hdid):
    pass