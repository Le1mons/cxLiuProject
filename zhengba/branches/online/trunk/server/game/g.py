#!/usr/bin/python
#coding:utf-8
import sys,os
if not 'x' in sys.modules:
    import x
else:
    x = sys.modules['x']
'''
本文件主要储存公用模块入口和方法
注：切勿在本命名空间下存储逻辑数据，在reload时会丢失

g.m
g.GC
g.event
g.Dict()

'''
#获取ROOT路径
ROOTPATH = os.getcwd().split('game')[0]
if ROOTPATH[-1] != '/' and ROOTPATH[-2:] != '\\':
    ROOTPATH += '/'

#设置syspath
PACHLIST = [
    '..',
    ROOTPATH,
    ROOTPATH+'lib',
    ROOTPATH+'game',
    ROOTPATH+'game/api',
    ROOTPATH+'game/dbfun',
    ROOTPATH+'game/fight',
    ROOTPATH+'game/huodong',
    ROOTPATH+'game/baseclass'
]
sys.path.extend(PACHLIST)

import tw,timer,socketpack,time
import lib.myjson as minjson

'''
模拟实现常量功能
'''
class Const: 
    class ConstError(TypeError):pass 
    def __setattr__(self, name, value): 
        if self.__dict__.has_key(name): 
            raise self.ConstError, "Can't rebind const (%s)" %name 
        self.__dict__[name]=value 


class TimeOut:
    def __init__(self):
        self._clock = 0
        self._fIndex = 1
        self._lastRun = time.time()
        self._calls = {}
        self._step()
        
    def _step(self):
        self._clock += 1
        self._lastRun = time.time()
        
        self.__t = tw.reactor.callLater(1,self._step)
        try:
            if self._clock in self._calls:
                calls = self._calls[self._clock]
                for findex,c in calls.items():
                    try:
                        c[0]( *c[1], **c[2] )
                    except Exception,e:
                        print "timeOut error! ", repr(e)
                        
                del self._calls[self._clock]
        except:
            pass
    
    def recheck(self):
        
        if time.time() - self._lastRun > 3:
            try:
                self.__t.cancel()
            except:
                pass
            
            self._step()
    
    #delaySecond = 延迟的秒数，int
    def set(self,fun,delaySecond,*a,**k):
        _k = self._clock + delaySecond
        
        if _k not in self._calls:
            self._calls[_k] = {}
        self._fIndex+=1
        self._calls[_k][ self._fIndex ] = (fun,a,k)
        
        #print 'set',self._calls
        
        return (_k,self._fIndex)
    
    def clear(self,flag):
        k1,k2 = flag
        if k1 in self._calls and k2 in self._calls[k1]:
            del self._calls[k1][k2]
    
#调试时的conn对象
class DebugConn:
    def __init__(self,uid=''):
        self.uid = uid
        import sess
        self.sess = sess.Session("debugconn")
        self.sendData = []

    def response (self,msg,api=""):
        d = socketpack.s2c(msg,api)
        self.sendData.append(d)
    
    
    def send(self,*a,**k):
        print 'send',self.sendData

debugConn = DebugConn()

'''refresh value recover by time

params:
    uid                 : uid
    cdtime              : cooldown time
    lessNum             : lessNum
    maxNum              : maxNum
    lasttime            : last recover time
    addRecoverValCall   : function to add recover val
    setLastTimeCall     : functino to set last recover time
    addnumpertime       : recover val every time, default 1
'''
def refValRecoverByTime(
    uid,
    lessNum,
    maxNum,
    lasttime,
    cdtime,
    addRecoverValCall,
    setLastTimeCall,
    addnumpertime=1
    ):
    canAddNum = maxNum - lessNum
    if canAddNum < 1: return lessNum

    _nt = C.NOW()
    # 可以刷新次数，却没有刷新时，立即开始及时
    if canAddNum and not lasttime:
        setLastTimeCall(uid, _nt)
        return lessNum
    
    difftime = _nt - lasttime
    if difftime < cdtime: return lessNum
    times, _ = divmod(difftime, cdtime)
    addNum = times * addnumpertime
    if addNum > canAddNum: addNum = canAddNum

    addRecoverValCall(uid, addNum)
    if addNum < canAddNum:
        setLastTimeCall(uid, lasttime + times * cdtime)

    else:
        setLastTimeCall(uid, 0)

    lessNum += addNum
    return lessNum


def json(res):
    return minjson.write(res)

def _custombasename(fullname):
    return os.path.basename(os.path.splitext(fullname)[0])

#api逻辑中判断是否登陆的装饰器
def apiCheckLogin(func):
    def _deco(*args, **kwargs):
        try:
            if os.path.exists(ROOTPATH+'banapi.txt'):
                _frame = sys._getframe(1)
                _code = _frame.f_code
                _api = _custombasename(_code.co_filename)            
                _banapi = []
        
                with open(ROOTPATH+'banapi.txt', 'r') as f:
                    _banapi = ((f.read()).strip()).split(",")
                #print '_banapi',_banapi
                #print '_api',_api
                if len(_banapi)>0 and (_api+".py") in _banapi:
                    return {"s":-9999,"errmsg":"该功能临时关闭中 请稍候"}             
        except:
            pass        

        _conn = args[0]
        if not hasattr(_conn,"uid") or _conn.uid=="":
            return {"s":-102,"errmsg":L('global_unlogin')}
        
        ret = func(*args, **kwargs)
        return ret
    return _deco  

#仅在第一个进程运行的装饰器
def runAtFirstGame(func):
    def _deco(*args, **kwargs):
        global portIndex
        if portIndex!=0:return
        
        ret = func(*args, **kwargs)
        return ret  
    return _deco  

def fmtApiNameByFile(filename):
    f = os.path.basename(filename)
    f = f.replace('api_','')
    tmp = os.path.splitext(f)
    return tmp[0]

def buid(binduid):
    uid = ''
    _r = mdb.find1("userinfo",{"binduid":binduid}, fields=['uid'])
    if _r:
        uid = _r['uid']
    return uid

def uid(uid):
    _binduid = ''
    _r = mdb.find1('userinfo', {'uid': uid}, fields=['binduid'])
    if _r:
        _binduid = _r['binduid']

    return _binduid


'''
    覆盖time模块的time方法，以便内网测试时可以可以随意修改时间
'''

def override_time():
    if os.path.isdir('/home/www/default/changetime') and not hasattr(time, '__legutimeoverride'):
        raw_time = time.time
        def new_time():
            def get_offset_value():
                val = 0
                try:
                    txt_path = '/home/www/default/changetime/{0}.txt'.format('_'.join(ROOTPATH.split('/')))
                    with open(txt_path) as f:
                        val = int(f.read())

                except:
                    pass

                return val

            now = raw_time()
            offset = get_offset_value()
            now += offset
            return now

        time.time = new_time
        # 避免重复加上偏移量
        time.__legutimeoverride = True

