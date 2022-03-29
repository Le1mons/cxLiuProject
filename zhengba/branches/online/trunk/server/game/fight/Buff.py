#!/usr/bin/python
#coding:utf-8

import Fight,random

class Buff(object):
    index = 0
    def __init__ (self,role,buffData):
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
        
        if self.buffType not in role.buff:
            role.buff[ self.buffType ] = []
        
        #加入到role的buff集合
        role.buff[ self.buffType ].append(self)
        
        _pro = 0
        if 'pro' in buffData:
            _pro = buffData['pro']
            
        
        #如果是掉血类buff的话，施加buff时就计算好掉血量，提高性能
        if self.buffType in ['diaoxue','zhongdu','liuxue','zhuoshao','roundsign','baojisign']:
            if 'realinjury' in self.data and str(self.data['realinjury'])=='1':
                #如果配置里有realinjury KEY并且=1的话，表示pro是真实伤害，即：最终扣血的值得
                dps = int(self.data['pro']) * -1
            else:
                dps = self.fight.getBuffDPS(self.data['from'],self.role, int(self.data['pro']))
                
            self.resValue = dps
        
        #如果是恢复血类buff，施加时计算
        if self.buffType in ['hpback']:
            if 'realinjury' in self.data and str(self.data['realinjury'])=='1':
                addnum = int(self.data['pro'])
            else:
                addnum = self.fight.getBuffAddHP(self.data['from'],self.role, int(self.data['pro']))
                
            self.resValue = addnum
          
        self.altAttr = self.fight.calcAttr( self.role , {self.buffType : _pro } )
        self.fight.log(self.role,'buff导致属性发生变化', self.altAttr ,'byskill',self.data)        

        self.fight.event.on( Fight.FightEvent.reduceBuffTurn ,self.reduceTurn)
        
        self.fight.addActionLog({'act':'buff','f':self.data['from'].rid,'t':self.role.rid,'bid':self.buffid,'bt':self.buffType,'_id':self._id,'r': self.data['round'] })
    
    #根据技能配置的randnum，判断是否会触发
    def ifEmit(self): 
        return True

    def reduceTurn(self):
        #回合数变化
        self.data['round'] -= 1
        self.fight.event.emit( Fight.FightEvent.buffTurnChange ,self)
        self.fight.log('buff回合数变化',self.data,self)
        
        #self.fight.addActionLog({'act':'buff','from':self.data['from'].rid,'to':self.role.rid,'bufftype':self.buffType,'buffid':self.buffid,'_id':self._id,'round': self.data['round'] })
        #self.fight.addActionLog({'act':'buffround','t':self.role.rid,'_id':self._id,'r': self.data['round'] })
        
        if self.data['round'] <= 0: self.clear()

    def clear (self):
        #删除buff
        if self in self.role.buff[ self.buffType ]:
            self.role.buff[ self.buffType ].remove(self)
        
        #反向重置该技能带来的属性影响
        if self.altAttr!=None:
            for k,v in self.altAttr.items():
                self.role.data[k] += v*-1        

        self.fight.event.emit( Fight.FightEvent.buffEnd ,self)
        self.fight.event.off( Fight.FightEvent.reduceBuffTurn ,self.reduceTurn)
        
        #self.fight.addActionLog({'act':'buff','from':self.data['from'].rid,'to':self.role.rid,'bufftype':self.buffType,'buffid':self.buffid,'_id':self._id,'round': self.data['round'] })
        self.fight.addActionLog({'act':'buffdel','t':self.role.rid,'bid':self.buffid,'bt':self.buffType,'_id':self._id,'r': self.data['round'] })
        
        self.fight.log('buff被删除',self.data,self.role)
        
        del self.role
        del self.fight
        del self.buffid
        del self.fromrole
        del self.conf
        del self.data
        del self.buffType

if __name__=='__main__':
    print Buff