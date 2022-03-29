#!/usr/bin/python
#coding:utf-8
import g

'''
一次性活动功能
'''

_defaltUserData = {'got': 0, 'val': 0}

#获取配置
def getOnceTaskConf():
    return g.GC['oncetask']

def getOnceTaskGroupConf():
    return g.GC['oncetaskgroup']

def getHDTaskGroupConf():
    return g.GC['huodongtask']


#获取指定groupid的配置
#tasklist是从json中读取的，tasklistData是在preparefun中转换的
def getConfByGroupID(groupid,fillTaskListData=True):
    groupid = str(groupid)
    _groupConf = getOnceTaskGroupConf()
    
    if groupid not in _groupConf:
        print 'groupid not in oncetaskgroup',groupid
        return None
    _group = _groupConf[groupid]
    
    if fillTaskListData:
        _tasklistData = {}
        for _ts in _group['tasklist']:
            for _tid in _ts:
                _taskConf = getConfByTaskID(_tid)
                _taskConf['taskgroupid'] = str(groupid)
                
                _tasklistData[_tid] = _taskConf
                
        _group['tasklistData'] = _tasklistData

    return _group

#通过taskid获取配置
def getConfByTaskID(taskid):
    taskid = str(taskid)
    _taskConf = getOnceTaskConf()
    if taskid not in _taskConf:
        print 'taskid not in oncetask',taskid
        return None
    return _taskConf[taskid]

#初始化所有开区活动
def initOpenAreaConf():
    _groupConf = getOnceTaskGroupConf()
    for _groupid,_group in _groupConf.items():
        if _group['logicstarttime']['cond'] == 'kaiqu+':
            fmtOneTask(_group,insert=True)

#格式化活动开启时间
def _fmtStartTime(opencond):
    _startTime = 0
    if opencond['cond'] == 'kaiqu+':
        _openTime = g.C.NOW(g.C.getDate(g.getOpenTime())) #开区当天00:00:00的时间戳
        if 'val' in opencond:
            _startTime = _openTime + 24*3600*opencond['val']
            
    if opencond['cond'] == 'lv=':
        _startTime = g.C.NOW()
        
    return _startTime

#格式化活动结束时间
def _fmtEndTime(startTime,timeto):
    _endTime = 2100000000
    
    if timeto['cond'] == 'kaiqu+':
        _openTime = g.C.NOW(g.C.getDate(g.getOpenTime())) #开区当天00:00:00的时间戳
        if 'val' in timeto:
            _endTime = _openTime + 24*3600*timeto['val']

    if timeto['cond'] == 'open+':
        _endTime = startTime + 24*3600*timeto['val']
            
    if timeto['cond'] == 'second+':
        _endTime = startTime + timeto['val']
        
    return _endTime 

#格式化单条任务数据
def fmtOneTask(group,uid=None,insert=False):
    _startLogicTime = _fmtStartTime(group['logicstarttime'])
    _endLogicTime = _fmtEndTime(_startLogicTime, group['logictimeto'])
    
    _startShowTime = _fmtStartTime(group['showstarttime'])
    _endShowTime = _fmtEndTime(_startShowTime, group['showtimeto'])    
    
    _uid = uid
    if group['logicstarttime']["cond"] == "kaiqu+":
        _uid = "SYSTEM"
    
    if _uid==None:
        print 'fmtOneTask uid is None'
        return 
    
    _data = {
        "uid": _uid,
        "ctype": 1,
        "startLogicTime":_startLogicTime,
        "endLogicTime":_endLogicTime,
        
        "startShowTime":_startShowTime,
        "endShowTime":_endShowTime,   
                
        "groupname":group["groupname"],
        "taskgroupid":group["taskgroupid"]
    }
    
    if insert:
        g.mdb.insert('oncetaskinfo',_data)
    
    return _data

#兑换ANT
#如果 _prizeConf 为 None则表示扣除物品

