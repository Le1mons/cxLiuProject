#!/usr/bin/python
#coding:utf-8

#两个库必须在同一服务器上，且使用root权限登陆
#合并前请务必备份好数据库
#===================================================================================================
#主区数据库配置

import os
if os.path.isfile('./hequ.lock'):
    print "hequ locked...."
    exit()


SVR1DB = {
    "host":"{{dbhost}}",
    "port":{{dbport}},
    "poolsize":10,
    "dbname":"{{db1}}", 
    "dbuser":"{{dbuser}}",
    "dbpwd":"{{dbpwd}}",
    "authdb":"admin"
}

#老区开区时间
DB1OPENTIME = "{{opentime1}}"
#新区开区时间
DB2OPENTIME = "{{opentime2}}"
#新区serveridx集合
NEWSEVERIDX = [{{NEWSEVERIDX}}]
OLDSEVERIDX = [{{OLDSEVERIDX}}]

#需要清空的表
clearTable = [
    'blacklist','cityprize','fightcity','fightcity_hero','fightcity_team','fightlog','hdinfo','lueduolog','passlog',
    'pkfightlog','sjywpkdata','sjywpkhistorydata','shops','sjywpklog','taishou','timerlist'
    ''
]

#清理角色时跳过的表
clearUserBreakTable = ['gameconfig','userinfo','shiliattr']
#dropIndex = {"userinfo":['name_1'],'gonghui':['name_1']}
'''reMarkIndex = {
    "userinfo":[{ "keys":(("name",1),),"option":{"unique":True }}],
    "gonghui":[{ "keys":(("name",1),),"option":{"unique":True }}]
}'''

import sys
sys.path.append('game')

import lib.file,time,copy,os,subprocess
import g
import dbmongo
import thread
import pymongo
import configmongodb

def w (msg):
    amsg = msg
    try:
        amsg = msg.decode('utf-8').encode('gbk')
    except:
        pass
    return amsg

def line ():
    print '=========================='

baseList = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ']
def changeBase(n,b=len(baseList)):
    x,y = divmod(n,b)
    if x>0:
        return changeBase(x,b) + baseList[y]
    else:             
        return baseList[y]