override_time()


def local_override_time():
    """
    在 server/time.txt 中设置时间偏差 可以不用修改系统时间

    :return:
    """
    txt_path = ROOTPATH + 'time.txt'
    if os.path.exists(txt_path) and not hasattr(time, '__legutimeoverride'):
        raw_time = time.time
        def new_time():
            def get_offset_value():
                val = 0
                try:
                    # txt_path = ROOTPATH + 'time.txt'
                    # txt_path = '/home/www/default/changetime/{0}.txt'.format('_'.join(ROOTPATH.split('/')))
                    with open(txt_path) as f:
                        val = int(f.read())

                except:
                    pass

                return val

            now = raw_time()
            offset = get_offset_value()
            now += offset
            return now

        time.time = new_time
        # 避免重复加上偏移量
        time.__legutimeoverride = True

local_override_time()


'''
模块管理
其他模块直接 g.m.xxx 即可自动引入模块
'''
class ModuleManage:
    def preload (self):
        if hasattr(x,'ModuleManageInit'):
            return
        x.ModuleManageInit = True
        for f in os.listdir(ROOTPATH+'game/'):
            if f.find('fun')!=-1 and f.endswith(".py") and not f.startswith("."):
                self.load(f.replace('.py',''))
    
    def reload (self):
        for m in x._MODULEDICT_:
            reload(x._MODULEDICT_[m])
        
    def load (self,name):
        if not name in x._MODULEDICT_:
            #try:
            x._MODULEDICT_[name] = __import__(name)
            '''except Exception as e:
                print e
                print 'import',name,'error'
                '''
        return x._MODULEDICT_[name]

    def __getitem__(self, name):
        return self.load(name)
    
    __getattr__ = __getitem__

'''
公共字典
x = g.Dict()
x.y=1
print x.z = None
'''
class Dict(dict):
    def __getattr__(self, name):
        if name in self:
            value = dict.__getitem__(self, name)
            if isinstance(value, dict) and not isinstance(value, Dict):
                value = Dict(value)
            return value
        else:
            return None

    def __setattr__(self, name, value):
        self[name] = value
    
    def __delattr__(self, name):
        if name in self:
            del self[name]
    
    def __getstate__(self):
        return self
    
    def __setstate__(self,state):
        self = state
    
    def __deepcopy__(self, memo):
        return Dict(dict(self))
'''
配置管理

读配置
title = GC.story.chapter['1'].title
print title
title = "modify"
print title
print GC.story.chapter['1'].title
'''
#格式字典配置
#支持 a.b 属性读写模式
class fmtConfigDict(dict):
    def __getitem__(self, name):
        #print 'fmtConfigDict name',name
        value = dict.__getitem__(self, name)
        if isinstance(value, dict) and not isinstance(value, fmtConfigDict):
            value = fmtConfigDict(value)
        if isinstance(value, tuple):
            value = fmtConfigTuple(value)
        return value

    __getattr__ = __getitem__
    def __setattr__(self, name, value):
        raise TypeError('donot set config='+name)
    def __delattr__(self, name):
        raise TypeError('donot del config='+name)
    
    def __getstate__(self):
        return self

    def __setstate__(self,state):
        self = state
    
    def __deepcopy__(self, memo):
        return fmtConfigDict(dict(self))
        
        
class TupleIter:
    def __init__ (self,v):
        self.v = v
        self.i = 0

    def __iter__(self):
        return self

    def next (self):
        if self.i == len(self.v):
            self.i = 0
            raise StopIteration
        self.i += 1
        return self.v[self.i - 1]

class fmtConfigTuple(tuple):
    def __getitem__(self, name):
        value = tuple.__getitem__(self, name)
        if isinstance(value, dict) and not isinstance(value, fmtConfigDict):
            value = fmtConfigDict(value)
        if isinstance(value, tuple):
            value = fmtConfigTuple(value)
        return value

    def __iter__ (self):
        return TupleIter(self)

    __getattr__ = __getitem__
    def __setattr__(self, name, value):
        raise TypeError('donot set config='+name)
    def __delattr__(self, name):
        raise TypeError('donot del config='+name)
    
    def __getstate__(self):
        return self

    def __setstate__(self,state):
        self = state
        
    def __deepcopy__(self, memo):
        return fmtConfigTuple(tuple(self))

#将嵌套的LIST转换为tuple
class List2tuple:
    def __init__ (self):
        self.keyDict=[]

    def _do (self,d,parent=[],deep=1):
        #记录所有需要转换为tuple的list的key
        import copy
        if isinstance(d, dict) or isinstance(d, list):
            if isinstance(d, dict):
                each = d.items()
            elif isinstance(d, list):
                each = enumerate(d)

            for k,v in each:
                if isinstance(v, dict) or isinstance(v, list) or isinstance(v, tuple):
                    _parent = copy.copy(parent)
                    _parent.append(k)

                    if isinstance(v, list):
                        self.keyDict.append(copy.copy(_parent))
                    self._do(v,_parent,deep+1)
        
    def do (self,d):
        self._data = d;
        self._do(self._data)
        while len(self.keyDict)>0:
            keys = self.keyDict.pop()
            py = "self._data"
            for _key in keys:
                if type(_key)==type(u''):
                    py += "[u'"+ _key +"']"

                if type(_key)==type(''):
                    py += "['"+ _key +"']"

                if type(_key)==type(1):
                    py += "["+ str(_key) +"]"
            exec  ((py+" = tuple("+ py +")"))
        return self._data