def duiHuanANT(uid,_needConf,_prizeConf=None,why=None):
    #有领取消耗
    _needMap = {}
    _changeInfo = {"item":{},"attr":{},"hero":{}}

    #合并需要扣除数据
    for ele in _needConf:
        _needType = ele["a"]
        _needId = ele["t"]
        _needNum = int(ele["n"])
        if _needType not in _needMap:
            _needMap[_needType] = {}
        
        #该id已存在
        if _needId in _needMap[_needType]:
            _needMap[_needType][_needId] += -_needNum
        else:
            _needMap[_needType].update({_needId:-_needNum})
        
    #计算属性消耗
    if "attr" in _needMap:
        _altRes = g.m.userfun.altNum(uid,_needMap["attr"])
        #消耗不足
        if _altRes[0]!=True:
            _res = {"s":-100,"attr":_altRes[1]}
            return _res

    #计算物品消耗
    if "item" in _needMap:
        _itemList = g.m.itemfun.getItemList(uid,'num,itemid',{"itemid":{"$in":_needMap["item"].keys()}})
        _itemMap = {}
        for ele in _itemList:
            _itemId = ele["itemid"]
            _itemNum = ele["num"]
            #道具不足
            if _itemNum + _needMap["item"][_itemId] < 0:
                _res = {"s":-3,"errmsg":g.L("hd_item_nonum")}
                return _res
    
    #扣除消耗
    for k1,v1 in _needMap.items():
        if k1 == "attr":
            #扣除属性
            _r = g.m.userfun.updateUserInfo(uid,v1,why)
            _changeInfo["attr"] = v1
        
        if k1 == "item":
            #扣除物品
            for k,v in v1.items():
                _r = g.m.itemfun.changeItemNum(uid,k,v)
                _changeInfo["item"][str(k)] = v
    
    #奖励物品
    if _prizeConf!=None:
        _prizeMap = g.getPrizeRes(uid, _prizeConf,why)
        for k,v in _prizeMap.items():
            if k not in _changeInfo:
                _changeInfo[k] = {}
                
            for k1,v1 in v.items():
                if k1 not in _changeInfo[k]:
                    _changeInfo[k][k1] = v1
                else:
                    _changeInfo[k][k1]+= v1
        
    return {"s":1,"changeInfo": _changeInfo }       


#获取玩家的任务数据
def getUserData(uid,groupids=None,taskids=None,taskgroupnames=None):
    res = {}
    _w = {"uid":uid}
    if groupids != None:
        if not isinstance(groupids,list):groupids=[groupids]
        _w['taskgroupid'] = {"$in":groupids}
    if taskids != None:
        if not isinstance(taskids,list):taskids=[taskids]
        _w['taskid'] = {"$in":taskids}
    
    if taskgroupnames!=None:
        if not isinstance(taskgroupnames,list):taskgroupnames=[taskgroupnames]
        _w['taskgroupname'] = {"$in":taskgroupnames}
    
    _rss = g.mdb.find('oncetaskdata',_w,fields=['_id'])
    
    for rs in _rss:
        res[ str(rs['taskgroupid'])+ '_' + str(rs['taskid']) ] = rs
        
    del _rss
    return res

#设置玩家数据
def setUserData(uid,groupid,taskid,data):
    groupid = str(groupid)
    taskid = str(taskid)
    
    _conf = getConfByGroupID(groupid,fillTaskListData=False)
    _w = {
        "uid":uid,
        "taskgroupid":groupid,
        "taskgroupname":_conf['groupname'],
        "taskid":taskid
    }
    _r = g.mdb.update('oncetaskdata',_w,data,upsert=True)
    return _r

#设置玩家数据
def setUserDataByHdTask(uid,groupid,taskid,groupname,data):
    groupid = str(groupid)
    taskid = str(taskid)
    _w = {
        "uid":uid,
        "taskgroupid":groupid,
        "taskgroupname":groupname,
        "taskid":taskid
    }
    _r = g.mdb.update('oncetaskdata',_w,data,upsert=True)
    return _r
    

#获取当前任务列表
def getCurrTaskList(uid,where=None,showOrLogic='logic',fillUserData=False,delTaskListData=False):
    _nt = g.C.NOW()
    
    if showOrLogic!="logic":
        #如果是取用来显示的数据时
        _w = {
            "$and":[
                {"$or":[{"uid":"SYSTEM"},{"uid":uid}]},
                {"$or":[
                    {"startShowTime":{"$lte":_nt}},
                    {"startLogicTime":{"$lte":_nt}}
                ]}
                ],
            "endShowTime":{"$gte":_nt}
        }
    else:
        #取逻辑（开始统计任务进度）的起止时间
        _w = {"startLogicTime":{"$lte":_nt},"endLogicTime":{"$gte":_nt},"$or":[{"uid":"SYSTEM"},{"uid":uid}]}
        
    #默认ctype = 1
    _w['ctype'] = 1
    if where!=None:
        _w.update(where)
        
    _rs = g.mdb.find('oncetaskinfo',_w,fields=['_id'])
    
    for _group in _rs:
        if _group.get('ctype', 1) == 2:
            #活动任务
            pass
        else:
            #普通任务
            _cc = getConfByGroupID(_group['taskgroupid'], True if delTaskListData==False else False)
            _group.update(_cc)
            

        if showOrLogic!="logic":
            #如果不是逻辑数据的话，再次加工数据
            _fmtShowGroup(_group)
        
        #如果需要玩家数据
        if fillUserData:
            _userData = getUserData(uid,_group['taskgroupid'])
            
            _openlv = 0
            _openlvRs = g.getAttrOne(uid, {"ctype":"oncetask_openlv_"+ str(_group['taskgroupid']) },"_id,v")
            if _openlvRs==None:
                _gud = g.getGud(uid)
                _openlv = _gud['lv']
                g.setAttr(uid, {"ctype":"oncetask_openlv_"+ str(_group['taskgroupid']) },{"v":_openlv})
            else:
                _openlv=_openlvRs['v']
            
            _group['mylvwhenopen'] = _openlv
            
            
            for _uk,_ud in _userData.items():
                _taskid = _ud['taskid']
                if _taskid in _group['tasklistData']:
                    _group['tasklistData'][ _taskid ]['userData'] = _ud
                    
                del _ud['taskgroupid']
                del _ud['taskid']
                del _ud['uid']                

    return _rs

