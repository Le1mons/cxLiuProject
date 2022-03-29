#! /usr/bin/python
# -*-coding:utf-8-*-


"""
特惠礼包2
"""

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

htype = 65
import g



def getOpenList(uid, hdinfo):
    if hdinfo['isxianshi'] == 1:
        hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val')
        for idx, i in enumerate(hdinfo['data']):
            if hdData['val'].get(str(idx), 0) < hdinfo['data'][idx]['maxnum']:
                break
        else:
            return False
    return hdinfo


def getOpenData(uid, hdinfo):
    hdid = hdinfo['hdid']
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdid, keys='_id,val,gotarr')
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


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

    setData = {"$set": {"gotarr": [],"val": {}}}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)


def hdEvent(uid, hdinfo, etype, *args, **kwargs):
    if etype != 'chongzhi':
        # 只处理充值事件
        return

    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val')

    for idx, i in enumerate(hdinfo['data']):
        if i['proid'] != args[2]['proid']:
            continue
        if hdData['val'].get(str(idx), 0) >= i['maxnum']:
            g.success[kwargs['orderid']] = False
            return

        _prize = i['prize']
        _send = g.getPrizeRes(uid, _prize, {'act': 'tehuilibao', 'proid':i['proid']})
        g.sendUidChangeInfo(uid, _send)
        g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'$inc': {'val.{}'.format(idx): 1}})
        break



if __name__ == "__main__":
    uid = g.buid("liu1")
    hdid = 50
    hdidinfo = g.m.huodongfun.getInfo(hdid)
    a = getOpenData(uid, hdidinfo)
    print a