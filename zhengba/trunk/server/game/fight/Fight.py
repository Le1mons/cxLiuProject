#!/usr/bin/python
#coding:utf-8
from __future__ import division
#用于/相除的时候,保留真实结果.小数

#战斗类
import sys,gc
if __name__ == "__main__":
    sys.path.append("..")

import g,event,Buff
import random,string,time,json,uuid,sys,copy
import FightRole,FightArtifact,FightRole_MoWang,FightPet

FightEvent = g.Const()
FightEvent.reduceBuffTurn = "reduceBuffTurn" #减buff回合数事件
FightEvent.buffTurnChange = "buffTurnChange" #某个buff的回合数发生了变化
FightEvent.buffEnd = "buffEnd" #某个buff的回合数结束被删除

FightEvent.reducePassiveSkillTurn = "reducePassiveSkillTurn" #减被动技能回合数事件
FightEvent.passiveSkillTurnChange = "passiveSkillTurnChange" #某个被动技能的回合数发生了变化
FightEvent.passiveSkillEnd = "passiveSkillEnd" #某个被动技能的回合数结束被删除

FightEvent.doAtk = "doAtk" #攻击时 {"from":fromRole,"to":[toRole],"atkType":""}
FightEvent.byAtk = "byAtk" #被攻击事件时 {"from":fromRole,"to":toRole,"atkType":""}
FightEvent.baoJi = "baoJi" #暴击事件时 {"from":fromRole,"to":toRole,"atkType":""}
FightEvent.byBaoJi = "byBaoJi" #被暴击事件时 {"from":fromRole,"to":toRole,"atkType":""}
FightEvent.byDead = "byDead" #死亡时(无论是否会复活都触发){"to":deadRole}
FightEvent.byRealDead = "byRealDead" #死亡且不会复活时触发{"to":deadRole}
FightEvent.hpChange = "hpChange" #血量改变时 {"to":role,"addnum":addnum}
FightEvent.nuQiChange = "nuqiChange" #怒气变化时 {"to":role,"addnum":addnum}
FightEvent.geDang = "geDang" #格挡时 {"from":fromRole,"to":toRole,"atkType":atkType}
FightEvent.roleInit = "roleInit" #角色初始化完成 {"to":role}
FightEvent.byGeDang = "byGeDang" #被格挡时 {"from":fromRole,"to":toRole,"atkType":atkType}

FightEvent.addShenQiNuQiByTurn = "addShenQiNuQiByTurn" #回合数导致神器怒气变化
FightEvent.addShenQiNuQiByXPSkill = "addShenQiNuQiByXPSkill" #xp技能导致神器怒气变化
FightEvent.shenQiAtk = "shenQiAtk" #到了神器出手时机事件
FightEvent.roundStart = "roundStart" #回合开始时事件
FightEvent.deadOver = "deadOver" #死亡结束事件
FightEvent.roundEnd = "roundEnd" #回合结束时事件
FightEvent.getBuff = "getBuff" # zhongle buff

FightEvent.fightEnd = "fightEnd" #战斗结束时

def deepCopy(src):
    if isinstance(src, dict):
        dst = {}
        for k,v in src.items():
            dst[k] = deepCopy(v)
        return dst
 
    elif isinstance(src, (list, tuple)):
        dst = []
        for i in src:
            dst.append(deepCopy(i))
        return dst
    else:
        return src