def _fmtShowGroup(_group):
    if 'showstarttime' in _group: del _group['showstarttime']
    if 'showtimeto' in _group: del _group['showtimeto']
    if 'logictimeto' in _group: del _group['logictimeto']
    if 'logicstarttime' in _group: del _group['logicstarttime']

    _group['stime'] = _group['startShowTime']
    _group['etime'] = _group['endLogicTime']
    _group['distime'] = _group['endShowTime']

    if 'startLogicTime' in _group: del _group['startLogicTime']
    if 'startShowTime' in _group: del _group['startShowTime']
    if 'endLogicTime' in _group: del _group['endLogicTime']
    if 'endShowTime' in _group: del _group['endShowTime']
    return _group

#获取groupid中已领取的任务次数
def getFinishedNums(uid,taskgroupname):
    ud = getUserData(uid,taskgroupnames=taskgroupname)
    num = 0
    for k,d in ud.items():
        if 'finish' in d:
            num+=1
    # group中全部任务个数
    _groupCon = getOnceTaskGroupConf()
    _taskNum = len([_task for tmp in _groupCon if _groupCon[tmp]['groupname'] == taskgroupname for tasktmp in _groupCon[tmp]['tasklist'] for _task in tasktmp])
    num = round((100.0* num)/ _taskNum, 1)
    return num

#获取百分比进度奖励信息
def getProgPrizeInfo(uid,taskgroupname):
    #开服狂欢有百分比进度
    _got = {}
    _gotRs = g.getAttrOne(uid,{"ctype":"gotprogprize"+ str(taskgroupname)},'_id,v')
    if _gotRs != None:
        _got=_gotRs['v']
    return {"finish": getFinishedNums(uid,taskgroupname),"got":_got}

def setProgPrizeInfo(uid,taskgroupname,v):
    return g.setAttr(uid,{"ctype":"gotprogprize"+ str(taskgroupname)},v)

