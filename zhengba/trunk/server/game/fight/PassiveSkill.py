#!/usr/bin/python
#coding:utf-8
import random
import Fight
import copy

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
        self.maxTurnNum = skillData.get("chkdata", {}).get("turnnum", 999)
        self.turnNum = {}
        if self.bdid not in role.beidong:
            role.beidong[ self.bdid ] = []
        
        #加入到role的beidong集合
        role.beidong[ self.bdid ].append(self)

        self.fight.event.on(Fight.FightEvent.reducePassiveSkillTurn,self.reduceTurn)
    
    #根据技能配置的randnum，判断是否会触发
    def ifEmit(self):
        try:
            # 如果有被动就不触发
            if self.role.getBuff('unpassive'):
                return False
            return random.randint(1,1000) <= self.data['randnum']
        except:
            return False
    
    def reduceTurn(self):
        #回合数变化
        self.data['round'] -= 1
        self.fight.event.emit( Fight.FightEvent.passiveSkillTurnChange ,self)
        # 清除本轮触发次数
        self.useturnnum = 0

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

        elif when == 'hpchange':
            self.fight.event.on( Fight.FightEvent.hpChange ,self.chkHPChange)

    def chkHPChange(self,emitData):
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False or emitData.get('dot') == True or emitData['to'].roleType != "role" or (emitData['to'].lastHitBy and emitData['to'].lastHitBy.roleType != "role"):
            return

        # 受控不触发
        if self.conf['iscontrolrun'] == 1 and self.role.isSleep():
            return

        # 血量大于0不加
        if emitData['addnum'] >= 0 or emitData['to'] != self.role:
            return


        # dot和fanji不触发
        if 'dot' in emitData and emitData['dot'] == True:
            return

        # 自己攻击不触发
        if self.role == emitData['to'].lastHitBy:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return


        emitData['to'].fanshang(int(self.data['v']['pro'] * emitData['addnum'] * 0.001))
            
    def chkdata(self,emitData):
        #检测是否触发
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return


        # 判断是否被嘲讽
        _chaofengbuff = emitData['to'].getBuff("chaofeng")
        if _chaofengbuff:
            if not _chaofengbuff[0].fromrole.isDead():
                _targets = [_chaofengbuff[0].fromrole]
            else:
                _targets = self.fight.getTargetByConf(emitData['to'], self.conf['v'])
        else:
            _targets = self.fight.getTargetByConf(emitData['to'], self.conf['v'])

        _resTargets = []
        for role in _targets:
            conds = []

            chkjobs = self.conf['chkdata'].get('job',[])
            if len(chkjobs) > 0:
                conds.append(role.data['job'] in chkjobs) #指定职业

            if 'defless' in self.conf['chkdata']:
                #受到防御低于自己的目标攻击时反击
                conds.append(role.data['def'] < self.role.data['def'] )

            if conds and not all(conds):
                continue #有任何条件不满足，直接return

            _resTargets.append(role)

        if not _resTargets:
            return

        self.fight.log(self.role,'开始反击',_resTargets,'by技能',self.data)
        self.role.fanji( _resTargets , int(self.data['v']['pro']) )


    def chkByBaoJi(self,emitData):
        #被暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        
        self.fight.log(self.role,'开始反击',emitData['from'],'by技能',self.data)
        self.role.fanji( emitData['from'] , int(self.data['v']['pro']) )
        
        
    def chkBaoJi(self,emitData):
        #暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep():
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
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
        self.fight.event.off( Fight.FightEvent.hpChange ,self.chkHPChange)

        if not fromSuper:
            self._delAttr()       
    # 删除指定被动





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
        elif when == 'fightend':
            self.fight.event.on(Fight.FightEvent.fightEnd, self.fightEnd)
        elif when == 'deadover':
            self.fight.event.on(Fight.FightEvent.deadOver, self.deadOver)
        elif when == 'getbuff':
            self.fight.event.on(Fight.FightEvent.getBuff, self.getBuff)
        elif when == 'roundend':
            self.fight.event.on(Fight.FightEvent.roundEnd, self.roundEnd)

    def roundEnd(self, emitData):
        try:
            # 自己死亡需要clear()
            if 'iscancel' in self.conf['chkdata'] and self.conf['chkdata']['iscancel'] == 1 and self.role.isDead() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
                self.clear()
                return
        except:
            print "err passiveskill"
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        self.role.runSkills(self.conf['v']['runskill'], addLog=True)

    def getBuff(self, emitData):
        try:
            if self.role.isDead():
                self.clear()
                return
        except:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        # 1是敌方  -2是自己
        side = self.conf['chkdata']['side']
        if side == "-2" and emitData['to'] != self.role: return
        if side == "1" and emitData['to'].data['side'] == self.role.data['side']: return

        if'bufftype' in self.conf['chkdata']  and  emitData['bufftype'] not in self.conf['chkdata']['bufftype']:
            return

        self.fight.log(self.role, 'getbuff触发了runskill', self.conf['v']['runskill'], 'by技能', self.data)
        self.role.runSkills(self.conf['v']['runskill'], addLog=True)

    def fightEnd(self, emitData):
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        self.fight.log(self.role, 'fightEnd触发了runskill', self.conf['v']['runskill'], 'by技能', self.data)
        self.role.runSkills(self.conf['v']['runskill'], addLog=True)

    def deadOver(self, emitData):
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        self.fight.log(self.role, 'deadOver触发了runskill', self.conf['v']['runskill'], 'by技能', self.data)
        self.role.runSkills(self.conf['v']['runskill'], addLog=True)

    def roundStart(self,emitData):
        #回合开始时判断
        if self.role.isDead() or self.ifEmit()==False or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        #self.data['nowindex'] - self.role.data.get('xpskillindex)
        if 'xpskillindex' in self.conf['chkdata'] and (self.role.data.get('xpskillindex',0) != int(self.conf['chkdata']['xpskillindex']) or self.role.data.get('afterXpskillRound') != int(self.conf['chkdata']['round'])):
            return

        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep():
            return        
        
        number = str(self.conf['chkdata'].get('number',''))
        # 如果是援军
        if self.role.data.get('isyuanjun'):
            if number != "" and number != "-1" and emitData['turn'] - self.role.data['upturn'] != int(number):
                return
        else:
            if number != "" and number != "-1" and  int(number) != emitData['turn']:
                return

        # 百分比比较
        if 'pro' in self.conf['chkdata']:
            _temp = {'maxhp': {'type': 'hp', 'max':self.role.data['maxhp']}}
            if cmp(self.role.data[_temp[self.conf['chkdata']['type']]['type']] / _temp[self.conf['chkdata']['type']]['max'],self.conf['chkdata']['pro']/1000.0) != int(self.conf['chkdata']['cond']):
                return

        # 自己死亡需要clear()
        if 'iscancel' in self.conf['chkdata'] and self.conf['chkdata']['iscancel'] == 1 and self.role.isDead():
            self.clear()
            return

        self.fight.log(self.role,'roundStart触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )        
    
    def chkByBaoJi(self,emitData):
        #被暴击时判断
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        self.fight.log(self.role,'被暴击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )
        
        
    def chkBaoJi(self,emitData):
        #暴击时判断
        if self.role.isDead() or emitData['from'].isDead() or self.ifEmit()==False or self.role.isSleep() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
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
        if self.role.isDead() or self.ifEmit()==False or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum: #### or self.role.isSleep():
            return        
        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return
        # # 种族克制
        # if 'upjob' in self.conf['chkdata'] and int(self.conf['chkdata']['upjob']) == 1 and self.fight.ifZhongZuKeZhi(emitData['from'], emitData['to'][0]):
        #     return
        
        emitTimes = 1
        atkType = self.conf['chkdata'].get('atktype','') #配置中是小写的，游戏逻辑是atkType
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验

        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['from'] != self.role: return #不是自己
        if side == '0' and emitData['from'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['from'].data['side'] == self.role.data['side'] : return #不是敌人

        _skillRunat = None
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
                if emitData and "to"in emitData and len(emitData["to"]) > i:
                    _skillRunat = emitData["to"][i]
                self.role.runSkills(self.conf['v']['runskill'], addLog=True, skillRunAt=_skillRunat)
        else:
            _skillRunat = emitData["to"]
            self.role.runSkills(self.conf['v']['runskill'], addLog=True, skillRunAt=_skillRunat)
            
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
        if 'iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 1 and self.role.isSleep() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:

            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        atkType = self.conf['chkdata'].get('atktype','') #配置中是小写的，游戏逻辑是atkType
        if atkType != "" and atkType != emitData["atkType"]: return #攻击类型校验
        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人

        self.turnNum[str(self.fight.turn)] = self.turnNum.get(str(self.fight.turn), 0) + 1
        self.fight.log(self.role,'被攻击事件触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True, skillRunAt=emitData["to"])
            
    def chkGeDang(self,emitData):
        #格挡时判断
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
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

        # 记录成功格挡次数
        self.role.signData['gedang'] += 1
        # 如果需要判断格挡次数
        if 'count' in self.conf['chkdata']:
            if self.role.signData['gedang'] < self.conf['chkdata']['count']:
                return
            else:
                self.role.signData['gedang'] = 0
        else:
            if self.role.isSleep():
                return

        self.fight.log(self.role,'格挡触发了runskill',self.conf['v']['runskill'],'by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True,skillRunAt=emitData['to']  )
        
    def chkByGeDang(self,emitData):
        #被格挡时判断
        #检测是否触发
        if self.role.isDead() or self.ifEmit()==False or self.role.isSleep() or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
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
        if self.ifEmit()==False or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return

        # 自己死亡需要clear()
        if 'iscancel' in self.conf['chkdata'] and self.conf['chkdata']['iscancel'] == 1 and self.role.isDead():
            self.clear()
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人        
        
        self.fight.log(self.role,'死亡触发了runskill','by技能',self.data)

        self.role.runSkills( self.conf['v']['runskill'],addLog=True, skillRunAt=emitData.get("fromrole", None))

        
        once = str(self.conf['chkdata'].get('once','0'))
        if str(once)=='1':
            self.clear();
    
    def chkByRealDead(self,emitData):
        #有人死亡且不会触发时判断
        if self.ifEmit()==False or self.turnNum.get(str(self.fight.turn), 0) >= self.maxTurnNum:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return
        side = str(self.conf['chkdata'].get('side',''))
        if side == '-2' and emitData['to'] != self.role: return #不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side'] : return #不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side'] : return #不是敌人        
        
        self.fight.log(self.role,'死亡触发了runskill','by技能',self.data)
        self.role.runSkills( self.conf['v']['runskill'],addLog=True )    
    
    def chkHPChange(self,emitData):
        #血量变化时判断
        if self.ifEmit()==False or ('iscontrolrun' in self.conf and int(self.conf['iscontrolrun']) == 0 and self.role.isSleep()) or emitData['to'] != self.role:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
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
        self.fight.event.off( Fight.FightEvent.fightEnd ,self.fightEnd)
        self.fight.event.off( Fight.FightEvent.deadOver ,self.deadOver)
        self.fight.event.off( Fight.FightEvent.getBuff ,self.getBuff)
        self.fight.event.off(Fight.FightEvent.roundEnd, self.roundEnd)

        
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

        # 种族的加成
        if 'zhongzu' in self.conf['chkdata']:
            # 上阵该职业的英雄个数
            _num = len([i for i in self.fight.roles if i.data['side'] == self.role.data['side'] and i.data['zhongzu'] in self.conf['chkdata']['zhongzu']])
            if _num == 0:
                return
            for key in self.conf['v']:
                self.conf['v'][key] *= _num
        
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

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return


        # 如果有复活被动
        if self.role.getBuff('fuhuo'): return
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
        # 如果是援军
        if self.role.data.get('isyuanjun'):
            if number != "" and number != "-1" and emitData['turn'] - self.role.data['upturn'] != int(number):
                return
        else:
            if number != "" and number != "-1" and int(number) != emitData['turn']:
                return

        # 自己死亡需要clear()
        if 'iscancel' in self.conf['chkdata'] and self.conf['chkdata']['iscancel'] == 1 and self.role.isDead():
            self.clear()
            return
        
        self.fight.addActionLog({'act':'changeskin','to':self.role.rid,'skin':self.data['v']['skin'],"skillid":self.skillid})
   
    def clear(self,fromSuper=False):
        super(PassiveSkill_changeskin, self).clear(fromSuper=True)
        self.fight.event.off( Fight.FightEvent.roundStart ,self.roundStart)


# 招小弟类被动技能
class PassiveSkill_kuilei(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_kuilei, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'roundend':
            self.fight.event.on(Fight.FightEvent.roundEnd, self.roundEnd)

    def roundEnd(self, emitData):
        # 第15回合就clear
        if emitData['turn'] == self.fight.maxTurn:
            self.clear()
            return

        # 在ready状态就被打死了
        if self.role.isDead() and self.role.data['ready'] == True:
            self.clear()
            return

        # 魔王存活就招小怪
        _ranRid = []
        if not self.role.isDead():
            _ranRid = random.sample(self.role.rids, self.role.data['kuileinum'])
            for i in self.fight.roles:
                if i.rid in _ranRid:
                    # i.data = self.role.kuileiData[i.rid].copy()
                    i.data['hp'] = i.data['maxhp']
                    i.data['ready'] = True
                    i.data['dead'] = False
                    i.clearAllBuffs()
                    i.clearAllPassives()
                    i.fmtSkill()
                    self.fight.addActionLog({'act':'hp','r':i.rid,'v':i.data['maxhp'],'nv':i.data['maxhp'],'noShow':1})

            self.fight.addActionLog({'act': 'kuileishow','showrole':_ranRid})
            self.role.data['dead'] = True
            self.role.data['ready'] = False
            self.fight.call = True
            self.fight.f5PosInfo()
        else:
            for i in self.fight.roles:
                # 魔王这一边的
                if i.data['side'] == self.role.data['side'] and i.rid != self.role.rid and (not i.isDead() or i.getPassiveSkill('fuhuo')):
                    return

            for i in self.fight.roles:
                # 魔王这一边的
                if i.data['side'] == self.role.data['side'] and i.rid != self.role.rid:
                    i.data['ready'] = False
                    i.data['dead'] = True

            # 复活魔王
            self.fight.addActionLog({'act': 'mowangshow'})
            self.role.data['dead'] = False
            self.role.data['ready'] = True

        self.fight.roleActionStop()

    def clear(self, fromSuper=False):
        super(PassiveSkill_kuilei, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.roundEnd, self.roundEnd)



# 招小弟类被动技能
class PassiveSkill_call(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_call, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'roundend':
            self.fight.event.on(Fight.FightEvent.roundEnd, self.roundEnd)

    def roundEnd(self, emitData):
        # 第15回合就clear
        if emitData['turn'] == self.fight.maxTurn:
            self.clear()
            return

        # 在ready状态就被打死了
        if self.role.isDead() and self.role.data['ready'] == True:
            self.clear()
            return

        # 魔王存活就招小怪
        _ranRid = []
        if not self.role.isDead():
            _show = 0
            # _ranRid = random.sample(self.role.rids, self.role.data['kuileinum'])
            for i in self.fight.roles:
                if i.isDead() and len(_ranRid) <= self.role.data['kuileinum'] and i.data['side'] == self.role.data['side']:
                    i.data['hp'] = i.data['maxhp']
                    i.data['ready'] = True
                    i.data['dead'] = False
                    i.clearAllBuffs()
                    i.clearAllPassives()
                    i.fmtSkill()
                    self.fight.addActionLog(
                        {'act': 'hp', 'r': i.rid, 'v': i.data['maxhp'], 'nv': i.data['maxhp'], 'noShow': 1})
                    _show = 1
                    _ranRid.append(i.rid)
                    break

            if _ranRid and _show:
                self.fight.addActionLog({'act': 'kuileishow', 'showrole': _ranRid})

                self.fight.call = True
                self.fight.f5PosInfo()

        self.fight.roleActionStop()

    def clear(self, fromSuper=False):
        super(PassiveSkill_call, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.roundEnd, self.roundEnd)



# 招小弟类被动技能
class PassiveSkill_addbosshp(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_addbosshp, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'hpchange':
            self.fight.event.on(Fight.FightEvent.hpChange, self.hpChange)

    def hpChange(self, emitData):
        # 我方加血
        if self.role.data['side'] == emitData['to'].data['side'] and emitData['addnum'] >= 0:
            return
        # 对方扣血
        elif self.role.data['side'] != emitData['to'].data['side'] and emitData['addnum'] <= 0:
            return

        self.role.data['hp'] += abs(emitData['addnum'])
        self.fight.addActionLog({'act': 'hp','r':self.role.rid,'v':abs(emitData['addnum']),'nv':self.role.data['hp']})
        # 如果血量满了  这场战斗就结束了
        if self.role.data['hp'] >= self.role.data['maxhp']:
            self.fight.addActionLog({'act': 'lanlongskill','from':self.role.rid})
            for i in self.fight.roles:
                if i.data['side'] == self.role.data['side']:
                    i.data['dead'] = True
                    self.fight.addActionLog({'act': 'hp', 'r': i.rid, 'v': i.data['hp'], 'nv': 0})
                    self.fight.addActionLog({'act': 'dead', 'to': i.rid, 'canFuHuo':False})

            self.fight.addActionLog({"v": 0,"act": "fightres"})

    def clear(self, fromSuper=False):
        super(PassiveSkill_addbosshp, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.hpChange, self.hpChange)


# 受到控制触发类技能
class PassiveSkill_controlbuffround(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_controlbuffround, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'getbuff':
            self.fight.event.on(Fight.FightEvent.getBuff, self.getBuff)

    def getBuff(self, emitData):
        try:
            if self.role.isDead():
                self.clear()
                return
        except:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return


        role = emitData["to"]
        buff = emitData["buff"]
        if role != self.role:
            return

        _buffCon = buff.conf
        # 如果不是控制技能
        if _buffCon["iscontrol"] != "1":
            return
        buff.reduceTurn()

    def clear(self, fromSuper=False):
        super(PassiveSkill_controlbuffround, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.getBuff, self.getBuff)


# 复制对方buff
class PassiveSkill_copybuff(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_copybuff, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'roundend':
            self.fight.event.on(Fight.FightEvent.roundEnd, self.roundend)

    def roundend(self, emitData):

        if self.role.isDead():
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        _skill = {"order": "", "islive": "1", "pos": "0", "limit": "1", "side": "6"}
        # 选出复制debuff的role
        targets = self.fight.getTargetByConf(self.role, _skill)
        if not targets:
            return
        fromrole = targets[0]
        # 选出增加debuffrole的人
        _skill = {"order": "", "islive": "1", "pos": "0", "limit": "", "side": "1"}
        targets = self.fight.getTargetByConf(self.role, _skill)
        # 排除掉母体
        if fromrole in targets:
            targets.remove(fromrole)
        targets = targets[:self.conf["v"]["num"]]

        # 循环生成buff数据
        _addNum = 0
        for buffid, arr in fromrole.buff.items():
            if not arr:
                continue
            _con = fromrole.fight.getBuff(buffid)
            if _con["gtype"] != "2":
                continue
            _addNum += 1
            # 最高三层
            for i in arr[:3]:
                for role in targets:
                    _buffinfo = i.data.copy()
                    del _buffinfo["from"]

                    role.addBuff(self.role, _buffinfo)
            if _addNum >= self.conf["v"]["typenum"]:
                break



    def clear(self, fromSuper=False):
        super(PassiveSkill_copybuff, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.roundEnd, self.roundend)


# 处理黑暗之魂
class PassiveSkill_heianzhihun(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_heianzhihun, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'roundstart':
            self.fight.event.on(Fight.FightEvent.roundStart, self.roundStart)
        elif when == 'roundend':
            self.fight.event.on(Fight.FightEvent.roundEnd, self.roundend)
        elif when == 'dead':
            self.fight.event.on( Fight.FightEvent.byDead ,self.chkByDead)


    def chkByDead(self,emitData):
        # 死亡触发
        if not self.role.isDead():
            return
        self.role.addBuff(self.role, self.conf["v"])

        # 判断是否达到4层
        _buffList = self.role.getBuff(self.conf["v"]["buffid"])
        if len(_buffList) >= 4 and self.role.data.get("heianzhihun", False):
            self.role.data['canFuHuo'] = self.data['v']['pro']
            # 恢复满怒气
            _addNuQi = 100 - self.role.data['nuqi']
            if _addNuQi:
                self.role.modifyNuQi(_addNuQi)
            # 删除buff
            self.role.clearBuffByType(self.conf["v"]["buffid"])

    def roundStart(self, emitData):
        # 死亡触发
        if not self.role.isDead():
            return
        self.role.addBuff(self.role, self.conf["v"])

        # 判断是否达到4层
        _buffList = self.role.getBuff(self.conf["v"]["buffid"])
        if len(_buffList) >= 4 and self.role.data.get("heianzhihun", False):
            self.role.data['canFuHuo'] = self.data['v']['pro']
            # 恢复满怒气
            _addNuQi = 100 - self.role.data['nuqi']
            if _addNuQi:
                self.role.modifyNuQi(_addNuQi)
            # 删除buff
            self.role.clearBuffByType(self.conf["v"]["buffid"])

    def roundend(self, emitData):
        # 死亡触发
        if not self.role.isDead():
            return
        self.role.runSkills(self.conf['v']['runskill'], addLog=True)



    def clear(self, fromSuper=False):
        super(PassiveSkill_heianzhihun, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.roundStart, self.roundStart)
        self.fight.event.off(Fight.FightEvent.byDead, self.chkByDead)
        self.fight.event.off(Fight.FightEvent.roundEnd, self.roundend)


# 处理精心准备
class PassiveSkill_jingxingready(PassiveSkill):
    def __init__(self, role, skillData):
        super(PassiveSkill_jingxingready, self).__init__(role, skillData)

        self.fight.call = False
        self.boss = None
        when = self.conf['chkdata']['when'].lower()
        if when == 'getbuff':
            self.fight.event.on(Fight.FightEvent.getBuff, self.getBuff)
        elif when == 'hpchange':
            self.fight.event.on(Fight.FightEvent.hpChange, self.hpChange)

    def hpChange(self, emitData):
        # 被攻击时判断
        # 检测是否触发
        '''
        if self.role.isDead() or self.ifEmit()==False or self.role.isSleep():
            return
        '''

        if self.role.isDead() or self.ifEmit() == False:
            return
        # 2018-8-7 将isSleeo改为配置可控
        if 'iscontrolrun' in self.conf and int(
                self.conf['iscontrolrun']) == 1 and self.role.isSleep() or self.turnNum.get(str(self.fight.turn),
                                                                                            0) >= self.maxTurnNum:
            return
        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return


        if emitData["addnum"] > 0 or self.role.data["hp"] * 100 / self.role.data["maxhp"] > 30 or self.role.data["hp"] <= 0:
            return

        side = str(self.conf['chkdata'].get('side', ''))
        if side == '-2' and emitData['to'] != self.role: return  # 不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side']: return  # 不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side']: return  # 不是敌人

        buffs = self.role.buff.get("jingxingready",[])
        # for buff in buffs:
        #     # 如果这个buff免疫清除
        #     if buffs[0].data.get("ismianyi", 0):
        #         continue
        #     buffs[0].clear()
        _clearMaxNum = self.conf["v"]["delnum"]
        if len(buffs) < _clearMaxNum:
            return

        _skill = {"order": "hp,desc", "islive": "1", "pos": "2", "limit": "", "side": "1"}
        targetList = self.fight.getTargetByConf(self.role, _skill)
        _targetlist = []
        for target in targetList:
            if target.data["hp"] > self.role.data["hp"]:
                _targetlist.append(target)

        if len(_targetlist) > 0:
            _toRole = _targetlist[0]
            if _toRole.data["hp"] <= self.role.data["hp"]:
                return
            _maxdpspro = self.conf["v"]["maxdpsatkpro"]
            _add = _toRole.data["hp"] - self.role.data["hp"]
            # 判断最大值
            if _add > self.role.data["atk"] * _maxdpspro / 1000:
                _add = self.role.data["atk"] * _maxdpspro / 1000

            _toRole.modifyHP(-_add)
            _toRole.setSignNum('dps', -_add)

            self.role.modifyHP(_add)
            self.role.setSignNum('dps', _add)

            mianyi = 0
            _clearNum = 0
            while len(buffs) > 0 and mianyi < len(buffs) and _clearNum < _clearMaxNum:
                if buffs[0].data.get("ismianyi", 0):
                    mianyi += 1
                    continue
                buffs[0].clear()
                _clearNum += 1

    def getBuff(self, emitData):
        try:
            if self.role.isDead():
                self.clear()
                return
        except:
            return

        # 如果有封印被动的buff
        if self.role.getBuff("lightseal"):
            return

        _buffType = emitData["bufftype"]
        _buffCon = self.role.fight.getBuff(_buffType,copy=False)
        if _buffCon["gtype"] != "2":
            return
        buffs = self.role.buff.get("jingxingready",[])


        side = str(self.conf['chkdata'].get('side', ''))
        if side == '-2' and emitData['to'] != self.role: return  # 不是自己
        if side == '0' and emitData['to'].data['side'] != self.role.data['side']: return  # 不是己方
        if side == '1' and emitData['to'].data['side'] == self.role.data['side']: return  # 不是敌人

        if _buffCon["iscontrol"] == "1":
            _clearMaxNum = self.conf["v"]["del2num"]
            if len(buffs) < _clearMaxNum:
                return
            # self.role.clearBuffByType(_buffType)
            # # buff反弹
            _buffData = emitData["buff"].data.copy()
            emitData["buff"].clear()
            if "hid" in _buffData["from"].data:
                _buffData["from"].addBuff(self.role, _buffData)
            if hasattr(emitData["buff"], 'buffType'):

                emitData["buff"].clear()

        else:
            _clearMaxNum = self.conf["v"]["delnum"]
            if len(buffs) < _clearMaxNum:
                return

            emitData["buff"].clear()


        mianyi = 0
        _clearNum = 0
        while len(buffs) > 0 and mianyi < len(buffs) and _clearNum < _clearMaxNum:
            if buffs[0].data.get("ismianyi", 0):
                mianyi += 1
                continue
            buffs[0].clear()
            _clearNum += 1

    def clear(self, fromSuper=False):
        super(PassiveSkill_jingxingready, self).clear(fromSuper=True)
        self.fight.event.off(Fight.FightEvent.getBuff, self.getBuff)
        self.fight.event.on(Fight.FightEvent.hpChange, self.hpChange)




#根据不同的技能类型，实例化不同的类
def addPassiveSkill(role,skillData):
    id2Class = {
        "fanji" : PassiveSkill_fanji,
        "runskill"  : PassiveSkill_runskill,
        "extbuff"  : PassiveSkill_extbuff,
        "fuhuo" : PassiveSkill_fuhuo,
        "changeskin" : PassiveSkill_changeskin,
        "kuilei" : PassiveSkill_kuilei,
        "call":PassiveSkill_call,
        "addbosshp" : PassiveSkill_addbosshp,
        "controlbuffround": PassiveSkill_controlbuffround,
        "copybuff":PassiveSkill_copybuff,
        "heianzhihun": PassiveSkill_heianzhihun,
        "jingxingready": PassiveSkill_jingxingready
    }


    if 'bdid' in skillData:
        #理论上skillData中会有bdid这个key的，但是为了兼容原来的逻辑，确保无误，这里加个判断
        bdid = skillData['bdid']
    else:
        #不读取配置，减少copy消耗
        conf = role.fight.getSkill(skillData['skillid'])
        bdid = conf['bdid']
        
    if bdid in id2Class:
        id2Class[bdid]( role,skillData )
    else:
        PassiveSkill(role, skillData)
        
if __name__=='__main__':
    pass