class HeQu:
    def __init__ (self,db1):
        #数据库对象
        self.mdb1 = dbmongo.MongoDB(db1)
        g.mdb = self.mdb1
        self.client1 = pymongo.MongoClient(host=db1["host"],port=db1["port"])
        self.client1.get_database(db1["authdb"]).authenticate(db1["dbuser"],db1["dbpwd"])
        self.db1Name = db1['dbname']
        #清理死号-未登录时长
        self.ptime = (60*60*24*7)
        line()
        
    #删除索引
    def hq_dropIndex(self):
        db = self.client1.get_database(self.db1Name)
        _collectionList = db.collection_names()
        for c in _collectionList:
            _collection = db.get_collection(c)
            _collection.drop_indexes()
            print "drop_index====",c

        '''global dropIndex
        db = self.client1.get_database(self.db1Name)
        for k,v in dropIndex.items():
            #获取集合
            _collection = db.get_collection(k)
            #获取索引集合
            _indexs = _collection.index_information()
            for ele in v:
                if not ele in _indexs:
                    continue
                _res = _collection.drop_index(ele)'''
                
    #还原被删的索引
    def hq_reMarkIndex(self):
        configmongodb.starup()
        '''global reMarkIndex
        db = self.client1.get_database(self.db1Name)
        for k,v in reMarkIndex.items():
            #获取集合
            _collection = db.get_collection(k)
            #获取索引集合
            for ele in v:
                #待创建的索引
                _index = ele["keys"]
                #创建选项
                _options = ele["option"]   
                _res = _collection.create_index(_index,**_options)'''
        

    #需要清理的表数据
    def hq_clearTableData(self):
        global clearTable
        print '开始清理表数据'
        for tb in clearTable:
            print '清理表=====',tb
            self.mdb1.delete(tb)
        print '清理表数据结束'


    #检测玩家角色名重复
    def hq_chkUserName(self):
        global baseList
        rss = self.mdb1.find('userinfo',{},fields={'_id':0,'uid':1,'name':1})
        namedic = {}
        print w("开始检测重复角色名")
        _chkIdArr = baseList

        for u in rss:
            _uname = u['name']
            #先把名字中的替换词去掉，重新排序
            for replaceStr in _chkIdArr:
                _uname = _uname.replace(replaceStr,'')

            if _uname in namedic:
                namedic[ _uname ].append( u['uid'] )
            else:
                namedic[ _uname ] = [u['uid']]

        for name,d in namedic.items():
            if len(d)==1:continue
            _idx = 0
            for _uid in d:
                _tmpName = name + str(changeBase(_idx))
                _idx+=1

                self.mdb1.update('userinfo',{"uid":_uid}, {"$set":{"name": _tmpName}})
                print w(_uid+"改名为："+_tmpName)

    #检查势力名是否重复
    def hq_chkShiLiName(self):
        _groupList = self.mdb1.group('shili',where={},groupby='name',act=['count','_id'])
        _chkIdArr = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ','ⅰ','ⅱ','ⅲ','ⅳ','ⅴ','ⅵ','ⅹ']
        print w("开始检测势力名是否重复")
        for u in _groupList:
            _num = int(u['val'])
            if _num == 1:
                continue
            _uname = u['name']
            _reNameList = self.mdb1.find('shili',{'name':_uname},fields={'_id':1,'name':1})
            _idx = 0
            for ele in _reNameList:
                while 1:
                    _tmpName = _uname +_chkIdArr[_idx]
                    _ghinfo = self.mdb1.find1('shili',{'name':_tmpName},fields={'_id':1,'name':1})
                    if _ghinfo != None:
                        _idx += 1
                        continue

                    _tid = ele['_id']
                    self.mdb1.update('shili',{"_id":_tid}, {"$set":{"name": _tmpName}})
                    print w(ele['name']+"改名为："+_tmpName)
                    break

        print w("结束检测势力名是否重复")
        
    #创建三军演武NPC
    def hq_createSJYWNpc(self):
        print "Start Create SJYW NPC"
        #g.m.sjywfun.createNPC()
        print "End Create SJYW NPC"


    #清理死号用户
    def hq_clearDeadUser(self):
        _ntime = g.C.getNowTime()
        _ptime = _ntime-self.ptime
        _delUserList = self.mdb1.find('userinfo',where={"ischongzhi":None,"lv":{"$lt":20},"logintime":{"$lt":_ptime}},fields={"uid":1,"name":1,"_id":0})
        print w("开始清空死号玩家")
        if len(_delUserList) == 0:
            print w("无死号信息")
            return
        
        db = self.client1.get_database(self.db1Name)
        _collectionList = db.collection_names()
        _userList = []
        for u in _delUserList:
            _userList.append(u['uid'])
        
        for c in _collectionList:
            if c in clearUserBreakTable:
                continue
            self.mdb1.delete(c,{'uid':{"$in":_userList}})
        
        self.mdb1.delete('userinfo',{'uid':{"$in":_userList}})
        print w("结束清空死号玩家数量="+ str(len(_userList)))


        
    #清理竞技场数据
    '''def hq_clearTxbwNpc(self):
        print "Start Create TXBW NPC"
        self.mdb1.delete('pkdata')
        _jjcRobot = g.m.txbwfun.createNPC()
        print "END Create TXBW NPC"
        '''
    
    #实例化添加比武信息
    def hq_fmtTxbwData(self):
        print "Start fmt TXBW"
        #删除所有NPC
        self.mdb1.delete('pkdata',{'uid':{'$regex':'ROBOT_'}})
        #获取所有玩家信息，按照排名和战力排序
        _userList = self.mdb1.find('pkdata',sort=[["rank",1],["zhanli",-1]],fields=['_id','uid'])
        _rank = 0
        for u in _userList:
            _tmpUid = u['uid']
            _rank += 1
            self.mdb1.update('pkdata',{'uid':_tmpUid},{'rank':_rank})
            
        #生成100个npc
        g.m.txbwfun.createNPCByLastRank(_rank)
        print "End fmt TXBW"
        
    #删除天下比武对手信息
    def hq_delTxbwPkUser(self):
        print "Start DELETE TXBWPKUSER"
        self.mdb1.delete('playattr',{"ctype":g.L("TXBW_PKLIST")})
        print "END DELETE TXBWPKUSER"
        
    #删除playattr数据
    def hq_delPlayAttr(self):
        print "Start DELETE Playattr"
        _ctypeList = [
            'SJYW_PKLIST','zhanyi_backup','fengdi_backup','taishou_pk_time','last_taishou_specity',
            'taishou_specity','lueduo_blackuid','lueduo_pklist'
        ]
        self.mdb1.delete('playattr',{"ctype":{'$in':_ctypeList}})
        print "Start DELETE Playattr"
        
    #创建太守NPC
    def hq_creatTaiShouNpc(self):
        print "Start Create TaiShouNpc"
        g.m.taishoufun.createTaiShou()
        print "END Create TaiShouNpc"
        
    #删除系统任务
    def hq_delOnecTaskBySys(self):
        print "Start DELETE OnecTaskBySys"
        self.mdb1.delete('oncetaskinfo',{"uid":'SYSTEM'})
        print "END DELETE OnecTaskBySys"
        
    #重置公告信息
    def hq_reGongGao(self):
        print "Start RESET GONGGAO"
        g.mdb.delete('gameconfig',{'ctype':{'$nin':['shili_junxiang_prizehour']}})
        _nt = g.C.NOW()
        etime = g.getOpenTime() + 8*24*3600
        _gongGao = [
            {
                "title":"合服公告",
                "stype":0,
                "content":"尊敬的玩家，你们好！<br>　　感谢您长久以来对本游戏的支持，为了给您更好的游戏环境和游戏体验，我们现在对当前服务器进行了合服操作，合服后，您将可以和更多的活跃玩家一起战斗，更好的体验养成将领、攻城略地的快乐！合服过程中，我们将对一些难以保留的数据进行了清理，敬请谅解，同时，我们也对所有的玩家进行了合服补偿奖励，请在邮件中领取。<br>　　如遇到异常问题，请联系客服进行处理，再次感谢您的理解和支持，我们将再接再厉，竭诚为您提供更加优质的服务。",
                "stime":_nt,
                "etime":etime
                },
        ]
        _addData = []
        for i,ele in enumerate(_gongGao):
            _tmpData = {}
            _tmpData["ctype"] = "GONGGAO"
            _tmpData["k"] = str(i+ 1)
            _tmpData["v"] = ele
            _addData.append(_tmpData)
        
        #初始化公告
        _r = g.m.gameconfigfun.addGameConfig(_addData)
        print "End RESET GONGGAO"
        
        
        #2018-1-17 至尊合区需求
        _randNum = g.m.zhizunfun.randLuckyNum()
        #正在福池中使用的数字
        g.m.gameconfigfun.setGameConfig({'ctype':'ZHIZUN_USELUCKYNUM'},{'v':_randNum,'issetnum':1})
        #至尊设置的数字
        g.m.gameconfigfun.setGameConfig({'ctype':'ZHIZUN_TMPLUCKYNUM'},{'v':_randNum})
        #军饷逻辑 保留一条发军饷的信息
        _jxSendData = g.mdb.find('gameconfig',{'ctype':'shili_junxiang_prizehour'})
        if len(_jxSendData) > 1:
            _saveid = _jxSendData[0]['_id']
            g.mdb.delete('gameconfig',{'ctype':'shili_junxiang_prizehour','_id':{'$ne':_saveid}})


    '''
    #清除重复公告
    def hd_chkGongGao(self):
        #删除公告外的信息
        self.mdb1.delete('gameconfig',{'ctype':{'$ne': 'GONGGAO'}})
        _ggList = self.mdb1.find('gameconfig',{'ctype':'GONGGAO'})
        _chkList = []
        for gg in _ggList:
            if 'order' in gg:
                _tmpOrderid = gg['order']
                if _tmpOrderid not in _chkList:
                    _chkList.append(_tmpOrderid)
                    continue
            self.mdb1.delete('gameconfig',{'_id':gg['_id']})
    '''

    #清理重复活动和hdid小于10000的活动
    def hd_chkHongDong(self):
        #清除日常任务id
        self.mdb1.delete('hdinfo',{'hdid':{'$lte':10000}})
        _hdList = self.mdb1.find('hdinfo',fields=['hdid'])
        _chkList = []
        for h in _hdList:
            _tmpHdid = int(h['hdid'])
            if _tmpHdid not in _chkList:
                _chkList.append(_tmpHdid)
                continue
            #去除相同hdid活动
            self.mdb1.delete('hdinfo',{'_id':h['_id']})
            
    #删除所有活动
    def hd_delHongDong(self):
        self.mdb1.delete('hdinfo')
        
    #删除指定称号
    def hd_delTitle(self):
        print "Start DELETE Title"
        _delTtid = ['fightcity_roundtitle','fightcity_ererytitle','taishou_dounleprize']
        self.mdb1.delete('title',{'ttid':{'$in':_delTtid}})
        print "End DELETE Title"

    #添加日常活动
    def hq_AddHuoDong(self):
        #创建活动
        _addHDList = [1,30,33,36,38,50,55]
        #过滤的活动
        _blackHD = [10060]
        #_nt = g.getOpenTime()
        _nt = g.C.NOW()
        _hdCon = g.GC["huodong"]
        _hdData = []
        for ele in _hdCon:
            if int(ele['hdid']) in _blackHD:
                continue
            #if  not int(ele['hdid']) in _addHDList:
            #    continue
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
                    _st = g.C.getDate(_tmpData["stime"],"%m月%d日")
                    _et = g.C.getDate(_tmpData["rtime"],"%m月%d日")
                    _tmpData["showtime"] = _st + "-" + _et
            #相对注册时间
            elif _tmpData["ttype"] == 1:
                pass
    
            _hdData.append(_tmpData)
            
        for s in _hdData:
            print s['hdid']
        #_hdList = g.m.huodongfun.getOpenList(None,1)
        #新增活动

        _rInfo = g.m.huodongfun.addHuodongInfo(_hdData)
        
    #合服全服邮件
    def hq_sendFullServerPrize(self):
        _title = '数据互通奖励！'
        _where = {'title':_title}
        _chkTime = g.C.NOW(g.C.DATE())
        _oldEmail = self.mdb1.count('email',{"title":_title,'ctime':{'$gt':_chkTime}})
        if _oldEmail > 0:
            return
        
        print w("开始全区合区补偿")
        _sendServer = OLDSEVERIDX
        _diffNum = 1
        """
        改名卡*1
        元宝*1000
        经验券 * 35
        """
        _sendPrize = [{'a':'item','t':'153','n':1},{'a':'attr','t':'rmbmoney','n':1000},{'a':'item','t':'110','n':35}]
        _slLeaderPrize = [{'a':'attr','t':'rmbmoney','n':200}]
        _content = "现在你可以结交到更多的朋友啦，还有免费的奖励可以领，赶快领取吧！"
        _content_leader = '尊敬的玩家，您是尊贵的势力首领，在本次合服中补偿之外，额外对您进行补偿，敬请领取，以示鼓励。'
        _ntime = g.C.getNowTime()
        _dataArr={
            "etype":1,
            "title":_title,
            "content":_content,
            "ctime":_ntime,
            "passtime":_ntime + 15*24*3600,
            "uid":'SYSTEM',
            "needlv":25,
            'getprize':0,
            'isread':0,
            'plist':[],
            "prize":_sendPrize
        }
        self.mdb1.insert('email',_dataArr)
        print w("结束全区合区补偿")
        
    #合服势力奖励
    def hq_sendShiLiUserPrize(self):
        print w("开始发放势力会长奖励")
        _title = '势力首领合服补偿'
        _content = '尊敬的玩家，您是尊贵的势力首领，在本次合服中补偿之外，额外对您进行补偿，敬请领取，以示鼓励。'
        _date = g.C.DATE()
        _ntime = g.C.NOW()
        _prize = [{'a':'attr','t':'rmbmoney','n':200}]
        _dataArr_Leader={
            "etype":1,
            "title":_title,
            "content":_content,
            "ctime":_ntime,
            "passtime":_ntime + 15*24*3600,
            "uid":'',
            "needlv":25,
            'getprize':0,
            'isread':0,
            "prize":_prize
        }
        _slUser = self.mdb1.find('shiliuser',{'power':5,"hqprizesend":{"$ne":_date}},fields={'_id':0,'uid':1})
        if len(_slUser) > 0:
            for sl in _slUser:
                _tmpUid = sl['uid']
                _dataArr_Leader['uid'] = _tmpUid
                if "_id" in _dataArr_Leader:
                    del _dataArr_Leader['_id']
                
                self.mdb1.update('shiliuser',{'uid':sl['uid']},{'hqprizesend':_date})
                self.mdb1.insert('email',_dataArr_Leader)
                
        print w("结束发放势力会长奖励")
                
    #发放新区奖励
    def hq_sendNewServerPrize(self):
        print w("开始新区奖励补偿")
        _db1time = g.C.NOW(DB1OPENTIME)
        _db2time = g.C.NOW(DB2OPENTIME)
        _diff = g.C.getDateDiff(int(_db1time),int(_db2time))
        #2017-3-1跨服奖励增加1天
        if _diff == 0:
            return

        _sidArrNew = NEWSEVERIDX
        _diffNum = abs(_diff)
        if _diffNum > 14: _diffNum = 14
        """
        经验券：35 * _diffNum
        """
        _sendPrize = [{'a':'item','t':'110','n':35 * _diffNum}]
        _content = "游戏数据互通奖励，感谢您对游戏的大力支持，祝您游戏愉快！"
        _ntime = g.C.getNowTime()
        _dataArr={
            "etype":1,
            "title":"数据互通奖励",
            "content":_content,
            "ctime":_ntime,
            "uid":'SYSTEM',
            "needlv":25,
            "passtime":_ntime + 15*24*3600,
            "isread":0,
            'getprize':0,
            'plist':[],
            "prize":_sendPrize
        }
        for sid in _sidArrNew:
            _dataArr['sid'] = int(sid)
            if "_id" in _dataArr:
                del _dataArr['_id']
            self.mdb1.insert('email',_dataArr)

        print w("结束新区奖励补偿")


