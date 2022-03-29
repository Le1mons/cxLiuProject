#!/usr/bin/python
#coding:utf-8

#战斗类
import g,event
import random,string,time,uuid
import Buff,PassiveSkill,Fight,AfterAtk

#神器
class FightPet(object):
    index = 0
    def __init__ (self,fight):
        self.rid = "pet_"+str(FightPet.index)
        FightPet.index += 1
        
        self.event = event.EventEmitter() 
        self.data = None #战斗数据
        self.fight = fight #战斗实例
        self.inited = False #是否已初始化
        self.actionLogData = {} #当前行动回合中有可能需要推给发送给客户端的变化数据
        self.lastSkillTarget = None #最后一次主动技能选择出的目标
        self.lastHitBy = None #最后一次被谁攻击
        self.signData = {'dps':0,'addhp':0,'maxdot':0,'buffnum':0} #战斗统计值{'dps':'累计输出伤害','addhp':'总加血量'}
        self.roleType = "pet"
        
    def clear(self):
        self.fight.log('clear..',self)
        del self.event
        del self.data
        del self.fight
        del self.inited
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
        self.data = roleData
        self.inited = True
        return self
    
    #格式化技能数据
    def fmtSkill (self):
        self.runSkill(self.data['skill'])
    
    #运行单个技能        
    def atk(self):
        skillid = self.data['skill']
        # 选敌
        self.lastSkillTarget = self.fight.getTargetBySkillID(self, skillid)

        if len(self.lastSkillTarget) == 0:
            self.fight.log(self, '使用技能', skillid, '但选敌目标为空')
            return False

        _skillConf = self.fight.getSkill(skillid)
        self.fight.log(self, '使用技能', skillid, '获取到目标', self.lastSkillTarget, '附加攻击后技能', list(_skillConf['v']));

        beforeSkills = []
        afterSkills = list(_skillConf['v'])
        if len(afterSkills) > 0:
            for _fskid in afterSkills[:]:
                # 上面这个 [:] 的解释：python_循环删除list中的元素，有坑啊！
                # https://www.cnblogs.com/lijun888/p/8623856.html
                if self.fight.isBeforeAtkSkill(_fskid):
                    beforeSkills.append(_fskid)

                    if _fskid in afterSkills:
                        afterSkills.remove(_fskid)

        __atkLog = {'act': 'atk', 'from': self.rid, 'to': {}, 'skillid': skillid, 'atkType': 'petAtk'}
        for idx, toRole in enumerate(self.lastSkillTarget):
            toRole.lastHitBy = self
            if _skillConf['type'] == '2' and int(_skillConf['pro']) == 0:
                __atkLog['to'][toRole.rid] = 0
            else:
                # BB处理攻击前技能======================
                extProAttrs = {"before_skilldpspro": 0, "before_dpspro": 0}  # 记录攻击前技能带来的影响集合，设定默认值是为了能正常的删除，防止数据叠加
                if len(beforeSkills) > 0:
                    for _bskid in beforeSkills:
                        _bsc = self.fight.getSkill(_bskid)
                        _afterSkillRes = AfterAtk.runSkill(self, [toRole], _bsc)
                        extProAttrs.update(_afterSkillRes)

                dps = self.fight.getDPS(self, toRole, int(_skillConf['pro']), 'petAtk')
                dps['skillid'] = skillid

                __atkLog['to'][toRole.rid] = dps['dps']

                # AA删除攻击前技能的影响
                for extPAK, extPAV in extProAttrs.items():
                    if extPAK in self.data:
                        del self.data[extPAK]

                self.fight.log(self, '攻击了', toRole, dps['dps'])

                self.fight.tmpLogKey = 'atkHP'
                toRole.modifyHP(dps['dps'], extData=dps)
                # 统计伤害输出
                self.setSignNum('dps', dps['dps'])
                self.fight.tmpLogKey = None

        self.fight.addActionLog(__atkLog)
        self.fight.addActionLogFromTmp('atkHP')

        # 攻击后附加技能
        self.fight.log(self, '攻击后附加技能', afterSkills)
        if len(afterSkills) > 0:
            self.runSkills(afterSkills)

        return True

    #战斗中，频繁会需要获取各种pro值，如： defpro，最终需要返回的值是 defpro-defdrop
    #so 提供快捷方法，which = def即可
    def getProVal(self,which):
        return self.data.get(which+"pro",0) - self.data.get(which+"drop",0)

    def ifBaoJi(self, toRole=None):
        return False

    # 运行一个技能组
    def runSkills(self, skillids, addLog=False):
        for skillid in skillids:
            self.runSkill(skillid, addLog=addLog)

    # 运行单个技能
    def runSkill(self, skillid, addLog=False):
        sc = self.fight.getSkill(skillid, copy=False)
        if sc['type'] == '1': return  # 面板属性技能
        if sc['type'] == '2': return  # 攻击技能

        sc = self.fight.getSkill(skillid)
        sc['skillid'] = skillid

        if sc['type'] == '3':
            return self.runAfterAtkSkill(sc, addLog=addLog)
        if sc['type'] == '4':  # 被动技能
            return self.addPassiveSkill(self, sc, addLog=addLog)

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

    #增加一个被动技能，skillData参见PassiveSkill类注释
    def addPassiveSkill (self,fromwho,skillData,addLog=False):
        skillData['from'] = fromwho
        PassiveSkill.addPassiveSkill(self,skillData)

    #轮到我行动了
    def startAction (self):
        self.fight.log(self,'开始行动>>>')
        self.fight.roleActionStart(self)
    
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