#初次打开界面检测有可能直接完成的任务
def chkFinishTaskByOpen(uid,hdlist):
    _eventTypeList = ['ZGCNUM','SBNUM', 'MJNUM', 'JLNUM', 'LCCL', 'YBCL','HeroBiaoQian','BZKJLvNum','QiShiLv','HeroGroupNumByStep',
                      'ShenBingNumByDJ','MJNumByLv','JLSJNUM','ZXNX','WuJiangPingZhi','ZYWIN']
    _data = hdlist
    if len(_data) == 0:
        return
    
    _taskTypeArr = []
    _needChk = 1
    for task in _data:
        for k,v in task['tasklistData'].items():
            if v['tasktype'] in _eventTypeList:
                if 'userData' in v:
                    _needChk = 0
                    continue
                
                #如果是需要检测的类型
                _taskTypeArr.append(v)
                
    if len(_taskTypeArr) == 0:
        return
    
    gud = g.getGud(uid)
    for v in _taskTypeArr:
        ttype = v['tasktype']
        #print 'ttype=========',ttype
        '''if ttype in ['TFQXGK','TFQXC']:
            #讨伐群雄章节
            _maxId = g.m.tfqxfun.getMyTfqxMaxId(uid)
            g.event.emit("tfqxfightwin",uid,"TFQXGK",int(_maxId))'''
        if ttype == 'SBNUM':
            #神兵数量
            _count = g.mdb.count('shenbing',{'uid':uid})
            checkModifyUserData(uid, 'SBNUM', _count)
        elif ttype == 'MJNUM':
            _count = g.m.shenbingfun.getMingJiangNumByLv(uid,0)
            checkModifyUserData(uid, 'MJNUM', _count)
        elif ttype == 'JLNUM':
            #将领数量
            _count = g.mdb.count('hero',{'uid':uid})
            checkModifyUserData(uid, 'JLNUM', _count)
        elif ttype == 'LCCL':
            #print 'LCCL==============',gud['lclimit']
            #粮草参量
            checkModifyUserData(uid,'LCCL', gud['lclimit'])
        elif ttype == 'YBCL':
            #print 'YBCL==============',gud['yblimit']
            #银币产量
            checkModifyUserData(uid,'YBCL', gud['yblimit'])
        elif ttype == 'HeroBiaoQian':
            #将领标签
            checkModifyUserData(uid,'HeroBiaoQian',0)
        elif ttype == 'BZKJLvNum':
            #兵种科技
            checkModifyUserData(uid,'BZKJLvNum')
        elif ttype == 'QiShiLv':
            #气势等级
            _qishi = g.m.qishifun.getQishiLv(uid)
            checkModifyUserData(uid,'QiShiLv',_qishi)
        elif ttype == 'HeroGroupNumByStep':
            #战国策等阶数量
            checkModifyUserData(uid,'HeroGroupNumByStep')
        elif ttype == 'ShenBingNumByDJ':
            #神兵等阶数量
            checkModifyUserData(uid,'ShenBingNumByDJ')
        elif ttype == 'MJNumByLv':
            #名将等级数量
            checkModifyUserData(uid,'MJNumByLv')
        elif ttype == 'JLSJNUM':
            #将领等级数量
            _count = g.mdb.count('hero',{'uid':uid,'lv':{'$gte':v['taskdata'][1]}})
            checkModifyUserData(uid, 'JLSJNUM', {'num':_count,'lv':200})
        elif ttype == 'ZXNX':
            #将领星级数量
            _count = g.mdb.count('hero',{'uid':uid,'star':{'$gte':v['taskdata'][1]}})
            checkModifyUserData(uid, 'ZXNX', _count)
        elif ttype == 'WuJiangPingZhi':
            #武将品质数量
            _count = g.mdb.count('hero',{'uid':uid,'pinzhi':{'$gte':v['taskdata'][1]}})
            checkModifyUserData(uid, 'WuJiangPingZhi', _count)
        elif ttype == 'ZYWIN':
            # 战役通关章节
            _zhanyi = v['taskdata']
            _num = g.mdb.count('zhanyi', {'star.{0}'.format(_zhanyi): {'$exists': 1}, 'uid': uid})
            if _num:
                checkModifyUserData(uid, 'ZYWIN', _zhanyi)
            
    return 1

