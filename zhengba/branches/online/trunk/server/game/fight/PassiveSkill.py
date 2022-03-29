#!/usr/bin/python
#coding:utf-8
import random
import Fight

#被动技能基类
class PassiveSkill(object):
    def __init__ (self,role,skillData):
        '''
        skillData = {"skillid":"4002"} 必选
        
        依附于role存在，当fight广播reducePassiveSkillTurn事件时，回合数-1
        当skill回合数改变时，会向fight广播passiveSkillTurnChange事件
        当skill结束时，会向fight广播passiveSkillEnd事件
        '''
        if 'v' in skillData and 'round' in skillData['v']:
            skillData['round'] = int(skillData['v']['round'])
        else:
            skillData['round'] = 99999        

        if 'v' in skillData and 'randnum' in skillData['v']:
            skillData['randnum'] = int(skillData['v']['randnum'])
        else:
            skillData['randnum'] = 1000
            
        self.role = role
        self.fight = role.fight
        self.skillid = skillData['skillid']
        self.conf = role.fight.getSkill(self.skillid)
        self.bdid = self.conf['bdid']
        self.data = skillData
        self.altAttr = None #该技能未宿主带来的属性变化，会在技能被clear时，反向操作
        
        if self.bdid not in role.beidong:
            role.beidong[ self.bdid ] = []
        
        #加入到role的beidong集合
        role.beidong[ self.bdid ].append(self)

        self.fight.event.on(Fight.FightEvent.reducePassiveSkillTurn,self.reduceTurn)
    
    #根据技能配置的randnum，判断是否会触发
    def ifEmit(self):
        return random.randint(1,1000) <= self.data['randnum']
    
    def reduceTurn(self):
        #回合数变化
        self.data['round'] -= 1
        self.fight.event.emit( Fight.FightEvent.passiveSkillTurnChange ,self)
        if self.data['round'] <= 0: self.clear()

    def clear (self,fromSuper=False):
        #删除技能
        if self in self.role.beidong[ self.bdid ]:
            self.role.beidong[ self.bdid ].remove(self)
        
        #反向重置该技能带来的属性影响
        if self.altAttr!=None:
            for k,v in self.altAttr.items():
                self.role.data[k] += v*-1
            
        self.fight.event.emit( Fight.FightEvent.passiveSkillEnd ,self)
        self.fight.event.off( Fight.FightEvent.reducePassiveSkillTurn ,self.reduceTurn)
        
        if not fromSuper:
            self._delAttr()
      
      
    def _delAttr(self):
        del self.role
        del self.fight
        del self.skillid
        del self.conf
        del self.bdid
        del self.data         
        del self
        