#主进程
def main ():
    hequ = HeQu(SVR1DB)
    hequ.startTime = time.time()
    #清理死号用户
    hequ.hq_clearDeadUser()
    #设置重名玩家
    hequ.hq_chkUserName()
    #设置重名势力
    hequ.hq_chkShiLiName()
    #清理部分表数据
    hequ.hq_clearTableData()
    #格式化添加比武信息
    hequ.hq_fmtTxbwData()
    #删除Gamefig，新建公告
    hequ.hq_reGongGao()
    #清理天下比武对手信息
    hequ.hq_delTxbwPkUser()
    #删除playattr信息
    hequ.hq_delPlayAttr()
    #生成天下比武NPC
    #创建太守NPC
    hequ.hq_creatTaiShouNpc()
    #删除系统任务
    hequ.hq_delOnecTaskBySys()
    #还原合并前删除的索引
    hequ.hq_reMarkIndex()

    #发放全服奖励
    hequ.hq_sendFullServerPrize()
    #发放势力会长补偿
    hequ.hq_sendShiLiUserPrize()
    #发放新区奖励
    hequ.hq_sendNewServerPrize()
    #2017-3-8 清理重复活动和hdid小于10000的活动
    #hequ.hd_chkHongDong()
    #删除所有活动
    hequ.hd_delHongDong()
    #删除称号
    hequ.hd_delTitle()
    #添加活动
    hequ.hq_AddHuoDong()
    hequ.endTime = time.time()
    print "success!!!!!!!!!!!!!!!!"
    print "runtime==========",  hequ.endTime- hequ.startTime
    
#删除索引
def delIndex():
    hequ = HeQu(SVR1DB)
    hequ.hq_dropIndex()

import sys
if 'clearIndex' == sys.argv[1]:
    #合并前删除影响合并的索引-执行完后还原索引
    delIndex()
else:
    main()