#检查是否有任务完成
def checkModifyUserData(uid,eventType,data=0,isinc=1):
    eventType = str(eventType)
    #2017-6-20 增加类型逻辑
    _taskListRss = getCurrTaskList(uid,where={'ctype':{'$ne':0}},fillUserData=True)
    for _taskInfo in _taskListRss:
        _groupNmae = _taskInfo['groupname']
        taskListData = _taskInfo['tasklistData']

        for _taskid,_task in taskListData.items():
            if _task['tasktype']!=eventType:continue
            
            #修改记录值
            if 'userData' in _task : 
                _userData = _task['userData']
            else:
                _userData = g.C.dcopy(_defaltUserData)
                
            #如果已经结束了的任务
            if "finish" in _userData : continue
            
            if g.m.taskfun._checkHeroNumByCond(eventType, uid, 0,onlyCheckEventType=True):
                #如果eventType是英雄相关的key，则特殊处理
                _chkVal = _task['taskdata'][1]
                num = g.m.taskfun._checkHeroNumByCond(eventType, uid, _chkVal)
                _userData['val'] = num
            elif eventType in []:#g.m.taskfun._needCheckGudKeys:
                #如果是attrChange中需要检测的keys，如：lv,opencityid 等
                num = data['newAttr'][eventType]
                _userData['val'] = num
            elif eventType == 'FIGHTWIN':
                #战胜
                _taskData = _task['taskdata']
                if str(_taskData['fightid']) == str(data['fightid']):
                    _userData['val'] += 1
            elif eventType == 'MeiRiHaoLi':
                #每日好礼：当天上线就能领取，不上线后错过
                _sDate = g.C.getDate( _taskInfo['startShowTime'] ) #活动开始显示的时间
                _nDate = g.C.getDate()#今天
                _diffDay = g.C.dataDiff(_sDate,_nDate,'d') #天数差
                
                if int(_task['taskdata']) < int(_diffDay):
                    _userData['otime']  = 1 #设置已过期标志
                
                if int(_task['taskdata']) == int(_diffDay):
                    _userData['val'] += 1 
                else:
                    _userData['val'] = 0
                    
            elif eventType == 'LeiJiDengLu':
                #累计登陆：天数累加，错过后领取上一天的奖励
                sumLoginData = _getSumLoginDay(uid,"LeiJiDengLu_"+ str(_task['taskgroupid']))
                #if str(_task['taskdata']) == str(sumLoginData['v']):
                _userData['val'] = sumLoginData['v']
            elif eventType in ['TFQXC', 'JRSL', 'HGGZ', 'LCCL', 'YBCL']:
                # 直接修改数据类
                _userData['val'] = data
            elif eventType == 'TXBWMAX':
                # 天下比武
                if data > _task['taskdata']:
                    continue
                _userData['val'] = 1
            elif eventType == 'JHPZNUM':
                # 剑魂品质任务
                _tmpNum = len([tmp for tmp in data if int(tmp) >= int(_task['taskdata'][1])])
                if _tmpNum <= 0:
                    continue
                _userData['val'] += _tmpNum
            elif eventType == 'JLSJNUM':
                # 将领等级任务
                if data['lv'] < _task['taskdata'][1]:
                    continue
                _userData['val'] += data['num']
            elif eventType == 'ShiLiJunXian':
                #势力军衔任务
                _userData['val'] = data
            elif eventType == 'BZKJLvNum':
                #势力科技等级数量
                _chkLv = _task['taskdata'][1]
                _num = g.m.bzkjfun.chkNumByLv(uid,_chkLv)
                _userData['val'] = _num
            elif eventType == 'HeroGroupNumByStep':
                #战国策组合等阶数量统计
                _chkStep = _task['taskdata'][1]
                _num = g.m.herogroupfun.chkHeroGroupNumByStep(uid,_chkStep)
                _userData['val'] = _num
            elif eventType == 'ShenBingNumByDJ':
                #统计神兵数量
                _chkDJ = _task['taskdata'][1]
                _num = g.m.shenbingfun.getSBNumByDj(uid,_chkDJ)
                _userData['val'] = _num
            elif eventType == 'MJNumByLv':
                _chkLv = _task['taskdata'][1]
                _num = g.m.shenbingfun.getMingJiangNumByLv(uid,_chkLv)
                _userData['val'] = _num
            elif eventType == 'ZYWIN':
                _chkVal = _task['taskdata']
                if _chkVal == data:
                    _userData['val'] = 1
            else:
                #默认直接+data
                if isinc:
                    _userData['val'] += data
                else:
                    _userData['val'] = data

            if _userData['val']>_task['pval']:
                _userData['val'] = _task['pval']
            
            _task['userData'] = _userData
            if _userData['val'] >= _task['pval']:
                g.event.emit("oncetaskovered",uid,_task)
                
            if _taskInfo['ctype'] == 2:
                setUserDataByHdTask(uid, _task['taskgroupid'], _taskid, _groupNmae,_userData)
            else:
                setUserData(uid, _task['taskgroupid'], _taskid, _userData)

#获取在taskKey这个活动中，已经连续登陆天数
def _getSumLoginDay(uid,taskKey,updateDays=True):
    _w = {"uid":uid,"ctype":taskKey}
    attr = g.getAttrOne(uid, _w ,'v,lasttime')
    if attr==None:
        attr = {"v":0,"lasttime":946656000} #2000-1-1
    
    _sameDay = g.C.chkSameDate(g.C.NOW(),int(attr["lasttime"]),0)

    if updateDays and not _sameDay:
        attr = {"v":attr["v"]+1,"lasttime":g.C.NOW()}
        g.setAttr(uid, _w, attr)
    
    return attr   


#等级变化时，是否需要触发新的任务
def checkNewTaskWhenLvChange(uid,oldAttr,newAttr):
    if 'lv' not in newAttr:
        return 
    
    currGroupList = None
    groupConf = getOnceTaskGroupConf()
    for groupid,group in groupConf.items():
        if 'logicstarttime' in group and group['logicstarttime']['cond'] == 'lv=':
            _needLv = group['logicstarttime']['val'] #需要的等级
            if newAttr['lv'] >= _needLv:
                
                #取出当前已有的任务
                if currGroupList==None:
                    currGroupList = []
                    #currList = getCurrTaskList(uid,delTaskListData=True,showOrLogic='show') #错误，不能排查掉过期的任务
                    currList = g.mdb.find('oncetaskinfo',{"uid":uid},fields=['_id','taskgroupid']) #取出所有任务列表，哪怕已经过期的任务
                    
                    for gp in currList:
                        currGroupList.append(gp['taskgroupid'])  
                    
                if groupid in currGroupList:continue
                
                currGroupList.append(str(groupid))
                fmtOneTask(group,uid=uid,insert=True)
   