#自动载入配置并缓存
class GameConfig:
    def __init__ (self):
        self._cache = {}
    
    def _fixJsonName (self,name):
        if not name.endswith('.json'):
            name = name + '.json'
        return name
        
    def readFile (self,fileName):
        #读文件
        import os
        Root=os.getcwd().split('game')[0]
        if Root[-1] != '/' and Root[-2:] != '\\':
            Root += '/'
        
        _nPath = "json/"
        if os.path.exists(Root + 'samejson/'+fileName):
            _nPath = "samejson/"
            
        #不try直接抛出错误
        f = open(Root + _nPath + fileName, 'r')
        outStr=f.read()
        f.close()
        
        return outStr
    
    def reload (self):
        import os
        Root=os.getcwd().split('game')[0]
        if Root[-1] != '/' and Root[-2:] != '\\':
            Root += '/'        

        for f,v in self._cache.items():
            if os.path.exists(Root + 'samejson/'+ f) or os.path.exists(Root + 'json/'+ f):
                print 'delete json cache',f
                del self._cache[f]

    def readJson (self,fileName):
        #读JSON
        import json
        txt = self.readFile(fileName)
        #不try直接抛出错误
        _json = json.loads(txt)
        return _json
    
    #从数据库拉取配置
    def getDBConfig(self,fileName,callback=None):
        #读配置并格式化
        fileName = self._fixJsonName(fileName)
        if not fileName in self._cache:
            _json = m.gameconfigfun.getOneGameCon({"ctype":"CONFIG","k":fileName},keys='_id,v')
            if _json != None:
                _json = _json["v"]
                if isinstance(_json,basestring):_json = m.minjson.read(_json)
            
            if _json==None:_json = self.readJson(fileName)
            list2tuple = List2tuple()
            _data = list2tuple.do(_json)
            self._cache[fileName] = _data
        
        if callback!=None:callback()
        if isinstance(self._cache[fileName], dict):
            return (fmtConfigDict(self._cache[fileName]))
        else:
            return (fmtConfigTuple(self._cache[fileName]))
                
    def getConfig (self,fileName):
        #读配置并格式化
        fileName = self._fixJsonName(fileName)
        if not fileName in self._cache:
            _json = self.readJson(fileName)
            list2tuple = List2tuple()
            _data = list2tuple.do(_json)
            self._cache[fileName] = _data
        
        if isinstance(self._cache[fileName], dict):
            return fmtConfigDict(self._cache[fileName])
        else:
            return fmtConfigTuple(self._cache[fileName])
        
    def __getitem__(self, fileName):
        return self.getConfig(fileName)
    
    __getattr__ = __getitem__
    
    
#获取玩家gud
def getGud(uid):
    uid = str(uid)
    _data = m.gud.get(uid)

    if _data != None:
        if not 'iscache' in _data:
            if "svrindex" not in _data:
                _data['svrindex']=int(uid.split('_')[0])
                #_rs['opentime']=getGameOpenTime()
                
            _data['iscache'] = 1
            gud.setGud(uid,_data)
        
        _nt = C.NOW()

    return _data


#获取表架构
def getTableDemo(tbname):
    _tbCon = GC.table
    if not tbname in _tbCon:
        return
    return Dict(_tbCon[tbname])

#语言包
def L(key,*args):
    _con = GC.skin
    if not key in _con:
        # print "key %s not in skin.json" % key
        return key
        
    returnStr=_con[key]
    if len(args)>0:
        return C.formatString(returnStr,*args)
    return returnStr

#格式化奖励格式
#返回格式为:{"attr":{xxx},"item":[]}
def fmtPrizeRes(data):
    #attr : ['huangjin','rmbmoney','yinbi','liangcao','jingtie','gongxian','payexp','yueli']
    #格式示例: {'a':'attr','t':'rmbmoney','n':1111}
    _res =  {}
    _chkKeys = {"attr":{},"item":{},"hero":{},'equip':{},'shipin':{},'glyph':{}}
    for ele in data:
        _key = ele["t"]
        _val = int(ele["n"])
        if ele["a"] in _chkKeys:
            _vk = ele["a"]
            if _key not in _chkKeys[_vk]:
                _chkKeys[_vk][_key] = _val
            else:
                _chkKeys[_vk][_key]+= _val
    
    _res["attr"] = _chkKeys["attr"]
    _res["item"] = [{"t":v1,"n":v2} for v1,v2 in _chkKeys["item"].items()]
    _res["hero"] = _chkKeys["hero"]
    _res['equip'] = _chkKeys["equip"]
    _res['glyph'] = _chkKeys["glyph"]
    _res['shipin'] = [{"t":v1,"n":v2} for v1,v2 in _chkKeys["shipin"].items()]
    return _res

#合并奖励格式
def mergePrize(data,uid=None):
    _prizeRes = fmtPrizeRes(data)
    _data = []
    for k,v in _prizeRes.items():
        if isinstance(v,(list,tuple)):
            for tn in v:
                _data.append({"a":k,"t":tn["t"],"n":tn["n"]})
        else:
            for k1,v1 in v.items():
                _data.append({"a":k,"t":k1,"n":v1})
    
    return _data

# 统一的atn格式奖励，区分个人，势力，其他的奖励
def classifyPrize(prize):
    personalPrize = []
    shiliPrize = []
    for ele in prize:
        if ele['a'] == 'shili':
            shiliPrize.append(ele)
        else:
            personalPrize.append(ele)

    val = {
        'person': personalPrize,
        'shili': shiliPrize
    }
    return val

#格式化奖励数组
def fmtPrizeList(data):
    _res = []
    _mergArr = {}
    for t in data:
        _a = t['a']; _t = t['t']; _n = t['n']
        if not _a in _mergArr:_mergArr[_a] = {}
        if not _t in _mergArr[_a]:_mergArr[_a][_t] = 0
        _mergArr[_a][_t] += _n
        
    for a,t in _mergArr.items():
        for k,n in t.items():
            _res.append({'a':a,'t':k,'n':n})
        
    return _res

