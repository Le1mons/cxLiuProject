#!/usr/bin/python
#coding:utf-8
import random,copy
import Fight

#根据技能配置的randnum，判断是否会触发
def _getRandNum(skillData):
    if 'randnum' not in skillData : skillData['randnum'] = 1000
    skillData['randnum'] = int(skillData['randnum'])      
    return skillData['randnum']

def ifEmit(skillData):  
    return random.randint(1,1000) <= _getRandNum(skillData)

#增加怒气
def addnuqi(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.modifyNuQi( skillData['data']['value'] )

#减少怒气
def delnuqi(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.modifyNuQi( skillData['data']['value']*-1 )

#增加buff
def addbuff(fromRole,toRole,skillData):
    #不应该在一开始判断几率，下面后计算免疫属性
    #if not ifEmit( skillData ):
    #    return
    
    buffinfo = skillData['data']['v']    
    buffid = buffinfo['buffid']
    buffconf = fromRole.fight.getBuff(buffid)
    buffType = buffconf['bufftype']
    
    #判断toRole是否有免疫类buff
    mianYiPassiveSkill = toRole.getPassiveSkill('mianyi')
    mianYiBuffTypes = []
    for _skill in mianYiPassiveSkill:
        mianYiBuffTypes += _skill.data['v']['bufftype']
    
    if len(mianYiBuffTypes)>0 and buffType in mianYiBuffTypes:
        return
    
    #通过buffif读取配置，如果是控制类技能，需要计算免控率
    if buffconf['iscontrol'] == '1':
        #toRole有免控buff
        if len(toRole.getBuff('uncontrol')) > 0:
            return
        #我方控制技能触发概率*（1-对方战中免控率）
        _miankongVal = toRole.getProVal('miankong')
        _miankong = toRole.fight.range(_miankongVal,0,1000)
        oddsNum = _getRandNum(skillData) * ( 1000 - _miankong)/1000
        
        if random.randint(1,1000) <= oddsNum:
            toRole.addBuff(fromRole,buffinfo)
    else:
        #一开始的版本，在最上面判断了一次ifEmit，为了保持和外网的计算结果一次，这里再多判断一次
        if ifEmit( skillData ):
            if ifEmit( skillData ):
                toRole.addBuff(fromRole,buffinfo)
        
#对toRole造成  fromRole的千分之x攻击的生命
def hppro(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.recoverHPByPro(skillData['data']['pro'],fromRole,skillData)    

#对攻击目标造成其生命上限千分之pro的伤害
def delhp(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        maxdpsatkpro = None
        if 'maxdpsatkpro' in skillData['data']:
            maxdpsatkpro = skillData['data']['maxdpsatkpro']
            
        toRole.delHPByPro(skillData['data']['pro'],fromRole,skillData,maxdpsatkpro=maxdpsatkpro)

#对敌方全体造成千分之pro的伤害
def atk(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        fromRole.afterAtkRunAtk(toRole,skillData['data']['pro'])
      
#造成目标生命上限恢复xx%恢复
def addhp(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.addHPByPro(skillData['data']['pro'],fromRole,skillData)

#恢复固定生命值
def hpvalue(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.addHPByNum(skillData['data']['value'],fromRole,skillData)
        
#恢复已损失血量x%的生命
def relosehppro(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.addHPByLosePro(skillData['data']['pro'],fromRole,skillData)

#判断chkdata是否符合条件，如果符合，则需要重置技能属性
def chkdata(fromRole,toRole,chkdata):
    
    if "job" in chkdata:
        #如果目标是某职业，则...
        jobstr = [str(v) for v in chkdata['job']]
        if not str(toRole.data['job']) in jobstr:
            return False
   
    if 'hasbufftype' in chkdata:
        #如果目标带有xx buff，则...
        hasBuff = 0
        for _buffType in chkdata['hasbufftype']:
            if len(toRole.getBuff( _buffType )) > 0:
                hasBuff += 1
                break
        if hasBuff==0:
            return False
    
    if 'comparehp' in chkdata:
        v = chkdata['comparehp']
        if v == 0:
            #如果目标血量高于自己，则不触发
            if not toRole.data['hp'] > fromRole.data['hp']:
                return False
            
        if v == 1:
            #如果目标血量低于自己，则不触发
            if not toRole.data['hp'] < fromRole.data['hp']:
                return False
            
    return True

def calcAttr(fromRole,toRole,skillData):
    pro = "before_"+ skillData['act']
    dic = {pro:skillData['data']['pro']}
    res = fromRole.fight.calcAttr(fromRole,dic)
    return res
       
#根据不同的技能类型，做对应逻辑
def runSkill(fromRole,toRoles,skillData):
    res = {}
    act2Def = {
        "addnuqi" : addnuqi,
        'delnuqi' : delnuqi,
        'buff' : addbuff,
        'hppro': hppro,
        'relosehppro': relosehppro,
        'delhp': delhp,
        'atk': atk,
        'addhp':addhp,
        'hpvalue':hpvalue,
        'skilldpspro': calcAttr,
        'dpspro': calcAttr
    }    
    act = skillData['act']
    
    if toRoles:
        for toRole in toRoles:
            _skillData = skillData
            if len(toRoles)>1:
                #下面的逻辑中，会修改skillData的值，如果是循环的话，需要copy一份防止值被覆盖
                _skillData = copy.deepcopy(skillData)
                
            #如果chkdata有值，判断是否需要替换
            chkdataConf = _skillData['chkdata']
            if len(chkdataConf)>0:
                chkRes = chkdata(fromRole,toRole,chkdataConf)
                if chkRes:
                    _skillData['data'] = _skillData['ext']
            
            #该项有可能为空字典
            if len(_skillData['data']) == 0:
                continue
            
            if act in act2Def:
                res = act2Def[act](fromRole, toRole ,_skillData )
                #如果只有1个目标的话，返回数据
                if len(toRoles)==1:
                    return res
            else:
                print '~~~~unkonwn AfterSkill',_skillData
    else:
        print 'runSkill no roles',skillData
        
    return res
    
if __name__=='__main__':
    pass