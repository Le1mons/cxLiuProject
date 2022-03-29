#! /usr/bin/python
# -*-coding:utf-8-*-
"""
皮肤礼包
"""

if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('game')


htype = 41
import g

'''
{
    "hdid" : 1562850363,
    "showtime" : "7月12日0点-7月18日23点59分",
    "stime" : 1562860800,
    "etime" : 1563465600,
    "rtime" : 1563465600,
    "ttype" : 0,
    "showtype" : 2,
    "name" : "皮肤礼包",
    "htype" : 41,
    "stype" : 10041,
    "itype" : 0,
    "intr" : "活动期间超值英雄限时上架，消耗相应物品即可兑换指定英雄，机不可失哦！",
    "img" : "",
    "icon" : "ico_event_yxpf",
    "data" : {
        "money" : 648,
        "proid" : "skin648",
        "skinid" : "1108001",
        "prize" : [ 
            {
                "a" : "item",
                "t" : "6001",
                "n" : 1
            }, 
            {
                "a" : "attr",
                "t" : "rmbmoney",
                "n" : 1000
            }
        ]
    }
}
'''

def getOpenList(uid, hdinfo):
    # hdinfo['data']['proid'] = 'skin{}'.format(hdinfo['data']['money'])
    return hdinfo


def getOpenData(uid, hdinfo):
    hdData = g.m.huodongfun.getMyHuodongData(uid, hdinfo['hdid'], keys='_id,val,gotarr')
    # hdinfo['data']['proid'] = 'skin{}'.format(hdinfo['data']['money'])
    _retVal = {"info":hdinfo["data"],"myinfo":hdData}
    return _retVal


# 没有领奖 直接事件发送奖励
# remove
def getPrize(uid, hdinfo, *args, **kwargs):
    return



def getHongdian(uid, hdid, hdinfo):
    return

def initHdData(uid,hdid,data=None,*args,**kwargs):
    setData = {"val":0,"gotarr":[]}
    if data:
        setData.update(data)
    _r = g.m.huodongfun.setMyHuodongData(uid, int(hdid), setData)

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
    if etype != 'chongzhi' or args[2]['proid'] != hdinfo['data']['proid']:
        # 只处理充值事件
        return 0

    _userHd = g.mdb.find1('hddata',{'uid':uid,'hdid':hdinfo['hdid']},fields=['_id','gotarr'])
    if _userHd == None:
        return 0
    
    if 'gotarr' in _userHd and len(_userHd['gotarr']) > 0:
        return 0

    _prize = hdinfo['data']['prize']
    _send = g.getPrizeRes(uid, _prize, {'act': 'skin_gift','proid':args[2]['proid']})
    g.sendUidChangeInfo(uid, _send)
    # g.m.huodongfun.setHDData(uid, hdinfo['hdid'], {'$push':{'gotarr': g.C.MNOW()}})



if __name__ == "__main__":
    a= 1