#将领变更事件
def onHeroChange(uid,eventType):
    eventType = str(eventType)
    _needCheck = g.m.taskfun._checkHeroNumByCond(eventType, uid, 0,onlyCheckEventType=True)
    if _needCheck : 
        return checkModifyUserData(uid, eventType)


def onTaskCondChange(uid,eventType,num):
    return checkModifyUserData(uid,eventType,num)

#接受属性改变事件
def onAttrChange(uid,oldAttr,newAttr):
    _keys = g.m.taskfun._needCheckGudKeys
    for _k in _keys:
        if _k == 'lv':
            checkNewTaskWhenLvChange(uid,oldAttr,newAttr)
        if _k in newAttr:
            checkModifyUserData(uid, _k,{"oldAttr":oldAttr,"newAttr":newAttr})

def onFightWin(uid,ftype,winnum,*args, **kwargs):
    if ftype=='GuDingRenWu':
        return checkModifyUserData(uid,'FIGHTWIN',{"winnum":1,"fightid":kwargs["fightid"],"ftype":ftype})
    else:
        return checkModifyUserData(uid,ftype,winnum)

def onGetOnceTask(uid):
    checkModifyUserData(uid,'MeiRiHaoLi')
    checkModifyUserData(uid,'LeiJiDengLu')

def onPKJiFenChange(uid,newScore,changeScore):
    checkModifyUserData(uid,'BiWuJiFen',changeScore)

def onFightCityKill(uid,killnum):
    checkModifyUserData(uid,'GuoZhanShaDi',killnum)
    
#充值成功事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    checkModifyUserData(uid,'RenYiChongZhi',1)
    checkModifyUserData(uid,'LeiJiChongZhi',int(money))

def onShiJiBuy(uid,buyType,buyNum):
    buyTypeConf = {
        "1":"GouMaiJinBi",
        "2":"GouMaiLiangCao"
    }
    if buyType in buyTypeConf:
        checkModifyUserData(uid, buyTypeConf[buyType] ,1)

# 封地产量变化
def onFDCLChange(uid, eventType, nvaldata):
    # 粮草产量变化
    ftype = 'liangcao'
    lcnval = nvaldata.get(ftype) or g.m.fengdifun.getZyPro(uid, ftype)
    checkModifyUserData(uid,'LCCL', lcnval)

    # 金币产量变化
    ftype = 'yinbi'
    ybnval = nvaldata.get(ftype) or g.m.fengdifun.getZyPro(uid, ftype)
    checkModifyUserData(uid,'YBCL', ybnval)

# 获得太守职位任务
def onGetTaishou(uid, eventType, data, *args, **kwargs):
    if eventType == 'PVTAISHOU':
        checkModifyUserData(uid, 'PVTSWIN', data)

# 拥有将领数量
def onHeroNum(uid, eventType, data):
    if eventType == 'FZTL':
        checkModifyUserData(uid, 'JLNUM', data)

# 讨伐群雄章节
def onTFQXChapter(uid, eventType, data):
    if eventType == 'TFQXGK':
        checkModifyUserData(uid, 'TFQXC', data)
    
    

# 激活名将事件
def onActiveMJ(uid):
    checkModifyUserData(uid, 'MJNUM', 1)
    
# 获取神兵任务, 默认发一把神兵，如果需要一次发多把神兵需要添加数量
def onGetShenbin(uid):
    checkModifyUserData(uid, 'SBNUM', 1)

# 获取剑魂任务
def onGetJianhun(uid, *args, **kwargs):
    _data = kwargs['data']
    if isinstance(_data, dict):
        _data = _data.values()
    _dataNum = len(_data)
    _colorList = [tmp['color'] for tmp in _data]
    checkModifyUserData(uid, 'JHNUM', _dataNum)
    # 剑魂品质任务
    checkModifyUserData(uid, 'JHPZNUM', _colorList)

# 经典战役任务
def onCpzzFight(uid, eventType, data):
    if eventType == 'JDZY':
        checkModifyUserData(uid, 'CPZZNUM', data)

# 封地开垦任务
def onFengDi(uid, eventType, data):
    if eventType == 'FDKK':
        checkModifyUserData(uid, 'FDNUM', data)

# 加官进爵任务
def onGuanzhiUp(uid, eventType, data):
    if eventType == 'SGFC':
        checkModifyUserData(uid, 'HGGZ', data)

