#!/usr/bin/python
#coding:utf-8
import random,copy
import Fight

#根据技能配置的randnum，判断是否会触发
def _getRandNum(skillData):
    if 'randnum' not in skillData : skillData['randnum'] = 1000
    skillData['randnum'] = int(skillData['randnum'])      
    return skillData['randnum']

def ifEmit(skillData,fromRole=None):
    # 如果有被动就不触发
    if fromRole is not None and fromRole.roleType == 'role' and fromRole.getBuff('unpassive'):
        return False
    return random.randint(1,1000) <= _getRandNum(skillData)

#增加怒气
def addnuqi(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        toRole.modifyNuQi( skillData['data']['value'] )

#减少怒气
def delnuqi(fromRole,toRole,skillData):
    if ifEmit( skillData , fromRole):
        toRole.modifyNuQi( skillData['data']['value']*-1 )

# 扣除当前血量
def delNowHp(fromRole, toRole, skillData):
    if ifEmit( skillData ):
        if fromRole != toRole:
            num = -min(toRole.data['hp'] * skillData['data']['pro'] / 1000, fromRole.data['atk'] * skillData['data']['maxdpsatkpro'] / 1000)
        else:
            num = -(toRole.data['hp'] * skillData['data']['pro'] / 1000)
        # 特殊技能 pve伤害减少一半  运营sb平衡
        if skillData['skillid'] in ('51025013','51026013','5102a013') and fromRole.fight.ftype != 'pvp':
            num /= 2
        toRole.modifyHP(num, fromRole=fromRole)
        fromRole.setSignNum('dps', num)

# 驱散控制技能
def qusan(fromRole, toRole, skillData):
    if ifEmit( skillData ):
        fromRole.fight.addActionLog({'act': 'qusan', 'to': toRole.rid})
        for buffType in toRole.buff.keys():
            if toRole.fight.getBuff(buffType,copy=False)['iscontrol'] == '1':
                toRole.clearBuffByType(buffType)

# 强驱散
def powerqusan(fromRole, toRole, skillData):
    if ifEmit(skillData):
        _gtype = skillData['data'].get('gtype', '2')
        #驱散的buff数量
        _num = skillData['data'].get('num', 99)
        toRole.fight.addActionLog({'act': {'2': 'jinghua', '1': 'qusan'}[_gtype], 'to': toRole.rid})
        _qsNum = 0
        for buffType in toRole.buff.keys():
            if toRole.fight.getBuff(buffType, copy=False)['gtype'] != _gtype:
                continue
            # 如果驱散的数量大于可以驱散的数量
            if _qsNum >= _num:
                break
            toRole.clearBuffByType(buffType)
            _qsNum += 1



# 清除某某buff达成某某条件
def clearbuff(fromRole, toRole, skillData):
    # if ifEmit(skillData):
    _bufftype = skillData['data']['bufftype']
    _buffid = skillData['data']['buffid']
    #驱散的buff数量
    _pro = skillData['data']['pro']
    # fromRole.fight.getBuff(_bufftype, copy=False)
    _maxNum = skillData['data'].get("maxnum", 99)
    _side = skillData["data"].get("side", 0)
    if not _side:
        buffs = fromRole.buff.get(_bufftype, [])
        _clearNum = 0
        for i in buffs:
            if i.buffid != _buffid:
                continue
            if _clearNum >= _maxNum:
                break
            _clearNum += 1
            targets = fromRole.lastSkillTarget
            if targets:
                _toRole = random.sample(targets, 1)[0]
                toRole.fight.addActionLog({'act': "clearbuff", 'to': toRole.rid, "buffid": _bufftype})
                _dps = fromRole.data['atk'] * _pro / 1000.0
                _toRole.modifyHP(-_dps, fromRole=fromRole)
        mianyi = 0
        _clearNum = 0
        while len(buffs) > 0 and mianyi < len(buffs):
            if _clearNum >= _maxNum:
                break
            if buffs[0].buffid != _buffid:
                mianyi += 1
                continue
            if buffs[0].data.get("ismianyi", 0):
                mianyi += 1
                continue
            buffs[0].clear()
            _clearNum += 1

    else:
        targets = [toRole]
        _clearNum = 0
        for _toRole in targets:
            buffs = _toRole.buff.get(_bufftype, [])
            for i in buffs:
                if i.buffid != _buffid:
                    continue
                if _clearNum >= _maxNum:
                    break
                _clearNum += 1
                targets = fromRole.lastSkillTarget
                if targets:
                    for toRole in targets:
                        toRole.fight.addActionLog({'act': "clearbuff", 'to': toRole.rid, "buffid": _bufftype})
                        _dps = fromRole.data['atk'] * _pro / 1000.0
                        _toRole.modifyHP(-_dps,fromRole=fromRole)

                mianyi = 0
                _clearNum = 0
                while len(buffs) > 0 and mianyi < len(buffs):
                    if _clearNum >= _maxNum:
                        break
                    if buffs[0].buffid != _buffid:
                        mianyi += 1
                        continue
                    if buffs[0].data.get("ismianyi", 0):
                        mianyi += 1
                        continue
                    buffs[0].clear()


    # for buff in buffs:
    #     # 如果这个buff免疫清除
    #     if buffs[0].data.get("ismianyi", 0):
    #         continue
    #     buffs[0].clear()



#增加buff
def addbuff(fromRole,toRole,skillData):
    #不应该在一开始判断几率，下面后计算免疫属性
    #if not ifEmit( skillData ):
    #    return

    buffinfo = skillData['data']['v']

    buffid = buffinfo['buffid']
    buffconf = fromRole.fight.getBuff(buffid,copy=False)
    buffType = buffconf['bufftype']
    
    #判断toRole是否有免疫类buff
    mianYiPassiveSkill = toRole.getPassiveSkill('mianyi')
    mianYiBuffTypes = []
    for _skill in mianYiPassiveSkill:
        mianYiBuffTypes += _skill.data['v']['bufftype']
    
    if len(mianYiBuffTypes)>0 and buffType in mianYiBuffTypes and not buffinfo.get("ismianyi", 0):
        return

    # 判断toRole是否有免疫类buff
    mianYiPassiveSkill = toRole.getPassiveSkill('mianyi2')
    mianYiBuffTypes = []
    for _skill in mianYiPassiveSkill:
        mianYiBuffTypes += _skill.data['v']['bufftype']

    if len(mianYiBuffTypes) > 0 and buffType in mianYiBuffTypes and fromRole.roleType not in ('pet', 'artifact') and not buffinfo.get("ismianyi", 0):
        return

    # 如果有护盾  免疫一切debuff
    if buffconf['gtype'] == '2' and toRole.getBuff('hudun') and not buffinfo.get("ismianyi", 0):
        return

    # 如果是致命链接
    if buffid == "zmlj":
        # 如果判断是一样的
        if toRole == fromRole:
            return
        _num = 0
        # 判断这个主英雄释放的buff是不是只有一个
        for i in fromRole.getBuff(buffid):
            if i.fromrole != fromRole:
                continue
            _num += 1
        if _num > 0:
            return
        # 如果没有则在给被链接方上buff的同时给主链接放上一个buff
        fromRole.addBuff(fromRole, buffinfo)

    #通过buffif读取配置，如果是控制类技能，需要计算免控率
    if buffconf['iscontrol'] == '1':
        # 如果有免控护盾
        if len(toRole.getBuff('uncontrolhudun')) > 0:
            toRole.getBuff('uncontrolhudun')[0].clear()
            return

        #toRole有免控buff
        if len(toRole.getBuff('uncontrol')) > 0:
            return

        # 有火药装甲 消耗一层抵消
        if toRole.getBuff('resistarmer'):
            toRole.getBuff('resistarmer')[0].clear()
            return

        #我方控制技能触发概率*（1 + 强控 - 对方战中免控率）
        _miankongVal = toRole.getProVal('miankong')
        _miankong = toRole.fight.range(_miankongVal,0,1000)
        oddsNum = _getRandNum(skillData) * (1000 + fromRole.getProVal("control") - _miankong) / 1000


        if random.randint(1,1000) <= oddsNum:
            toRole.addBuff(fromRole,buffinfo)
    else:
        #一开始的版本，在最上面判断了一次ifEmit，为了保持和外网的计算结果一次，这里再多判断一次
        if ifEmit( skillData, fromRole ):
            if ifEmit( skillData ):
                toRole.addBuff(fromRole,buffinfo)
        
#对toRole造成  fromRole的千分之x攻击的生命
def hppro(fromRole,toRole,skillData):
    if ifEmit( skillData, fromRole) and not toRole.isDead():
        toRole.recoverHPByPro(skillData['data']['pro'],fromRole,skillData)

#对toRole造成  fromRole的千分之x攻击的生命
def xixue(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        # 如果fromRole没死
        if skillData.get('islive', '1') == '1' and not fromRole.isDead():

            num = fromRole.fight.turnDps.get(fromRole.rid, {}).get(toRole.rid, 0) * skillData['data']['pro'] / 1000
            if num > 0:
                fromRole.modifyHP(num)
                fromRole.setSignNum('addhp', num)

# 回复特殊血量 暂时只处理上面一个方法的血量
def exthppro(fromRole,toRole,skillData):
    if not ifEmit( skillData ) or 'recoverHPByPro' not in fromRole.attr:
        return

    _addNum = fromRole.attr['recoverHPByPro'] / fromRole.fight.getAliveNum(fromRole.data['side'])
    toRole.modifyHP(_addNum)


#对攻击目标造成其生命上限千分之pro的伤害
def delhp(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        maxNum = None
        if 'maxdpsatkpro' in skillData['data']:
            maxdpsatkpro = skillData['data']['maxdpsatkpro']
            maxNum = int(fromRole.data['atk'] * maxdpsatkpro/1000.0)

            if toRole.lastAtkType == 'xpskill' and toRole.getBuff('junhengsign'):
                _buffs = toRole.getBuff('junhengsign')
                _buffs.sort(key=lambda x:x.data['pro'],reverse=True)
                maxNum = int(_buffs[0].fromrole.data['atk'] * maxdpsatkpro/1000.0)

        toRole.delHPByPro(skillData['data']['pro'],fromRole,skillData,maxNum=maxNum)

#对敌方全体造成千分之pro的伤害
def atk(fromRole,toRole,skillData):
    if ifEmit( skillData ):
        fromRole.afterAtkRunAtk(toRole,skillData['data']['pro'])
      
#造成目标生命上限恢复xx%恢复
def addhp(fromRole,toRole,skillData):
    if ifEmit( skillData ) and not toRole.isDead():
        toRole.addHPByPro(skillData['data']['pro'],fromRole,skillData)

#造成目标生命上限恢复xx%恢复
def addpethp(fromRole,toRole,skillData):
    if ifEmit( skillData ) and not toRole.isDead():
        num = int(fromRole.data['hp'] * skillData['data']['pro'] / 1000.0)
        toRole.modifyHP(num)
        if fromRole:
            fromRole.setSignNum('addhp',num)

#恢复固定生命值
def hpvalue(fromRole,toRole,skillData):
    if ifEmit( skillData ) and not toRole.isDead():
        toRole.addHPByNum(skillData['data']['value'],fromRole,skillData)
        
#恢复已损失血量x%的生命
def relosehppro(fromRole,toRole,skillData):
    if ifEmit( skillData ) and not toRole.isDead():
        _pro = skillData['data']['pro']
        # 特殊技能 pve伤害减少一半  运营sb平衡
        if skillData['skillid'] in ('51025213','51026213','5102a213') and fromRole.fight.ftype != 'pvp':
            _pro /= 2
        toRole.addHPByLosePro(_pro,fromRole,skillData)

# 直接扣血的
def damage(fromRole,toRole,skillData):
    if ifEmit(skillData, fromRole):
        _extData = {}
        _bj = False
        if skillData['data'].get('type') != 'bydamege':
            role = fromRole if skillData['data'].get('type', 'from') == 'from' else toRole
            _pro = skillData['data']['pro']
            _num = role.data['atk'] * skillData['data']['pro'] * 0.001
            # 判断是否享受真伤加成
            if skillData['data'].get('isrealinjury'):
                _pro += fromRole.getProVal('realinjury')
                _extData["isrealinjury"] = 1
                _extData["skillid"] = skillData["skillid"]
            _num = role.data['atk'] * _pro * 0.001

            if skillData['data'].get('iscritcal'):
                _bj = not _bj
                _num *= (fromRole.getProVal('baoshang') + 1500) * 0.001

            if skillData['data'].get('losses'):
                _lossHp = toRole.data["maxhp"] - toRole.data["hp"]
                _num = int(_lossHp * skillData['data']['pro'] * 0.001)
                try:
                    if _num >= fromRole.data["atk"] * 15:
                        _num = fromRole.data["atk"] * 15
                except:
                    print "errAfteratk"

        else:
            _num = fromRole.lastHitDps * skillData['data']['pro'] * 0.001
        _extData["ifBaoJi"] = _bj

        toRole.modifyHP(-_num, fromRole=fromRole, extData=_extData)
        fromRole.setSignNum('dps', _num)

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
            role = fromRole.lastHitBy if chkdata.get('type', 'to') == 'byatk' else fromRole if chkdata.get('type', 'to') == 'from' else toRole
            if len(role.getBuff( _buffType )) > 0:
                hasBuff += 1
                break
        if hasBuff==0:
            return False

    if 'comparebuff' in chkdata:
        # state 为1  >=
        if chkdata['comparebuff']['state']:
            if not fromRole.data[chkdata['comparebuff']['bufftype']] >= toRole.data[chkdata['comparebuff']['bufftype']]:
                return False
        else:
            if not fromRole.data[chkdata['comparebuff']['bufftype']] < toRole.data[chkdata['comparebuff']['bufftype']]:
                return False

    if 'comparehp' in chkdata:
        v = chkdata['comparehp']
        if v == 0:
            # 如果目标血量高于自己，则不触发
            if not toRole.data['hp'] > fromRole.data['hp']:
                return False

        if v == 1:
            # 如果目标血量低于自己，则不触发
            if not toRole.data['hp'] < fromRole.data['hp']:
                return False
    
    if 'comparedef' in chkdata:
        v = chkdata['comparedef']
        if v == 0:
            #如果目标血量高于自己，则不触发
            if not toRole.data['def'] > fromRole.data['def']:
                return False
            
        if v == 1:
            #如果目标血量低于自己，则不触发
            if not toRole.data['def'] < fromRole.data['def']:
                return False

    # 组合技能
    if 'skill' in chkdata and chkdata['skill'] not in fromRole.data['skill']:
        return False

    # 检查pos
    if 'pos' in chkdata and ((chkdata['pos'] == 1 and toRole.data['pos'] in (3,4,5,6)) or (chkdata['pos'] == 0 and toRole.data['pos'] in (1,2))):
        return False

    # 检查buff数量
    if 'countbufftype' in chkdata:
        _num = sum([len(toRole.buff.get(i,[])) for i in chkdata['countbufftype']])
        if _num < chkdata.get('num', 0):
            return False

    # 检查对方的血量百分比
    if 'hpproless' in chkdata:
        if toRole.data['hp'] * 1000 / toRole.data['maxhp'] > chkdata['hpproless']:
            return False

    # 处理生命值高于或低于x 处罚
    if "hplimit" in chkdata:
        _info = chkdata["hplimit"]
        if _info["side"] == -2:
            _hp = fromRole.data['hp']
            _maxhp = fromRole.data['maxhp']
        # 判断条件是我方血量还是对方血量, side为1标示对方血量
        elif _info["side"] == -1:
            _hp = toRole.data['hp']
            _maxhp = toRole.data['maxhp']
        # 判断是低于还是高于 state为1表示高于，state为0表示低于
        if _info["state"]:
            if _hp / _maxhp * 1000 < _info["pro"]:
                return False
        else:
            if _hp / _maxhp * 1000 > _info["pro"]:
                return False

    # 检查特定buff的数量
    if 'buffid' in chkdata:
        if len([i for i in toRole.getBuff(chkdata['buffid']) if i.data.get('chkid') == chkdata['chkid']]) >= chkdata['max']:
            return False
    return True

def calcAttr(fromRole,toRole,skillData):
    # 种族克制
    if 'upjob' in skillData['chkdata'] and int(skillData['chkdata']['upjob']) == 1 and not fromRole.fight.ifZhongZuKeZhi(fromRole, toRole):
        return {}

    pro = "before_"+ skillData['act']
    role = fromRole if skillData['chkdata'].get('type', 'to') == 'to' else toRole
    _val = skillData['data']['pro']
    dic = {pro: _val}

    res = fromRole.fight.calcAttr(role, dic)
    return res

# 战前临时根据弯buff调整
def modifyAttr(fromRole,toRole,skillData):

    if skillData["data"]["act"] not in ["dpspro", "skilldpspro"]:
        return {}
    _val = 0
    # 判断对方玩家身上的buff数
    if skillData["data"]["v"]["count"] == 'typebuffnum':
        _num = 0
        if not toRole:
            return _num
        for buffid in toRole.buff.keys():
            _con = toRole.fight.getBuff(buffid)
            if _con["gtype"] == "2":
                _num += 1
        if _num > 5:
            _num = 5
        _val = _num * skillData["data"]["v"]["pro"]
    # 判断对方玩家身上的怒气值
    elif skillData["data"]["v"]["count"] == 'nuqidps':
        if skillData["data"]["v"].get("addnuqi", 0) > 0:
            toRole.modifyNuQi(skillData["data"]["v"]["addnuqi"])

        _val = toRole.data['nuqi'] * skillData["data"]["v"]["pro"]
        if skillData["data"]["v"]["clear"]:
            toRole.modifyNuQi(-toRole.data['nuqi'])


    pro = "before_" + skillData["data"]["act"]
    role = fromRole if skillData['chkdata'].get('type', 'to') == 'to' else toRole
    dic = {pro: _val}

    res = fromRole.fight.calcAttr(role, dic)
    return res


# 诱发扣血
def youfa(fromRole,toRole,skillData):
    if ifEmit(skillData, fromRole):
        _dps = 0
        undotdps = 1000 + toRole.getProVal('undotdps')
        undotdps = toRole.fight.range(undotdps,min=1000)
        undotdps = undotdps*0.001

        for buffType in skillData['data']['buffid']:
            _buffs = toRole.getBuff(buffType)
            if not _buffs:
                continue

            for buff in _buffs[:]:
                _dps += int(buff.resValue/undotdps) * buff.data['round'] * skillData['data']['pro'] / 1000
                buff.clear()

        if _dps < 0:
            _dps = min(fromRole.data['atk'] * skillData['data']['maxdpsatkpro'] / 1000, abs(_dps))
            fromRole.setSignNum('dps',_dps)
            toRole.modifyHP(-_dps, fromRole=fromRole)








# 追击
def zuiji(fromRole,toRole,skillData):
    pass


# 控制技能回合数变化
def controlbuffround(fromRole,toRoles,skillData):
    pass


# buff回合数变化
def buffround(fromRole,toRole,skillData):
    if ifEmit(skillData, fromRole):
        for bufftype, arr in toRole.buff.items():
            _con = toRole.fight.getBuff(bufftype)
            if _con["gtype"] != skillData["data"]["gtype"]:
                continue
            for i in arr:
                i.data["round"] += skillData["data"]["num"]


# 清理怒气值并造成伤害
def clearNuQi(fromRole,toRoles,skillData):

    # 清除buff，并造成伤害
    for toRole in toRoles:
        # 扣除hp
        num = int(toRole.data['nuqi'] * skillData["data"]["pro"] / 1000.0)
        toRole.modifyHP(num, fromRole=fromRole)
        fromRole.setSignNum('dps', num)
        # 扣除怒气
        toRole.modifyNuQi(-toRole.data['nuqi'])


# 根据buff类型回血或者攻击
def buffnumdps(fromRole,toRole,skillData):
    if ifEmit(skillData, fromRole):
        _dps = fromRole.lastHitDps
        _num = 0

        _buffs = toRole.getBuff(skillData["data"]["buffid"])
        if not _buffs:
            return

        _buffNum = len(_buffs)
        if _buffNum > skillData['data']['maxnum']:
            _buffNum = skillData['data']['maxnum']
        _num = _buffNum * _dps * skillData['data']['pro'] / 1000
        _num = -_num
        if _num > 0:
            fromRole.setSignNum('addhp', _num)
            fromRole.modifyHP(_num, fromRole=fromRole)

        else:
            fromRole.setSignNum('dps', _num)
            toRole.modifyHP(_num, fromRole=fromRole)

#根据不同的技能类型，做对应逻辑
def runSkill(fromRole,toRoles,skillData):
    res = {}
    act2Def = {
        "addnuqi" : addnuqi,
        "youfa" : youfa,
        'delnuqi' : delnuqi,
        "damage": damage,
        'buff' : addbuff,
        'hppro': hppro,
        'xixue': xixue,
        'relosehppro': relosehppro,
        'delhp': delhp,
        'atk': atk,
        'addhp':addhp,
        'addpethp':addpethp,
        'hpvalue':hpvalue,
        'skilldpspro': calcAttr,
        'qusan': qusan,
        'delnowhp': delNowHp,
        'exthppro': exthppro,
        'dpspro': calcAttr,
        'powerqusan':powerqusan,
        "clearbuff": clearbuff,
        "modifyattr":modifyAttr,
        "clearnuqi": clearNuQi,
        "zuiji": zuiji,
        "controlbuffround": controlbuffround,
        "buffround":buffround,
        "buffnumdps":buffnumdps,
    }
    act = skillData['act']
    
    if toRoles:
        fromRole.lastAfterAtkTarge = toRoles
        for toRole in toRoles:
            _skillData = skillData
            if len(toRoles)>1:
                #下面的逻辑中，会修改skillData的值，如果是循环的话，需要copy一份防止值被覆盖
                _skillData = Fight.deepCopy(skillData)
                
            #如果chkdata有值，判断是否需要替换
            chkdataConf = _skillData['chkdata']
            if len(chkdataConf)>0:
                chkRes = chkdata(fromRole,toRole,chkdataConf)
                # 如果是countbufftype就特殊处理val
                if 'pro' in _skillData['ext'] and 'countbufftype' in chkdataConf:
                    _val = 0
                    for i in chkdataConf['countbufftype']:
                        _val += len(toRole.buff.get(i,[])) * _skillData['ext']['pro']
                    # 不能超过limit的限定
                    _skillData['ext']['pro'] = _val if _val < _skillData['ext']['limit'] else _skillData['ext']['limit']

                if chkRes:
                    _skillData['data'] = _skillData['ext']
            
            #该项有可能为空字典
            if len(_skillData['data']) == 0:
                continue
            
            if act in act2Def:
                res = act2Def[act](fromRole, toRole ,_skillData)
                #如果只有1个目标的话，返回数据
                if len(toRoles)==1:
                    return res or {}
            else:
                print '~~~~unkonwn AfterSkill',_skillData
    #else:
    #    print 'runSkill no roles',skillData
        
    return res
    
if __name__=='__main__':
    pass