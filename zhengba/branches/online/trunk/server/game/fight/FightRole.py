#!/usr/bin/python
#coding:utf-8

#战斗类
import g,event
import random,string,time,uuid
import Buff,PassiveSkill,Fight,AfterAtk

_MAXNUQI = 180

class FightRole(object):
    index = 0
    def __init__ (self,fight):
        self.rid = "role_"+str(FightRole.index)
        FightRole.index += 1
        '''
        特殊属性可选值：
        lockNuQi = 锁定怒气
        lockHP = 锁定血量
        '''
        self.attr = {} #特殊属性
        self.event = event.EventEmitter() 
        self.data = None #战斗数据
        self.fight = fight #战斗实例
        self.inited = False #是否已初始化
        self.buff = {} #角色战斗中buff
        self.beidong = {} #战斗中的被动属性
        self.actionLogData = {} #当前行动回合中有可能需要推给发送给客户端的变化数据
        
        self.lastSkillTarget = None #最后一次主动技能选择出的目标
        self.lastAtkType = "normalskill" #最后一次出手时的攻击类型 normalskill/xpskill
        self.lastHitBy = None #最后一次被谁攻击
        self.signData = {'dps':0,'addhp':0} #战斗统计值{'dps':'累计输出伤害','addhp':'总加血量'}
        self.roleType = "role"
    
    def setAttr(self,_type,val):
        #设定一些特殊的属性
        self.attr[_type] = val
        
    def getAttr(self,_type):
        #获取attr中的属性
        return self.attr.get(_type,None)
    
    def clear(self):
        self.fight.log('clear..',self)
        #清理buff
        self.clearAllBuffs()
        
        #清理被动技能
        for bdid,beidongs in self.beidong.items():
            while len(beidongs)>0:
                beidongs[0].clear()
        
        self.event.off_all()
        
        del self.data
        del self.fight
        del self.buff
        del self.beidong
        del self.actionLogData
    
    def __str__ (self):
        return str(self.rid) + '->'+ str(self.data)

    #通过数据初始化角色
    def initRoleByData (self,roleData):
        if 'dead' not in roleData:
            roleData['dead'] = False
        
        #记录原始攻击值，用于某些技能中设定“不超过面板攻击力上限多少倍”的设定
        #roleData['_rawAtk'] = roleData['atk']
        roleData['rid'] = self.rid
        
        self.data = roleData
        self.inited = True
        
        self.fmtSkill()
        return self
    
    #格式化技能数据
    def fmtSkill (self):
        skills = [self.data['normalskill'],self.data['xpskill']]
        skills.extend(self.data.get('skill',[]))
        for skillid in skills:
            self.runSkill(skillid)
    
    #运行一个技能组
    def runSkills(self,skillids,addLog=False,skillRunAt=None):
        for skillid in skillids:
            self.runSkill(skillid,addLog=addLog,skillRunAt=skillRunAt)
    
    #运行单个技能        
    def runSkill(self,skillid , addLog=False,skillRunAt=None):
        sc = self.fight.getSkill(skillid)
        sc['skillid'] = skillid
        if sc['type'] == '1':return #面板属性技能
        if sc['type'] == '2':return #攻击技能
        if sc['type'] == '3':
            return self.runAfterAtkSkill(sc , addLog=addLog,skillRunAt=skillRunAt)
        if sc['type'] == '4':#被动技能
            return self.addPassiveSkill(self, sc , addLog=addLog,skillRunAt=skillRunAt)
                
    #增加一个buff，buffData参见Buff类注释
    def addBuff (self,fromwho,buffData):
        buffData['from'] = fromwho
        
        _buff = Buff.Buff(self,buffData)
        self.fight.log(self,'增加了buff',buffData,_buff)
    
        
    #删掉所有buff    
    def clearAllBuffs(self):
        for buffType,buffs in self.buff.items():
            while len(buffs)>0:
                buffs[0].clear()        

    #清除指定类型的buff
    def clearBuffByType(self,buffType): 
        buffs = self.buff.get(buffType,[])
        while len(buffs)>0:
            buffs[0].clear() 
    
    #返回某类buff的pro累计总和
    def getSumProByBuffType(self,buffType,_filter=None):
        val = 0
        buffs = self.getBuff(buffType)
        if len(buffs) > 0:
            for buff in buffs:
                if _filter==None or _filter(buff):
                    val += int(buff.data['pro'])
        return val
    
    #由于fromRole使用了bySkillConf技能，恢复千分之pro的攻击生命
    def recoverHPByPro(self,pro,fromRole=None,bySkillConf=None):
        self.fight.log(self,'恢复攻击生命，千分之',pro,'技能配置',bySkillConf)
        num = self.fight.getAddHP(fromRole,pro,self.lastAtkType)
        self.modifyHP(num)
        if fromRole:
            fromRole.setSignNum('addhp',num)
        
    #由于fromRole使用了bySkillConf技能，造成其生命上限千分之pro的伤害
    #maxdpsatkpro = 最终扣血不超过fromRole atk 的 maxdpsatkpro/1000 
    def delHPByPro(self,pro,fromRole=None,bySkillConf=None,maxdpsatkpro=None):
        self.fight.log(self,'扣除生命值，上限的千分之',pro)
        num = int(self.data['maxhp'] * pro / 1000.0)
        
        #不超过攻击力的上限
        if maxdpsatkpro!=None:
            maxNum = int(fromRole.data['atk'] * maxdpsatkpro/1000.0)
            if num > maxNum:
                num = maxNum
        
        if self.fight.ftype == 'pve':
            num = int(num * 0.5)

        num *= -1
        
        self.modifyHP(num)
        if fromRole:
            fromRole.setSignNum('dps',num)
    
    #由于fromRole使用了bySkillConf技能，造成目标生命上限恢复xx%
    def addHPByPro(self,pro,fromRole=None,bySkillConf=None):
        self.fight.log(self,'成目标生命上限恢复百分比',pro)
        num = int(self.data['maxhp'] * pro / 1000.0) 
        self.modifyHP(num)
        if fromRole:
            fromRole.setSignNum('addhp',num)
    
    #由于fromRole使用了bySkillConf技能，恢复value血量
    def addHPByNum(self,value,fromRole=None,bySkillConf=None):
        self.fight.log(self,'目标生命恢复',value)
        num = int(value) 
        self.modifyHP(num)
        if fromRole:
            fromRole.setSignNum('addhp',num)        
    
    #恢复已损失血量x%的生命
    def addHPByLosePro(self,pro,fromRole=None,bySkillConf=None):
        self.fight.log(self,'恢复已损失血量百分比',pro)
        num = int( (self.data['maxhp'] - self.data['hp']) * pro / 1000.0) 
        if num>0:
            self.modifyHP(num)
            if fromRole:
                fromRole.setSignNum('addhp',num)        
       
    #获取一个buffType，不存在时返回空[]
    def getBuff(self,buffType):
        return self.buff.get(buffType,[])
    
    #增加一个被动技能，skillData参见PassiveSkill类注释
    def addPassiveSkill (self,fromwho,skillData,addLog=False,skillRunAt=None):
        skillData['from'] = fromwho
        PassiveSkill.addPassiveSkill(self,skillData)
    
    #运行一个攻击后技能
    def runAfterAtkSkill(self,skillconf , addLog=False,skillRunAt=None):
        targets = self.fight.getTargetBySkillID(self,skillconf['skillid'],skillRunAt)
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
    
    def ifBaoJi(self):
        return random.randint(1,1000) <= self.getProVal('baoji')
    
    #增加一个战斗数据日志
    def addLogData (k,v):
        if k not in self:
            self.actionLogData[k] = v
        else:
            self.actionLogData[k] += v
    
    #角色是否处于前排                
    def isFront (self):
        return 'isFront' in self.data and self.data['isFront']==True
    
    #角色是否处于后排
    def isBack (self):
        return 'isBack' in self.data and self.data['isBack']==True

    #是否已死亡，高频快捷方法
    def isDead (self):
        return self.data['dead']
    
    #检测是否已经死亡
    def checkDead (self):
        
        if self.data['hp'] <= 0:
            willDead = True
        else:
            willDead = False
        
        #print 'willDead',willDead,self.data['dead']
        #生存状态发生改变，则需要刷新位置信息
        deadHappend = False
        if self.data['dead'] != willDead:
            if willDead:
                deadHappend = True
                
            self.fight.log(self,'死亡状态设置为',willDead);
            self.data['dead'] = willDead
            self.fight.f5PosInfo()
            
        self.data['dead'] = willDead
        return deadHappend
    
            
    #修改血量
    #emitRealDead = 如果改变血量发生了死亡时，时候广播事件
    def modifyHP(self,addnum,addlog=True,extData=None, emitRealDead=True):
        res = {}
        
        #没有锁定血量的话
        if not self.getAttr('lockHP'):
            self.data['hp'] += addnum
        
        if self.data['hp'] > self.data['maxhp']:
            self.data['hp'] = self.data['maxhp']
            
        self.fight.log(self,'生命值变化',addnum)
        
        res['v'] = addnum
        res['nv'] = self.data['hp']
        
        if addlog:
            log = {'act':'hp','r':self.rid,'v':addnum,'nv':self.data['hp']}
            
            if extData:
                #简化后输出给客户端
                if 'atkType' in extData:
                    at = extData['atkType']
                    if extData['atkType']=='xpskill':at="xp"
                    if extData['atkType']=='normalskill':at="nm"
                    extData['at'] = at
                    del extData['atkType']
                    
                if 'ifJingZhun' in extData:
                    extData['jz'] = extData['ifJingZhun']
                    del extData['ifJingZhun']                    
                 
                if 'ifBaoJi' in extData:
                    extData['bj'] = extData['ifBaoJi']
                    del extData['ifBaoJi']  
                    
                log.update(extData)
                
            self.fight.addActionLog(log)
        
        deadHappend = self.checkDead()
        res['dead'] = False
        res['canFuHuo'] = False
        
        self.fight.event.emit( Fight.FightEvent.hpChange,{"to":self,"addnum":addnum})
        if deadHappend:
            res['dead'] = True
            self.fight.event.emit( Fight.FightEvent.byDead ,{"to":self})
            
            canFuHuo = self.data.get('canFuHuo',False)
            res['canFuHuo'] = canFuHuo
           
            if not canFuHuo and emitRealDead:
                self.fight.event.emit( Fight.FightEvent.byRealDead ,{"to":self})   
                
            self.fight.addActionLog({'act':'dead','to':self.rid,'canFuHuo':canFuHuo})
        
        return res
        
    #修改怒气
    def modifyNuQi(self,addnum,addlog=True):
        
        if self.getAttr('lockNuQi'):
            return
        
        if addnum>0 and self.data['nuqi'] < _MAXNUQI:
            self.data['nuqi'] += addnum
        else:
            self.data['nuqi'] += addnum
        
        if self.data['nuqi']<0:
            self.data['nuqi'] = 0
        
        if addlog:
            self.fight.addActionLog({'act':'nuqi','r':self.rid,'v':addnum,'nv':self.data['nuqi']})
        self.fight.log(self,'怒气变化',addnum)
        self.fight.event.emit( Fight.FightEvent.nuQiChange,{"to":self,"addnum":addnum})
    
    #检测是否有掉血buff
    def checkDiaoXue (self):
        if self.isDead():return
        self.fight.log('检测掉血类buff',self)
        
        allBuff = self.getBuff('diaoxue') + self.getBuff('zhongdu') + self.getBuff('liuxue') + self.getBuff('zhuoshao') + self.getBuff('roundsign')
        dps = 0
        for buff in allBuff:  #这里有相同的bug，需求上暂不修改： [:]
            
            #如果配置里有isend，表示只有在最后一个回合的时候触发，如：回合印记
            if ('isend' not in buff.data) or ( str(buff.data['isend'])=='0') or (str(buff.data['isend'])=='1' and buff.data['round']==1):
                dps += buff.resValue
                #form对象buff带来的输出记录
                buff.fromrole.setSignNum('dps',buff.resValue)
            
            if buff.data['round']==1:
                buff.clear()
        
        if dps!=0:
            self.fight.log('掉血类buff累计造成伤害',dps)
            self.modifyHP(dps)

    #检测是否有回复血buff
    def checkHuiFu (self):
        if self.isDead():return
        self.fight.log('检测恢复类buff',self)
        
        allBuff = self.getBuff('hpback')
        addnum = 0
        for buff in allBuff[:]:
            if buff.ifEmit():
                addnum += buff.resValue
            
            if buff.data['round']==1:
                buff.clear()            
        
        if addnum!=0:
            self.fight.log('回复类buff累计加血',addnum)
            self.modifyHP(addnum)
            self.setSignNum('addhp',addnum)

    #返回是否无法行动，冰冻/眩晕/石化
    def isSleep (self):
        res = len(self.getBuff('bingdong'))>0 \
            or len(self.getBuff('xuanyun'))>0 \
            or len(self.getBuff('shihua'))>0
        return res
    
    #开始攻击
    def atk (self):
        if self.isDead():return False
        
        atkType = None
        _xpSkillDelNuQi = 0
        
        #判断是普攻还是怒气攻击
        #沉默：无法释放怒气攻击
        #禁魔：无法释放怒气攻击
        if self.data['nuqi'] < 100 or len(self.getBuff('jinmo'))>0 or len(self.getBuff('chenmo'))>0:
            skillid = self.data['normalskill']
            #如果被动技能中有替换普攻的
            beiDongChangeskill = self.getPassiveSkill('changeskill')
            if len(beiDongChangeskill)>0:
                skillid = str(beiDongChangeskill[0].conf['v']['runskill'][0])
                
            atkType = "normalskill"
        else:
            skillid = self.data['xpskill']
            atkType = "xpskill"
            _xpSkillDelNuQi = self.data['nuqi']
            
            #神殿魔王时，新加的一个逻辑：对xpskill增加了一个 atkround 的数组配置，用于控制这个技能只在某些回合时才会触发
            #如果不满足这些回合数，则切换到normalskill
            _skillConf = self.fight.getSkill(skillid)
            if 'atkround' in _skillConf and len(_skillConf['atkround'])>0 and int(self.fight.turn) not in _skillConf['atkround']:
                skillid = self.data['normalskill']
                atkType = "normalskill"
                _xpSkillDelNuQi = 0
        
        #判断是否有给主动技能增加附加技能的skill
        addAfterSkill = self.getPassiveSkill('addafterskill')
        _addAfterSkillIDS = []
        if len(addAfterSkill)>0:
            for _askill in addAfterSkill:
                if 'chkdata' in _askill.conf and 'atktype' in _askill.conf['chkdata'] and atkType!=_askill.conf['chkdata']['atktype']:
                    continue
                _addAfterSkillIDS += _askill.conf['v']['runskill']
                self.fight.log(self,'给主动技能增加附加技能',_addAfterSkillIDS)
        
        #选敌   
        self.lastSkillTarget = self.fight.getTargetBySkillID(self,skillid)
        
        if len(self.lastSkillTarget) == 0:
            self.fight.log(self,'使用技能',skillid,'但选敌目标为空')
            return False
        
        self.lastAtkType = atkType
        
        _skillConf = self.fight.getSkill(skillid)
        self.fight.log(self,'使用技能',skillid,'获取到目标',self.lastSkillTarget,'附加攻击后技能',list(_skillConf['v']),'被动增加的攻击后技能',_addAfterSkillIDS);
        
        
        #skill_afteratk中配置的2类技能 skilldpspro 和 dpspro，只对当次攻击生效
        #本质上说，应该理解为：攻击前技能，把这样的技能整理到beforeSkills
        #skilldpspro 技能伤害率增加XX%（攻击前技能）
        #dpspro 伤害增加XX%（攻击前技能）        
        beforeSkills = []
        afterSkills = list(_skillConf['v'])+_addAfterSkillIDS
        if len(afterSkills) > 0:
            for _fskid in afterSkills[:]:
                #上面这个 [:] 的解释：python_循环删除list中的元素，有坑啊！
                #https://www.cnblogs.com/lijun888/p/8623856.html
                if self.fight.isBeforeAtkSkill(_fskid): 
                    beforeSkills.append( _fskid )
                    
                    if _fskid in afterSkills:
                        afterSkills.remove(_fskid)   
                    
        #计算攻击逻辑
        geDangRoles = []
        baoJiRoles = []
        realdDeadRoles = []
        baojisignEmitRoles = []
        
        __atkLog = {'act':'atk','from':self.rid,'to':{},'skillid':skillid,'atkType':atkType}
        for toRole in self.lastSkillTarget:
            #BB处理攻击前技能======================
            extProAttrs = {"before_skilldpspro":0,"before_dpspro":0} #记录攻击前技能带来的影响集合，设定默认值是为了能正常的删除，防止数据叠加
            if len(beforeSkills) > 0:
                for _bskid in beforeSkills:
                    _bsc = self.fight.getSkill(_bskid)    
                    _afterSkillRes = AfterAtk.runSkill(self,[toRole],_bsc)
                    extProAttrs.update(_afterSkillRes)
                
                self.fight.log(self,'攻击前技能导致属性变化',extProAttrs,' bySkill',_bsc)                
            #//BB===================================
            
            toRole.lastHitBy = self
            
            if 'hpproinjury' in _skillConf and _skillConf['hpproinjury']>0:
                #神殿魔王时加的新体系，根据目标的生命值上限扣血
                dps = self.fight.getSpecDPSBySkillConf(self,toRole,_skillConf,atkType)
            else:
                dps = self.fight.getDPS(self,toRole,int(_skillConf['pro']),atkType)
            
            #记录所有触发了暴击印记的角色
            if 'baojisignEmit' in dps:
                if dps['baojisignEmit']==True:
                    baojisignEmitRoles.append(toRole)
                del dps['baojisignEmit']
            
            __atkLog['to'][ toRole.rid ] = dps['dps']
            
            #AA删除攻击前技能的影响
            for extPAK,extPAV in extProAttrs.items():
                if extPAK in self.data:
                    del self.data[extPAK]
            extProAttrs = {}
            #//AA===================
            
            
            #记录所有格挡了的role集合
            if not dps.get('ifJingZhun',True):
                geDangRoles.append(toRole)
                
            #记录所有被暴击了的role
            if dps.get('ifBaoJi',False):
                baoJiRoles.append(toRole)
            
            self.fight.log(self,'攻击了',toRole,dps['dps'])
            
            self.fight.tmpLogKey = 'atkHP'
            _modifyhp = toRole.modifyHP( dps['dps'] , extData=dps, emitRealDead=False )
            
            #记录roleDead对象
            if _modifyhp['dead'] and not _modifyhp['canFuHuo']:
                realdDeadRoles.append(toRole)               

            #统计伤害输出
            self.setSignNum('dps',dps['dps'])
            self.fight.tmpLogKey = None
           
        self.fight.addActionLog(__atkLog)
        self.fight.addActionLogFromTmp('atkHP')
        
        #攻击后附加技能
        self.fight.log(self,'攻击后附加技能',afterSkills)
        if len(afterSkills) > 0:
            self.runSkills( afterSkills )
        
        #先计算dps后再扣怒气，dps公式里会用到怒气值来计算加成
        if atkType=='xpskill':
            self.modifyNuQi(-_xpSkillDelNuQi) #扣除怒气点 
            self.fight.event.emit( Fight.FightEvent.addShenQiNuQiByXPSkill ,{"from":self,"to":toRole,"atkType":atkType})
        
        #主动攻击时，runskills后才广播真实死亡事件
        for toRole in realdDeadRoles:
            self.fight.event.emit( Fight.FightEvent.byRealDead ,{"to":toRole})   
        
        #广播格挡事件
        for toRole in geDangRoles:
            #格挡
            self.fight.event.emit( Fight.FightEvent.geDang ,{"from":self,"to":toRole,"atkType":atkType})
            #被格挡
            self.fight.event.emit( Fight.FightEvent.byGeDang ,{"from":self,"to":toRole,"atkType":atkType})

        #广播被暴击事件
        for toRole in baoJiRoles:
            self.fight.event.emit( Fight.FightEvent.byBaoJi ,{"from":self,"to":toRole,"atkType":atkType})
            self.fight.event.emit( Fight.FightEvent.baoJi ,{"from":self,"to":toRole,"atkType":atkType})
            
        geDangRoles = []
        baoJiRoles = []
        
        #广播攻击事件
        self.fight.event.emit( Fight.FightEvent.doAtk ,{"from":self,"to":self.lastSkillTarget,"atkType":atkType})        
        
        #广播被攻击事件
        for toRole in self.lastSkillTarget:
            self.fight.event.emit( Fight.FightEvent.byAtk ,{"from":self,"to":toRole,"atkType":atkType})      
        
        #每次释放普通攻击增加XX（暂定50）点，每次被攻击增加(暂定10点)点。上限100点，怒气累计可以超上限。怒气大于等于100点如果没被控就会放怒气攻击。
        if atkType == 'normalskill':
            #普通攻击增长士气
            self.modifyNuQi(50)
            
        for toRole in self.lastSkillTarget:
            #冰冻：无法行动，且被攻击无法回复怒气
            #石化：无法行动，且被攻击无法回复怒气
            if len(toRole.getBuff('bingdong')) == 0 and len(toRole.getBuff('shihua')) == 0:
                toRole.modifyNuQi(10)
        
        #触发了暴击印记的角色，清理buff
        if len(baojisignEmitRoles)>0:
            for _toRole in baojisignEmitRoles:
                _toRole.clearBuffByType('baojisign')                
        
        self.lastAtkType = "normalskill"  
        return True
    
    #战斗中，频繁会需要获取各种pro值，如： defpro，最终需要返回的值是 defpro-defdrop
    #so 提供快捷方法，which = def即可
    def getProVal(self,which):
        return self.data.get(which+"pro",0) - self.data.get(which+"drop",0)
    
    #开始反击
    def fanji(self,toRole,pro=0):
        dps = self.fight.getDPS(self,toRole,pro)
        self.fight.addActionLog({'act': 'fanji' ,'to':{toRole.rid:dps},'from':self.rid,"skillid":self.data['normalskill']})
        toRole.modifyHP(dps['dps'])
        self.setSignNum('dps',dps['dps'])
    
    #攻击后技能中，触发了另外一个攻击的实现
    def afterAtkRunAtk(self,toRole,pro=0):
        dps = self.fight.getDPS(self,toRole,pro)
        self.fight.addActionLog({'act': 'afatk' ,'to':{toRole.rid:{"dps":dps['dps']}},'from':self.rid})
        toRole.modifyHP(dps['dps'])
        self.setSignNum('dps',dps['dps'])

    #检测是否有复活
    def checkFuHuo (self):
        self.fight.log('检测是否可复活..')
        if 'canFuHuo' not in self.data:
            return
        pro = self.data['canFuHuo']
        addnum = int(self.data['maxhp'] * pro / 1000.0)
        self.data['hp'] = 0
        self.modifyHP(addnum)
        self.fight.log(self,'复活了 恢复了血量',addnum)
        self.fight.addActionLog({'act':'fuhuo','to':self.rid,'v':addnum,'nv':self.data['hp']})
        self.clearAllBuffs()
        
        del self.data['canFuHuo']

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