class Fight(object):
    index = 0
    def __init__ (self,ftype):
        self.fid = "fight_"+ str(Fight.index)       #唯一标号
        Fight.index+=1 
        
        self.debug = False
        self.ftype = ftype                          #战斗类型
        self.ctime = time.time()                    #创建时间
        self.turn = 0                               #当前回合数
        self.maxTurn = 15 if ftype != 'pvp' else 30 #上限回合数
        self.roles = []                             #战斗对象数据集合
        self.artifaces = []                         #战斗神器数据集合
        self.pets = []                              #宠物数据集合
        self.reserveidx = 0
        self.toshowrole = []                        # 敌方显示的角色
        self.inited = False                         #是否已初始化
        self.started = False                        #是否已开始
        self.overed = False                         #是否已结束
        self.delayBuff = {}                         # 记录延迟触发的buff
        
        self.event = event.EventEmitter() 
        
        self.actionLog = []
        self.allLog = []
        self._tmpLog = {}                           #日志暂存区
        
        self._rolesInfo = {}                        #玩家战前信息，用于返回给客户端
        self.turnDps = {}                           # 记录出手总伤害
        self.winside = None                         # 哪边胜利
        self.tmpLogKey = None
        self.deadorder = 0                          # 死亡人数(顺序) 以此排序上阵援军

    def clear(self):
        for role in self.roles:
            role.clear()
        
        for artiface in self.artifaces:
            artiface.clear()        
           
        self.event.off_all()
        
        del self.actionLog
        del self.allLog
        del self._tmpLog
        del self._rolesInfo
        del self

    def log(self,*msg):
        if not self.debug:return
        
        print '------------------------------'
        for m in msg:
            if type(m) == type(''):
                print m.decode('utf-8').encode(sys.getfilesystemencoding())
            else:
                print m
        print '============================'
    
    #控制输出给客户端的日志记录
    def roleActionStart(self,role=None):
        self.actionLog = []
        if role:
            self.addActionLog({"act":"startAct","from":role.rid})
            
    def addActionLog(self,data):
        
        if self.tmpLogKey != None:
            self.tmpLog(self.tmpLogKey,data )
            return
        
        if type(data) == type([]):
            self.actionLog += data
        else:
            self.actionLog.append(data)
        
    def roleActionStop(self,role=None):
        if role:
            self.addActionLog({"act":"stopAct","from":role.rid}) 
            
        self.allLog += (self.actionLog)
    
    def tmpLog(self,key,data=None):
        if data == None:
            v = self._tmpLog.get(key,[])
            if key in self._tmpLog:
                del self._tmpLog[key]
            return v
        else:
            if key not in self._tmpLog:
                self._tmpLog[key] = []
            self._tmpLog[key].append(data)
            
    def addActionLogFromTmp(self,key):
        log = self.tmpLog(key)
        self.tmpLogKey = None
        if len(log)>0:
            self.addActionLog(log)
    #//控制输出给客户端的日志记录


    #打印战斗对象数据
    def dumpRole (self,roles=None):
        if roles==None:
            roles = self.roles
        for role in roles:
            print str(role)
    
    #获取技能配置
    def getSkill (self,skillid,copy=True):
        v = g.GC.getConfig('skill',False)[str(skillid)]
        if copy:
            return deepCopy(v)
        else:
            return v

    def getBuff (self,buffid,copy=True):
        v = g.GC.getConfig('buff',False)[str(buffid)]
        if copy:
            return deepCopy(v)
        else:
            return v
    
    #skill_afteratk中配置的2类技能 skilldpspro 和 dpspro，只对当次攻击生效
    #本质上说，应该理解为：攻击前技能
    def isBeforeAtkSkill(self,skillid):
        conf = self.getSkill(skillid,copy=False)
        if conf['act'] in ['skilldpspro','dpspro', "modifyattr"]:

            return True
        return False
        
    #增加一个战斗对象
    def addRole (self,role):
        self.roles.append(role)
    
    #增加一个神器
    def addArtifact(self,role):
        self.artifaces.append(role)

    #增加一个神器
    def addPet(self,role):
        self.pets.append(role)
    
    #通过一个过滤function获取角色集合
    def getRolesByFilter (self,fun):
        _roles = []
        for role in self.roles:
            if fun(role):
                _roles.append(role)
        return _roles
    
    #通过kv字典获取角色集合，如：getRolesByKV({"side":1,"pos":2})
    def getRolesByKV (self,kv):
        _roles = []
        for role in self.roles:
            _ne = 0 #不相等字段数
            for k,v in kv.items():
                if role.data[k] != v:
                    _ne+=1
                    break

            if _ne==0:
                _roles.append( role )

        return _roles

    #通过数据初始化战斗
    def initFightByData (self,roleDatas):
        #空方法，用于继承新战斗类型的实例化逻辑方法
        self.fmtFightDataApi(roleDatas)
        for rd in roleDatas:
            if 'mowangtype' in rd:
                #神殿魔王功能里的魔王和爪牙 mowangtype=1=boss mowangtype=2=爪牙
                _role = FightRole_MoWang.FightRole_MoWang(self)
                _role.setAttr('lockHP', rd.get('lockHP', True))
                _role.initRoleByData(rd)
                self.addRole(_role)    
            elif 'hid' in rd:
                #普通的英雄
                _role = FightRole.FightRole(self)
                _role.initRoleByData(rd)
                self.addRole(_role)
            elif 'sqid' in rd:
                #神器
                _role = FightArtifact.FightArtifact(self)
                _role.initRoleByData(rd)
                self.addArtifact(_role)
            elif 'pid' in rd:
                #宠物
                _role = FightPet.FightPet(self)
                _role.initRoleByData(rd)
                self.addPet(_role)
                
        self.f5PosInfo()
        
        #广播初始化事件
        for role in self.roles:
            self.event.emit( FightEvent.roleInit, {"to":role})
        for role in self.artifaces:
            self.event.emit( FightEvent.roleInit, {"to":role})        
        
        for role in self.roles:
            self._rolesInfo[ role.rid ] = deepCopy(role.data)
        for role in self.artifaces:
            self._rolesInfo[ role.rid ] = deepCopy(role.data)        

        self.inited = True

        return self
    
    #实例化各种不同战斗类型的接口
    def fmtFightDataApi(self,roledata):
        pass
    
    #格式化返回数据
    def fmtFightResApi(self,data):
        pass
    
    def _cmp(self,a,b):
        #升序排列handle
        v = cmp(a,b)
        if v==0:
            v = random.sample([1,-1], 1)[0] #相等时随机排序
        return v
    
    #roles按key排序，返回新数组，并不会修改原roles，desc=是否降序
    def orderRoles (self,key,desc=False,targets=None):
        if targets == None:
            targets = self.roles
        
        if key=='_hpper':
            #血量百分比，特殊处理一下
            for t in targets:
                t.data['_hpper'] = t.data['hp'] / t.data['maxhp']
        # 如果有指定排序的选敌
        if len(key.split("-")) > 1:
            key = key.split("-")[0]

        try:
            if desc:
                return sorted(targets,cmp = lambda r1,r2: self._cmp(r2.data[key],r1.data[key]))
            else:
                return sorted(targets,cmp = lambda r1,r2: self._cmp(r1.data[key],r2.data[key]))
        except:
            print 11111

    #战前逻辑
    def beforeStart (self):
        self.log('beforeStart...')
        pass
    
    #刷新位置信息，用于设定当前处于前排后排属性
    #当有角色死亡/复活，中途加入等事件时，需要调用该方法重算    
    def f5PosInfo(self):
        #刷新位置信息
        _frontNums = [0,0]
        _backNums = [0,0]      
        
        for role in self.roles:
            #根据pos判断前后排
            if int(role.data['pos']) in [1,2]:
                if not role.isDead():
                    _frontNums[ role.data['side'] ]+=1
                role.data['isFront'] = True
                role.data['isBack'] = False
            else:
                if not role.isDead():
                    _backNums[ role.data['side'] ] += 1
                role.data['isFront'] = False
                role.data['isBack'] = True
        
        for role in self.roles:
            #如果前/后排没人的话，既是前排又是后排
            if int(role.data['pos']) in [1,2]:
                if _backNums[ role.data['side'] ]==0:
                    role.data['isBack'] = True
            else:
                if _frontNums[ role.data['side'] ]==0:
                    role.data['isFront'] = True             
    
    #开始战斗
    def start (self):
        if not self.inited:
            raise RuntimeError('need initFightByData before start')
        if self.started:
            raise RuntimeError('started')
      
        self.beforeStart()
        
        #循环直到战斗结束
        while not self.overed:
            self.turnRound()
        
        res = {
            "roles" : self._rolesInfo,
            "fightlog" : self.allLog,
            "winside" : self.winside
        }
        #格式化不同数据的返回值
        self.fmtFightResApi(res)

            
        self.clear()
        #gc.collect()
        return res
    
    def stop (self,winside):
        '''
        -2 回合数上限
        -1 平局
        0/1 = 某side方
        '''
        self.winside = winside
        self.overed = True
        self.log('战斗结束 胜利方：',winside)

        self.roleActionStart()
        self.event.emit( FightEvent.fightEnd, {"winside":winside})
        self.addActionLog({'act':'fightres','v':winside})
        self.roleActionStop()

        self.log('fightStop...')

    #开始一个回合
    def turnRound (self):
        self.turn += 1
        
        self.roleActionStart()
        self.addActionLog({'act':'turn','v':self.turn})
        self.roleActionStop()
        
        #回合数上限
        if self.turn > self.maxTurn:
            self.stop(-2)
            return

        self.log('turn',self.turn)
        

        self.roleActionStart()
        #抛出因回合数变化致使神器加怒气事件
        self.event.emit( FightEvent.addShenQiNuQiByTurn ) 
        #抛出回合数开始事件
        self.event.emit( FightEvent.roundStart, {"turn":self.turn} ) 
        self.roleActionStop()

        # 开始激活延迟buff
        for i in self.delayBuff.get(str(self.turn), []):
            self.roleActionStart()
            Buff.Buff(*i)
            self.roleActionStop()
        
        #判断角色的掉血和恢复
        for idx,role in enumerate(self.roles):
            self.roleActionStart()
            role.checkDiaoXue()
            role.checkHuiFu()
            self.roleActionStop()
        
        self.roleActionStart()
        #广播buff减回合事件
        self.event.emit( FightEvent.reduceBuffTurn )
        #广播被动技能减回合事件
        self.event.emit( FightEvent.reducePassiveSkillTurn )   
        self.roleActionStop()
        
        
        #神器出手事件
        self.event.emit( FightEvent.shenQiAtk )

        # 宠物开始行动   按照驱散 和 速度排序
        # self.pets.sort(key=lambda x:(-x.data['qusan'], x.data['speed']), reverse=True)
        _petQusan0 = []
        _preQusan1 = []
        for pet in self.pets:
            if not pet.data["qusan"]:
                _petQusan0.append(pet)
            else:
                _preQusan1.append(pet)
        _petQusan0.sort(key=lambda x:(x.data['speed']), reverse=True)
        _preQusan1.sort(key=lambda x: (x.data['speed']))
        self.pets = _petQusan0 + _preQusan1


        for pet in self.pets:
            # pos与回合数/4的余数相同
            if (pet.data['pos']!=4 and self.turn % 4 != pet.data['pos']) or (self.turn % 4!=0 and pet.data['pos']==4): continue
            self.roleActionStart()
            pet.atk()
            self.roleActionStop()

        #角色按speed降序，执行行动
        self.roles = self.orderRoles('speed',True)

        for role in self.roles:
            if role.isDead(): continue
            role.startAction()
            self.turnDps.clear()
        
        #判断复活
        for role in self.roles:
            self.roleActionStart()
            role.checkFuHuo()
            self.roleActionStop()

        #抛出回合数结束事件
        self.event.emit( FightEvent.roundEnd, {"turn":self.turn})

        #判断援军
        for role in self.roles:
            # self.roleActionStart()
            role.checkYuanjun()

        self.roleActionStop()
        self.checkEnd()
        return self
    
    #判断是否结束
    def checkEnd(self):
        allNums = [0,0]
        deadNums = [0,0]
        for role in self.roles:
            side = int(role.data['side']) #总数
            allNums[side] += 1
            if role.isDead():
                deadNums[side] += 1 #死亡数
        
        winside = None
        
        # 特殊处理，如果是测试战斗就需要重新刷新对方数据
        if self.ftype == "test" and deadNums[1] >= allNums[1]:
            # try:
            self.initFightByData(self.rolereservedata[self.reserveidx])
            # except:
            #     print self.rolereservedata, self.reserveidx
            self.reserveidx += 1
            self.roleActionStart()
            self.addActionLog({'act': 'replace', 'v': self.toshowrole})
            self.roleActionStop()

        else:
            if deadNums[0] >= allNums[0] and deadNums[1] >= allNums[1]:
                winside = -1 #平局
            elif deadNums[0] >= allNums[0]:
                winside = 1 #side 1获胜
            elif deadNums[1] >= allNums[1]:
                winside = 0 #side 0获胜
        
        if winside!=None:
            self.stop(winside) #结束战斗

    # 选敌逻辑 skill = {"side":x,"islive":y....等，详见getTargetBySkillID中的注释}
    def getTargetByConf(self, actionRole, skill, skillRunAt=None):
        skillside = str(skill.get('side', '2'))

        # 3 默认被动效果作用目标进行选敌（如：暴击攻击4个目标，只有1号目标真的被暴击，则只有1号目标触发效果，skillRunAt从passiveskill中传过来）
        if skillside == '3':
            if skillRunAt == None:
                # raise RuntimeError('skill  has not targetSide3')
                print 'skill  has not targetSide3'
                return []
            if isinstance(skillRunAt, list):
                return skillRunAt
            return [skillRunAt]

        # 返回最后一次攻击我的对象
        if skillside == '2':
            return [actionRole.lastHitBy]

        # 返回自己
        if skillside == '-2':
            return [actionRole]

        #继承上一个技能的选敌
        if skillside == '-3':
            return actionRole.lastAfterAtkTarge

        # 继承选敌
        if skillside == '-1':
            targets = actionRole.lastSkillTarget
            if not targets:
                targets = [skillRunAt]
            # 如果
            if skill['limit'] != "":
                g.C.SHUFFLE(targets)
            return targets

        # 继承选敌并随机n名玩家
        if skillside == '-4':
            targets = actionRole.lastSkillTarget
            if not targets:
                targets = [skillRunAt]
            # 如果
            if skill['limit'] != "":
                g.C.SHUFFLE(targets)
                targets = targets[:int(skill['limit'])]

            return targets

        targetSide = None
        if skillside == '1':
            targetSide = (int(actionRole.data['side']) + 1) % 2  # 计算敌方side
        elif skillside in ('0', '4', "7", "8"):
            targetSide = int(actionRole.data['side'])
        # 与敌方相连
        elif skillside in ('5', '6'):
            targetSide = int(actionRole.data['side'] + 1) % 2 # 获取敌方side
        if targetSide == None:
            raise RuntimeError('skill  has not targetSide')

        targets = []

        skillive = str(skill['islive'])
        skillpos = str(skill['pos'])

        for role in self.roles:
            if str(role.data['side']) != str(targetSide): continue  # 检测位置
            if skillive == '1' and role.isDead(): continue  # 检测生存状态
            if skillive == '0' and role.data['dead'] == False: continue
            if not role.data['ready']: continue

            # 检测位置
            if (skillpos == '0') or (skillpos == '1' and role.isFront()) or (skillpos == '2' and role.isBack()):
                targets.append(role)

        # 如果没有目标，则直接返回
        if len(targets) == 0: return targets

        order = skill['order']
        if order == 'rand':
            random.shuffle(targets)
        elif order != "":
            orderby = order.split(',')
            _key = orderby[0]

            targets = self.orderRoles(orderby[0], orderby[1] == 'desc', targets=targets)
            # 如果是有指定位置的选敌 比如speed_0 speed_1 速度第一名 速度第二名
            if len(_key.split("-")) > 1:
                _key = _key.split("-")
                _idx = int(_key[1])
                # 说明位置无法选敌
                if _idx >= len(targets):
                    return targets
                else:
                    targets = [targets[_idx]]
        # 如果是羁绊类型踢掉自己
        if skillside in ('4', '8', ):
            targets = filter(lambda x: x != actionRole, targets)

        # 检查有debuff的role
        if skillside == '6':
            targets2 = []
            for role in targets:
                if role == actionRole:
                    continue
                # 获取有异常buff的role
                for bufftype, info in role.buff.items():
                    if not info:
                        continue
                    _con = role.fight.getBuff(bufftype)
                    if _con["gtype"] == "2":
                        targets2.append(role)
                        break
            if targets2:
                random.shuffle(targets2)
                targets = targets2

        # 检查相邻的role
        if skillside == '7':
            targets2 = []
            _chkPos = ("1", "2", "3", "4", "5", "6",)
            _roleDict = {str(role.data["pos"]):role for role in targets}
            _myPos = actionRole.data["pos"]
            n = 1
            while n < 6:
                _pos1 = str(int(_myPos) - n)
                _pos2 = str(int(_myPos) + n)
                if _pos1 in _roleDict:
                    targets2.append(_roleDict[_pos1])
                if _pos2 in _roleDict:
                    targets2.append(_roleDict[_pos2])
                # 不过参数超过判断
                if _pos1 not in _chkPos and _pos2 not in _chkPos:
                    break
                n += 1
            targets = targets2

        # 切片，取前limit个
        if skill['limit'] != "":
            targets = targets[:int(skill['limit'])]

        # 如果是羁绊类型就把自己添加进去
        if skillside in ('4', '5'):
            targets.insert(0, actionRole)

        # 检查有debuff的role


        return targets
    
    def getTargetBySkillID (self,actionRole,skillid,skillRunAt=None):
        '''
        skill配置中
        side=选择哪一方的role
        -1=不选敌，默认攻击动作选敌
        -2=自己
        0=我方
        1=敌方

        islive=是否或者
        1=是
        0=否

        pos=位置
        0=不限制
        1=前排
        2=后排

        order=排序条件，如：hp,desc   atk,asc    rand,speed
        limit=选敌数量
        '''
        skillidStr =str(skillid)
        #print 'getTargetBySkillID',skillid

        #if skillidStr not in g.GC.skill:
        #    raise RuntimeError('skill '+ skillidStr +' not in skilljson')
        
        skill = self.getSkill(skillidStr,copy=False)


        return self.getTargetByConf(actionRole,skill,skillRunAt)

    
    def ifZhongZuKeZhi(self,fromRole,toRole):
        '''
        1=亡灵 克制 奥数2
        2=奥术 克制 邪能3
        3=邪能 克制 自然4
        4=自然 克制 亡灵1
        5=暗影 克制 光明6
        6=光明 克制 暗影5
        '''
        # 神宠不判断种族
        if 'pid' in fromRole.data:
            return False
        keZhiConf = {
            "1": "2",
            "2": "3",
            "3": "4",
            "4": "1",
            "5": "6",
            "6": "5"
        }
        fz = str(fromRole.data['zhongzu'])
        toz = str(toRole.data['zhongzu'])
        
        if fz not in keZhiConf or toz not in keZhiConf:
            return False
        
        if keZhiConf[fz] == toz:    
            return True
        else:
            return False
    
    #控制val的范围在min-max之间
    def range(self,val,min=None,max=None):
        if min!=None and val < min :
            val = min
            
        if max!=None and val > max:
            val = max
            
        return val
    
    def dpsDebugLog(self,s):
        if not self.debug:
            return
        self._dpsDebugLog.append(s)
    
    def _getJobAndZhongZuAddPro(self,fromRole,toRole):
        #根据fromRole的job和zhongzu，拼接出：受到某种族伤害增加 和 受到某职业伤害增加 的buff 的key
        #再获取toRole里属性累和后的值
        jobAdddpsKey = "job"+ str(fromRole.data.get("job","")) +"adddps"
        zhongZuAdddpsKey = "zhongzu"+ str(fromRole.data.get("zhongzu","")) +"adddps"
        
        #职业和种族加成总和
        jobAndZhongZuAddPro = (1000 + toRole.getProVal(jobAdddpsKey) + toRole.getProVal(zhongZuAdddpsKey))/1000.0
        return jobAndZhongZuAddPro
    
    #通过技能配置特出的扣血逻辑
    #如：按生命上限扣血
    def getSpecDPSBySkillConf(self,fromRole,toRole,skillConf,atkType='normalskill'):
        #职业和种族加成总和
        jobAndZhongZuAddPro = self._getJobAndZhongZuAddPro(fromRole, toRole)
        dps = 0

        if 'hpproinjury' in skillConf and skillConf['hpproinjury']>0:
            # 特殊魔王
            # 判断是否有根据我方英雄数量增加伤害的技能
            numpro = 0
            if skillConf.get("numpro", 0):
                _num = 0
                for i in self.roles:
                    # 对方
                    if i.data['side'] == fromRole.data['side'] and i.rid != fromRole.rid:
                        if not i.isDead():
                            _num += 1
                numpro += int(skillConf["numpro"]) * _num

            #神殿魔王时加的新体系，根据目标的生命值上限扣血
            dps = int(toRole.data['maxhp'] * (skillConf['hpproinjury'] + numpro) / 1000.0) * -1 * jobAndZhongZuAddPro
            # 迷宫洞窟的战斗
            if skillConf['where'] == 'countalive':
                dps /= self.getAliveNum(toRole.data['side'])
            return {"dps" : dps , "ifJingZhun": True ,"ifBaoJi":False,"atkType":atkType,'baojisignEmit':False}

        if self.ftype == 'pvm' and dps > 9999000:
            dps = 9999000
        
        return {"dps":dps,"atkType":atkType}


    # 计算真实伤害
    def getRealinjuryDPS(self,fromRole,toRole,skillpro=0,atkType='normalskill', extskill=False):
        #伤害公式 = 我方战中攻击*（我方技能伤害率[技能内的配置]+战中增加技能伤害率）*浮动系数*{if=“暴击”，战中暴击伤害率+150%，1}*{if=“怒气攻击”，当前怒气/怒气上限，1}*{if=“最终精准”，1，XX%}*最终伤害系数
        _atk = fromRole.data.get('atk',0)
        # 浮动系数 = 98%-102%随机
        fuDong = (random.randint(98, 102) * 0.01)
        dps = _atk * self.range((fromRole.getProVal('realinjury')) / 1000.0, min=0.2) * fuDong
        self.dpsDebugLog("伤害=" + str(dps))

        ifBaoJi = False
        baojisignEmit = False
        _baojiSignDps = 0
        ifJingZhun = True

        return {"dps" : dps , "ifJingZhun": ifJingZhun ,"ifBaoJi":ifBaoJi,"atkType":atkType,'baojisignEmit':baojisignEmit,'baojidps':_baojiSignDps}


    #计算伤害值
    def getDPS(self,fromRole,toRole,skillpro=0,atkType='normalskill', extskill=False):

        #职业和种族加成总和
        jobAndZhongZuAddPro = self._getJobAndZhongZuAddPro(fromRole, toRole)

        #神器新出现的概念：真实伤害
        if atkType=='realinjury':
            _shenqidps = (1000 + fromRole.getProVal('shenqidps')) / 1000.0
            return {"dps" : int(skillpro*jobAndZhongZuAddPro*_shenqidps*-1) ,"atkType":atkType}
        # 神宠
        elif atkType == 'petAtk':
            return {"dps" : -int((skillpro + fromRole.getProVal('before_dps')+ fromRole.getProVal('before_skilldps')) / 1000.0 *fromRole.data['atk']) ,"atkType":atkType}
        
        self._dpsDebugLog=[];
        
        #最终精准率控制 是否最终精准，几率为 (jingZhunLv*100) %
        #最终精准率 = 1+我方战中精准率-对方战中格挡率+{if=“种族克制”，10%，0}
        jingZhunLv = 1 + fromRole.getProVal('jingzhun') /1000.0 - toRole.getProVal('gedang') /1000.0
        if self.ifZhongZuKeZhi(fromRole, toRole):
            jingZhunLv += 0.1
            
        jingZhunLv = self.range(jingZhunLv,min=0.2)
        self.dpsDebugLog("精准率="+str(jingZhunLv))
        
        #对toRole的job是否有伤害加成/减成buff（buffType = job*dpspro 其中*=1~5   1战士 2法师 3牧师 4刺客 5游侠）
        toRoleJob = toRole.data['job']
        jobdosPro = fromRole.getProVal('job'+ str(toRoleJob) +'dps')
        self.dpsDebugLog("职业加成="+str(jobdosPro))
        #攻击前技能临时属性
        beforeSkillTmpDPSPro = fromRole.getProVal('before_dps')
        self.dpsDebugLog("攻击前技能dps属性="+str(beforeSkillTmpDPSPro))
        
        #PVP战斗属性
        pvpDpsVal = 0
        if self.ftype == 'pvp':
            pvpDpsVal = (fromRole.getProVal('pvpdps')-toRole.getProVal('pvpundps'))/1000.0
        
        #如果被攻击目标有流血状态的话，判断from有没有 liuxuedps 加成
        liuxueDPSPro = 0
        if len(toRole.getBuff('liuxue')) > 0:
            liuxueDPSPro = fromRole.getProVal('liuxuedps')
            self.dpsDebugLog("liuxuedps="+str(liuxueDPSPro))
        
        #如果被攻击目标有中毒状态的话，判断from有没有 zhongdudps 加成
        zhongduDPSPro = 0
        if len(toRole.getBuff('zhongdu')) > 0:
            zhongduDPSPro = fromRole.getProVal('zhongdudps')
            self.dpsDebugLog("zhongdudps="+str(zhongduDPSPro))

        # 如果被攻击目标有虚弱状态的话，判断from有没有 zhongdudps 加成
        zhuoshaoDPSPro = 0
        if len(toRole.getBuff('zhuoshao')) > 0:
            zhuoshaoDPSPro = fromRole.getProVal('zhuoshaodps')
            self.dpsDebugLog("zhuoshaodps=" + str(zhuoshaoDPSPro))

        # 如果被攻击目标有虚弱状态的话，判断from有没有 zhongdudps 加成
        xuruopro = 0
        if len(toRole.getBuff('xuruo')) > 0:
            xuruopro = 500
        beforeSkillTmpSkillDPSPro = fromRole.getProVal('before_skilldps')
            #最终伤害系数 = 1+我方战中伤增率*0.7-对方战中免伤率-对方防御/（200+20*（对方等级-1））*（1-我方战中破甲率）+{if=“种族克制”，30%，0}+{if=“饰品指定种族”，饰品伤害加成，0}
        shangHaiXiShu = 1 + (fromRole.getProVal('dps') + jobdosPro + beforeSkillTmpDPSPro + liuxueDPSPro + zhongduDPSPro+zhuoshaoDPSPro+xuruopro) /1000.0 * 0.7 - toRole.getProVal('undps')/1000.0 + pvpDpsVal

        _pojia = self.range(fromRole.getProVal('pojia'),0,1000)

        shangHaiXiShu = shangHaiXiShu - toRole.data['def']/(200+20*(toRole.data['lv']-1)) * (1 - _pojia/1000.0)


        self.dpsDebugLog("最终伤害系数="+str(shangHaiXiShu))
        if self.ifZhongZuKeZhi(fromRole, toRole):
            shangHaiXiShu += 0.25
            self.dpsDebugLog("种族克制，最终伤害系数="+str(shangHaiXiShu))
        #todo what is {if=“饰品指定种族”，饰品伤害加成，0}??   

        # 神宠不要最低系数
        #伤害系数最低0.1
        if atkType != 'petAtk' and shangHaiXiShu<0.1:
            shangHaiXiShu=0.1  
            
        self.dpsDebugLog("下线保护后，最终伤害系数="+str(shangHaiXiShu))
        
        
        #浮动系数 = 98%-102%随机
        fuDong = (random.randint(98,102)*0.01)
        self.dpsDebugLog("浮动系数="+str(fuDong))

        #toRole是否存在观星者印记buff，观星者印记：被攻击时，攻击方技能伤害率增加（观星者印记单个目标最多技能伤害率加到300%）
        guanxingsignPro = toRole.getSumProByBuffType('guanxingsign')
        if guanxingsignPro > 3000 : guanxingsignPro = 3000
        self.dpsDebugLog("观星者印记buff="+str(guanxingsignPro))
        
        #toRole是否存在闪电印记buff，闪电印记：本印记释放者攻击印记携带者时，印记释放者伤增率增加
        def _shanDianFilter(__buff):
            if __buff.data['from'] == fromRole and atkType == "xpskill":
                return True
        shandiansignPro = toRole.getSumProByBuffType('shandiansign',_shanDianFilter)
        self.dpsDebugLog("闪电印记buff="+str(shandiansignPro))
        
        #攻击前技能临时属性
        beforeSkillTmpSkillDPSPro = fromRole.getProVal('before_skilldps')
        self.dpsDebugLog("攻击前技能skilldps属性="+str(beforeSkillTmpSkillDPSPro))
 
        #伤害公式 = 我方战中攻击*（我方技能伤害率[技能内的配置]+战中增加技能伤害率）*浮动系数*{if=“暴击”，战中暴击伤害率+150%，1}*{if=“怒气攻击”，当前怒气/怒气上限，1}*{if=“最终精准”，1，XX%}*最终伤害系数
        _atk = fromRole.data.get('atk',0)

        if hasattr(fromRole,'getAttr') and fromRole.getAttr('maxFightAtkRange'):
            _maxAtk = fromRole.getAttr('_rawAtk') * fromRole.getAttr('maxFightAtkRange')
            if _atk > _maxAtk:
                _atk = _maxAtk     

        dps = _atk * self.range( (skillpro + fromRole.getProVal('skilldps') + guanxingsignPro + shandiansignPro + beforeSkillTmpSkillDPSPro)/1000.0,min=0.2) * fuDong


        self.dpsDebugLog("伤害="+str(dps))
        
        ifBaoJi = False
        baojisignEmit = False
        _baojiSignDps = 0

        if fromRole.ifBaoJi(toRole):
            baoShangLv = fromRole.getProVal('baoshang')+1500
            
            # toRole是否存在暴击印记buff，被暴击时产生额外千分之x攻击的伤害，且触发一次后解除该buff
            '''
            baojisignPro = toRole.getSumProByBuffType('baojisign')
            if baojisignPro != 0:
                baojisignEmit = True
                #toRole.clearBuffByType('baojisign') 需要等攻击动作后，再删除buff，所以，移到fightRole的atk中处理
                baoShangLv += baojisignPro
            '''
            #暴击印记逻辑调整：由原来的增加爆伤率，修改为一个掉血类的伤害型buff
            baojisignBuff = toRole.getBuff('baojisign')
            if len(baojisignBuff)>0:
                baojisignEmit = True
                for _tmpbuff in baojisignBuff:
                    _baojiSignDps += _tmpbuff.resValue #_baojiSignDps为一个负数，最终伤害扣血值
                    _tmpbuff.fromrole.signData['dps'] -= _tmpbuff.resValue
                
                self.dpsDebugLog("存在暴击印记造成了伤害="+str(_baojiSignDps))
             
            dps = dps * baoShangLv/1000.0

            self.dpsDebugLog("触发暴击，伤害="+str(dps))
            ifBaoJi = True
        _nuqiPro = 1
        if atkType=='xpskill' and 'nuqi' in fromRole.data and 'maxnuqi' in fromRole.data:
            if hasattr(fromRole,'getAttr') and fromRole.getAttr('noNuQiJiaCheng'):
                self.dpsDebugLog("该英雄不计算怒气加成")
            else:
                _nuqiPro = fromRole.data['nuqi'] / fromRole.data['maxnuqi']
                #怒气带来的伤害加成上限控制
                if hasattr(fromRole,'getAttr'):
                    _maxNuqiDPS = fromRole.getAttr('maxNuqiDPS')
                    if _maxNuqiDPS and _nuqiPro>_maxNuqiDPS:
                        _nuqiPro = _maxNuqiDPS

                dps = dps * _nuqiPro


                self.dpsDebugLog("怒气加成，伤害="+str(dps))


        dps = dps * shangHaiXiShu

        # if fromRole.rid == 'role_0':
        #     print "atk", _atk, "skillpro", skillpro, "spro", fromRole.getProVal('skilldps'), "怒气伤害", _nuqiPro, "伤害系数", shangHaiXiShu, "爆伤", fromRole.getProVal('baoshang')+1500, "暴击",ifBaoJi
        #     print dps


        self.dpsDebugLog("伤害系数加成，伤害="+str(dps))
        
        ifJingZhun = True
        if not random.randint(1,100) <= (jingZhunLv*100):
            ifJingZhun = False
            #没有精准伤害
            dps = dps * 0.3  #todo raosong:如果不精准（不精准的意思就是格挡）就是30%伤害。30%这个系数后面可能改，我下周去算一下这个系数是多少。
            self.dpsDebugLog("被格挡，伤害="+str(dps))

        # 判断是否闪避
        _dodgeLv = 1 - toRole.getProVal('dodge') / 1000.0
        ifDodge = True
        if not random.randint(1,100) <= (_dodgeLv*100):
            ifDodge = False
            dps = 0
            self.dpsDebugLog("被闪避，伤害=" + str(dps))

        dps = self.range(int(dps),min=1)*-1
        dps += _baojiSignDps #暴击印记
        dps *= jobAndZhongZuAddPro
        # 减去庇护buff
        _protect = toRole.getBuff('protect')
        if _protect:
            _protect.sort(key=lambda x:x.data['pro'], reverse=True)
            dps *= (1000-_protect[0].data['pro']) * 0.001

        # 魔王伤害不超过9999000
        if self.ftype == 'pvm' and abs(dps) > 9999000:
            dps = -9999000

        self.dpsDebugLog("伤害系数加成，巨魔诅咒之前伤害=" + str(dps))
        # 巨魔诅咒
        _trollcurseBuff = filter(lambda x:toRole.data['hid'] in x.data['hero'], fromRole.getBuff('trollcurse'))
        if _trollcurseBuff:
            _trollcurseBuff.sort(key=lambda x:x.data['pro'], reverse=True)
            _trollcurseBuff = _trollcurseBuff[:_trollcurseBuff[0].data['maxnum']]
            _pro = sum([x.data['pro'] for x in _trollcurseBuff])
            dps -= int(dps * _pro / 1000.0)
            self.dpsDebugLog("伤害系数加成，巨魔诅咒之后伤害={0},巨魔诅咒pro={1}".format(dps, _pro))

        if len(self._dpsDebugLog)>0:
            self.log('-------伤害详解-------',"\n".join(self._dpsDebugLog),'-------//伤害详解-------')


        return {"dps" : dps , "ifJingZhun": ifJingZhun ,"ifBaoJi":ifBaoJi,"atkType":atkType,'baojisignEmit':baojisignEmit,'baojidps':_baojiSignDps,"ifDodge":ifDodge}
    
    #伤害类BUFF（如掉血）使用的计算公式
    def getBuffDPS(self,fromRole,toRole,skillpro=0):
        dps = fromRole.data['atk'] * (skillpro)/1000.0  # + fromRole.getProVal('skilldps') 不受增加技能伤害率影响
        return self.range(int(dps),min=1) *-1
    
    #治疗公式  skillpro=某个技能的伤害率
    def getAddHP(self,role, toRole, skillpro=0,atkType='normalskill'):
        #战中攻击*（我方技能伤害率+战中增加技能伤害率）*浮动系数*{if=“暴击”，战中暴击伤害率+150%，1}*{if=“怒气攻击”，当前怒气/怒气上限，1}
        a = role.data['atk'] * ( (skillpro)/1000.00 ) * (random.randint(98,102)*0.01) * (role.getProVal('cure')+1000)/1000.0 * (toRole.getProVal('undercure')+1000)/1000.0

        #+ role.getProVal('skilldps') 不受增加技能伤害率影响
        self.log('-------getAddHP-------',"\n".join(  [str(role.data['atk']),str(skillpro),str(a)]   ),'-------//getAddHP-------')
        
        if role.ifBaoJi():
            a *= (role.getProVal('baoshang') + 1500)/1000.00
            self.log('-------baoji-------',"\n".join(  [str(a) ]   ),'-------//baoji-------')
            
        if atkType=='xpskill' and role.data['nuqi']>=role.data['maxnuqi']:
            a *= (role.data['nuqi']/role.data['maxnuqi'])
            self.log('-------xpskill-------',"\n".join(  [str(a) ]   ),'-------//baoji-------')
            
        return self.range(int(a),min=1)
    
    #恢复类BUFF使用的计算公式
    def getBuffAddHP(self,fromRole,toRole,skillpro=0):
        dps = fromRole.data['atk'] * (skillpro + fromRole.getProVal('skilldps') + fromRole.getProVal('cure'))/1000.0 * (toRole.getProVal('undercure')+1000)/1000.0
        return self.range(int(dps),min=1)

    # 通过技能配置特出的扣血逻辑
    # 如：按turn扣血
    def getSpecDPSByTurn(self, fromRole, toRole, skillConf, atkType='xpskill'):
        _where = skillConf['where'].split(',')
        dps = skillConf['realinjury'] * -int(_where[self.turn - 1])
        return {"dps": dps, "atkType": atkType}
    
    #根据prodict KV字典及role对象，算出影响的数据结果
    def calcAttr(self,role,prodict):
        res = {}
        for _type,v in prodict.items():
            if _type == 'hppro':
                res['hp'] = int(role.data['hp'] * v / 1000.0)
            elif _type == 'maxhppro':
                res['maxhp'] = int(role.data['maxhp'] * v / 1000.0)            
            elif _type == 'atkpro':
                res['atk'] = int(role.data['atk'] * v / 1000.0)
            elif _type == 'atkdrop':
                res['atk'] = int(role.data['atk'] * v / 1000.0) * -1
            elif _type == 'speedpro':
                res['speed'] = int(role.data['speed'] * v / 1000.0)
            elif _type == 'speeddrop':
                res['speed'] = int(role.data['speed'] * v / 1000.0) * -1
            elif _type == 'defpro':
                res['def'] = int(role.data['def'] * v / 1000.0)
            elif _type == 'defdrop':
                res['def'] = int(role.data['def'] * v / 1000.0) * -1
            elif _type == 'addspeed':
                res['speed'] = int(v)
            elif _type == 'delspeed':
                res['speed'] = int(-v)
            elif _type == 'undercurepro':
                res['undercurepro'] = int(v) + role.data.get("undercurepro", 0)
            elif _type == 'speedprobypet':
                _buff = role.getBuff('speedprobypet')
                _val = _buff[-1].fromrole.data['speed'] * _buff[-1].data['pro'] / 1000.0
                res['speed'] = int(_val)
            else:
                res[_type] = v
                
        for _type,v in res.items():
            ov = role.data.get(_type,0);
            role.data[ _type ] = ov + v
        return res

    # 获取某方存活数量
    def getAliveNum(self, side, zhongzu=None):
        if not zhongzu:
            return len([i for i in self.roles if i.data['side']==side and not i.data['dead']])
        else:
            return len([i for i in self.roles if i.data['side']==side and not i.data['dead'] and i.data['zhongzu'] in zhongzu])

    # 只用在测试的时候，一队npc死亡生成另一队
    def saveReserveRole(self, RoleData):
        self.rolereservedata = RoleData
    
if __name__ == '__main__':

    with open("demofight.json",'r') as load_f:
        fightData = json.load(load_f)
  
    #a = [1,2,3,4,5]
    #print a[:2]
    f = Fight('pve')
    a = f.initFightByData(fightData).start()
    print json.dumps(a)
 
    #f.dumpRole( f.orderRoles('atk',True) )
    #print f.getRolesByKV({"side":1})