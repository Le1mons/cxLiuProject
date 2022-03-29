#!/usr/bin/env python
#coding:utf-8

'''
    重置服务器：
    1，重置开服时间为今天
    2，清除活动(hdinfo)
    2.1 清楚一次性活动(可选，限大战国)
    3, 重新生成活动
    @Author: gch
    @DateTime: 2017-06-27 16:42:39

'''

import sys
sys.path.append('./game')

import g, time, re, datetime 

def get_game_name():
    dbconfig = g.conf['DBCONFIG']
    dbname = dbconfig['dbname']
    if dbname.find('king') != -1:
        return 'king'

    else:
        return 'homm'

def change_open_time():
    with open('config.py', 'r') as f:
        _rawcontent = f.readlines()
        pattern = re.compile('OPENTIME')
        dir(pattern)
        _newcontent = []
        for line in _rawcontent:
            _r = pattern.findall(line)
            if _r:
                _date = g.C.DATE(fmtStr='%Y-%m-%d %H:%M:%S')
                _tmp = '    OPENTIME = \"' + _date + '\",    #开区时间\n'
                print 'new  data is =====', _tmp
                _newcontent.append(_tmp)

            else:
                _newcontent.append(line)

        with open('config.py.bak', 'w') as f:
            for ele in _newcontent:
                f.write(ele)

def clear_hd():
    clear_collections = ['hdinfo', 'hddata', 'oncetaskinfo', 'oncetaskdata']
    for collection in clear_collections:
        print g.mdb.delete(collection, {})

def gen_hd_heros():
    #创建活动
    _nt = g.getOpenTime()
    _hdCon = g.GC["huodong"]
    _hdData = []
    for ele in _hdCon:
        _tmpData = {}
        _tmpData.update(ele)
        #绝对时间戳
        if _tmpData["ttype"] == 0:
            #永久活动
            if _tmpData["stime"] ==-1:
                _tmpData["stime"] = 0
                _tmpData["etime"] = 0
                _tmpData["rtime"] = 0
                _tmpData["showtime"] = "永久"
            else:
                _tmpData["stime"]=g.C.ZERO(_tmpData["stime"]*24*3600 + _nt)
                _tmpData["etime"]=g.C.ZERO(_tmpData["etime"]*24*3600 + _nt) + 24*3600-1
                _tmpData["rtime"]=g.C.ZERO(_tmpData["rtime"]*24*3600 + _nt) + 24*3600-1
                _st = g.C.getDate(_tmpData["stime"],"%m月%d日0:00")
                _et = g.C.getDate(_tmpData["rtime"],"%m月%d日24:00")
                _tmpData["showtime"] = _st + "-" + _et
        #相对注册时间
        elif _tmpData["ttype"] == 1:
            pass

        _hdData.append(_tmpData)
    
    _hdList = g.mdb.find('hdinfo',{'hdid':{"$lt":1000000}})
    #新增活动
    if len(_hdList)==0:
        _rInfo = g.m.huodongfun.addHuodongInfo(_hdData)

def gen_hd_king():
    #创建活动
    _nt = g.getOpenTime()
    _hdCon = g.GC["huodong"]
    _hdData = []
    for ele in _hdCon:
        _tmpData = {}
        _tmpData.update(ele)
        #绝对时间戳
        if _tmpData["ttype"] == 0:
            #永久活动
            if _tmpData["stime"] ==-1:
                _tmpData["stime"] = 0
                _tmpData["etime"] = 0
                _tmpData["rtime"] = 0
                _tmpData["showtime"] = "永久"
            else:
                _tmpData["stime"]=g.C.ZERO(_tmpData["stime"]*24*3600 + _nt)
                _tmpData["etime"]=g.C.ZERO(_tmpData["etime"]*24*3600 + _nt) + 24*3600-1
                _tmpData["rtime"]=g.C.ZERO(_tmpData["rtime"]*24*3600 + _nt) + 24*3600-1
                _st = g.C.getDate(_tmpData["stime"],"%m月%d日00:00")
                _et = g.C.getDate(_tmpData["rtime"],"%m月%d日23:59")
                _tmpData["showtime"] = _st + "-" + _et
                if str(_tmpData["htype"]) == '1010':
                    #如果是双倍活动
                    _tmpData["data"] = {}
                    _hd_dbprize = g.GC["hd_doubleprize"]
                    for k,v in _hd_dbprize['hddata'].items():
                        _tmpData["data"][k] = {'opendate':[]}
                        for d in v['openday']:
                            _openDate = g.C.DATE(_nt + d*24*3600)
                            _tmpData["data"][k]['opendate'].append(_openDate)
        #相对注册时间
        elif _tmpData["ttype"] == 1:
            pass
        #相对开区时间
        elif _tmpData["ttype"] == 2:
            pass

        _hdData.append(_tmpData)

    _hdList = g.mdb.find('hdinfo',{'hdid':{"$lt":1000000}})
    #新增活动
    if len(_hdList)==0:
        _rInfo = g.m.huodongfun.addHuodongInfo(_hdData)
        print 'finish adding huodong.'


def run():
    print '===== start'

    change_open_time()

    print '====== finish'

run()