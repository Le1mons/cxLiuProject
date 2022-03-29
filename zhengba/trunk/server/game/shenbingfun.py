#!/usr/bin/python
#coding:utf-8

'''
神兵将魂相关方法
'''
import g

#添加神兵信息
def addShenBing(uid,sbid,num=1,data=None):
    _con = g.GC['shenbing']['shenbing'][sbid]
    #基础属性
    _data = {
        "uid":uid,
        "sbid":sbid,
        #道具名
        "name":_con["name"],
        #道具颜色
        "color":_con["color"],
        #创建时间
        "ctime":g.C.NOW(),
        #最后修改时间
        "lasttime":g.C.NOW(),
        #默认星级
        "star":0,
        #默认等阶
        "dengjie":1,
        #默认计数等级
        "lv":0
    }
    if data != None: _data.update(data)
    _res = g.mdb.insert("shenbing",_data)
    # 获得神兵
    g.event.emit('shenbing_jihuo', uid)
    return _res

#获取神兵列表
def getShenBingList(uid,keys='',where=None):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {"uid":uid}
    if where!=None:
        for k,v in where.items():
            if k == "tid" and len(v)>0:
                k["tid"] = g.mdb.toObjectId(v)

        _w.update(where)

    _res = g.mdb.find("shenbing",_w,**_options)

    return _res


#获取神兵信息
def getShenBing(uid,tid,keys=''):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {'uid':uid,'_id':g.mdb.toObjectId(tid)}
    _res = g.mdb.find1("shenbing",_w,**_options)
    return _res


#设置神兵信息
def setShenBing(uid,tid,data):
    _w = {'uid':uid,'_id':g.mdb.toObjectId(tid)}
    _res = g.mdb.update('shenbing',_w,data)
    return _res



#生成新剑魂buff
def makeJianHunBuff(jhid):
    _con = g.GC['pre_jianhun'][jhid]
    _res = {'buff':{}}
    _res['basebuff'] = {}
    if str(_con['color']) == '5':
        #如果是特殊剑魂
        _extCon = g.GC['jianhun']['extitem']
        _allPro =  _extCon['allpro']
        _bdskill = g.C.getRandArr(_extCon['bdskill'],_allPro)
        _res['bdskill'] = _bdskill['b']
        _bdskillCon = g.GC['jianhun']['bdskill'][_res['bdskill']]
    else:
        _buffp = _con['buffp']
        _buffItem = g.C.getRandArr(_con['buff'],_buffp)
        _res['basebuff'] = _buffItem['b']
        _res['buff'] = _buffItem['b']
        
    return _res




#添加剑魂信息
#isemit:是否触发事件
def addJianHun(uid,jhid,data=None,isemit=1):
    _con = g.GC['pre_jianhun'][jhid]
    _nt = g.C.NOW()
    _data = {}
    _data['uid'] = uid
    _data['jhid'] = jhid
    #颜色
    _data['color'] = _con['color']
    #位置
    _data['pos'] = _con['pos']
    #名字
    _data['name'] = _con['name']
    _data['lv'] = 0
    _data['num'] = 1
    _data['nexp'] = 0
    _data['allexp'] = 0
    _data['ctime'] = _nt
    _data['lasttime'] = _nt
    _buff = makeJianHunBuff(jhid)
    _data.update(_buff)
    _reSetBuff =  reSetJianHunBuff(_data)
    _data.update(_reSetBuff)
    if data != None:
        _data.update(data)

    _newdata = g.C.dcopy(_data)
    _res = g.mdb.insert("jianhun",_newdata)

    # 获取剑魂
    if isemit:
        print 'enter JH event'
        g.event.emit('jianhun_jihuo', uid, data=[_data])
        
    return {"tid":str(_res),"jhdata":_data}



#设置剑魂信息
def setJianHun(uid,tid,data):
    _w = {"uid":uid,'_id':g.mdb.toObjectId(tid)}
    _res = g.mdb.update("jianhun",_w,data)
    return _res


#获取剑魂信息
def getJianHunData(uid,tid,keys=''):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {"uid":uid,'_id':g.mdb.toObjectId(tid)}
    _res = g.mdb.find1("jianhun",_w,**_options)
    return _res

#获取剑魂列表
def getJianHunList(uid,keys='',where=None):
    _options = {}
    if keys!='':
        _options = {"fields":keys.split(",")}
        
    _w = {"uid":uid}
    if where!=None:
        _w.update(where)

    _res = g.mdb.find("jianhun",_w,**_options)
    return _res

#获取剑魂最大等级
def getJHMaxLv():
    return g.GC['jianhun']['maxlv']