#获取奖励
#失败返回False
def getPrizeRes(uid,data,act=''):
    _prizeRes = fmtPrizeRes(data)
    #attr : ['huangjin','rmbmoney','yinbi','liangcao','jingtie','gongxian','payexp','yueli']
    #检测属性是否可修改
    _res = {}
    _res["attr"] = {}
    _res["attr"].update(_prizeRes["attr"])
    _res["item"] = {}
    _res["hero"] = {}
    _res["equip"] = {}
    _res["shipin"] = {}
    _res["glyph"] = {}

    
    for k,v in _prizeRes["attr"].items():
        #属性值不可为负数
        if v < 0:
            return False
    
    for k,v in _prizeRes["attr"].items():
        if k =="exp":
            _r = m.userfun.altExp(uid,v)
            _tmpRinfo = {}
            _tmpRinfo.update(_r)
            if "addnexp" in _r:
                del _r["addnexp"]
                
            _prizeRes["attr"].update(_r)
            _res["attr"].update(_tmpRinfo)

    
    if len(_prizeRes["attr"])>0:
        _updateRes = m.userfun.updateUserInfo(uid,_prizeRes["attr"], act)

    #增加物品
    itemCon = m.itemfun.getItemCon()
    for ele in _prizeRes["item"]:
        itemid = str(ele['t'])
        _num = int(ele['n'])
        tCon = itemCon[itemid]
        isMulti = tCon['ismutil']
        itemdata = ele['data'] if 'data' in ele else ''
        _r = m.itemfun.addItem(uid, itemid, _num,itemdata)
        if isMulti:
            _res["item"].update(_r)
            # _r = m.itemfun.addItem(uid, itemid, _num,itemdata)

        else:
            for tid in _r:
                tid = str(tid)
                _res['item'][tid] = 1

    #增加英雄
    _maxZhanli = 0
    #添加的hid列表，用于头像激活
    _hidList = []
    _heroCon = GC['pre_hero']
    for hid,num in _prizeRes["hero"].items():
        if hid not in _hidList:_hidList.append(str(hid))
        for i in xrange(num):
            _r = m.herofun.addHero(uid,hid)
            m.userfun.setMaxZhanli(uid, _r['maxzhanli'])
            if _r['maxzhanli'] != 0:
                _maxZhanli = _r['maxzhanli']
            _res["hero"][_r['tid']] = _r["herodata"]
        # 开服狂欢获得N星英雄
        event.emit('kfkh', uid, 20, 5, cond=_heroCon[hid]['star'],val=num)

    if len(_hidList) > 0:
        event.emit("adduserhead",uid,_hidList)
    
    if _maxZhanli != 0:
        #设置历史最大战力
        m.userfun.setMaxZhanli(uid,_maxZhanli)

    # 增加饰品
    for ele in _prizeRes['shipin']:
        _r = m.shipinfun.changeShipinNum(uid, ele["t"], ele["n"])
        _res["shipin"].update(_r)

    #增加装备
    for k,v in _prizeRes["equip"].items():
        for ele in xrange(v):
            _jhRes = m.equipfun.addEquip(uid,k)
            _res["equip"].update(_jhRes)
        # 监听获取装备事件
        event.emit('GetEquip', uid, k)

    # 增加雕纹
    #增加装备
    for k,v in _prizeRes["glyph"].items():
        _jhRes = m.glyphfun.addglyph(uid,k,num=v)
        _res["glyph"].update(_jhRes)

    #添加日志记录
    if len(act)>0:
        logdata = {}
        logdata['prize']=data
        if type(act)==dict:
            logdata.update(act)
            _act = logdata["act"]
            del logdata["act"]
            _logres = m.dball.writeLog(uid,_act,logdata)
        else:
            _logres = m.dball.writeLog(uid,act,logdata)
    
    return _res

#格式化发送奖励信息
def fmtSendPrizeData(uid,pdata):
    _tmpData = {}
    #获取attr改变
    if "attr" in pdata and len(pdata["attr"])>0:
        gud = getGud(uid)
        _tmpData["attr"] = {}
        for k in pdata["attr"]:
            if k in ["addnexp"]:
                _tmpData["attr"].update({k:pdata["attr"][k]})
                continue
            
            if k == 'name':
                _tmpData["attr"][k] = pdata["attr"][k]
                continue
            
            if k!='noshow':
                # 排除掉临时属性
                if k not in gud: continue

                _tmpData["attr"].update({k:gud[k]})
            else:
                _tmpData["attr"][k] = pdata["attr"][k]
                
    #获取item改变
    if "item" in pdata and len(pdata["item"])>0:
        itemCon = m.itemfun.getItemCon()
        itemidList = []
        TidList = []
        itemMap = {}
        for k,v in pdata['item'].items():
            if k in itemCon:
                itemidList.append(k)
            else:
                TidList.append(k)

        # 处理只需要数量的物品
        if itemidList:
            _w = {'itemid':{'$in':itemidList}}
            _itemList = m.itemfun.getItemList(uid, where=_w)
            for ele in _itemList:
                _tid = str(ele['_id'])
                del ele['_id']
                itemMap[_tid] = ele

            # 扣光了为0
            # for ele in itemidList:
            #     if ele not in itemMap:
            #         itemMap[ele]['num'] = 0

        # 处理tid数量的物品
        if TidList:
            oidList = [mdb.toObjectId(x) for x in TidList]
            _w = {'_id':{'$in': oidList}}
            _itemList = m.itemfun.getItemList(uid, keys='itemid,num,passtime,paymoney,lasttime,usetype,etime', where=_w)
            for ele in _itemList:
                tid = str(ele['_id'])
                del ele['_id']
                itemMap[tid] = ele
                itemMap[tid].update({'tid': tid})

            for ele in TidList:
                if ele not in itemMap: 
                    itemMap[ele] = pdata['item'][ele]

        '''
        _tmpData["item"] = {}
        _tmpItemList = pdata["item"].keys()
        _w = {"itemid":{"$in":_tmpItemList}}
        _itemList = m.itemfun.getItemList(uid,keys='itemid,num,passtime,paymoney',where=_w)
        _itemMap = {}
        #转换为k/v
        itemCon = m.itemfun.getItemCon()
        itemidList = []
        for ele in _itemList:
            _itemid = str(ele['itemid'])
            itemidList.append(_itemid)
            tCon = itemCon[_itemid]
            if 'isnum' in tCon and tCon['isnum'] == 0:
                _tid = str(ele['_id'])
                del ele['_id']
                _itemMap[_tid] = ele

            else:
                _itemMap[str(ele["itemid"])] = int(ele["num"])


        for ele in _tmpItemList:
            #扣完了则数量为0
            if ele in itemCon:
                if ele not in itemidList:
                    _itemMap[ele] = 0
            else:
                _itemMap[ele] = pdata['item'][ele]
        '''

        _tmpData['item'] = itemMap

    if "hero" in pdata and len(pdata["hero"])>0:
        _tmpData["hero"] = pdata["hero"]

    if "shipin" in pdata and len(pdata["shipin"])>0:
        _tids = pdata["shipin"].keys()
        _tidList = map(mdb.toObjectId, _tids)
        _shipinList = m.shipinfun.getShipinList(uid,where={'_id':{'$in':_tidList}})
        # except:
        #     _shipinList = m.shipinfun.getShipinList(uid, where={'spid': {'$in': _tids}})
        _tmpData["shipin"] = {}
        if not _shipinList:
            for i in _tids:
                _tmpData['shipin'][i] = {'num': 0}
        else:
            _spTids = []
            for i in _shipinList:
                _tid = str(i['_id'])
                i['tid'] = _tid
                _tmpData["shipin"].update({_tid: i})
                _spTids.append(str(i['_id']))
                del i['_id']

            if len(_shipinList) != len(_tids):
                # 如果有数据不存在   取差集
                _noTids = set(_spTids) ^ set(_tids)
                for i in _noTids:
                    _tmpData['shipin'][i] = {'num': 0}
            
    # 装备
    if 'equip' in pdata and len(pdata['equip']) > 0:
        _tmpData["equip"] = {}
        _tmpData["equip"].update(pdata["equip"])

    # 雕纹
    if 'glyph' in pdata and len(pdata['glyph']) > 0:
        _tmpData["glyph"] = {}
        _tmpData["glyph"].update(pdata["glyph"])

    return _tmpData

#合并变化消息
def mergeChangeInfo(rdata,pdata):
    for k,v in pdata.items():
        for k1,v1 in v.items():
            if k not in rdata:
                rdata[k] = {}

            if k1 not in rdata[k]:
                rdata[k][k1] = 0

            rdata[k][k1] += v1

    return rdata

