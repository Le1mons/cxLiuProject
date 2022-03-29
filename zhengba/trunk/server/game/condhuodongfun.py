#!/usr/bin/python
#coding:utf-8

#条件触发活动相关方法

import g

#根据等级触发条件
def chkHuoDongByLv(uid,oldlv,newlv):
    if oldlv < 25 and newlv >= 25:
        #开启英雄推荐
        g.m.hd_herotuijian.createTuiJianData(uid)


g.event.on("lvup",chkHuoDongByLv)