#获取神兵buff
def getShenBingJianHunBuff(uid,hid):
    _sbData = g.mdb.find1('shenbing',{'uid':uid,'usehid':hid})
    if _sbData == None:
        return {}
    
    _buff = {}
    _sbid = str(_sbData['sbid'])
    _key = str(_sbData['lv'] + 1)
    _con = g.GC['shenbingcom'][_sbid][_key]
    _buff = _con['buff']
    _jhList = getJianHunList(uid,where={'usehid':hid})
    for jh in _jhList:
        for k,v in jh['buff'].items():
            if k in _buff:
                _buff[k] += v
            else:
                _buff[k] = v

    return _buff



#获取指定等级的经验上限
def getMaxExp(lv,_color):
    _maxExpList = g.GC['jianhun']['exp']
    _pro = g.GC['jianhun']['colorpro'][str(_color)]
    if lv >= len(_maxExpList):
        _maxExp = 99999999
    else:
        #每级所需成长值公式：((等级×10)^(1+(等级÷100))*20)
        _maxExp = _maxExpList[lv] * _pro
        _maxExp = int(_maxExp)
    return _maxExp


#设置剑魂经验
def altExp(uid,jhtid,exp):
    _jhData =  getJianHunData(uid,jhtid)
    _jhLv = int(_jhData['lv'])
    _color = _jhData['color']
    _baselv = _lv = int(_jhData['lv'])
    _myexp = _jhData['nexp']+int(exp)
    _res = {}
    _res['allexp'] = _jhData['allexp'] + exp
    _maxExp = getMaxExp(_lv,_color)
    _maxLv = getJHMaxLv()
    while(1):
        _maxExp = getMaxExp(_lv,_color)
        if _myexp >= _maxExp and _lv < _maxLv:
            _lv+=1
            _myexp = _myexp - _maxExp
        else:
            break

    _isUp = 0
    _res['nexp'] = _myexp
    if _myexp > _maxExp: _res['nexp'] = _maxExp-1
    if _lv != int(_baselv): _isUp = 1
    if _isUp:
        _res['lv'] = _lv
        #_res['maxexp'] = _maxExp
        #TODO 事件提醒
        #g.event.emit("jianhunchange",uid,"XXX")
        
    return _res

#重置剑魂buff
def reSetJianHunBuff(jhdata):
    _lv = int(jhdata['lv'])
    _color = str(jhdata['color'])
    _buff = {}
    if _color != '5':
        #系数
        _pro = g.GC['jianhun']['colorpro'][_color]
        #基数buff
        _baseBuff = jhdata['basebuff']
        #计算buff值
        for k,v in _baseBuff.items():
            if k in ['atk','def','bingli']:
                #攻击力、防御力值公式=INT(((基数^(1+级别÷100))+系数×级别)×(1+级别/10))+系数
                #_val = int((pow(v,(1+_lv*0.01)) +_pro * _lv) * (1+ _lv * 0.1)) + _pro
                #2017-8-23修改 攻击力=INT(((配置值^(1+级别÷100))+5×级别)×(1+级别/10))+5 
                _val = int((pow(v,(1+_lv*0.01)) +5 * _lv) * (1+ _lv * 0.1)) + 5;_val = int(_val * _pro)
                if k == 'def':
                    #防御力=攻击力×3 
                    _val *= 3
                if k == 'bingli':
                    #兵力=攻击力×8 
                    _val *= 8
                    
                '''elif k in ['bingli']:
                    #兵力值=INT(INT(((基数^(1+级别÷100))+系数×级别)×(1+级别/10))+系数×(级别+2-(级别/10)))
                    _val = int( int((pow(v,(1+_lv*0.01)) +_pro * _lv) * (1+ _lv * 0.1)) + _pro * (_lv + 2 - (_lv*0.1)))'''
            elif k in ['speed']:
                #速度值=级别+系数+（级别×系数+基数）
                #_val = int(_lv + _pro +(_lv * _pro + v))
                #2017-8-23 速度=级别+5+（级别×5+配置的值）
                _val =  (_lv + 5 + (_lv * 5 + v) ) * _pro;_val = int(_val)
            elif k in ['wuli','zhili','tongshuai']:
                #力量、智力、统御=基数+级别
                _val = int(v + _lv) * _pro
            elif k in ['atkpro','defpro','binglipro']:
                #攻击力、防御力、兵力百分比成长=（基数+级别）÷100
                #_val = (v + _lv) * 0.01
                #_val = round(_val,3)
                #2017-8-23 修改 攻防血百分比=(配置值+lv*0.6)/100
                _val = (v + _lv * 0.6 ) * 0.01 * _pro
                _val = round(_val,3)
            elif k in ['dpsdrop']:
                #伤害减免=（基数+级别×0.5）÷100
                #_val = (v + _lv * 0.5) * 0.01
                #2017-8-23 伤害减免=(配置值+lv)/100 
                _val = (v + _lv) * 0.01 * _pro
                _val = round(_val,3)
            elif k in ['baojipro','renxingpro','baoshangpro']:
                _val = v + _lv * 0.01 * _pro
                _val = round(_val,3)
            elif k in ['yazhi','dikang']:
                _val = v + _lv * 10 * _pro
                _val = int(_val)
            else:
                _val = v
                
            _buff[k] = _val
            
    return {'buff':_buff}