#获取城池的信息
def getCityData(cids=None):
    _where = {}
    if cids != None: _where['cityid'] = {'$in':cids}
    _cdata = mdb.find('fightcity',_where)
    if len(_cdata) == 0 and cids != None and len(cids) == 1:
        _city = m.fightteamfun.getDefCityInfo(str(cids[0]))
        _cdata = [_city]
        
    _res = fmtCityData(_cdata)
    return _res

#获取npc等级
def getNpcLv(cid):
    _wlv = getWorldLv()
    #1都城,2郡城,3县城,4关城
    _npclvCon = GC['cityfightnpclv']
    _chkCon = _npclvCon['baselv']
    _openDay = getOpenAreaDay()
    _openDay = str(_openDay)
    if _openDay in _npclvCon['openday']:
        #有特殊配置天数则替换掉默认的数据
        _chkCon = _npclvCon['openday'][_openDay]
    
    _con = m.mapfun.getCityConByIdx(cid)
    _ctype = str(_con['t'])
    _lv = _wlv + _chkCon[_ctype]
    if _lv < 20: _lv = 20
    return _lv

#格式化城市信息
def fmtCityData(cdata):
    _res = {}
    for ct in cdata:
        _cid = str(ct['cityid'])
        _tmp = {}
        _tmp['cid'] = _cid
        #城池状态，0空闲中，1被宣战，2开战中
        _tmp['status'] = int(ct['status'])
        #城防兵等级
        _tmp['npclv'] = getNpcLv(_cid)
        #每小时增加的npc
        _tmp['hournpc'] = 2
        #当前城池npc数量
        _tmp['npcnum'] = int(ct['npcnum'])
        #npc数量上限
        _tmp['maxnpc'] = int(ct['maxnpc'])
        #宣战时间，宣战后可开站的时间戳
        _tmp['xztime'] = int(ct['xztime'])
        #战斗冷却时间,未来时间戳
        _tmp['lasttime'] = int(ct['lasttime'])
        #城战开始了少秒
        _tmp['runtime'] = int(ct['runtime'])
        #宣战势力id
        _tmp['xzslid'] = ct['xzslid']
        #宣战势力名称
        _tmp['xzslname'] = ct['xzslname']
        #宣战势力旗帜
        _tmp['xzslflag'] = ct['xzslflag']
        if 'fightid' in ct: _tmp['fightid'] = ct['fightid']
        _res[_cid] = _tmp
        _tmp['slid'] = str(ct['slid'])
        if ct['slid'] != '':
            _slData = m.shilifun.getShiliInfoBySid(ct['slid'],'flag,name,mzname')
            if _slData != None:
                #势力旗帜
                _tmp['flag'] = _slData['flag']
                #势力名称
                _tmp['name'] = _slData['name']
                #盟主名称
                _tmp['mzname'] = _slData['mzname']

    #返回city信息
    return _res


#通知客户端某些东西改变(item,attr,army)
def sendChangeInfo(conn,pdata,api=None):
    '''
    #获取堆栈信息，自动分析出是哪个API文件调用了本方法，暂不启用该功能
    print "----------------xxxxxxxxxxxxxxx----------------"
    import inspect
    v = inspect.stack()    
    for xx in v:
        print 'sendChangeInfo',xx    
    print "***********xxxxxxxxxxxxxxx*******************"
    '''
    _maps = {
        "attr":"attrchange",
        "item":"itemchange",
        "hero":"herochange",
        'equip':'equipchange',
        "shipin": "shipinchange",
        "glyph": "glyphchange"
    }
    _tmpData = fmtSendPrizeData(conn.uid,pdata)
    for ele,v in _maps.items():
        if ele in _tmpData and len(_tmpData[ele])>0:
            if api!=None and v=='attrchange':
                _tmpData[ele]['api'] = api
                
            conn.response(_tmpData[ele],v)


#通知客户端指定uid某些东西改变(item,attr,army)
def sendUidChangeInfo(uids,pdata,api=None):
    _maps = {
        "attr":"attrchange",
        "item":"itemchange",
        "hero":"herochange",
        "equip":"equipchange",
        'shipin':'shipinchange',
        'glyph':'glyphchange'
    }
    _tmpData = fmtSendPrizeData(uids,pdata)
    for ele,v in _maps.items():
        if ele in _tmpData and len(_tmpData[ele])>0:
            if api!=None and v=='attrchange':
                _tmpData[ele]['api'] = api

            m.mymq.sendAPI(uids,v,_tmpData[ele])
            
# 发送战役变化
def sendZhanyiChange(conn, cdata):
    conn.response(cdata,'zhanyichange')

#发送城池
def sendCityChangeToAll(cdata):
    m.mymq.sendAPI('all','citychange',cdata)
    
#通知全服拉取公告
def sendGongGaoChangeToAll(cdata):
    m.mymq.sendAPI('all','gonggaonew',cdata)
    
#推送粮草的改变
#data:[{a,t,n}]
def sendPrizeDataShow(uid,data):
    m.mymq.sendAPI(uid,'prizeshow',data)
    
#推送提示字信息
def sendMsgShow(uid,data):
    m.mymq.sendAPI(uid,'messageshow',data)
    
#推送红包信息
def sendHongBaoShow(data):
    m.mymq.sendAPI('all','hongbaochange',data)
    
#推送英雄商店信息
def sendHeroShopShow(uid,data):
    m.mymq.sendAPI(uid,'heroshopchange',data)

    
#全服发送
def sendTOAll(ctype,data):
    m.mymq.sendAPI('all',ctype,data)

#推送队伍改变信息
#isadd:是添加还是替换
def sendFightTeamHerosToUid(uid,num,isadd=0):
    _data = {'num':num,'isadd':isadd}
    m.mymq.sendAPI(uid,'fightteamchange',_data)

#设置http短链sid
def creatHttpSid(uid):
    _sid = C.formatString('{1}_{2}',C.getUniqCode(),uid)
    return _sid

#获取SvrIndex
def getSvrIndex():
    return conf["SVRINDEX"]

# 获取所有区服sid列表
def getSvrList():
    return conf['ALLSVRINDEX']

#检测非法字符
def checkWord(txt,reptxt=''):
    _res = reg.search(txt)
    if _res!=None:
        return False
    
    return True

#检查一段话是否全部为中文
def checkChinese(txt):
    _retVal = True
    for e in txt:
        if C.is_chinese(e)==False:
            _retVal = False
            break
    
    return _retVal


#获取playAttr属性
def getAttr(uid,where,keys='',isnone=1,**kwargs):
    _w = where
    _w.update({"uid":uid})
    if keys!='':
        kwargs["fields"] = keys.split(",")
    _res = mdb.find("playattr",_w,**kwargs)
    if len(_res)==0 and isnone==1:
        return None

    return _res


