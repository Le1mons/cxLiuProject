#!/usr/bin/python
#coding:utf-8

#战斗类
import g,event
import random,string,time,uuid
import Buff,PassiveSkill,Fight,AfterAtk

#神器
class FightArtifact(object):
    index = 0
    def __init__ (self,fight):
        self.rid = "artifact_"+str(FightArtifact.index)
        FightArtifact.index += 1
        
        self.event = event.EventEmitter() 
        self.data = None #战斗数据
        self.fight = fight #战斗实例
        self.inited = False #是否已初始化
        self.beidong = {} #战斗中的被动属性
        self.actionLogData = {} #当前行动回合中有可能需要推给发送给客户端的变化数据
        
        self.lastSkillTarget = None #最后一次主动技能选择出的目标
        self.lastHitBy = None #最后一次被谁攻击
        self.signData = {'dps':0,'addhp':0} #战斗统计值{'dps':'累计输出伤害','addhp':'总加血量'}
        self.roleType = "artifact"
        
        self.fight.event.on(Fight.FightEvent.addShenQiNuQiByTurn,self.addNuQiByTurn)
        self.fight.event.on(Fight.FightEvent.addShenQiNuQiByXPSkill,self.addNuQiByXPSkill)
        self.fight.event.on(Fight.FightEvent.shenQiAtk,self.checkAtk)
        
    def clear(self):
        self.fight.log('clear..',self)
        self.fight.event.off(Fight.FightEvent.addShenQiNuQiByTurn,self.addNuQiByTurn)
        self.fight.event.off(Fight.FightEvent.addShenQiNuQiByXPSkill,self.addNuQiByXPSkill)
        self.fight.event.off(Fight.FightEvent.shenQiAtk,self.checkAtk)
        
        #清理被动技能
        for bdid,beidongs in self.beidong.items():
            while len(beidongs)>0:
                beidongs[0].clear()
        
        self.event.off_all()
        
        del self.event
        del self.data
        del self.fight
        del self.inited
        del self.beidong
        del self.actionLogData
        del self.lastSkillTarget
        del self.lastHitBy
        del self.signData
        del self.roleType
    
    def __str__ (self):
        return str(self.rid) + '->'+ str(self.data)

    #通过数据初始化角色
    def initRoleByData (self,roleData):
        if 'dead' not in roleData:
            roleData['dead'] = False
            
        roleData['rid'] = self.rid
        
        if 'maxnuqi' not in roleData:
            roleData['maxnuqi'] = 100    #怒气上限值
        if 'nuqi' not in roleData:
            roleData['nuqi'] = 0
            
        self.data = roleData
        self.inited = True
        
        self.fmtSkill()
        return self
    
    #格式化技能数据
    def fmtSkill (self):
        self.runSkill(self.data['skill'])        
    
    #运行一个技能组
    def runSkills(self,skillids,addLog=False):
        for skillid in skillids:
            self.runSkill(skillid,addLog=addLog)
    
    #运行单个技能        
    def runSkill(self,skillid , addLog=False):
        sc = self.fight.getSkill(skillid)
        sc['skillid'] = skillid
        if sc['type'] == '1':return #面板属性技能
        if sc['type'] == '2':return #攻击技能
        if sc['type'] == '3':
            return self.runAfterAtkSkill(sc , addLog=addLog)
        if sc['type'] == '4':#被动技能
            return self.addPassiveSkill(self, sc , addLog=addLog)
         
    #增加一个被动技能，skillData参见PassiveSkill类注释
    def addPassiveSkill (self,fromwho,skillData,addLog=False):
        skillData['from'] = fromwho
        PassiveSkill.addPassiveSkill(self,skillData)
    
    #运行一个攻击后技能
    def runAfterAtkSkill(self,skillconf , addLog=False):
        targets = self.fight.getTargetBySkillID(self,skillconf['skillid'])
        if targets==None:
            self.fight.log('警告：技能找不到攻击目标，确定配置是否正确',skillconf)
        if addLog:
            pass
            #self.fight.addActionLog({'act':'runskill','skillid':skillconf['skillid'],'from':self.rid,'to':[ r.rid for r in targets]})
            #按当前游戏来看 客户端不需要
        return AfterAtk.runSkill(self,targets,skillconf)
       
    #获取一个被动技能，不存在时返回空[]
    def getPassiveSkill(self,bdid):
        return self.beidong.get(bdid,[])
   
    #增加一个战斗数据日志
    def addLogData (k,v):
        if k not in self:
            self.actionLogData[k] = v
        else:
            self.actionLogData[k] += v
    
    #是否已死亡，高频快捷方法
    def isDead (self):
        return self.data['dead']
    
    #每回合回怒气
    def addNuQiByTurn(self):
        self.modifyNuQi(20)
    
    #己方英雄使用XP技回怒气
    def addNuQiByXPSkill(self,emitData):
        if emitData['from'].data['side'] == self.data['side']:
            self.modifyNuQi(10)

    #修改怒气
    '''
    可以溢出，但是无论是否溢出，释放技能后都是直接扣到0。    
    那应该没意义了吧？直接不高于上限就可以咯？
    大于等于满值的时候，只要触发释放节点，就会释放
    我刚刚在想以后万一加了个降低魔兽怒气的技能
    '''
    def modifyNuQi(self,addnum,addlog=True):
        self.data['nuqi'] += addnum
        
        if self.data['nuqi']<0:
            self.data['nuqi'] = 0
            
        if addlog:
            self.fight.addActionLog({'act':'nuqi','r':self.rid,'v':addnum,'nv':self.data['nuqi']})
            
        self.fight.log(self,'怒气变化',addnum)
        self.fight.event.emit( Fight.FightEvent.nuQiChange,{"to":self,"addnum":addnum})
    
    #判断是否能攻击
    def checkAtk(self):
        if self.data['nuqi'] >= self.data['maxnuqi']:
            self.fight.roleActionStart(self)
            self.atk()
            self.modifyNuQi(self.data['nuqi']*-1)
            self.fight.roleActionStop(self)
    
    #开始攻击
    def atk (self):
        skillid = self.data['skill']
        atkType = "realinjury"
        #选敌   
        self.lastSkillTarget = self.fight.getTargetBySkillID(self,skillid)
        
        if len(self.lastSkillTarget) == 0:
            self.fight.log(self,'使用技能',skillid,'但选敌目标为空')
            return False
        
        _skillConf = self.fight.getSkill(skillid)
        self.fight.log(self,'使用技能',skillid,'获取到目标',self.lastSkillTarget,'附加攻击后技能',list(_skillConf['v']));
        
        afterSkills = list(_skillConf['v'])
        
        __atkLog = {'act':'atk','from':self.rid,'to':{},'skillid':skillid,'atkType':atkType}
        for toRole in self.lastSkillTarget:
            toRole.lastHitBy = self
            dps = self.fight.getDPS(self,toRole,int(_skillConf['realinjury']),atkType)
            
            __atkLog['to'][ toRole.rid ] = dps['dps']
           
            self.fight.log(self,'攻击了',toRole,dps['dps'])
            
            self.fight.tmpLogKey = 'atkHP'
            toRole.modifyHP( dps['dps'] , extData=dps )
            #统计伤害输出
            self.setSignNum('dps',dps['dps'])
            self.fight.tmpLogKey = None
           
        self.fight.addActionLog(__atkLog)
        self.fight.addActionLogFromTmp('atkHP')
        
        #攻击后附加技能
        self.fight.log(self,'攻击后附加技能',afterSkills)
        if len(afterSkills) > 0:
            self.runSkills( afterSkills )
        
        return True
    
    #轮到我行动了
    def startAction (self):
        if self.isDead():return
        
        self.fight.log(self,'开始行动>>>')
        self.fight.roleActionStart(self)
        if not self.isSleep():
            _atk = self.atk()
            if _atk:
                self.stopAction()
    
    #我的行动结束
    def stopAction (self):
        self.lastSkillTarget = None
        self.fight.roleActionStop(self)
        self.fight.log(self,'结束行动<<<')
    
    #设置统计信息
    #act:统计类型
    def setSignNum(self,act,num):
        self.signData[act] += abs(num)

if __name__ == '__main__':
    a = [1,2,3]
    a.extend([4,5,6])
    print a
