#! /usr/bin/python
# -*-coding:utf-8-*-
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 63
import g

"""
王者招募
"""




def getOpenList(uid, hdinfo):
    return False

def getOpenData(uid, hdinfo):
    return False

def getPrize(uid, hdinfo, *args, **kwargs):
    return

def getHongdian(uid, hdid, hdinfo):
    return

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {'gotarr': [], 'val': 0, 'lasttime': g.C.NOW()}
    g.m.huodongfun.setHDData(uid, int(hdid), setData)
    return setData

def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return 0





if __name__ == "__main__":
    from pprint import pprint

    uid = g.buid('ysr2')

    hdid = 123457


    hdinfo = g.m.huodongfun.getInfo(hdid)
    pprint(b)