#获取一条playAttr属性
def getAttrOne(uid,where,keys='',**kwargs):
    _w = where
    _w.update({"uid":uid})
    if keys!='':
        kwargs["fields"] = keys.split(",")
    _res = mdb.find("playattr",_w,**kwargs)
    if len(_res)==0:
        return None

    return _res[0]

#根据时间过滤取出attr,当日过期
def getAttrByDate(uid,where,time=0,keys='',**kwargs):
    if keys!='':
        kwargs["fields"] = keys.split(",")
        kwargs["fields"] += ["lasttime"]
    
    _r = getAttr(uid, where,**kwargs)
    _res = []
    _nt = C.NOW()
    if _r!=None:
        for ele in _r:
            #范围内的值都取出
            if C.chkSameDate(_nt,int(ele["lasttime"]),time)!=False:
                if keys.find("lasttime")==-1:del ele["lasttime"]
                _res.append(ele)
        
    return (_res)


#根据时间过滤取出attr,lasttime + time 后过期
def getAttrByTime(uid,where,time=0,**kwargs):
    _r = getAttr(uid, where,**kwargs)
    _res = []
    _nt = C.NOW()
    if _r!=None:
        for ele in _r:
            #范围内的值都取出
            if ele["lasttime"] + time >= _nt >= ele["lasttime"]:
                _res.append(ele)
        
    return _res
    
#设置playAttr属性
def setAttr(uid,where,data,istime=1):
    _w = where
    _nt = C.NOW()
    _w.update({"uid":uid})
    _newData = {"$set":{}}
    if istime == 1:
        data["lasttime"] = _nt
        
    data["ctime"] = _nt
    _exists = mdb.find1("playattr",_w)
    if _exists!=None:
        del data["ctime"]
    
    _ispreix = "".join(data.keys()).find("$")
    if _ispreix>=0:
        for k,v in data.items():
            if not str(k).startswith("$"):
                _newData["$set"].update({k:v})
            else:
                _newData.update({k:v})
    else:
        _newData = data
    
    if "$set" in _newData and len(_newData["$set"])==0:
        del _newData["$set"]
        
    _res = mdb.update("playattr",_w,_newData,upsert=True)
    return _res

#格式化设置data
def fmtSetData(data):
    _newData = {"$set":{}}
    _ispreix = "".join(data.keys()).find("$")
    if _ispreix>=0:
        for k,v in data.items():
            if not str(k).startswith("$"):
                _newData["$set"].update({k:v})
            else:
                _newData.update({k:v})
    else:
        _newData = data
    
    if "$set" in _newData and len(_newData["$set"])==0:
        del _newData["$set"]
        
    return _newData

'''获取ctype的属性
params:
    k        可选条件
    default  默认值
    bydate   是否隔天刷新
'''
def getAttrByCtype(uid, ctype, k=None, default=0, bydate=True):
    _where = {'ctype': ctype}
    if k != None:
        _where.update({'k': k})

    _retVal = default
    if bydate:
        _r = getAttrByDate(uid, _where)
    else:
        _r = getAttr(uid, _where)

    if _r:
        _retVal = _r[0]['v']

    return _retVal

'''设置ctype的属性
params:
    k       可选条件
    default 默认值
    bydate  是否隔天过期
    valCall 如何处理数据移植值和新值，默认累加
'''
def setAttrByCtype(uid, ctype, val, k=None, default=0, bydate=True, valCall=None):
    rawval = getAttrByCtype(uid, ctype, k=k, default=default, bydate=bydate)
    newval = rawval

    def _push(vallist, val):
        vallist.append(val)
        return vallist

    def _override(vallist, val):
        return val

    def _update(vallist, val):
        vallist.update(val)
        return vallist

    method_dict = {
        'push': _push,
        'override': _override,
        'update': _update
    }

    if not valCall:
        newval += int(val)
    else:
        if valCall in method_dict:
            newval = method_dict[valCall](rawval, val)

        else:
            newval = valCall(rawval, val)

    _where = {'ctype': ctype}
    if k:
        _where.update({'k': k})

    _r = setAttr(uid, _where, {'v': newval})
    return _r
    
#删除playAttr属性
def delAttr(uid,where):
    _w = {"uid":uid}
    _w.update(where)
    _res = mdb.delete("playattr",_w)
    return (_res)

#获取奖励倍率公共方法
def getPrizeTime(uid,ptype):
    _time = 1
    _r = mdb.find1("playattr",{"ctype":L("prizetime"),"k":str(ptype)})
    if _r!=None:
        _time = int(_r['v'])

    return _time

#格式化城战加入时所需要的战斗数据
def fmtFightCityInfo(uid,heros,side):
    _retVal = []
    for k,v in heros.items():
        v["pid"] = k
        v["side"] = side
        if "hid" not in v:
            v["hid"] = k
        
        _finfo = m.herofun.fmtHeroFightInfo(uid,k)
        _finfo = _finfo.values()[0]
        _finfo.update(v)
        _finfo = fmtFightInfo(_finfo)
        _retVal.append(_finfo)

    return _retVal

#获取战斗上阵约束条件
#cids：约束条件id的集合
def getFightCondData(cids):
    _res = []
    for cid in cids:
        _cid = str(cid)
        if not _cid in GC['fightcond']:
            continue
        _tmp = GC['fightcond'][_cid]
        _tmp['val'] = list(_tmp['val'])
        _res.append(_tmp)
        
    return _res


#获取开区时间戳
def getOpenTime():
    return C.NOW(conf["OPENTIME"])

# 已经开区几天
def getOpenDay():
    _zt = C.NOW(C.DATE(getOpenTime()))
    _nt = C.NOW()
    day, _ = divmod(_nt - _zt, 24 * 3600.0)
    day += 1
    return int(day)

#检查是否已开区多少天,True表示已开day天,False 表示未开day天
def chkOpenDay(day):
    day = int(day)
    _zeroTime = C.NOW(C.getDate(getOpenTime()))
    _zt = C.NOW(C.getDate())
    if _zeroTime + day*24*3600 < _zt:
        return True
    else:
        return False
    
#检查是否已开区多少时间
def chkOpenTime(time):
    _opTime = getOpenTime()
    _nt = C.NOW()
    if _opTime + time < _nt:
        return True
    else:
        return False
    
#格式化战斗信息日志
def fmtFightLog(fres):
    _fightLog = {}
    _fightLog['winside'] = fres.fresults['winside']
    _fightLog['state'] = 'FIGHT'
    _fightLog['fd'] = []
    _fightLog['forder'] = fres.fts
    _fightLog['eorder'] = fres.ets
    _fightLog['title'] = fres.ptype
    _fightLog['flog'] = fres.fresults["flog"]
    return _fightLog