# 穿戴宝物数量任务
def onWearBaowu(uid, eventType, data):
    if eventType == 'ADDFB':
        checkModifyUserData(uid, 'BWNUM', data)

# 对应等级将领数量任务
def onShengjiHero(uid, num, *args, **kwargs):
    if 'num' not in kwargs:
        kwargs['num'] = 1
    checkModifyUserData(uid, 'JLSJNUM', kwargs)

# 战国策激活任务
def onZGCJihuo(uid):
    checkModifyUserData(uid, 'ZGCNUM', 1)

# 天下比武历史最高排名
def onTXBWBestRank(uid, eventType, data):
    if eventType == 'TXBWTOP':
        checkModifyUserData(uid, 'TXBWMAX', data)
    
#添加新将领
def onChangeHeroAdd(uid,eventType,heroData):
    checkModifyUserData(uid,'HeroBiaoQian',heroData)
    
#讨伐义渠击杀玩家事件
def onTFYQKillArmy(uid,data):
    checkModifyUserData(uid,'TFYQKillNum',data)
    
#势力捐献
def onChangeShiLiJuanXian(uid,data):
    checkModifyUserData(uid,'ShiLiJuanXian',data)

# 加入或创建势力
def onSLChange(uid, eventType, data):
    checkModifyUserData(uid, 'JRSL', int(bool(data)))

# 势力军衔提升
def onShiliJunxianLv(uid, *args, **kwargs):
    _num = g.m.shilijunxian.getMyJxLv(uid)
    checkModifyUserData(uid,'ShiLiJunXian',_num)
    
# 兵种科技拥有多少级的多少个
def onBzkjLvNum(uid, *args, **kwargs):
    checkModifyUserData(uid,'BZKJLvNum')
    
# 气势达到多少级
def onQishiLvChange(uid, *args, **kwargs):
    _qishi = g.m.qishifun.getQishiLv(uid)
    checkModifyUserData(uid,'QiShiLv',_qishi)
    
# 粮草消耗多少
def onUseLiangcao(uid, liangcao, *args, **kwargs):
    checkModifyUserData(uid,'UseLiangCao',liangcao)
    
# 征讨匈奴总战斗次数
def onZTXNFightNum(uid, difficulty, *args, **kwargs):
    checkModifyUserData(uid,'ZTXNFightNum',1)
    
# 精铁消耗总量
def onUseJingtie(uid, jingtie, *args, **kwargs):
    checkModifyUserData(uid,'UseJingTie',jingtie)
    
# 金币消耗总量
def onUseJinbi(uid, jinbi, *args, **kwargs):
    checkModifyUserData(uid,'UseJinBi', jinbi)
    
# 虎符消耗总量
def onUseHufu(uid, hufunum, *args, **kwargs):
    checkModifyUserData(uid,'UseHuFu',abs(hufunum))
    
# 统计多少阶的战国策组合多少个
def onHeroGroupNumByStep(uid, *args, **kwargs):
    checkModifyUserData(uid,'HeroGroupNumByStep')
    
# 神兵激活
def onShenbingLvUp(uid, *args, **kwargs):
    checkModifyUserData(uid,'ShenBingNumByDJ')
    
# 名将升级
def onMingjiangLvUp(uid, *args, **kwargs):
    checkModifyUserData(uid,'MJNumByLv')
    
#对应战斗的胜利场次
def onFightWinNum(uid,ftype,data, *args, **kwargs):
    _key = ftype + 'WinNum'
    checkModifyUserData(uid,_key,data)

# 幸运夺宝抽取多少次
def onXydbPrize(uid, num, *args, **kwargs):
    checkModifyUserData(uid, 'XYDBNUM', num)

# 战役通关进度
def onZhanyiWin(uid, guanqia, difficulty):
    checkModifyUserData(uid, 'ZYWIN', guanqia)

# 掠夺多少次
@g.event.on('lueduo_change')
def onLueDuoNum(uid, *args, **kwargs):
    ctype = 'lueduo_pknum'
    val = g.m.statfun.getMyStat(uid, ctype)
    checkModifyUserData(uid, 'lueduonum', val, isinc=0)

# 掠夺多少资源
@g.event.on('lueduo_change')
def onLueDuoZiyuan(uid, *args, **kwargs):
    for key in ('yinbi','liangcao', 'jingtie'):
        ctype = 'lueduo_prize_{0}'.format(key)
        val = g.m.statfun.getMyStat(uid, ctype)
        checkModifyUserData(uid,'lueduo_{0}'.format(key), val, isinc=0)

