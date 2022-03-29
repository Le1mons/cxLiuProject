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
        self.attr = {}                          # 特殊属性
        self.event = event.EventEmitter() 
        self.data = None                        # 战斗数据{atk,def,hp,speed,pos,side}
        self.fight = fight                      # 战斗实例
        self.inited = False                     # 是否已初始化
        self.buff = {}                          # 角色战斗中buff
        self.beidong = {}                       # 战斗中的被动属性
        self.actionLogData = {}                 # 当前行动回合中有可能需要推给发送给客户端的变化数据

        self.lastSkillTarget = None             # 最后一次主动技能选择出的目标
        self.lastAfterAtkTarge = []             # 最后一次主动技能选择出的目标
        self.lastAtkType = "normalskill"        # 最后一次出手时的攻击类型 normalskill/xpskill
        self.lastHitBy = None                   # 最后一次被谁攻击
        self.lastHitDps = 0                    # 最后一次攻击伤害
        self.signData = {'dps':0,'addhp':0,'buffnum':0,'maxdot':0,'gedang':0,'buffemit':{}}   #战斗统计值{'dps':'累计输出伤害','addhp':'总加血量'}
        self.roleType = "role"
        self.willRole = None             # 即将要打的目标

        
    
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
    def initRoleByData (self,roleData,runskill=True):
        if 'dead' not in roleData:
            roleData['dead'] = False
        if 'ready' not in roleData:
            roleData['ready'] = True

        # 如果是援军
        if 'hid' in roleData and int(roleData['pos']) == 7:
            roleData['ready'] = False
            roleData['dead'] = True
            runskill = False
        
        roleData['rid'] = self.rid
        
        self.data = roleData
        self.inited = True

        # 添加战斗前的基础是atk，speed，def
        roleData["baseatk"] = roleData["atk"]
        roleData["basespeed"] = roleData["speed"]
        roleData["basedef"] = roleData["def"]

        #临时：有2个英雄需要设置怒气不会加成伤害
        if 'hid' in roleData and str(roleData['hid']) in ['64025','64026']:
            self.setAttr('maxNuqiDPS',1.5)
        
        #有2个英雄需要控制战中攻击不超过战前攻击的N倍
        if 'hid' in roleData and str(roleData['hid']) in ['12035','12036']:
            #记录原始攻击值，用于某些技能中设定“不超过面板攻击力上限多少倍”的设定
            self.setAttr('_rawAtk',roleData['atk'])          
            self.setAttr('maxFightAtkRange',3)        

        if runskill:
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
        sc = self.fight.getSkill(skillid,copy=False)
        if sc['type'] == '1':return #面板属性技能
        if sc['type'] == '2':return #攻击技能
        sc = self.fight.getSkill(skillid)
        sc['skillid'] = skillid
        if sc['type'] == '3':
            return self.runAfterAtkSkill(sc , addLog=addLog,skillRunAt=skillRunAt)
        if sc['type'] == '4':#被动技能
            return self.addPassiveSkill(self, sc , addLog=addLog,skillRunAt=skillRunAt)
                
    #增加一个buff，buffData参见Buff类注释
    def addBuff (self,fromwho,buffData):
        buffData['from'] = fromwho
        # # 如果是致命链接
        # if buffData["buffid"] == "zmlj":
        #     buffData["targe"] = fromwho.lastAfterAtkTarge

        _buff = Buff.Buff(self,buffData)

        self.fight.log(self,'增加了buff',buffData,_buff)
    
        
    #删掉所有buff    
    def clearAllBuffs(self):
        for buffType,buffs in self.buff.items():
            while len(buffs)>0:
                buffs[0].clear()

    #删掉所有有异常的buff
    def clearAllDeBuffs(self):
        for buffType,buffs in self.buff.items():
            _con = self.fight.getBuff(buffType)
            # 判断是否是异常buff
            if _con["gtype"] != 2:
                continue
            while len(buffs)>0:
                buffs[0].clear()

    # 删掉所有buff
    def clearAllPassives(self):
        for buffType, buffs in self.beidong.items():
            while len(buffs) > 0:
                buffs[0].clear()

    #清除指定类型的buff
    def clearBuffByType(self,buffType):
        buffs = self.buff.get(buffType,[])
        # for buff in buffs:
        #     # 如果这个buff免疫清除
        #     if buffs[0].data.get("ismianyi", 0):
        #         continue
        #     buffs[0].clear()
        mianyi = 0
        while len(buffs)>0 and mianyi < len(buffs):
            if buffs[0].data.get("ismianyi", 0):
                mianyi += 1
                continue
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
        num = self.fight.getAddHP(fromRole,self,pro,self.lastAtkType)
        # 判断是否有治愈诅咒,把治疗转化成伤害
        if self.getBuff('zyzz'):
            buffs = self.getBuff('zyzz')
            num = -num * self.getBuff('zyzz')[0].data["pro"] / 1000
            # 删除一层buff
            while len(buffs) > 0:
                buffs[0].clear()
                break
        else:
            self.setAttr('recoverHPByPro', num)
            if fromRole:
                fromRole.setSignNum('addhp', num)
        self.modifyHP(num, fromRole=fromRole)


        
    #由于fromRole使用了bySkillConf技能，造成其生命上限千分之pro的伤害
    #maxdpsatkpro = 最终扣血不超过fromRole atk 的 maxdpsatkpro/1000 
    def delHPByPro(self,pro,fromRole=None,bySkillConf=None,maxNum=None):
        self.fight.log(self,'扣除生命值，上限的千分之',pro)
        num = int(self.data['maxhp'] * pro / 1000.0)
        
        #不超过攻击力的上限
        if maxNum!=None and num > maxNum:
            num = maxNum
        
        if self.fight.ftype == 'pve':
            num = int(num * 0.5)

        num *= -1
        
        self.modifyHP(num,fromRole=fromRole)
        # 如果是均衡触发的
        if hasattr(self.fight, 'junheng'):
            self.fight.junheng.setSignNum('dps',num)
            del self.fight.junheng
        elif fromRole:
            fromRole.setSignNum('dps',num)
    
    #由于fromRole使用了bySkillConf技能，造成目标生命上限恢复xx%
    def addHPByPro(self,pro,fromRole=None,bySkillConf=None):
        self.fight.log(self,'成目标生命上限恢复百分比',pro)
        num = int(self.data['maxhp'] * pro / 1000.0 * (self.getProVal('undercure')+1000) / 1000.0)
        if bySkillConf and bySkillConf["data"].get("fire",0) and fromRole:
            num = int(fromRole.data["maxhp"] * pro / 1000.0 * (self.getProVal('undercure')+1000) / 1000.0)
        _skillid = ""
        if bySkillConf and "skillid" in bySkillConf["data"]:
            _skillid = bySkillConf["data"]["skillid"]
        self.modifyHP(num, skillid=_skillid, fromRole=fromRole)
        if fromRole:
            fromRole.setSignNum('addhp',num)
    
    #由于fromRole使用了bySkillConf技能，恢复value血量
    def addHPByNum(self,value,fromRole=None,bySkillConf=None):
        self.fight.log(self,'目标生命恢复',value)
        num = int(value)
        num = num * (self.getProVal('undercure') + 1000) / 1000.0
        self.modifyHP(num,fromRole=fromRole)
        if fromRole:
            fromRole.setSignNum('addhp',num)        
    
    #恢复已损失血量x%的生命
    def addHPByLosePro(self,pro,fromRole=None,bySkillConf=None):
        self.fight.log(self,'恢复已损失血量百分比',pro)
        num = int((self.data['maxhp'] - self.data['hp']) * pro / 1000.0)
        if num > 0:
            num = num * (self.getProVal('undercure') + 1000) / 1000.0
            # 如果是扣血
            if bySkillConf and bySkillConf['data'].get('type', 1) == -1:
                try:
                    num = -min(num, bySkillConf['data']['maxdpsatkpro'] * fromRole.data['atk'] / 1000)
                except:
                    print 1
            self.modifyHP(num,fromRole=fromRole)
            if fromRole:
                fromRole.setSignNum('addhp' if num > 0 else 'dps',num)

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
            # self.fight.addActionLog({'act':'runskill','skillid':skillconf['skillid'],'from':self.rid,'to':[ r.rid for r in targets]})
            #按当前游戏来看 客户端不需要


        return AfterAtk.runSkill(self,targets,skillconf)

       
    #获取一个被动技能，不存在时返回空[]
    def getPassiveSkill(self,bdid):
        return self.beidong.get(bdid,[])
    
    def ifBaoJi(self,toRole=None):
        rnum = random.randint(1,1000)
        lv = self.getProVal('baoji')
        '''
        抗暴率：
        1、与暴击对应，战斗暴击率=我方暴击率-对方抗爆率
        2、仅在受到攻击时，这个属性才会生效
        3、最终暴击率的取值范围（0%，100%）
        4、字段 unbaojipro
        '''
        if toRole:
            lv = lv - toRole.getProVal('unbaoji')
        lv = self.fight.range(lv,min=0,max=1000)
        
        return rnum <= lv
    
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
    def modifyHP(self,addnum,addlog=True,extData=None, emitRealDead=True, dot=False, fanshang=False, fromRole=None, lianjie=False, isrealinjury=False, atknum=1, skillid=""):
        res = {}
        _jdpf = 0

        # 记录伤害
        if addnum < 0:
            if fromRole and fromRole.roleType == 'role':
                self.fight.turnDps[fromRole.rid][self.rid] = self.fight.turnDps.setdefault(fromRole.rid, {}).get(self.rid, 0) - addnum
            # 如果是扣血的时候会判断是否有剧毒披风，减少伤害，并加入一个debuff
            if self.getBuff('jdpf') and extData and 'atkType' in extData and extData["atkType"] in ["xpskill", "normalskill"] and not dot:
                addnum -= addnum * self.getBuff('jdpf')[0].resValue / 1000
                _jdpf = 1

            # 如果是扣血的时候会判断是否有暗影守护，如果有抵消伤害，并治疗
            if self.getBuff('aysh') and extData and 'atkType' in extData and extData["atkType"] in ["xpskill","normalskill"] and not dot:
                buffs = self.getBuff('aysh')
                addnum = -addnum * self.getBuff('aysh')[0].data["pro"] / 1000
                # 删除一层buff
                while len(buffs) > 0:
                    buffs[0].clear()
                    break
            # 如果是hudun3
            if self.getBuff('hudun3') and extData and 'atkType' in extData and extData["atkType"] in ["xpskill","normalskill"] and not dot:
                addnum = addnum + self.getBuff('hudun3')[0].resValue
                if addnum >= 0:
                    addnum = -1


        # 如果加血 或者 扣血时没有护盾
        if addnum > 0 or ((dot and self.getBuff('hudun2') or not self.getBuff('hudun2')) and not self.getBuff('hudun')):
            #没有锁定血量的话
            if not self.getAttr('lockHP'):
                self.data['hp'] += addnum

            if self.data['hp'] > self.data['maxhp']:
                self.data['hp'] = self.data['maxhp']

        else:
            _huduns = self.getBuff('hudun') + self.getBuff('hudun2') if not dot else self.getBuff('hudun')
            _hudunAddNum = addnum
            for hundun in _huduns:
                hundun.resValue = _hudunAddNum = _hudunAddNum + hundun.resValue
                if hundun.resValue > 0:
                    break

        self.fight.log(self,'生命值变化',addnum)
        res['v'] = addnum
        res['nv'] = self.data['hp']


        if addlog:
            log = {'act':'hp','r':self.rid,'v':addnum,'nv':self.data['hp'],'fs':fanshang, "atknum":atknum}
            # if fromRole and fromRole.roleType == 'role':
            #     log["f"] = fromRole.rid

            # 特殊技能需要显示动效
            if skillid:
                log["skillid"] = skillid

            if extData:
                #简化后输出给客户端
                if 'atkType' in extData:
                    at = extData['atkType']
                    if extData['atkType']=='xpskill':at="xp"
                    if extData['atkType']=='normalskill':at="nm"
                    # 判断此次伤害是否是真实伤害
                    if isrealinjury:at="rl"
                    extData['at'] = at
                    del extData['atkType']
                    
                if 'ifJingZhun' in extData:
                    extData['jz'] = extData['ifJingZhun']
                    del extData['ifJingZhun']                    
                 
                if 'ifBaoJi' in extData:
                    extData['bj'] = extData['ifBaoJi']
                    del extData['ifBaoJi']

                if 'ifDodge' in extData:
                    extData['dodge'] = extData['ifDodge']
                    del extData['ifDodge']

                if 'fromRid' in extData:
                    extData['f'] = extData['fromRid']
                    del extData['fromRid']                
                    
                log.update(extData)
                
            self.fight.addActionLog(log)
        
        deadHappend = self.checkDead()
        res['dead'] = False
        res['canFuHuo'] = False
        # 如果致命链接
        self.fight.event.emit(Fight.FightEvent.hpChange, {"to": self, "addnum": addnum, "lianjie": lianjie, "jdpf": _jdpf})

        if deadHappend:
            _miansi = self.getPassiveSkill('miansi')
            _miansi2 = self.getPassiveSkill('miansi2')
            # 黑暗之魂
            _heianzhihun = self.getPassiveSkill('heianzhihun')
            if _miansi:
                _hpBack = int(self.data['maxhp'] * _miansi[0].data['v']['pro'] / 1000.0)
                self.data['hp'] = log['nv'] = _hpBack

                self.fight.addActionLog({'act':'hp','r':self.rid,'v':_hpBack,'nv':self.data['hp']})
                self.checkDead()
                # 清除所有友方的角色的免死
                for role in self.fight.roles:
                    if role.data['side'] == self.data['side']:
                        for i in role.getPassiveSkill('miansi'):
                            i.clear()
            elif _miansi2:
                _hpBack = int(self.data['maxhp'] * _miansi2[0].data['v']['pro'] / 1000.0)
                self.data['hp'] = log['nv'] = _hpBack

                self.fight.addActionLog({'act':'hp','r':self.rid,'v':_hpBack,'nv':self.data['hp']})
                self.checkDead()
                for i in _miansi2:
                    i.clear()
            # 判断是否有黑暗之魂
            elif _heianzhihun:
                res['dead'] = True
                allNums = 0
                deadNums = 0
                for role in self.fight.roles:
                    if int(role.data['side']) == self.data["side"]: # 总数
                        allNums += 1
                        if role.isDead():
                            deadNums+= 1  # 死亡数
                # 如果死亡数等于总数就是真实的死亡
                if deadNums == allNums:
                    res['canFuHuo'] = False



                    self.data['deadorder'] = self.fight.deadorder
                    self.fight.deadorder += 1
                    # 清除黑暗之魂的被动
                    for i in _heianzhihun:
                        i.clear()

                    self.checkDead()
                    self.fight.addActionLog({'act': 'dead', 'to': self.rid, 'canFuHuo': False})
                    self.data["heianzhihun"] = False
                else:
                    self.fight.event.emit(Fight.FightEvent.byDead, {"to": self, "fromrole": fromRole})
                    self.fight.addActionLog({'act': 'heianzhihun', 'to': self.rid})
                    self.data["heianzhihun"] = True

            else:
                res['dead'] = True
                self.fight.event.emit( Fight.FightEvent.byDead ,{"to":self,"fromrole": fromRole})

                canFuHuo = self.data.get('canFuHuo',False)
                res['canFuHuo'] = canFuHuo

                if not canFuHuo and emitRealDead:
                    self.fight.event.emit( Fight.FightEvent.byRealDead ,{"to":self})
                    self.data['deadorder'] = self.fight.deadorder
                    self.fight.deadorder += 1

                self.fight.addActionLog({'act':'dead','to':self.rid,'canFuHuo':canFuHuo})


        
        return res
        
    #修改怒气
    def modifyNuQi(self,addnum,addlog=True,byatk=False,show=True):
        
        if self.getAttr('lockNuQi'):
            return

        # 怒气加成
        if byatk:
            addnum *= (self.getProVal('nuqi')+1000)/1000.0
        
        if addnum>0 and self.data['nuqi'] < _MAXNUQI:
            self.data['nuqi'] += addnum
        else:
            self.data['nuqi'] += addnum
        
        if self.data['nuqi']<0:
            self.data['nuqi'] = 0

        if addlog:
            self.fight.addActionLog({'act':'nuqi','r':self.rid,'v':addnum,'nv':self.data['nuqi'],'show':show})
        self.fight.log(self,'怒气变化',addnum)
        self.fight.event.emit( Fight.FightEvent.nuQiChange,{"to":self,"addnum":addnum})
    
    #检测是否有掉血buff
    def checkDiaoXue (self):
        if self.isDead():return
        self.fight.log('检测掉血类buff',self)
        
        allBuff = self.getBuff('diaoxue') + self.getBuff('zhongdu') + self.getBuff('liuxue') + self.getBuff('zhuoshao') + self.getBuff('roundsign')
        '''
        异常伤害减免：
        每回合受到的dot伤害=本回合将受到的dot伤害总和/（1+异常伤害减免）
        异常伤害减免仅在当前英雄受到dot伤害时生效。
        战中异常伤害减免的取值范围（1~正无穷）
        字段 undotdpspro        
        '''
        undotdps = 1000 + self.getProVal('undotdps')
        undotdps = self.fight.range(undotdps,min=1000)
        undotdps = undotdps*0.001
        
        deathsignBuffs = self.getBuff('deathsign')
        emitDeathsign = False
        if len(deathsignBuffs) >= 3:
            emitDeathsign = True
            allBuff += deathsignBuffs
        
        dps = 0
        for buff in allBuff:  #这里有相同的bug，需求上暂不修改： [:]
            
            #如果配置里有isend，表示只有在最后一个回合的时候触发，如：回合印记
            if ('isend' not in buff.data) or ( str(buff.data['isend'])=='0') or (str(buff.data['isend'])=='1' and buff.data['round']==1):
                try:
                    _v = int(buff.resValue/undotdps)
                except:
                    print buff
                dps += _v
                #form对象buff带来的输出记录
                buff.fromrole.setSignNum('dps',_v)
                buff.fromrole.setSignNum('maxdot',_v)

            if buff.data['round']==1:
                buff.clear()
        
        if emitDeathsign:
            self.clearBuffByType('deathsign')
        
        if dps!=0:
            self.fight.log('掉血类buff累计造成伤害',dps)
            self.modifyHP(dps,dot=True)

    #检测是否有回复血buff
    def checkHuiFu (self):
        if self.isDead():return
        self.fight.log('检测恢复类buff',self)
        
        allBuff = self.getBuff('hpback') + self.getBuff('maxhpback')
        addnum = 0
        for buff in allBuff[:]:
            if buff.ifEmit():
                addnum += buff.resValue

            buff.fromrole.setSignNum('addhp', addnum)
            if buff.data['round']==1:
                buff.clear()

        if addnum!=0:
            self.fight.log('回复类buff累计加血',addnum)
            self.modifyHP(addnum)

    #返回是否无法行动，冰冻/眩晕/石化
    def isSleep (self):
        res = len(self.getBuff('bingdong'))>0 \
            or len(self.getBuff('xuanyun'))>0 \
            or len(self.getBuff('bianxing'))>0 \
            or len(self.getBuff('bind'))>0 \
            or len(self.getBuff('shihua'))>0
        return res
    
    #开始攻击
    def atk(self, extskill=False):
        if self.isDead():return False
        atkType = None
        _xpSkillDelNuQi = 0

        #判断是普攻还是怒气攻击
        #沉默：无法释放怒气攻击
        #禁魔：无法释放怒气攻击
        isExt = 0
        if (self.data['nuqi'] < 100 or len(self.getBuff('jinmo'))>0 or len(self.getBuff('chenmo'))>0) and not extskill:
            skillid = self.data['normalskill']
            #如果被动技能中有替换普攻的
            beiDongChangeskill = self.getPassiveSkill('changeskill')
            if len(beiDongChangeskill)>0:
                skillid = str(beiDongChangeskill[0].conf['v']['runskill'][0])
                
            atkType = "normalskill"

            # 如果中了恐惧就不能普通攻击
            if self.getBuff('kongju'):
                return False
        # 如果是额外技能
        elif extskill:
            isExt = 1
            skillid = self.data['xpskill']
            _skillConf = self.fight.getSkill(skillid)
            skillid = _skillConf["extskill"][0]
            atkType = "xpskill"
            _xpSkillDelNuQi = self.data['nuqi']
            # 释放xp技能的次数
            self.data['xpskillindex'] = self.data.get('xpskillindex', 0) + 1
            # 释放xp技能之后的回合数
            self.data['afterXpskillRound'] = 1

        else:
            skillid = self.data['xpskill']
            atkType = "xpskill"
            _xpSkillDelNuQi = self.data['nuqi']
            # 释放xp技能的次数
            self.data['xpskillindex'] = self.data.get('xpskillindex',0)+1
            # 释放xp技能之后的回合数
            self.data['afterXpskillRound'] = 1
            #神殿魔王时，新加的一个逻辑：对xpskill增加了一个 atkround 的数组配置，用于控制这个技能只在某些回合时才会触发
            #如果不满足这些回合数，则切换到normalskill
            _skillConf = self.fight.getSkill(skillid)
            if 'atkround' in _skillConf and len(_skillConf['atkround'])>0 and int(self.fight.turn) not in _skillConf['atkround']:
                skillid = self.data['normalskill']
                atkType = "normalskill"
                _xpSkillDelNuQi = 0

        addAfterSkill = []
        _addAfterSkillIDS = []
        if not extskill:
            #判断是否有给主动技能增加附加技能的skill
            addAfterSkill = self.getPassiveSkill('addafterskill')
            # 判断是否被封印
            if len(addAfterSkill)>0 and not self.getBuff("lightseal"):
                for _askill in addAfterSkill:
                    if 'chkdata' in _askill.conf and 'atktype' in _askill.conf['chkdata'] and atkType!=_askill.conf['chkdata']['atktype']:
                        continue
                    _addAfterSkillIDS += _askill.conf['v']['runskill']
                    self.fight.log(self,'给主动技能增加附加技能',_addAfterSkillIDS)

        # 判断是否被嘲讽
        _chaofengbuff = self.getBuff("chaofeng")
        if _chaofengbuff:
            _lastSkillTarget = []
            if not _chaofengbuff[0].fromrole.isDead():
                self.lastSkillTarget = [_chaofengbuff[0].fromrole]
            else:
                self.lastSkillTarget = self.fight.getTargetBySkillID(self, skillid)
        else:
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

        __atkLog = {'act':'atk','from':self.rid,'to':{},'skillid':skillid,'atkType':atkType,'extData':{}}


        for idx, toRole in enumerate(self.lastSkillTarget):
            _pro = int(_skillConf['pro'])
            # 针对不同的敌人  pro不一样
            if _skillConf['multiv']:
                _pro = _skillConf['multipro'][idx]

            # 加入将要攻击的角色
            self.willRole = toRole

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
            # 伤害随着turn增加
            elif 'realinjury' in _skillConf and _skillConf['realinjury']>0 and _skillConf['where'].find(',')!=-1:
                dps = self.fight.getSpecDPSByTurn(self,toRole,_skillConf,atkType)
            elif "isrealinjury" in _skillConf and _skillConf['isrealinjury'] == 1:
                dps = self.fight.getRealinjuryDPS(self, toRole, _pro, atkType)
            else:
                dps = self.fight.getDPS(self,toRole,_pro,atkType, extskill=extskill)
            _atkNum = 1
            # 多重攻击伤害
            if _skillConf.get("randatknum", []):
                _atkNum = int(random.randint(_skillConf["randatknum"][0], _skillConf["randatknum"][1]))
                dps["dps"] = dps["dps"] * _atkNum

            dps['skillid'] = skillid
            dps['fromRid'] = self.rid
            # 记录上次对该玩家造成的伤害量
            self.lastHitDps = abs(dps['dps'])

            #记录所有触发了暴击印记的角色
            if 'baojisignEmit' in dps:
                if dps['baojisignEmit']==True:
                    baojisignEmitRoles.append(toRole)
                del dps['baojisignEmit']

            __atkLog['to'][ toRole.rid ] = dps['dps']
            __atkLog['extData'][ toRole.rid ] = {"bj": dps.get('ifBaoJi',False) }

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
            _modifyhp = toRole.modifyHP( dps['dps'] , extData=dps, emitRealDead=False, fromRole=self, atknum=_atkNum)
            if _modifyhp['dead']:
                self.fight.event.emit( Fight.FightEvent.deadOver ,{"from":self})
            __atkLog['extData'][ toRole.rid ].update({"hp": {"v":_modifyhp['v'],"nv":_modifyhp['nv'],"atknum": _atkNum}})


            #记录roleDead对象
            if _modifyhp['dead'] and not _modifyhp['canFuHuo']:
                realdDeadRoles.append(toRole)

                #统计伤害输出
            self.setSignNum('dps',dps['dps'] - dps.get('baojidps', 0))

            # 消耗一个反射buff  反弹扣血
            if toRole.getBuff('reflectarmer'):
                self.modifyHP(dps['dps'] * 0.001 * toRole.getBuff('reflectarmer')[0].data['pro'], fromRole=toRole)
                toRole.getBuff('reflectarmer')[0].clear()

            self.fight.tmpLogKey = None

        self.fight.addActionLog(__atkLog)
        self.fight.addActionLogFromTmp('atkHP')
        
        #攻击后附加技能
        self.fight.log(self,'攻击后附加技能',afterSkills)
        if len(afterSkills) > 0:
            self.runSkills( afterSkills )

        if _skillConf['multiv']:
            # 针对不同的敌人 运行不同的skill
            for idx, toRole in enumerate(self.lastSkillTarget):
                for _bskid in _skillConf['multiv'][idx]:
                    _bsc = self.fight.getSkill(_bskid)
                    _afterSkillRes = AfterAtk.runSkill(self,[toRole],_bsc)
        
        #先计算dps后再扣怒气，dps公式里会用到怒气值来计算加成
        if atkType=='xpskill':
            if not (_skillConf.get('extskill', []) and not isExt):
                self.modifyNuQi(-_xpSkillDelNuQi) #扣除怒气点
            self.fight.event.emit( Fight.FightEvent.addShenQiNuQiByXPSkill ,{"from":self,"to":toRole,"atkType":atkType})

        #主动攻击时，runskills后才广播真实死亡事件
        for idx,toRole in enumerate(realdDeadRoles):
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
            self.modifyNuQi(50, show=False)
            
        for toRole in self.lastSkillTarget:
            #冰冻：无法行动，且被攻击无法回复怒气
            #石化：无法行动，且被攻击无法回复怒气
            if len(toRole.getBuff('bingdong')) == 0 and len(toRole.getBuff('shihua')) == 0:
                toRole.modifyNuQi(10, byatk=True, show=False)
        
        #触发了暴击印记的角色，清理buff
        if len(baojisignEmitRoles)>0:
            for _toRole in baojisignEmitRoles:
                _toRole.clearBuffByType('baojisign')                
        
        self.lastAtkType = "normalskill"

        if _skillConf.get('extskill', []) and not isExt:
            self.atk(extskill=True)


        return True

    # # 额外的一次攻击
    # def extAtk(self):
    #     if self.isDead(): return False
    #     atkType = None
    #     _xpSkillDelNuQi = 0
    #
    #     # 判断是普攻还是怒气攻击
    #     # 沉默：无法释放怒气攻击
    #     # 禁魔：无法释放怒气攻击
    #     for skillid in self.data['extskill']:
    #
    #         atkType = "xpskill"
    #         _xpSkillDelNuQi = self.data['nuqi']
    #         # 释放xp技能的次数
    #         self.data['xpskillindex'] = self.data.get('xpskillindex', 0) + 1
    #         # 释放xp技能之后的回合数
    #         self.data['afterXpskillRound'] = 1
    #
    #         # 选敌
    #         self.lastSkillTarget = self.fight.getTargetBySkillID(self, skillid)
    #
    #         if len(self.lastSkillTarget) == 0:
    #             self.fight.log(self, '使用技能', skillid, '但选敌目标为空')
    #             return False
    #
    #         self.lastAtkType = atkType
    #
    #         _skillConf = self.fight.getSkill(skillid)
    #
    #         # skill_afteratk中配置的2类技能 skilldpspro 和 dpspro，只对当次攻击生效
    #         # 本质上说，应该理解为：攻击前技能，把这样的技能整理到beforeSkills
    #         # skilldpspro 技能伤害率增加XX%（攻击前技能）
    #         # dpspro 伤害增加XX%（攻击前技能）
    #         beforeSkills = []
    #         afterSkills = list(_skillConf['v'])
    #         if len(afterSkills) > 0:
    #             for _fskid in afterSkills[:]:
    #                 # 上面这个 [:] 的解释：python_循环删除list中的元素，有坑啊！
    #                 # https://www.cnblogs.com/lijun888/p/8623856.html
    #                 if self.fight.isBeforeAtkSkill(_fskid):
    #                     beforeSkills.append(_fskid)
    #
    #                     if _fskid in afterSkills:
    #                         afterSkills.remove(_fskid)
    #
    #                         # 计算攻击逻辑
    #         geDangRoles = []
    #         baoJiRoles = []
    #         realdDeadRoles = []
    #         baojisignEmitRoles = []
    #
    #         __atkLog = {'act': 'atk', 'from': self.rid, 'to': {}, 'skillid': skillid, 'atkType': atkType, 'extData': {}}
    #
    #         for idx, toRole in enumerate(self.lastSkillTarget):
    #             _pro = int(_skillConf['pro'])
    #             # 针对不同的敌人  pro不一样
    #             if _skillConf['multiv']:
    #                 _pro = _skillConf['multipro'][idx]
    #
    #             # 特殊魔王
    #             # 判断是否有根据我方英雄数量增加伤害的技能
    #             if _skillConf.get("numpro", 0):
    #                 _num = 0
    #                 for i in self.fight.roles:
    #                     # 对方
    #                     if i.data['side'] == self.data['side'] and not i.isDead() and i.rid != self.rid:
    #                         _num += 1
    #                 _pro += _skillConf["numpro"] * _num
    #
    #             # BB处理攻击前技能======================
    #             extProAttrs = {"before_skilldpspro": 0, "before_dpspro": 0}  # 记录攻击前技能带来的影响集合，设定默认值是为了能正常的删除，防止数据叠加
    #             if len(beforeSkills) > 0:
    #                 for _bskid in beforeSkills:
    #                     _bsc = self.fight.getSkill(_bskid)
    #                     _afterSkillRes = AfterAtk.runSkill(self, [toRole], _bsc)
    #                     extProAttrs.update(_afterSkillRes)
    #
    #                 self.fight.log(self, '攻击前技能导致属性变化', extProAttrs, ' bySkill', _bsc)
    #                 # //BB===================================
    #
    #             toRole.lastHitBy = self
    #
    #             if 'hpproinjury' in _skillConf and _skillConf['hpproinjury'] > 0:
    #                 # 神殿魔王时加的新体系，根据目标的生命值上限扣血
    #                 dps = self.fight.getSpecDPSBySkillConf(self, toRole, _skillConf, atkType)
    #             # 伤害随着turn增加
    #             elif 'realinjury' in _skillConf and _skillConf['realinjury'] > 0 and _skillConf['where'].find(',') != -1:
    #                 dps = self.fight.getSpecDPSByTurn(self, toRole, _skillConf, atkType)
    #             else:
    #                 dps = self.fight.getDPS(self, toRole, _pro, atkType)
    #
    #             dps['skillid'] = skillid
    #             dps['fromRid'] = self.rid
    #             # 记录上次对该玩家造成的伤害量
    #             self.lastHitDps = abs(dps['dps'])
    #
    #             # 记录所有触发了暴击印记的角色
    #             if 'baojisignEmit' in dps:
    #                 if dps['baojisignEmit'] == True:
    #                     baojisignEmitRoles.append(toRole)
    #                 del dps['baojisignEmit']
    #
    #             __atkLog['to'][toRole.rid] = dps['dps']
    #             __atkLog['extData'][toRole.rid] = {"bj": dps.get('ifBaoJi', False)}
    #
    #             # AA删除攻击前技能的影响
    #             for extPAK, extPAV in extProAttrs.items():
    #                 if extPAK in self.data:
    #                     del self.data[extPAK]
    #             extProAttrs = {}
    #             # //AA===================
    #
    #             # 记录所有格挡了的role集合
    #             if not dps.get('ifJingZhun', True):
    #                 geDangRoles.append(toRole)
    #
    #             # 记录所有被暴击了的role
    #             if dps.get('ifBaoJi', False):
    #                 baoJiRoles.append(toRole)
    #
    #             self.fight.log(self, '攻击了', toRole, dps['dps'])
    #
    #             self.fight.tmpLogKey = 'atkHP'
    #             _modifyhp = toRole.modifyHP(dps['dps'], extData=dps, emitRealDead=False, fromRole=self)
    #             if _modifyhp['dead']:
    #                 self.fight.event.emit(Fight.FightEvent.deadOver, {"from": self})
    #             __atkLog['extData'][toRole.rid].update({"hp": {"v": _modifyhp['v'], "nv": _modifyhp['nv']}})
    #
    #             # 记录roleDead对象
    #             if _modifyhp['dead'] and not _modifyhp['canFuHuo']:
    #                 realdDeadRoles.append(toRole)
    #
    #                 # 统计伤害输出
    #             self.setSignNum('dps', dps['dps'] - dps.get('baojidps', 0))
    #
    #             # 消耗一个反射buff  反弹扣血
    #             if toRole.getBuff('reflectarmer'):
    #                 self.modifyHP(dps['dps'] * 0.001 * toRole.getBuff('reflectarmer')[0].data['pro'])
    #                 toRole.getBuff('reflectarmer')[0].clear()
    #
    #             self.fight.tmpLogKey = None
    #
    #         self.fight.addActionLog(__atkLog)
    #         self.fight.addActionLogFromTmp('atkHP')
    #
    #         # 攻击后附加技能
    #         self.fight.log(self, '攻击后附加技能', afterSkills)
    #         if len(afterSkills) > 0:
    #             self.runSkills(afterSkills)
    #
    #         if _skillConf['multiv']:
    #             # 针对不同的敌人 运行不同的skill
    #             for idx, toRole in enumerate(self.lastSkillTarget):
    #                 for _bskid in _skillConf['multiv'][idx]:
    #                     _bsc = self.fight.getSkill(_bskid)
    #                     _afterSkillRes = AfterAtk.runSkill(self, [toRole], _bsc)
    #
    #         # 先计算dps后再扣怒气，dps公式里会用到怒气值来计算加成
    #         if atkType == 'xpskill':
    #             self.modifyNuQi(-_xpSkillDelNuQi)  # 扣除怒气点
    #             self.fight.event.emit(Fight.FightEvent.addShenQiNuQiByXPSkill,
    #                                   {"from": self, "to": toRole, "atkType": atkType})
    #
    #         # 主动攻击时，runskills后才广播真实死亡事件
    #         for idx, toRole in enumerate(realdDeadRoles):
    #             self.fight.event.emit(Fight.FightEvent.byRealDead, {"to": toRole})
    #
    #         # 广播格挡事件
    #         for toRole in geDangRoles:
    #             # 格挡
    #             self.fight.event.emit(Fight.FightEvent.geDang, {"from": self, "to": toRole, "atkType": atkType})
    #             # 被格挡
    #             self.fight.event.emit(Fight.FightEvent.byGeDang, {"from": self, "to": toRole, "atkType": atkType})
    #
    #         # 广播被暴击事件
    #         for toRole in baoJiRoles:
    #             self.fight.event.emit(Fight.FightEvent.byBaoJi, {"from": self, "to": toRole, "atkType": atkType})
    #             self.fight.event.emit(Fight.FightEvent.baoJi, {"from": self, "to": toRole, "atkType": atkType})
    #
    #         geDangRoles = []
    #         baoJiRoles = []
    #
    #         # 广播攻击事件
    #         self.fight.event.emit(Fight.FightEvent.doAtk, {"from": self, "to": self.lastSkillTarget, "atkType": atkType})
    #
    #         # 广播被攻击事件
    #         for toRole in self.lastSkillTarget:
    #             self.fight.event.emit(Fight.FightEvent.byAtk, {"from": self, "to": toRole, "atkType": atkType})
    #
    #             # 每次释放普通攻击增加XX（暂定50）点，每次被攻击增加(暂定10点)点。上限100点，怒气累计可以超上限。怒气大于等于100点如果没被控就会放怒气攻击。
    #         if atkType == 'normalskill':
    #             # 普通攻击增长士气
    #             self.modifyNuQi(50, show=False)
    #
    #         for toRole in self.lastSkillTarget:
    #             # 冰冻：无法行动，且被攻击无法回复怒气
    #             # 石化：无法行动，且被攻击无法回复怒气
    #             if len(toRole.getBuff('bingdong')) == 0 and len(toRole.getBuff('shihua')) == 0:
    #                 toRole.modifyNuQi(10, byatk=True, show=False)
    #
    #         # 触发了暴击印记的角色，清理buff
    #         if len(baojisignEmitRoles) > 0:
    #             for _toRole in baojisignEmitRoles:
    #                 _toRole.clearBuffByType('baojisign')
    #
    #         self.lastAtkType = "normalskill"
    #
    #
    #
    #     #战斗中，频繁会需要获取各种pro值，如： defpro，最终需要返回的值是 defpro-defdrop
    #so 提供快捷方法，which = def即可
    def getProVal(self, which):
        _pro = self.data.get(which + "pro", 0)
        _drop = self.data.get(which + "drop", 0)
        # 如果有动态变化数值的buff
        if 'modifybuff' in self.buff:
            for buff in self.getBuff('modifybuff'):
                if not buff.buffid.startswith(which):
                    continue
                _num = self.getProNum(buff)
                if buff.buffid == which + 'pro':
                    _pro += _num * buff.data['pro']
                elif buff.buffid == which + 'drop':
                    _drop += _num * buff.data['pro']

                self.fight.log(self, 'modifybuff导致属性:{0} 发生变化, 层数->{1}'.format(which, _num))

        # 缩小buff特殊处理
        if self.getBuff('suoxiao') and which+'drop' in self.getBuff('suoxiao')[0].data['buffpro']:
            self.getBuff('suoxiao').sort(key=lambda x:x.data['buffpro'][which+'drop'],reverse=True)
            _buff = self.getBuff('suoxiao')[0]
            _drop += _buff.data['buffpro'][which+'drop']

            self.fight.log(self, 'suoxiao导致属性:{0} 发生变化, 数值->{1}'.format(which+'drop', _buff.data['buffpro'][which+'drop']))

        # 超过15回合就要提升攻击
        if self.fight.turn > 15 and self.fight.ftype == "pvp" and which == 'dps':
            self.fight.log(self, '{0}回合导致属性: 之前是{1}'.format(self.fight.turn, _pro))
            _pro += (self.fight.turn - 15) * 100
            self.fight.log(self, '{0}回合导致属性: 之后是{1}'.format(self.fight.turn, _pro))

        return _pro - _drop


    def getProNum(self, buff):
        # 如果只要有buff
        if 'hasbufftype' in buff.data:
            _num = 0
            for i in buff.data['hasbufftype']:
                if self.getBuff(i):
                    _num = 1
                    break
        # 回合数
        elif buff.data["count"] == "turn":
            # 获取回合数
            turnNum = self.fight.turn
            _round = buff.data["round"]
            if not buff.data["desc"]:
                _num = turnNum if _round > 0 else 0
            else:
                _num = _round if _round > 0 else 0


        # 如果是存活人数
        elif buff.data['count'] == 'alive':
            # 根据条件计算存活人数
            _num = self.fight.getAliveNum(self.data['side'] if buff.data['side'] == 0 else (self.data['side'] + 1) % 2,buff.data.get('zhongzu'))

        # 损失血量
        elif buff.data["count"] == 'hpdrop':
            _num = int(1 - float(self.data["hp"]) / float(self.data["maxhp"]) * 100 / float(buff.data['v']))

        # 根据对方负面buff数量
        elif buff.data['count'] == 'typebuffnum':
            # 根据条件计算存活人数
            _num = 0
            _toRole = self.willRole
            if not _toRole:
                return _num
            for buffid in _toRole.buff.keys():
                _con = _toRole.fight.getBuff(buffid)
                if _con["gtype"] == "2":
                    _num += 1


        else:
            _num = 0
            for i in self.fight.roles:
                # 有指定的buff
                if not i.getBuff(buff.data['count']):
                    continue
                # side 相同
                if (buff.data['side'] == 1 and i.data['side'] != self.data['side']) or (buff.data['side'] == 0 and i.data['side'] == self.data['side']):
                    _num += 1
            _num = min(_num, buff.data['maxnum'])
        return _num
    
    #开始反击
    def fanji(self,toRole,pro=0):
        _actLog = {'act': 'fanji' ,'to':{},'from':self.rid,"skillid":self.data['normalskill']}
        self.fight.addActionLog(_actLog)
        _dps = 0
        if not isinstance(toRole, list):
            toRole = [toRole]
        for role in toRole:
            dps = self.fight.getDPS(self,role,pro)
            role.modifyHP(dps['dps'], extData={'atkType': 'normalskill'}, dot=True, fromRole=self)
            _dps += dps['dps']
            _actLog['to'].update({role.rid:dps})

        self.setSignNum('dps',_dps)

    #开始反伤
    def fanshang(self,num):
        try:
            self.lastHitBy.modifyHP(num, extData={'atkType': 'normalskill'}, dot=True, fanshang=True, fromRole=self)
        except:
            print self.lastHitBy
            return
        self.setSignNum('dps',num)
    
    #攻击后技能中，触发了另外一个攻击的实现
    def afterAtkRunAtk(self,toRole,pro=0):
        dps = self.fight.getDPS(self,toRole,pro)
        self.fight.addActionLog({'act': 'afatk' ,'to':{toRole.rid:{"dps":dps['dps']}},'from':self.rid})
        toRole.modifyHP(dps['dps'], fromRole=self)
        self.setSignNum('dps',dps['dps'])

    #检测是否有复活
    def checkFuHuo (self):
        self.fight.log('检测是否可复活..')
        if 'canFuHuo' not in self.data:
            return
        if self.getBuff('unpassive'):
            del self.data['canFuHuo']
            return
        pro = self.data['canFuHuo']

        # 如果有黑暗之魂
        _act = "fuhuo"
        if self.getPassiveSkill('heianzhihun'):
            _act = "fuhuoheianzhihun"


        addnum = int(self.data['maxhp'] * pro / 1000.0)
        self.data['hp'] = 0
        self.modifyHP(addnum)
        self.fight.log(self,'复活了 恢复了血量',addnum)
        self.fight.addActionLog({'act':_act,'to':self.rid,'v':addnum,'nv':self.data['hp']})
        # 黑暗之魂只删除异常buff
        if _act == "fuhuoheianzhihun":
            self.clearAllDeBuffs()
        else:
            self.clearAllBuffs()
        
        del self.data['canFuHuo']


    # 检测是否有援军
    def checkYuanjun(self):
        self.fight.log('检测是否有援军..')
        if "hid" not in self.data or int(self.data['pos']) != 7 or self.data['ready']:
            return

        _deadRole = filter(lambda x:x.isDead() and x.data['side']==self.data['side'] and x.data['ready'] and not x.data.get("heianzhihun",False), self.fight.roles)
        _deadRole.sort(key=lambda x:x.data.get('deadorder',1))
        if not _deadRole:
            return

        if self.data['star'] >= 5:
            # 添加一个buff技能
            self.data['skill'].append("9%02d3" %self.data['star'])

        self.fight.log(self, '援军上场了', self.rid)
        # 刷新站位  运行技能  提交技能  加载data信息  顺序不能变
        self.data['ready'] = True
        self.data['dead'] = False
        self.data['isyuanjun'] = True
        self.data['upturn'] = self.fight.turn
        self.data['pos'] = _deadRole[0].data['pos']
        self.fight.f5PosInfo()
        self.fmtSkill()
        self.fight.event.emit(Fight.FightEvent.roleInit, {"to": self})

        roledata = Fight.deepCopy(self.data)
        _deadRole[0].data['pos'] = roledata['pos'] = 7
        self.fight._rolesInfo[self.rid] = roledata
        self.fight.addActionLog({'act': 'yuanjunshow', 'to': self.rid, 'pos':self.data['pos']})


    #轮到我行动了
    def startAction (self):
        if self.isDead():return

        # 释放xp技能之后的回合数
        self.data['afterXpskillRound'] = self.data.get('afterXpskillRound', 0) + 1
        
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
        num = abs(int(num))

        # 如果室buff数量
        if act in ('buffnum', 'maxdot') and num < self.signData[act]:
            return

        self.signData[act] += num

if __name__ == '__main__':
    a = [1,2,3]
    a.extend([4,5,6])
    print a
    {"data.{}".format("10011"): "插入内容"}