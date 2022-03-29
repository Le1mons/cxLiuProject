#!/usr/bin/python
#coding:utf-8

import Fight,random

class Buff(object):
    index = 0
    def __init__ (self,role,buffData,delayData=None):
        '''
        buffData = {"buffid":"xuanyun","round":3} 必选
        依附于role存在，当fight广播reduceBuffTurn事件时，回合数-1
        当buff回合数改变时，会向fight广播buffTurnChange事件
        当buff结束时，会向fight广播buffEnd事件
        '''
        self._id = "buff_"+str(Buff.index)
        Buff.index += 1

        self.role = role
        self.fight = role.fight
        self.buffid = buffData['buffid']
        self.fromrole = buffData['from']
        self.conf = role.fight.getBuff(self.buffid)
        self.data = buffData
        self.buffType = self.conf['bufftype']
        self.calcAttrType = self.buffType

        # 延迟buff先推日志  指定回合再触发
        if 'delay' in self.data:
            if not delayData:
                _log = {'act': 'buff', 'f': self.data['from'].rid, 't': self.role.rid, 'bid': self.buffid,'bt': self.buffType, '_id': self._id, 'r': self.data['round']}
                _log['delay'] = self.data['delay']
                self.fight.addActionLog(_log)
                role.fight.delayBuff.setdefault(str(role.fight.turn + self.data['delay']), []).append((role,buffData,{"_id":self._id}))
                del self
                return
            else:
                self._id = delayData['_id']
        
        if self.buffType not in role.buff:
            role.buff[ self.buffType ] = []

        #加入到role的buff集合
        role.buff[ self.buffType ].append(self)

        # 修改buffid  前端显示用
        if self.buffType in ('modifybuff',):
            self.buffid = self.data['bufftype']

        # 修改属性
        elif self.buffType in ('jiban', 'steal'):
            self.calcAttrType = self.data['bufftype']

        # 统计buff数量
        role.setSignNum('buffnum', len(role.buff))
        
        _pro = 0
        if 'value' in buffData:
            _pro = buffData['value']

        if 'pro' in buffData:
            _pro = buffData['pro']

        if self.buffType in ('steal', ):
            _pro = int(sum([i.data[self.data['bufftype']] * _pro / 1000.0 for i in self.role.lastSkillTarget]))

        #如果是掉血类buff的话，施加buff时就计算好掉血量，提高性能
        elif self.buffType in ['diaoxue','zhongdu','liuxue','zhuoshao','roundsign','baojisign','deathsign']:
            if 'realinjury' in self.data and str(self.data['realinjury'])=='1':
                #如果配置里有realinjury KEY并且=1的话，表示pro是真实伤害，即：最终扣血的值得
                dps = int(self.data['pro']) * -1

            # 按照最大血量百分比
            elif 'maxhpv' in self.data:
                dps = int(self.fromrole.data['maxhp'] * self.data['maxhpv'] / 1000.0) * -1
            elif 'lastdps' in self.data:
                dps = int(self.fromrole.lastHitDps * self.data['pro'] / 1000.0) * -1
            else:
                dps = self.fight.getBuffDPS(self.data['from'],self.role, int(self.data['pro']))
                
            self.resValue = dps
        
        #如果是恢复血类buff，施加时计算
        elif self.buffType in ['hpback']:
            if 'realinjury' in self.data and str(self.data['realinjury'])=='1':
                addnum = int(self.data['pro'])
            else:
                addnum = self.fight.getBuffAddHP(self.data['from'],self.role, int(self.data['pro']))
                
            self.resValue = addnum

        # 致命连接
        elif self.buffType in ('zmlj','jdpf'):
            if self.buffType == "jdpf":
                self.resValue = self.data['pro']
            self.fight.event.on(Fight.FightEvent.hpChange, self.hpChange)
            if self.buffType == "zmlj":
                self.fight.event.on(Fight.FightEvent.byDead, self.chkByDead)

        # 湮灭印记
        elif self.buffType in ('ymyj',):
            self.fight.event.on( Fight.FightEvent.nuQiChange, self.nuqiChange)

        # 灵魂提灯
        elif self.buffType in ('emosign', ):
            self.role.runSkills( self.data["runskill"], addLog=True)
            self.fight.event.on(Fight.FightEvent.buffEnd, self.clearbuff)

        # 如果是恢复血类buff，施加时计算
        elif self.buffType in ('maxhpback', ):
            addnum = int(self.role.data['maxhp'] * self.data['pro'] / 1000.0)
            self.resValue = addnum

        # 如果是护盾, 施加时计算
        elif self.buffType in ('hudun', 'hudun2'):
            self.resValue = self.role.data['maxhp'] * _pro / 1000
            self.fight.event.on(Fight.FightEvent.byAtk, self.byAtk)

        # 如果是护盾3，
        elif self.buffType in ('hudun3'):
            self.resValue = self.role.data['atk'] * _pro / 1000

        # 如果是光子力
        elif self.buffType in ('lightpower',):
            self.fight.event.on(Fight.FightEvent.getBuff, self.clearbuff)

        # 如果是自然庇护
        elif self.buffType in ('zrbh','bianxing',):

            buffs = self.role.buff.get(self.buffType, [])
            if len(buffs) > 1:
                try:
                    buffs[0].clear()
                except:
                    print "1111"

            if self.buffType == "bianxing":
                self.byAtkNum = 0

            self.fight.event.on(Fight.FightEvent.byAtk, self.byAtk)

        # 如果是交换速度buff
        elif self.buffType in ('jhsd'):
            try:
                if not buffData.get("lj", 0):
                    # 随机一个对手
                    _skill = {"order": "speed,desc","islive": "1","pos": "2","limit": "","side": "1"}
                    targetList = self.fight.getTargetByConf(self.fromrole, _skill)
                    _targetlist = []
                    for target in targetList:
                        if target.data["speed"] > self.fromrole.data["speed"]:
                            _targetlist.append(target)
                    if len(_targetlist) > 0:
                        _toRole = random.sample(targetList, 1)[0]
                        _pro2 = self.fromrole.data["speed"] - _toRole.data["speed"]
                        _addBuff = {"speed": _pro2}
                        self.altAttr = self.fight.calcAttr(_toRole, _addBuff)
                        buffInfo = buffData.copy()
                        buffInfo["pro2"] =  _pro2
                        buffInfo["lj"] = 1
                        self.fromrole.addBuff(_toRole, buffInfo)
                else:
                    _pro2 = buffData["pro2"]
                    _addBuff = {"speed":  - _pro2}
                    self.altAttr = self.fight.calcAttr(self.role, _addBuff)
            except:
                print "jhsd err!!!!!!!"

        # 如果是偷取对方属性
        elif self.buffType in ('atksteal', ):

            if not buffData.get("lj", 0):
                _pro2 = int(self.role.data['atk'] * self.data['pro'] / 1000.0)
                _addBuff = {"atk": _pro2}
                self.altAttr = self.fight.calcAttr(self.role, _addBuff)
                buffInfo = buffData.copy()
                buffInfo["pro2"] = _pro2
                buffInfo["lj"] = 1
                self.fromrole.addBuff(self.role, buffInfo)
            else:
                _pro2 = buffData["pro2"]
                _addBuff = {"atk": - _pro2}
                self.altAttr = self.fight.calcAttr(self.role, _addBuff)
        #
        # # 如果是恶灵附体
        # elif self.buffType in ('elft', ):
        #     self.fight.event.on(Fight.FightEvent.byAtk, self.byAtk)


        # 如果是杀意
        elif self.buffType in ('shayi','junhengsign',"zrzl", ):
            self.fight.event.on(Fight.FightEvent.doAtk, self.chkDoAtk)

        # 如果是复活, 施加时计算
        elif self.buffType in ('fuhuo', 'jiban'):
            self.fight.event.on(Fight.FightEvent.byDead, self.chkByDead)
            # 羁绊buff 非施法者 记录下施法者的buff id
            if self.buffType in ('jiban', ) and role != buffData['from'] and buffData['from'].getBuff('jiban'):
                self.jiban = buffData['from'].getBuff('jiban')[-1]
                buffData['from'].getBuff('jiban')[-1].jiban = self

        # 正义守护
        elif self.buffType in ('zysh', ):
            self.fight.event.on(Fight.FightEvent.byAtk, self.chkByAtk)

        # 缩小buff
        elif self.buffType in ('suoxiao', ) and len(role.buff[self.buffType]) == 1:
            self.fight.addActionLog({'act': self.buffType, 'to':self.role.rid})


        # 判断是否是暴走
        elif self.buffType in ('baozou'):
            _addBuff = {"baojipro": 99999999, "jingzhunpro": 999999999}
            self.altAttr = self.fight.calcAttr(self.role, _addBuff)
            self.fight.log(self.role, 'buff导致属性发生变化', self.altAttr, 'byskill', self.data)

        # 判断是否嘲讽，如果是新的嘲讽会覆盖之前的嘲讽、
        elif self.buffType in ('chaofeng'):
            buffs = self.role.buff.get(self.buffType, [])
            if len(buffs) > 1:
                try:
                    buffs[0].clear()
                except:
                    print "1111"

        _alt = {self.calcAttrType : _pro}


        # 增加多个属性
        if 'buffkey' in self.data:
            _alt = {}
            for buff in self.data['buffkey']:
                _alt[buff['buffid']] = buff['pro']
        self.altAttr = self.fight.calcAttr( self.role ,  _alt)
        self.fight.log(self.role,'buff导致属性发生变化', self.altAttr ,'byskill',self.data)        

        self.fight.event.on( Fight.FightEvent.reduceBuffTurn ,self.reduceTurn)

        # 延迟buff 生成时就推送了  所以出发时不再推送
        if not delayData:
            self.fight.addActionLog({'act':'buff','f':self.data['from'].rid,'t':self.role.rid,'bid':self.buffid,'bt':self.buffType,'_id':self._id,'r': self.data['round'], "skillid": self.data.get("skillid", "")})
        self.fight.event.emit(Fight.FightEvent.getBuff, {'bufftype': self.buffType, 'to': role, "buff":self})
    # 被攻击事件 暂时只处理护盾
    def hpChange(self, data):
        if data['addnum'] >= 0:
            return
        # 致命链接
        if self.buffType == 'zmlj':
            if data['to'] != self.fromrole or self.role.isDead() or data['lianjie'] != False or self.fromrole == self.role:
                return
            _num = int(self.data['pro'] / 1000.0 * data['addnum'])

            # for role in self.data["targe"]:
            #     if role == self.fromrole:
            #         continue
            self.role.modifyHP(_num, lianjie=True)
            return

        # 剧毒披风
        if self.buffType == 'jdpf':
            if data['to'] != self.role or self.role.isDead() or not data['jdpf']:
                return

            buffinfo = self.data["buffinfo"].copy()

            buffinfo["pro"] = data['addnum'] / (1000 - self.data["pro"]) * self.data["pro"] / buffinfo["round"] * -1
            self.role.addBuff(self.role, buffinfo)
            return

    # 被攻击时
    def chkByAtk(self, emitData):
        # 检测是否触发
        if self.role.isDead() or emitData['to'] != self.role or emitData['from'].isDead():
            return
        self.role.runSkills(self.data['runskill'], skillRunAt=self.fromrole)

    # 怒气变话
    def nuqiChange(self, emitData):
        # 如果是ymyj
        if not hasattr(self, "buffid"):
            return

        if self.buffid == "ymyj":
            if self.role.data["nuqi"] >= 100:
                _num = int(self.role.data["nuqi"] * self.data["pro"] * self.fromrole.data["atk"] / 1000)
                self.role.modifyHP(-_num, fromRole=self.fromrole)
                # TODO 可能会出现buff被删除了情况,应该是角色死亡了
                try:
                    self.fromrole.setSignNum('dps', _num)
                    # 扣除怒气
                    self.role.modifyNuQi(-self.role.data["nuqi"])
                    self.clear()
                except:
                    pass


    # 清除buff
    def clearbuff(self, buff):

        if not hasattr(self, "role"):
            return
        if isinstance(buff, dict):
            buff = buff["buff"]
        if not hasattr(buff, "buffType"):
            return
        # 如果的灵魂提灯

        if buff.buffType == 'emosign':
            _runskill = buff.data["runskill"]
            for skill in _runskill:
                # 获取技能配置
                sc = buff.fight.getSkill(skill, copy=False)
                _bdid = sc["bdid"]
                # 获取技能的被动
                _bdlist = buff.role.beidong.get(_bdid, [])
                for _bd in _bdlist:
                    # 如果技能id相等,删除对应的被动
                    if _bd.skillid == skill and _bd.data["from"] == buff.data["from"]:
                        # 驱散被动
                        _bd.clear()

        # 如果是光之力
        if buff.buffType == "lightpower":
            _buffList = self.role.getBuff(buff.buffType)
            _buffNum = len(_buffList)
            # 如果buff数量大于
            if _buffNum >= 2:
                buffinfo = self.data["buffinfo"].copy()
                self.role.addBuff(self.role, buffinfo)

                self.role.clearBuffByType(buff.buffType)


    def chkDoAtk(self, emitData):
        if not self.ifEmit():
            return
        if not hasattr(self, 'buffType'):
            return

        if self.buffType in ('shayi', 'junhengsign',):
            if emitData["atkType"] != 'xpskill':
                return

        if emitData['from'] != self.role:
            return

        self.fight.junheng = self.fromrole
        self.role.runSkills(self.data['runskill'], skillRunAt=emitData['from'])
        # 记录emit次数
        if 'emit' in self.data:
            self.role.signData['buffemit'].setdefault(str(self.fight.turn), {})[self.buffType] = self.role.signData['buffemit'].setdefault(str(self.fight.turn), {}).get(self.buffType,0) + 1

    def chkByDead(self,emitData):
        # 复活类buff
        if not hasattr(self, 'buffType'):
            return
        if emitData['to'] != self.role: return #不是自己

        #有人死亡时判断
        if self.buffType == 'fuhuo':

            if self.role.getBuff('unpassive'):
                return
            if self.role.getPassiveSkill('heianzhihun'):
                return
            self.fight.log(self.role,'死亡触发了fuhuo','by技能',self.data)
            self.role.data['canFuHuo'] = self.data['pro']
            self.clear() #技能只会触发一次

        # 有人死亡是判断是否有致命连接
        elif self.buffType == 'zmlj':
            if emitData['to'] == self.role:

                # 清除主英雄身上的buff
                _zbuff = self.fromrole.getBuff(self.buffType)
                for i in _zbuff:
                    if i.fromrole == self.fromrole:
                        i.clear()
                try:
                    self.clear()
                except:
                    return

        elif self.buffType == 'jiban':
            # 自己死亡 清除buff 羁绊死亡 清除buff
            for i in self.role.getBuff('jiban'):
                i.jiban.clear()
                i.clear()

    # 被攻击事件 暂时只处理护盾
    def byAtk(self, data):

        if self.buffType in ('zrbh', 'bianxing') and data.get("atkType") in ["xpskill", "normalskill"] and data["from"].rid.find("role") != -1 and data["to"].rid == self.role.rid:

            if self.buffType == "bianxing":
                self.byAtkNum += 1
                if self.byAtkNum >= 3:
                    self.clear()
            else:

                self.role.runSkills(self.data["runskill"], addLog=True)
                self.clear()
            return

        if self.buffType not in ('hudun', 'hudun2') or self.resValue > 0:
            return

        self.clear()


    #根据技能配置的randnum，判断是否会触发
    def ifEmit(self):
        if 'emit' in self.data:
            if self.role.signData['buffemit'].get(str(self.fight.turn), {}).get(self.buffType, 0) >= self.data['emit']:
                return False
        return True

    def reduceTurn(self):
        #回合数变化
        self.data['round'] -= 1
        self.fight.event.emit( Fight.FightEvent.buffTurnChange ,self)
        self.fight.log('buff回合数变化',self.data,self)
        
        #self.fight.addActionLog({'act':'buff','from':self.data['from'].rid,'to':self.role.rid,'bufftype':self.buffType,'buffid':self.buffid,'_id':self._id,'round': self.data['round'] })
        #self.fight.addActionLog({'act':'buffround','t':self.role.rid,'_id':self._id,'r': self.data['round'] })
        
        if self.data['round'] <= 0: self.clear()




    def clear(self):

        self.fight.event.emit( Fight.FightEvent.buffEnd ,self)

        # 删除buff
        if self in self.role.buff[self.buffType]:
            self.role.buff[self.buffType].remove(self)

        # 反向重置该技能带来的属性影响
        if self.altAttr != None:
            for k, v in self.altAttr.items():
                self.role.data[k] += v * -1
        self.fight.event.off( Fight.FightEvent.reduceBuffTurn ,self.reduceTurn)
        self.fight.event.off(Fight.FightEvent.hpChange, self.hpChange)
        self.fight.event.off(Fight.FightEvent.byAtk, self.byAtk)
        self.fight.event.off(Fight.FightEvent.byAtk, self.chkByAtk)
        self.fight.event.off(Fight.FightEvent.buffEnd, self.clearbuff)
        self.fight.event.off(Fight.FightEvent.byDead, self.chkByDead)
        self.fight.event.off(Fight.FightEvent.doAtk, self.chkDoAtk)
        self.fight.event.off(Fight.FightEvent.doAtk, self.chkDoAtk)
        self.fight.event.off(Fight.FightEvent.nuQiChange, self.nuqiChange)


        #self.fight.addActionLog({'act':'buff','from':self.data['from'].rid,'to':self.role.rid,'bufftype':self.buffType,'buffid':self.buffid,'_id':self._id,'round': self.data['round'] })
        self.fight.addActionLog({'act':'buffdel','t':self.role.rid,'bid':self.buffid,'bt':self.buffType,'_id':self._id,'r': self.data['round']})
        
        self.fight.log('buff被删除',self.data,self.role)
        
        del self.role
        del self.fight
        del self.buffid
        del self.fromrole
        del self.conf
        del self.data
        del self.buffType
        del self.calcAttrType

if __name__=='__main__':
    print Buff