#启动系统定时器
def startRunatTime():
    #添加系统定时器
    if not hasattr(x,'timerInit'):
        _tid = m.timer.runat("00 21 * * *","txbw_loghistory")
        x.timerInit = True

#根据权值随机出一个元素
def randDataByWeight(data):
    _base = data['base']
    _arr = data['list']
    _tmpItem = Dict(C.getRandArr(_arr,_base))
    return _tmpItem

#获取世界等级
def getWorldLv(iscache=1):
    _key = "GLOBAL_WORLDLV"
    _data = mc.get(_key)
    _nt = C.NOW()
    #世界等级缓存
    if _data != None and iscache:
        _cd = _data['cd']
        if _nt < _cd:
            return int(_data['lv'])
        
    #最小世界等级
    _defLv = 20
    _where = {'ctype':'WORLDLV'}
    _data = m.gameconfigfun.getGameConfigByDate(_where)
    if len(_data) != 0:
        return int(_data[0]['v'])
    
    _userNum = 50
    if getOpenAreaDay() <= 6: _userNum = 200
    _ulist = mdb.find('userinfo',fields=['_id','lv'],sort=[['lv',-1]],limit=_userNum)
    if len(_ulist) == 0:
        return _defLv
    
    _num = len(_ulist)
    _allLv  = 0
    for u in _ulist:
        _addLv = 0
        if 'lv' in u: _addLv = int(u['lv'])
        _allLv += _addLv
        
    _avgLv = int(_allLv/_num)
    if _avgLv < _defLv: _avgLv = _defLv
    m.gameconfigfun.setGameConfig(_where,{'v':_avgLv})
    _cd = C.NOW(C.DATE()) + 24*3600
    _saveData = {'lv':_avgLv,'cd':_cd}
    mc.set(_key,_saveData)
    return _avgLv

#获取世界等级相关的加成
def getWorldLvExtPro(uid):
    _openDay = getOpenAreaDay()
    _res = {}
    if _openDay == 0:
        #第一天没有加成
        return _res
    
    gud=  getGud(uid)
    _lv = gud['lv']
    #2017-12-18 增加玩家等级25级后生效加成
    if _lv < 25:
        return _res
    
    _worldLv = getWorldLv()
    _defLv = _worldLv - _lv
    _con = GC['worldlvpro']['base']
    _minLv = _con['lv2pro'][-1]['needlv']
    if _defLv < _minLv:
        return _res
    
    for d in _con['lv2pro']:
        _needLv = d['needlv']
        if _defLv >= _needLv:
            _res = d['prodata']
            break

    return _res
    

#获取playattr相关功能当天的次数
def getPlayAttrDataNum(uid,ctype,w={},ptime=0):
    _where = {}
    _where['ctype'] = ctype
    if len(w) > 0: _where.update(w)
    _res = 0
    _data = getAttrByDate(uid,_where,ptime)
    if len(_data) == 0:
        return _res
    _res = _data[0]['v']
    return _res

#设置playattr相关功能当天的次数
def setPlayAttrDataNum(uid,ctype,num=1,w={},ptime=0):
    _num = getPlayAttrDataNum(uid,ctype,w,ptime)
    _resNum = _num  + num
    _where = {'ctype':ctype}
    if len(w) > 0: _where.update(w)
    setAttr(uid, _where , {"v":_resNum})
    return _resNum

#获取游戏版本
def getGameVer():
    return conf["VER"]

#合并两个结构相同或不同的dict
def mergeDict(dict1,dict2,add=0):
    #不是dict无法合并
    if not isinstance(dict1,dict) or not isinstance(dict2, dict):
        return
    #{"army":{"1":1,"2":2}}
    #{"army":{"3":3,"1":1},"item":{"4":1}}
    for k,v in dict2.items():
        #合并不存在的kv
        if k not in dict1:
            dict1[k] = v
        #合并存在且需要累加的kv
        elif k in dict1 and add == 1:
            dict1[k]+=v
        #存在的kv递归合并
        else:
            mergeDict(dict1[k],v,1)

    return

# warnning about deprecated functions.
def deprecated(func):
    def deco(*args, **kwargs):
        print 'Caution! function {0} is deprecated ...'.format(str(func.__name__))
        return func(*args, **kwargs)

    return deco

#格式化多个发送格式的信息
def fmtSendDataList(data):
    _res = {}
    for d in data:
        for k,v in d.items():
            if k not in _res: _res[k] = {}
            for t,n in v.items():
                if t not in _res[k]: _res[k][t] = 0
                _res[k][t] += n

    return _res

#获取游戏开区时间
def getGameOpenTime():
    #_sysConfig = config.CONFIG
    _sysConfig = conf
    _res = _sysConfig['OPENTIME']
    return _res

#获取开区天数
def getOpenAreaDay():
    _openTime = getGameOpenTime()
    _nDate = C.getDate()
    _openDate = _openTime.split(' ')[0]
    #开区第一天为0
    return C.dataDiff(_openDate,_nDate,'d')

#检查某个功能的开启条件
def chkOpenCond(uid,gongneng):
    _retVal = False
    _con = GC['opencond']['base']
    gongneng = str(gongneng)
    if gongneng not in _con: return False
    gud = getGud(uid)
    #检查开启条件
    _main = True #必要条件，必须达成
    if 'main' in _con[gongneng]:
        for ele in _con[gongneng]['main']:
            # for k,v in ele.items():
            # for idx,ele1 in enumerate(ele):
            k = ele[0]
            v = ele[1]
            #单个条件的判断
            if k in ('lv','opencityid','vip') and gud[k] < int(v):
                _main = False
                break
            elif k == 'lvrange' and (gud['lv']<v[0] or gud['lv'] > v[1]):
                _main = False
                break
            
    _optional = True #可选条件
    if 'optional' in _con[gongneng]:
        for ele in _con[gongneng]['optional']:
            _optional = True  # 可选条件
            k = ele[0]
            v = ele[1]
            # for k,v in ele.items():
                #单个条件的判断
            if k in ('lv','opencityid','vip') and gud[k] < int(v):
                _optional = False
            elif k == 'lvrange' and (gud['lv']<v[0] or gud['lv'] > v[1]):
                _optional = False
                
            if _optional:
                break

    if _main and _optional:
        _retVal = True

    return _retVal

#设置玩家公共buff（不以某个英雄为记录的公共buff）
def setCommonBuff(uid,btype,buff):
    _ctype = 'common'
    _w = {'uid':uid,'ctype':_ctype}
    _key = g.C.STR('buff.{1}',btype)
    mdb.update('buff', _w, {_key:buff}, upsert=True)