#获取被动技能信息
def getBDSkillBySBJH(uid,hid):
    _sbData = g.mdb.find1('shenbing',{'uid':uid,'usehid':hid})
    if _sbData == None:
        return {}
    
    _res = {}
    #获取神兵被动buff
    _sbid = str(_sbData['sbid'])
    lv = _sbData['dengjie']
    _sbCon = g.GC['shenbing']['shenbing'][_sbid]
    _bdskillId = _sbCon['bdskill']
    _bdSkillCon = g.GC['jianhun']['bdskill'][_bdskillId]
    _buffKey = _bdSkillCon['key']
    _buffVal = eval(_bdSkillCon['fmt'])
    _res[_buffKey] = _buffVal
    
    #获取剑魂被动buff - 2017-5-4去掉剑魂被动技能
    '''_jhList = getJianHunList(uid,'',{'color':5,'usehid':hid,'bdskill':{'$exists':1}})
    if len(_jhList) > 0 and _jhList[0]['bdskill'] == _bdskillId:
        lv = _jhList[0]['lv']
        _val = eval(_bdSkillCon['fmt'])
        _res[_buffKey] += _val'''
        
    if 'fuhuo' in _res:
        _res['fuhuo'] = {'hppro':_res['fuhuo'],'fhnum':1,'act':'chunjun'}
        
    return _res



#获取剑魂升级到顶级的总经验
def getAllMaxExp():
    return 102917


#获取吞噬花费金币的配置
def getTsJinBiCon():
    return g.GC['jianhun']['qhneedbycolor']


#获取达到等阶要求的神兵
def getSBNumByDj(uid,chkdj):
    _num = g.mdb.count('shenbing',{'uid':uid,'dengjie':{'$gte':chkdj}})
    return _num

# 根据条件获得剑魂的数量
def getJianhunNumByCond(uid, taskcon, jianhunlist):
    _cond = taskcon['cond'][0]
    _val = taskcon['cond'][1][0]
    jianhunList = jianhunlist or getJianHunList(uid)
    _num = 0
    for jianhun in jianhunList:
        # 如果是判断某个类型的剑魂
        if isinstance(_cond, int):
            if jianhun['pos']!=_cond: continue
            _key = taskcon['cond'][1][0]
            _val = taskcon['cond'][1][1]
            if jianhun[_key] >= _val:
                _num += 1

        # 如果是某个品质的剑魂
        if isinstance(_cond, basestring):
            if jianhun[_cond] == _val:
                _num += 1

    return _num

# 根据条件获取名将数量
def getMingjiangNumByCond(uid, taskcon, data):
    _chkval = taskcon['cond'][1][0]
    _num = g.mdb.count('hero', {'uid': uid, 'ismingjiang': 1, 'mjlv': {'$gte': _chkval}})
    return _num

# 获取对应名将等级的名将数量
def getMingJiangNumByLv(uid,chklv):
    _num = g.mdb.count('hero', {'uid': uid, 'ismingjiang': 1, 'mjlv': {'$gte': chklv}})
    return _num

# 跟均条件获取神兵数量
def getShenbingNumByCond(uid, taskcon, data):
    _shenbinglist = data or getShenBingList(uid)
    _num = 0
    _chkval = taskcon['cond'][1][0]
    for shenbing in _shenbinglist:
        if shenbing['dengjie'] >= _chkval:
            _num += 1

    return _num

if __name__=="__main__":
    uid = g.buid('kill3')
    g.m.herofun.reSetHeroBuff(uid,'1058')
    print getTsJinBiCon()
    for i in xrange(21):
        _jhData = {'color':1,'basebuff':{'defpro':5}}
        _jhData['lv'] = i
        print i,reSetJianHunBuff(_jhData)
        
    uid = g.buid("lfh5")
    print getShenbingNumByCond(uid,{'cond':[1,[1]]},'')