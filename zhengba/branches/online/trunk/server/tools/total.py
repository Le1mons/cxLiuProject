#coding:utf-8
#转excel

import pymongo
import xlwt
import os
import config
config.CONFIG["DBCONFIG"]["host"] = "10.0.0.233"
config.CONFIG["DBCONFIG"]["dbname"] = "hhh"

from game import common
from game import mijingfun
from game import armyfun
from game import g
from game import itemfun
from game import mijingfun


C = common.CommonFun()

def getValue(v,k,defval=0):
    return v[k] if v!=None and k in v  else defval

def total():
    _filePath = u"C:\\Users\\Administrator\\Desktop\\统计\\二区.xls"
    _uList = g.mdb.find("userinfo2",{},{"name":1,"lv":1,"nexp":1,"binduid":1,"uid":1},sort=[["lv",-1],["nexp",-1]],limit=50)
    #g.mdb.group('userinfo',where={'sex':4},groupby='name,binduid',act=['min','age'])
    execl = xlwt.Workbook("utf-8")
    ws = execl.add_sheet("统计")

    row0 = "角色名、级别、经验、账号、玩家信息".split("、")
    _r = [ws.write(0,i,row0[i]) for i in xrange(0,len(row0))]
    for line,ele in enumerate(_uList):
        lv = ele["lv"]
        name = ele["name"]
        nexp = ele["nexp"]
        binduid = ele["binduid"]
        uid = ele["uid"]
        row = [name,lv,nexp,binduid,uid]
        for li,ne in enumerate(row):
            ws.write(line+1,li,ne)
            
        print "正在处理第:[%s]个" % str(line + 1)

    if os.path.exists(_filePath):
        print "WANNING:FILE EXISTS ..."
    else:
        execl.save(_filePath)

    print "success..."


if __name__ == "__main__":
    total()