#反击类被动
class PassiveSkill_fanji(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_fanji, self).__init__(role, skillData)
        when = self.conf['chkdata']['when'].lower()
        
        if when == 'byatk':
            self.fight.event.on( Fight.FightEvent.byAtk ,self.chkdata)
            
        elif when == 'bybaoji':
            self.fight.event.on( Fight.FightEvent.byBaoJi ,self.chkByBaoJi)
            
        elif when == 'baoji':
            self.fight.event.on( Fight.FightEvent.baoJi ,self.chkBaoJi)
            
    def chkdata(self,emitData):
        #检测是否触发
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        conds = []
        
        chkjobs = self.conf['chkdata'].get('job',[])
        if len(chkjobs) > 0:
            conds.append(emitData['from'].data['job'] in chkjobs) #指定职业
            
        if 'defless' in self.conf['chkdata']: 
            #受到防御低于自己的目标攻击时反击
            conds.append( emitData['from'].data['def'] < self.role.data['def'] )
        
        for c in conds:
            if not c : return #有任何条件不满足，直接return
        
        self.fight.log(self.role,'开始反击',emitData['from'],'by技能',self.data)
        self.role.fanji( emitData['from'] , int(self.data['v']['pro']) )

    
    def chkByBaoJi(self,emitData):
        #被暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        self.fight.log(self.role,'开始反击',emitData['from'],'by技能',self.data)
        self.role.fanji( emitData['from'] , int(self.data['v']['pro']) )
        
        
    def chkBaoJi(self,emitData):
        #暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        atkType = self.conf['chkdata'].get('atkType','')
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['from'] != self.role: return #不是自己
        if side == '0' and emitData['from'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['from'].data['side'] == self.role.data['side'] : return #不是敌人
        
        self.fight.log(self.role,'开始反击',emitData['from'],'by技能',self.data)
        self.role.fanji( emitData['from'] , int(self.data['v']['pro']) )
        
        
    def clear(self,fromSuper=False):
        super(PassiveSkill_fanji, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.byAtk ,self.chkdata)
        self.fight.event.off( Fight.FightEvent.byBaoJi ,self.chkByBaoJi)
        self.fight.event.off( Fight.FightEvent.baoJi ,self.chkBaoJi)
        
        if not fromSuper:
            self._delAttr()       
        

#执行技能类被动技能
class PassiveSkill_runskill(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_runskill, self).__init__(role, skillData)
        
        when = self.conf['chkdata']['when'].lower()
        if when == 'doatk':
            self.fight.event.on( Fight.FightEvent.doAtk ,self.chkDoAtk)
        elif when == 'dead':
            self.fight.event.on( Fight.FightEvent.byDead ,self.chkByDead)
        elif when == 'realdead':
            self.fight.event.on( Fight.FightEvent.byRealDead ,self.chkByRealDead)        
        elif when == 'hpchange':
            self.fight.event.on( Fight.FightEvent.hpChange ,self.chkHPChange)
        elif when == 'gedang':
            self.fight.event.on( Fight.FightEvent.geDang ,self.chkGeDang)
        elif when == 'bygedang':
            self.fight.event.on( Fight.FightEvent.byGeDang ,self.chkByGeDang)
        elif when == 'byatk':
            self.fight.event.on( Fight.FightEvent.byAtk ,self.chkByAtk)
        elif when == 'bybaoji':
            self.fight.event.on( Fight.FightEvent.byBaoJi ,self.chkByBaoJi)
        elif when == 'baoji':
            self.fight.event.on( Fight.FightEvent.baoJi ,self.chkBaoJi)
        elif when == 'round':
            self.fight.event.on( Fight.FightEvent.roundStart ,self.roundStart)           
    
    def roundStart(self,emitData):
        #回合开始时判断
        if self.role.isDead() or self.ifEmit()==False:
            return
        
        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep():
            return        
        
        number = str(self.conf['chkdata'].get('number',''))
        if number != "" and number != "-1" and  int(number) != emitData['turn'] : return
        
        self.fight.log(self.role,'roundStart触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )        
    
    def chkByBaoJi(self,emitData):
        #被暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        self.fight.log(self.role,'被暴击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )
        
        
    def chkBaoJi(self,emitData):
        #暴击时判断
        if self.role.isDead() or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        atkType = self.conf['chkdata'].get('atkType','')
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['from'] != self.role: return #不是自己
        if side == '0' and emitData['from'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['from'].data['side'] == self.role.data['side'] : return #不是敌人
        
        self.fight.log(self.role,'暴击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True,skillRunAt=emitData['to'] )

    def chkDoAtk(self,emitData):
        #攻击时判断
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False: #### or self.role.isSleep():
            return        
        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep():
            return        
        
        emitTimes = 1
        atkType = self.conf['chkdata'].get('atktype','') #配置中是小写的，游戏逻辑是atkType
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['from'] != self.role: return #不是自己
        if side == '0' and emitData['from'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['from'].data['side'] == self.role.data['side'] : return #不是敌人
        
        targetdead = str(self.conf['chkdata'].get('targetdead','')) #目标死亡
        if targetdead != "":
            deads = 0
            for role in emitData['to']:
                if role.isDead():
                    deads+=1
            if deads == 0:
                return
            else:
                emitTimes = deads #死亡多少个目标，技能触发多少次
        
        
        for i in xrange(emitTimes):
            self.fight.log(self.role,'攻击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
            self.role.runSkills( self.conf['v']['runskill'],addLog=True )
            
    def chkByAtk(self,emitData):
        #被攻击时判断
        #检测是否触发
        '''
        if self.role.isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        '''
        if self.role.isDead() or self.ifEmit()==False:
            return
        #2018-8-7 将isSleeo改为配置可控
        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep():
            return
        
        atkType = self.conf['chkdata'].get('atktype','') #配置中是小写的，游戏逻辑是atkType
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人
        
        self.fight.log(self.role,'被攻击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )
            
    def chkGeDang(self,emitData):
        #格挡时判断
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False or self.role.isSleep():
            return        
        
        atkType = self.conf['chkdata'].get('atkType','')
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        
        if side == '-1':
            #攻击目标格挡时
            if not (emitData['from'].lastSkillTarget and emitData['to'] in emitData['from'].lastSkillTarget): 
                return #格挡者不在自己的选敌目标中
        
        if side == '-2' and emitData['to'] != self.role: return #不是自己return
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人return
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是友军return
        
        self.fight.log(self.role,'格挡触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True,skillRunAt=emitData['to']  )
        
    def chkByGeDang(self,emitData):
        #被格挡时判断
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        
        atkType = self.conf['chkdata'].get('atkType','')
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['from'] != self.role: return #不是自己
        if side == '0' and emitData['from'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['from'].data['side'] == self.role.data['side'] : return #不是敌人
        
        self.fight.log(self.role,'被格挡触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True  )
    
    def chkByDead(self,emitData):
        #有人死亡时判断
        if self.ifEmit()==False:
            return 
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人        
        
        self.fight.log(self.role,'死亡触发了runskill','by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )
    
    def chkByRealDead(self,emitData):
        #有人死亡且不会触发时判断
        if self.ifEmit()==False:
            return 
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人        
        
        self.fight.log(self.role,'死亡触发了runskill','by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )    
    
    def chkHPChange(self,emitData):
        #血量变化时判断
        if self.ifEmit()==False or self.role.isSleep() or emitData['to'] != self.role:
            return
        
        hpproless = str(self.conf['chkdata'].get('hpproless','')) #生命首次低于 30%  时
        if hpproless!="":
            hpproless = int(hpproless)
            if emitData['to'].data['hp'] * 1000 / emitData['to'].data['maxhp'] < hpproless:
                self.fight.log(self.role,'血量改变触发了runskill','by技能',self.data)
                self.clear(fromSuper=True)
                self.role.runSkills( self.conf['v']['runskill'] , addLog=True  )
                self._delAttr()
                
        
    def clear(self,fromSuper=False):
        super(PassiveSkill_runskill, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.doAtk ,self.chkDoAtk)
        self.fight.event.off( Fight.FightEvent.byDead ,self.chkByDead)
        self.fight.event.off( Fight.FightEvent.byRealDead ,self.chkByRealDead)
        self.fight.event.off( Fight.FightEvent.hpChange ,self.chkHPChange)
        self.fight.event.off( Fight.FightEvent.geDang ,self.chkGeDang)
        self.fight.event.off( Fight.FightEvent.byGeDang ,self.chkByGeDang)
        self.fight.event.off( Fight.FightEvent.byAtk ,self.chkByAtk)
        self.fight.event.off( Fight.FightEvent.byBaoJi ,self.chkByBaoJi)
        self.fight.event.off( Fight.FightEvent.baoJi ,self.chkBaoJi)
        self.fight.event.off( Fight.FightEvent.roundStart ,self.roundStart)
        
        if not fromSuper:
            self._delAttr()        

#战前加属性类被动
class PassiveSkill_extbuff(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_extbuff, self).__init__(role, skillData)
        when = self.conf['chkdata']['when'].lower()
        
        if when == 'roleinit':
            self.fight.event.on( Fight.FightEvent.roleInit ,self.chkExtBuff)  
    
    def chkExtBuff(self,emitData):
        if self.ifEmit()==False or emitData['to'] != self.role:
            return        
        
        pos = str(self.conf['chkdata'].get('pos',''))
        if pos!="":
            if pos=="1" and self.role.isFront()==False : return
            if pos=="0" and self.role.isBack()==False:return
        
        self.altAttr = self.fight.calcAttr( self.role , self.conf['v'] )
        self.fight.log(self.role,'属性发生变化', self.altAttr ,'byskill',self.data)
                
    def clear(self,fromSuper=False):
        super(PassiveSkill_extbuff, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.roleInit ,self.chkExtBuff)
        
        if not fromSuper:
            self._delAttr()    

#复活类被动技能
class PassiveSkill_fuhuo(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_fuhuo, self).__init__(role, skillData)
        
        when = self.conf['chkdata']['when'].lower()
        if when == 'dead':
            self.fight.event.on( Fight.FightEvent.byDead ,self.chkByDead)
     
    def chkByDead(self,emitData):
        #有人死亡时判断
        if self.ifEmit()==False:
            return
        if emitData['to'] != self.role: return #不是自己 
        self.fight.log(self.role,'死亡触发了fuhuo','by技能',self.data)
        self.role.data['canFuHuo'] = self.data['v']['pro']
        self.clear() #技能只会触发一次
   
    def clear(self,fromSuper=False):
        super(PassiveSkill_fuhuo, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.byDead ,self.chkByDead)
        
        if not fromSuper:
            self._delAttr()

#换肤类被动
class PassiveSkill_changeskin(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_changeskin, self).__init__(role, skillData)
        
        when = self.conf['chkdata']['when'].lower()
        if when == 'round':
            self.fight.event.on( Fight.FightEvent.roundStart ,self.roundStart)
        
    def roundStart(self,emitData):
        if self.ifEmit()==False:
            return
        
        number = str(self.conf['chkdata'].get('number',''))
        if number != "" and number != "-1" and  int(number) != emitData['turn'] : return
        
        self.fight.addActionLog({'act':'changeskin','to':self.role.rid,'skin':self.data['v']['skin'],"skillid":self.skillid})
   
    def clear(self,fromSuper=False):
        super(PassiveSkill_changeskin, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.roundStart ,self.roundStart)
            
          
#根据不同的技能类型，实例化不同的类
def addPassiveSkill(role,skillData):
    id2Class = {
        "fanji" : PassiveSkill_fanji,
        "runskill"  : PassiveSkill_runskill,
        "extbuff"  : PassiveSkill_extbuff,
        "fuhuo" : PassiveSkill_fuhuo,
        "changeskin" : PassiveSkill_changeskin,
    }    
    conf = role.fight.getSkill(skillData['skillid'])
    bdid = conf['bdid']
    if bdid in id2Class:
        id2Class[bdid]( role,skillData )
    else:
        PassiveSkill(role, skillData)
        
if __name__=='__main__':
    pass