#!/usr/bin/python
#coding:utf-8

'''
初始化游戏数据(包括表结构)
'''
import sys,urllib2
sys.path.append('game')
import g, json

import configmongodb
import configmongodb_cross


def startUp():
    if g.conf['VER'] == 'cross':
        #跨服库执行
        configmongodb_cross.starup()
    else:
        configmongodb.starup()
        _nt = g.C.NOW()
    
        etime = g.getOpenTime() + 8*24*3600
        _gongGao = [
            {"title":"欢迎进入您的天下！","stype":0,"content":"新服火热开启！各种福利来袭，任何游戏问题欢迎咨询官方客服，祝您游戏愉快！","stime":_nt,"etime":etime},
        ]
        if 'OWNER' in g.conf:
            if (g.conf['OWNER']).find('kuaiyou')!=-1:
                _gongGao = [
                    {"title":"欢迎勇士来到《部落帝国》","stype":0,"content":"加客服（天使姐姐）领礼包哟：QQ3001385594 ～官方交流群901297677，加群有礼包～","stime":_nt,"etime":etime},
                ]

        _addData = []
        for i,ele in enumerate(_gongGao):
            _tmpData = {}
            _tmpData["ctype"] = "GONGGAO"
            _tmpData["k"] = str(i+ 1)
            _tmpData["v"] = ele
            _addData.append(_tmpData)
        
        #初始化公告
        _ggList = g.m.gameconfigfun.getGameConfig({"ctype":"GONGGAO"},limit=1)
        if len(_ggList)==0:
            _r = g.m.gameconfigfun.addGameConfig(_addData)
        
        #初始化oncetask
        _onceList = g.mdb.find('oncetaskinfo',where={"uid":"SYSTEM","ctype":1},limit=1)
        # if len(_onceList)==0:
        #     _r = g.m.oncetaskfun.initOpenAreaConf()
        
        #创建竞技场NPC
        print "Start Create PKJJC NPC"
        # _jjcRobot = g.m.txbwfun.createNPC()
        print "END Create PKJJC NPC"
        
        #增加周常活动
        _nt = g.getOpenTime()
        print "Start  Create ZhouChangHD"
        g.m.huodongfun.rePeatHuoDong(_nt)
        print "END  Create ZhouChangHD"

        #创建活动
        _hdCon = g.GC["huodong"]
        _hdData, _htypes = [], []
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
                '''_tmpData["stime"]=g.C.ZERO(_tmpData["stime"]*24*3600 + _nt)
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
                            _tmpData["data"][k]['opendate'].append(_openDate)'''
            # 指定时间
            elif _tmpData["ttype"] == 3:
                # _tmpData["stime"] = g.C.ZERO(_nt)
                _st = g.C.getDate(_tmpData["stime"], "%m月%d日00:00")
                _et = g.C.getDate(_tmpData["rtime"], "%m月%d日23:59")
                _tmpData["showtime"] = _st + "-" + _et
                
            _hdData.append(_tmpData)
            _htypes.append(_tmpData['htype'])

        # 拉特殊活动
        try:
            _data = urllib2.urlopen('http://gameconfig.legu.cc/?app=game.zhengba.autofuturehdlist&act=isautofuture',timeout=5).read()
            _data = json.loads(_data)
            for hd in _data:
                if hd['htype'] in _htypes or not hd['stime'] <= g.C.NOW() <= hd['etime']:
                    continue
                _hdData.append(hd)
                _htypes.append(hd['htype'])
        except:
            pass

        #_hdList = g.m.huodongfun.getOpenList(None,1)
        _hdList = g.mdb.find('hdinfo',{'hdid':{"$lt":1000000}})
        #新增活动
        if len(_hdList)==0 and _hdData:
            _rInfo = g.m.huodongfun.addHuodongInfo(_hdData)
            print 'finish adding huodong.'
    
    print "startUp Success"

if __name__ == "__main__":
    startUp()