# 注册事件 - 修改属性
#g.event.on("altattr",onAttrChange)
# 注册事件 - 战斗胜利
g.event.on("fightwin",onFightWin)
#监听将领变更事件
g.event.on("herochange",onHeroChange)
#监听任务条件改变事件
g.event.on("taskcondchange",onTaskCondChange)
#客户端试图拉取任务信息，需要计算每日好礼和累计登陆数据
g.event.on("getOnceTask",onGetOnceTask)
#天下比武积分变化
g.event.on("pkjifenchange",onPKJiFenChange)
#城战杀敌
g.event.on("fightCityKill",onFightCityKill)
#监听充值成功事件
g.event.on("chongzhi",onChongzhiSuccess)
#实际购买资源
g.event.on("shijibuy",onShiJiBuy)

# 获得太守任务
g.event.on("fightwin", onGetTaishou)
# 拥有将领任务
g.event.on("taskcondchange", onHeroNum)
# 讨伐群雄任务
g.event.on("tfqxfightwin", onTFQXChapter)
# 激活名将
g.event.on('mingjiang_jihuo', onActiveMJ)
# 获取神兵任务
g.event.on('shenbing_jihuo', onGetShenbin)
# 获取剑魂任务
g.event.on('jianhun_jihuo', onGetJianhun)
# 经典战役任务
g.event.on('taskcondchange', onCpzzFight)
# 开垦土地
g.event.on('fdkaikeng', onFengDi)
# 加官进爵
g.event.on('taskcondchange',onGuanzhiUp)
# 宝物任务
g.event.on('addfabao', onWearBaowu)
# 多少级英雄多少个任务
g.event.on("herolvup",onShengjiHero)
# 战国策组合任务
g.event.on('herogoup_stepup', onZGCJihuo)
# 天下比武历史战绩
g.event.on("txbwtoprank", onTXBWBestRank)
# 势力变更事件
g.event.on('slchange', onSLChange)
#添加武将事件
g.event.on("addhero",onChangeHeroAdd)
#讨伐义渠击杀事件
g.event.on("fightTfyqKill",onTFYQKillArmy)
# 势力捐献
g.event.on('shili_juanxian', onChangeShiLiJuanXian)
# 势力军衔提升
g.event.on('shili_junxianlvup', onShiliJunxianLv)
# 兵种科技多少级多少个
g.event.on('bingzhongkeji_change', onBzkjLvNum)
# 气势达到多少级
g.event.on('qslv_change', onQishiLvChange)
# 监听粮草变化事件
g.event.on("onuseliangcao", onUseLiangcao)
# 监听征讨匈奴挑战次数事件
g.event.on("onztxnfightnum", onZTXNFightNum)
# 监听精铁变化事件
g.event.on("onusejingtie", onUseJingtie)
# 监听金币变化事件
g.event.on("onusejinbi", onUseJinbi)
# 监听虎符消耗事件
g.event.on("onusehufu", onUseHufu)
# 战国策激活、提升
g.event.on('herogoup_stepup', onHeroGroupNumByStep)
# 神兵统计多少阶多少把
g.event.on('shenbing_lvup', onShenbingLvUp)
# 升级名将
g.event.on('mingjiang_lvup', onMingjiangLvUp)
#战斗类型胜利
g.event.on('fightwin',onFightWinNum)
# 幸运夺宝抽取次数
g.event.on('xydb_getprize', onXydbPrize)
# 战役关卡胜利事件
g.event.on('pvzhanyi_win', onZhanyiWin)

if __name__=="__main__":
    uid = g.buid('lzl111')
    getCurrTaskList(uid)
    checkModifyUserData(uid,'JIAOFEI',1)
    #print getCurrTaskList(uid,ctype=2)
    #print g.minjson.write(getCurrTaskList(uid,fillUserData=True))
    #checkNewTaskWhenLvChange(uid, {'lv':10}, {'lv':35})
    #checkNewTaskWhenLvChange(uid, {'lv':10}, {'lv':35})
    #print getCurrTaskList(uid,delTaskListData=True,showOrLogic='show')
    #g.event.emit('fightwin',uid,'GuDingRenWu',1,fightid="100050")
    #getFinishedNums(uid, "10")
    #print _getSumLoginDay(uid, "oncetaskxxx")
    #onGetOnceTask(uid)
    #initOpenAreaConf()
    #onAttrChange(uid, {},{'lv':40})
    checkModifyUserData(uid,'ZXNX',2)
    #setUserData(uid, '1', '100', {"val":0,"got":1})
    #print g.m.minjson.write(getCurrTaskList(uid,fillUserData=True))
    #print getUserData(uid,"1","100")
    #print g.m.oncetaskfun.getCurrTaskList('SYSTEM',fillUserData=False)