#合并buff数组
#bufflist : [ {"atk":200,"def":200},{"hp":800} ]
def mergeBuffList(bufflist):
    _buff = {}
    for d in bufflist:
        for k,v in d.items():
            if k in _buff:
                _buff[k] += v
            else:
                _buff[k] = v
                
    return _buff


#检测删除物品是否足够
def chkDelNeed(uid,data):
    _data = data
    _res = {'res':True}
    for d in _data:
        _delNum = -abs(int(d['n']))
        _a = d['a']
        _t = d['t']
        if _a == 'attr':
            _chk = m.userfun.altNum(uid,{_t:_delNum})
        elif _a == 'equip':
            _chk = [True]
            _equip = m.equipfun.getEquipInfo(uid, _t)
            if _equip == None or (_equip['usenum'] - _delNum) >_equip['num']:
                _chk[0] = False
        elif _a == 'shipin':
            _chk = [True]
            _shipinInfo = m.shipinfun.getShipinInfo(uid, _t)
            if _shipinInfo == None or _shipinInfo['num'] + _delNum < 0:
                _chk[0] = False
        else:
            _item = mdb.find1('itemlist',{'uid':uid,'itemid':str(_t)})
            _chk = [False]
            if _item != None and 'num' in _item and _item['num'] + _delNum >= 0:
                _chk = [True]
        
        if _chk[0] == False:
            _res['res'] = False
            _res['a'] = _a
            _res['t'] = _t
            return _res
        
    return _res

#删除物品-使用前配合chkDelNeed做判断后使用
#issend:扣除物品后是否推送信息
def delNeed(uid,data,issend=1,logdata=None):
    _data = data
    _res = {}
    _send = {}
    for d in _data:
        _delNum = -abs(int(d['n']))
        _a = d['a']
        _t = d['t']
        if _a not in _res:_res[_a] = {};_send[_a] = {}
        if _t not in _res[_a]: _res[_a][_t] = 0;
        _res[_a][_t] += _delNum
        if _a == 'attr':
            #_tmp = m.itemfun.getItemInfo(uid,'',_t)
            #_tid = str(_tmp['itemid'])
            if _t not in _send[_a]: _send[_a][_t] = 0
            _send[_a][_t] += _delNum

    #删除属性
    if 'attr' in  _res:
        m.userfun.updateUserInfo(uid,_res['attr'],logdata)

    #删除物品
    if 'item' in _res:
        for itemid,num in _res['item'].items():
            _itemInfo = m.itemfun.changeItemNum(uid,itemid,num)
            _send['item'].update(_itemInfo)

    # 删除装备
    if 'equip' in _res:
        for eid,num in _res['equip'].items():
            _equipInfo = m.equipfun.changeEquipNum(uid, eid, num)
            _send['equip'].update(_equipInfo)

     # 删除饰品
    if 'shipin' in _res:
        for eid,num in _res['shipin'].items():
            _shipinInfo = m.shipinfun.changeShipinNum(uid, eid, num)
            _send['shipin'].update(_shipinInfo)

    #推送信息
    if issend:
        sendUidChangeInfo(uid,_send)

    # 增加日志
    if logdata:
        m.dball.writeLog(uid, logdata.pop('act'), logdata)
        
    return _send

#获取系统开启等级
def getSysOpenLv(stype):
    _res = 0
    _con = GC['opencond']['base']
    if stype not in _con:
        return _res
    
    _sysCon = _con[stype]
    if 'main' not in _sysCon:
        return _res
    
    for d in _sysCon['main']:
        if d[0] != 'lv':
            continue
        _res = d[1]
        break
    
    return _res

#获取玩家全局的随机code信息，每次接口调用时更新
def getGlobalRandCode(uid):
    _cacheKey_randCode = 'APIRANDCODE'
    return m.sess.get(uid,_cacheKey_randCode)

#格式化区服名
def fmtServername(sname):
    _data = ' '.split(sname)
    return _data[-1]

# class ExceptionHook:
#     instance = None

#     def __call__(self, *args, **kwargs):
#         if self.instance is None:
#             from IPython.core import ultratb
#             self.instance = ultratb.FormattedTB(mode='Plain',
#                  color_scheme='Linux', call_pdb=1)
#         return self.instance(*args, **kwargs)

# sys.excepthook = ExceptionHook()

# 定时器重试，重试不超过100次，防止死循环
def timerretry(func):
    func._retryTimes = 0
    def _deco(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception,e:
            try:
                timerlog.error(str(e))
                print '_retryTimes',func._retryTimes
                print e
                func._retryTimes+=1
                
                if func._retryTimes<100:
                    tw.reactor.callLater(3,_deco,*args, **kwargs)
            except:
                pass
    return _deco

try:
    conf = config
except:
    import config
    conf = config.CONFIG


if not hasattr(x,'gInit'):
    import gud,crossserver,crosschatfun,playattr
    from dbbase import DBFactory
    
    portIndex = None
    
    timeout = TimeOut()

    m = ModuleManage()
    GC = GameConfig()
    event = m.event.EventEmitter()
    mc = m.memcache.memcache.Client(conf['MEMCACHE'],dead_retry=3)
    # mc = m.memcache.Client(conf['MEMCACHE'],dead_retry=3)
    cityfightlog = m.cityfightlog.CITYFIGHTLOG('cityfightlog','cityfightServer',False)
    weblog = m.log.LOG('weblog','webServer',True)
    flog = m.log.LOG('fightlog','fServer',True)
    soclog = m.log.LOG('soclog','socketServer',True)
    timerlog = m.log.LOG('timerlog', 'timerServer', False)
    mdb = m.dbmongo.MongoDB(conf['DBCONFIG'])
    C = m.common.CommonFun()
    BASEDB = DBFactory.creactDB
    #db_plattr = DBFactory.creactDB(mdb,'playattr','playattr')

    
    reg = m.dfa.DFA(GC["other"]["word"].split('|'))
    #reg = m.common.re.compile((GC["other"]["word"]).encode('UTF-8'))
    chatBlackWordReg = m.common.re.compile((GC["other"]["chatBlackWord"]).encode('UTF-8'))
    m.preload()
    #城池id2城战class
    CITY2FIGHT = {}
    #城战中的连接
    CITY2CON = {}
    #讨伐义渠实例和连接
    YQ2FIGHT = {}
    YQ2CONN = {}
    x.gInit = True
    #加载变量
    crossserver.init()

    if hasattr(crosschatfun,'chatRoom'):
        print 'has crosschatfun.chatRoom'
        event.on("resetBindOver",crosschatfun.chatRoom.getQueue)

    import pathDebug

# f通过ctype获取数量
# def getNumByCtype()

if __name__=='__main__':
    #print C.UTCNOW()
    tw.reactor.run()
    #pass


    
