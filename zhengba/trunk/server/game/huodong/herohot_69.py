#! /usr/bin/python
# -*-coding:utf-8-*-


"""
英雄冲榜
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 69
import g



def getOpenList(uid, hdinfo):
    # if hdinfo['isxianshi'] == 1:
    #     hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    #     for idx, i in enumerate(hdinfo['data']):
    #         if hdData['gotarr'].get(str(idx), 0) < hdinfo['data'][idx]['maxnum']:
    #             break
    #     else:
    #         return False
    return


def getOpenData(uid, hdinfo):
    return


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
    pass


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    return
    if etype != 'chongzhi':
        # 只处理充值事件
        return




def isOpen(uid):
    _res = {"act":0}
    _nt = g.C.NOW()
    _hdinfo = g.mdb.find1("hdinfo", {"htype": htype, "stime": {"$lte": _nt}, "etime": {"$gte": _nt}}, fields=['_id'])
    # 判断活动是否开启
    if not _hdinfo:
        return _res

    _res["act"] = 1
    _res["etime"] = _hdinfo["etime"]
    _res["hdid"] = _hdinfo["hdid"]
    _res["stime"] = _hdinfo["stime"]
    return _res





if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a