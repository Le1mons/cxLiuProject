#!/usr/bin/python
#coding:utf-8

import g

DBBASE = g.BASEDB(g.mdb,'playattr','yzdle')


_funData = {
    "title":"fdfsd",
    "dps":0
}

def setData(uid):
    DBBASE.setAttr(uid,{'ctype':'test_num'},_funData)

#获取pk次数
def getPkNum(uid):return DBBASE.getPlayAttrDataNum(uid,'test_num')
#设置pk次数
def setPkNum(uid):return DBBASE.setPlayAttrDataNum(uid,'test_num')






if __name__=="__main__":
    uid = g.buid('fenghua10')
    print setData(uid)
    #print setPkNum(uid)
    
