#!/usr/bin/python
#coding:utf-8

#两个库必须在同一服务器上，且使用root权限登陆
#合并前请务必备份好数据库
#===================================================================================================
#主区数据库配置

import os
if os.path.isfile('./hequ.lock'):
    print "hequ locked...."
    exit()


SVR1DB = {
    "host":"{{dbhost}}",
    "port":{{dbport}},
    "poolsize":10,
    "dbname":"{{db1}}",
    "dbuser":"{{dbuser}}",
    "dbpwd":"{{dbpwd}}",
    "authdb":"admin"
}
# SVR1DB = {
#     "host":"10.0.0.7",
#     "port":27017,
#     "poolsize":10,
#     "dbname":"zhengba_s0",
#     "dbuser":"root",
#     "dbpwd":"iamciniao",
#     "authdb":"admin"
# }

#老区开区时间
DB1OPENTIME = "{{opentime1}}"
#新区开区时间
DB2OPENTIME = "{{opentime2}}"
#新区serveridx集合
NEWSEVERIDX = [{{NEWSEVERIDX}}]
OLDSEVERIDX = [{{OLDSEVERIDX}}]

#需要清空的表
clearTable = [
    'apiCount','blacklist','stormlog','gamelog'
]

#清理角色时跳过的表
clearUserBreakTable = ['gameconfig','userinfo','gonghuiattr']
#dropIndex = {"userinfo":['name_1'],'gonghui':['name_1']}
'''reMarkIndex = {
    "userinfo":[{ "keys":(("name",1),),"option":{"unique":True }}],
    "gonghui":[{ "keys":(("name",1),),"option":{"unique":True }}]
}'''

import sys
sys.path.append('game')

import lib.file,time,copy,os,subprocess
import g
import dbmongo
import thread
import pymongo
import configmongodb


logid = "{{logid}}"
def setStatus ():
    import urllib
    import urllib2

    url = "http://gametools.legu.cc/?app=api&act=hequstatus&id={0}".format(logid)
    req = urllib2.Request(url)
    res_data = urllib2.urlopen(req)
    res = res_data.read()
    print "setStatus",res


def w (msg):
    amsg = msg
    try:
        amsg = msg.decode('utf-8').encode('gbk')
    except:
        pass
    return amsg

def line ():
    print '=========================='

baseList = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ']
def changeBase(n,b=len(baseList)):
    x,y = divmod(n,b)
    if x>0:
        return changeBase(x,b) + baseList[y]
    else:             
        return baseList[y]


class HeQu:
    def __init__ (self,db1):
        #数据库对象
        self.mdb1 = dbmongo.MongoDB(db1)
        g.mdb = self.mdb1
        self.client1 = pymongo.MongoClient(host=db1["host"],port=db1["port"])
        self.client1.get_database(db1["authdb"]).authenticate(db1["dbuser"],db1["dbpwd"])
        self.db1Name = db1['dbname']
        #清理死号-未登录时长
        self.ptime = (60*60*24*7)
        line()
        
    #删除索引
    def hq_dropIndex(self):
        db = self.client1.get_database(self.db1Name)
        _collectionList = db.collection_names()
        for c in _collectionList:
            if c.startswith('system.'):
                continue
            _collection = db.get_collection(c)
            _collection.drop_indexes()
            print "drop_index====",c

        '''global dropIndex
        db = self.client1.get_database(self.db1Name)
        for k,v in dropIndex.items():
            #获取集合
            _collection = db.get_collection(k)
            #获取索引集合
            _indexs = _collection.index_information()
            for ele in v:
                if not ele in _indexs:
                    continue
                _res = _collection.drop_index(ele)'''
                
    #还原被删的索引
    def hq_reMarkIndex(self):
        configmongodb.starup()
        '''global reMarkIndex
        db = self.client1.get_database(self.db1Name)
        for k,v in reMarkIndex.items():
            #获取集合
            _collection = db.get_collection(k)
            #获取索引集合
            for ele in v:
                #待创建的索引
                _index = ele["keys"]
                #创建选项
                _options = ele["option"]   
                _res = _collection.create_index(_index,**_options)'''
        

    #需要清理的表数据
    def hq_clearTableData(self):
        global clearTable
        print '开始清理表数据'
        for tb in clearTable:
            print '清理表=====',tb
            self.mdb1.delete(tb)
        print '清理表数据结束'


    #检测玩家角色名重复
    def hq_chkUserName(self):
        global baseList
        rss = self.mdb1.find('userinfo',{},fields={'_id':0,'uid':1,'name':1})
        namedic = {}
        print w("开始检测重复角色名")
        _chkIdArr = baseList

        for u in rss:
            _uname = u['name']
            #先把名字中的替换词去掉，重新排序
            for replaceStr in _chkIdArr:
                _uname = _uname.replace(replaceStr,'')

            if _uname in namedic:
                namedic[ _uname ].append( u['uid'] )
            else:
                namedic[ _uname ] = [u['uid']]

        for name,d in namedic.items():
            if len(d)==1:continue
            _idx = 0
            for _uid in d:
                _tmpName = name + str(changeBase(_idx))
                _idx+=1

                self.mdb1.update('userinfo',{"uid":_uid}, {"$set":{"name": _tmpName}})
                print w(_uid+"改名为："+_tmpName)

    #检查势力名是否重复
    def hq_chkShiLiName(self):
        _groupList = self.mdb1.group('gonghui',where={},groupby='name',act=['count','_id'])
        _chkIdArr = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ','Ⅻ','ⅰ','ⅱ','ⅲ','ⅳ','ⅴ','ⅵ','ⅹ']
        print w("开始检测势力名是否重复")
        for u in _groupList:
            _num = int(u['val'])
            if _num == 1:
                continue
            _uname = u['name']
            _reNameList = self.mdb1.find('gonghui',{'name':_uname},fields={'_id':1,'name':1})
            _idx = 0
            for ele in _reNameList:
                while 1:
                    _tmpName = _uname +_chkIdArr[_idx]
                    _ghinfo = self.mdb1.find1('gonghui',{'name':_tmpName},fields={'_id':1,'name':1})
                    if _ghinfo != None:
                        _idx += 1
                        continue

                    _tid = ele['_id']
                    self.mdb1.update('gonghui',{"_id":_tid}, {"$set":{"name": _tmpName}})
                    print w(ele['name']+"改名为："+_tmpName)
                    break

        print w("结束检测势力名是否重复")
        
    #创建三军演武NPC
    def hq_createSJYWNpc(self):
        print "Start Create SJYW NPC"
        #g.m.sjywfun.createNPC()
        print "End Create SJYW NPC"

    # 删除循环活动
    def hq_deleteHuodong(self):
        print "start delete huodong"
        hd = self.mdb1.find('hdinfo', {'htype': {"$in": [14]}}, fields=['_id', 'hdid', 'name'])
        _email = []
        _nt = g.C.NOW()
        _users = self.mdb1.find('hddata', {'hdid': {'$in': map(lambda x:x['hdid'], hd)}, 'HEQU':{'$exists': 0}}, fields=['_id','uid'])

        self.mdb1.update('hddata', {'hdid': {'$in': map(lambda x:x['hdid'], hd)}}, {'HEQU': 1})

        _uids = map(lambda x:x['uid'], _users)

        for uid in _uids:
            _temp = {
                'title': '合服奖励发放',
                'prize': [{"a": "item","t": "2008","n": 10},{"a": "attr","t": "rmbmoney","n": 1000},{"a": "item","t": "3005","n": 50}],
                'getprize': 0,
                'content': '',
                "etype": 1,
                "ctime": _nt,
                "uid": uid,
                "passtime": _nt + 15 * 24 * 3600,
                "isread": 0,
                'ttltime': g.C.TTL()
            }
            _email.append(_temp)
        if _email:
            self.mdb1.insert('email', _email)

        # 删除活动再上一个新的
        self.mdb1.delete('hdinfo', {'htype': {"$in": [14, 12]}})
        self.mdb1.delete('hddata', {'uid': 'SYSTEM','hdid':100})

        def fmtShowTime(demo, stime, etime):
            _showTime = str(demo)
            _keys = {
                'stime': ['{SY}', '{SM}', '{SD}'],
                'etime': ['{EY}', '{EM}', '{ED}']
            }
            _sTimeDate = g.C.DATE(stime).split('-')
            _eTimeDate = g.C.DATE(etime - 1).split('-')
            _idx = 0
            for k in _keys['stime']:
                _showTime = _showTime.replace(k, _sTimeDate[_idx])
                _idx += 1

            _idx = 0
            for k in _keys['etime']:
                _showTime = _showTime.replace(k, _eTimeDate[_idx])
                _idx += 1

            return _showTime

        # 周常活动htype
        _delHtype = 14
        _nt = g.C.NOW()
        _hddata = self.mdb1.find('hdinfo', {'htype': _delHtype},fields=['hdid', 'showtimedemo', 'repeatday', 'stime', 'etime', 'rtime', 'data'])
        _hdidList = [ele['hdid'] for ele in _hddata]

        # 修改轮回规则
        _preHdId = '300'
        _mark2id = {v['data']['mark']: k for k, v in g.GC['zchuodong'].items()}
        for hd in _hddata:
            if hd['rtime'] > _nt:
                continue

            # 删除过期活动
            _preHdId = _mark2id[hd['data']['mark']]
            self.mdb1.delete('hdinfo', {'hdid': hd['hdid']})

        # 检测是否还有周常活动
        _chkNum = self.mdb1.count('hdinfo', {'htype': _delHtype})
        if _chkNum > 0:
            return

        _zchdCon = g.GC['zchdloop']
        # 开区天数
        _openDay = g.getOpenDay()
        # 活动天数
        _chkSize = _zchdCon['loopsize']
        # 活动id列表
        _loopHid = list(_zchdCon['loophdid'])
        # 获取余数为下标
        _weekSize = divmod(_openDay, _chkSize)[0]
        # _hdIdx = divmod(_weekSize, len(_loopHid))[1]
        _hdIdx = _loopHid.index(_preHdId) + 1
        if _hdIdx >= len(_loopHid): _hdIdx = 0
        _hdid = _loopHid[_hdIdx]
        _hdCon = g.GC['zchuodong'][_hdid]
        # import copy
        _zcData = g.C.dcopy(dict(_hdCon))
        # print '_hdContype====',type(_hdCon)
        # print '_zcData====',type(_zcData)

        _idx = 0
        _extPrize = list(_zchdCon['extprize'])
        _gid = _extPrize[0]['dlp']
        _dlPrize = g.m.diaoluofun.getGroupPrize(_gid)

        _arr = []
        for d in _zcData['data']['arr']:
            _tmp = list(d['p'])
            _num = _extPrize[_idx]['num']
            _tmpItem = {'a': _dlPrize[0]['a'], 't': _dlPrize[0]['t'], 'n': _num}
            _idx += 1
            _tmp.append(_tmpItem)
            d['p'] = _tmp
            _arr.append(d)

        # print _zcData['data']['arr']
        _addTime = _chkSize * 3600 * 24
        _zeroTime = g.C.getZeroTime(_nt)
        _zcData['hdid'] = _nt + 10
        _zcData['model'] = _dlPrize[0]['t']
        _zcData['stime'] = _zeroTime
        _zcData['etime'] = _zeroTime + _addTime
        _zcData['rtime'] = _zeroTime + _addTime - 300
        _zcData['showtime'] = fmtShowTime(_zcData['showtime'], _zcData['stime'], _zcData['etime'])
        # print _zcData
        # 设置重置活动的时间
        g.m.gameconfigfun.setGameConfig({'ctype': 'repeathd_zhouchang', 'k': g.C.DATE()}, {'v': _nt})
        self.mdb1.insert('hdinfo', _zcData)

        # 几天返利
        # 判断活动是否结束
        htyp = 11
        nt = g.C.NOW()
        self.mdb1.delete('hdinfo', {'htype': htyp})
        # _all = self.mdb1.find('hdinfo', {'htype': htyp}, fields=['stime', 'etime', 'rtime', 'hdid', 'htype'])
        #
        # if not _all:
        #     return
        #
        # for i in _all:
        #     if i['stime'] < nt < i['etime']:
        #         return
        #
        # info = _all[0]
        # etime = info['etime']
        # hdid = info['hdid']
        # # 活动结束
        # if nt > etime:
        #     _stime = g.C.ZERO(0 * 24 * 3600 + nt)
        #     _etime = g.C.ZERO(14 * 24 * 3600 + nt) + 24 * 3600 - 1
        #     _rtime = g.C.ZERO(14 * 24 * 3600 + nt) + 24 * 3600 - 1
        #     _st = g.C.getDate(_stime, "%m月%d日00:00")
        #     _et = g.C.getDate(_rtime, "%m月%d日23:59")
        #     _showtime = _st + "-" + _et
        #
        #     upsetDict = {
        #         'stime': _stime,
        #         'rtime': _rtime,
        #         'etime': _etime,
        #         'hdid': nt + 21 * 2,
        #         'showtime': _showtime,
        #     }
        #     res = self.mdb1.update('hdinfo', {'hdid': hdid, 'htype': 11}, upsetDict)
        #     print 'huodong_jitianfanli update', res

        def fmtShowTime(demo, stime, etime):
            _showTime = str(demo)
            _keys = {
                'stime': ['{SY}', '{SM}', '{SD}'],
                'etime': ['{EY}', '{EM}', '{ED}']
            }
            _sTimeDate = g.C.DATE(stime).split('-')
            _eTimeDate = g.C.DATE(etime - 1).split('-')
            _idx = 0
            for k in _keys['stime']:
                _showTime = _showTime.replace(k, _sTimeDate[_idx])
                _idx += 1

            _idx = 0
            for k in _keys['etime']:
                _showTime = _showTime.replace(k, _eTimeDate[_idx])
                _idx += 1

            return _showTime

        # 周常活动htype
        _delHtype = 12
        _nt = g.C.NOW()
        _hddata = g.mdb.find('hdinfo', {'htype': _delHtype},
                             fields=['hdid', 'showtimedemo', 'repeatday', 'stime', 'etime', 'rtime', 'data'])
        _hdidList = [ele['hdid'] for ele in _hddata]

        for hd in _hddata:
            if hd['rtime'] > _nt:
                continue

            # 删除过期活动
            g.mdb.delete('hdinfo', {'hdid': hd['hdid']})

        # 检测是否还有周常活动
        _chkNum = g.mdb.count('hdinfo', {'htype': _delHtype})
        if _chkNum > 0:
            return

        # 获取现在是第几周
        def getWeekNum():
            _ot = g.getOpenTime()
            _res = '5'
            # 9.27 更新之前的按照第五周
            if _ot < 1569513600:
                return _res
            # 开区时间大于五周了
            elif (g.getOpenDay() - 1) / 7 + 1 > 5:
                return _res

            _res = str((g.getOpenDay() - 1) / 7 + 1)
            return _res

        # 开区天数
        _openDay = g.getOpenDay()
        # 活动天数
        _chkSize = 7
        _hdCon = g.GC['chaozhilibao']
        _zcData = g.C.dcopy(dict(_hdCon))
        _addTime = _chkSize * 3600 * 24
        _zeroTime = g.C.getZeroTime(_nt)
        _zcData['hdid'] = int(str(_nt + _delHtype) + '1')
        _zcData['stime'] = _zeroTime
        _zcData['etime'] = _zeroTime + _addTime
        _zcData['rtime'] = _zeroTime + _addTime - 300
        _zcData['showtime'] = fmtShowTime(_zcData['showtime'], _zcData['stime'], _zcData['etime'])
        _zcData['data']['arr'] = _zcData['data']['arr'].pop(getWeekNum())
        # 设置重置活动的时间
        g.m.gameconfigfun.setGameConfig({'ctype': 'repeathd_czlb', 'k': g.C.DATE()}, {'v': _nt})
        g.mdb.insert('hdinfo', _zcData)
        print g.C.STR('CREATE hdinfo hdid {1} ', _zcData['hdid'])


        print "end delete huodong"


    #清理死号用户
    def hq_clearDeadUser(self):
        _ntime = g.C.getNowTime()
        _ptime = _ntime-self.ptime
        _delUserList = self.mdb1.find('userinfo',where={'payexp':{'$exists':0},"lv":{"$lt":30},"logintime":{"$lt":_ptime}},fields={"uid":1,"name":1,"_id":0})
        print w("开始清空死号玩家")
        if len(_delUserList) == 0:
            print w("无死号信息")
            return
        
        db = self.client1.get_database(self.db1Name)
        _collectionList = db.collection_names()
        _userList = []
        for u in _delUserList:
            _userList.append(u['uid'])
        
        for c in _collectionList:
            if c in clearUserBreakTable or c.startswith('system.'):
                continue
            self.mdb1.delete(c,{'uid':{"$in":_userList}})

        # 清理别人好友中的他们
        _set = set(_userList)
        _all = self.mdb1.find('friend')
        for i in _all:
            _userset = {}
            for key in i:
                if isinstance(i[key], list):
                    _userset[key] = list(set(i[key]) - _set)
            if _userset:
                self.mdb1.update('friend',{'uid':i['uid']}, _userset)
        
        self.mdb1.delete('userinfo',{'uid':{"$in":_userList}})
        print w("结束清空死号玩家数量="+ str(len(_userList)))


        
    #清理竞技场数据
    '''def hq_clearTxbwNpc(self):
        print "Start Create TXBW NPC"
        self.mdb1.delete('pkdata')
        _jjcRobot = g.m.txbwfun.createNPC()
        print "END Create TXBW NPC"
        '''
    
    # 处理风暴要塞数据
    def hq_clearStormData(self):
        print "Start clear storm"
        _res = {}
        _time = {}
        _nt = g.C.NOW()
        _con = g.GC['storm']['base']
        _myData = g.mdb.find('storm', {'over': {'$exists': 0},'stime':{'$lte':_nt}},fields=['number', 'etime', 'color', 'fightdata', 'stime', 'area', 'box','uid'])
        for i in _myData:
            if i['uid'] not in _res:
                _res[i['uid']] = []
            # 如果有宝箱奖励  并且已经过时
            if 'box' in i:
                _res[i['uid']] += _con['box'][i['box']]['prize']

            _mul = (i['etime'] - i['stime']) // _con['fortress'][i['color']]['sec'] + 1
            for p in _con['fortress'][i['color']]['prize']:
                _res[i['uid']].append({'a':p['a'],'t':p['t'],'n':int(p['n'] * _mul)+1})

            # 加上时段奖励u'zzb131'
            for p in _con['timeprize'][i['color']]:
                if i['etime'] - i['stime'] >= p['holdsec']:
                    _res[i['uid']] += p['prize']

            _time[i['uid']] = _time.get(i['uid'], 0) + i['etime'] - i['stime']

        _eList = []
        for uid in _res:
            _emailData = {
                'title': '风暴战场结算奖励',
                'prize':g.fmtPrizeList(_res[uid]),
                'getprize':0,
                'content': '',
                "etype": 1,
                "ctime": _nt,
                "uid": uid,
                "passtime": _nt + 15 * 24 * 3600,
                "isread": 0,
                'ttltime': g.C.TTL()
            }
            _eList.append(_emailData)
            if uid in _time:
                g.setAttr(uid, {'ctype': 'storm_gjtime'}, {'$inc': {'v': _time[uid]}})
        if _eList:
            self.mdb1.insert('email', _eList)
        self.mdb1.delete('storm')
        print "End clear storm"
        
    # 删除王者雕像
    def hq_delKingStatue(self):
        print "Start DELETE TXBWPKUSER"
        self.mdb1.delete('gameattr', {'uid': 'SYSTEM', 'ctype': 'king_statue'})
        self.mdb1.delete('gameattr', {'uid': 'SYSTEM', 'ctype': 'friends'})
        self.mdb1.delete('gameattr', {'uid': 'SYSTEM', 'ctype': 'ghcompeting_timer'})
        self.mdb1.delete('gameattr', {'uid': 'SYSTEM', 'ctype': 'temple_devil'})
        self.mdb1.delete('gameattr', {'uid': 'SYSTEMP', 'ctype': 'dragonknight_topdps'})
        print "END DELETE TXBWPKUSER"
        
    #删除playattr数据
    def hq_delPlayAttr(self):
        print "Start DELETE Playattr"
        _ctypeList = [
            'zypkjjc_freenum','championtrial_freenum','zypkjjc_fightuser','championtrial_fightuser','friend_canreceive','corss_servergroup'
        ]
        self.mdb1.delete('playattr',{"ctype":{'$in':_ctypeList}})
        print "Start DELETE Playattr"

        
    #重置公告信息
    def hq_reGongGao(self):
        print "Start RESET GONGGAO"
        temp = g.mdb.find1('gameconfig', {'ctype': 'ladder_division'},sort=[['v', -1]],fields=['_id']) or {'v': 1, 'ctype': 'ladder_division'}
        g.mdb.delete('gameconfig',{})
        _nt = g.C.NOW()
        etime = g.getOpenTime() + 8*24*3600
        _gongGao = [
            {
                "title":"合服公告",
                "stype":0,
                "content":"尊敬的玩家，你们好！<br>　　感谢您长久以来对本游戏的支持，为了给您更好的游戏环境和游戏体验，我们现在对当前服务器进行了合服操作，合服后，您将可以和更多的活跃玩家一起战斗，更好的体验养成将领、攻城略地的快乐！合服过程中，我们将对一些难以保留的数据进行了清理，敬请谅解，同时，我们也对所有的玩家进行了合服补偿奖励，请在邮件中领取。<br>　　如遇到异常问题，请联系客服进行处理，再次感谢您的理解和支持，我们将再接再厉，竭诚为您提供更加优质的服务。",
                "stime":_nt,
                "etime":etime
                },
        ]
        _addData = []
        for i,ele in enumerate(_gongGao):
            _tmpData = {}
            _tmpData["ctype"] = "GONGGAO"
            _tmpData["k"] = str(i+ 1)
            _tmpData["v"] = ele
            _addData.append(_tmpData)
        
        #初始化公告
        _r = g.m.gameconfigfun.addGameConfig(_addData)
        _r = g.m.gameconfigfun.addGameConfig(temp)
        print "End RESET GONGGAO"
        
        
        # # #2018-1-17 至尊合区需求
        # # _randNum = g.m.zhizunfun.randLuckyNum()
        # #正在福池中使用的数字
        # g.m.gameconfigfun.setGameConfig({'ctype':'ZHIZUN_USELUCKYNUM'},{'v':_randNum,'issetnum':1})
        # #至尊设置的数字
        # g.m.gameconfigfun.setGameConfig({'ctype':'ZHIZUN_TMPLUCKYNUM'},{'v':_randNum})
        # #军饷逻辑 保留一条发军饷的信息
        # _jxSendData = g.mdb.find('gameconfig',{'ctype':'shili_junxiang_prizehour'})
        # if len(_jxSendData) > 1:
        #     _saveid = _jxSendData[0]['_id']
        #     g.mdb.delete('gameconfig',{'ctype':'shili_junxiang_prizehour','_id':{'$ne':_saveid}})


    '''
    #清除重复公告
    def hd_chkGongGao(self):
        #删除公告外的信息
        self.mdb1.delete('gameconfig',{'ctype':{'$ne': 'GONGGAO'}})
        _ggList = self.mdb1.find('gameconfig',{'ctype':'GONGGAO'})
        _chkList = []
        for gg in _ggList:
            if 'order' in gg:
                _tmpOrderid = gg['order']
                if _tmpOrderid not in _chkList:
                    _chkList.append(_tmpOrderid)
                    continue
            self.mdb1.delete('gameconfig',{'_id':gg['_id']})
    '''

    #清理重复活动和hdid小于10000的活动
    def hd_chkHongDong(self):
        #清除日常任务id
        # self.mdb1.delete('hdinfo',{'hdid':{'$lte':10000}})
        _hdList = self.mdb1.find('hdinfo',fields=['hdid'])
        _chkList = []
        for h in _hdList:
            _tmpHdid = int(h['hdid'])
            if _tmpHdid not in _chkList:
                _chkList.append(_tmpHdid)
                continue
            #去除相同hdid活动
            self.mdb1.delete('hdinfo',{'_id':h['_id']})

        
    #合服全服邮件
    def hq_sendFullServerPrize(self):
        _title = '数据互通奖励！'
        _where = {'title':_title}
        _chkTime = g.C.NOW(g.C.DATE())
        # _oldEmail = self.mdb1.count('email',{"title":_title,'ctime':{'$gt':_chkTime}})
        # if _oldEmail > 0:
        #     print w("已经有奖励了"), SVR1DB['dbname']
        #     return
        
        print w("开始全区合区补偿")
        _sendServer = OLDSEVERIDX
        _diffNum = 1
        _db1time = g.C.NOW(DB1OPENTIME)
        _diff = g.C.getDateDiff(g.C.NOW(DB2OPENTIME),int(_db1time))
        """
        改名卡*1
        元宝*1000
        经验券 * 35
        """
        _num = 1000 + abs(_diff) * 1000
        if _num > 5000:
            _num = 5000
        _sendPrize = [{'a':'attr','t':'rmbmoney','n':_num}]
        _slLeaderPrize = [{'a':'attr','t':'rmbmoney','n':1000}]
        _content = "现在你可以结交到更多的朋友啦，还有免费的奖励可以领，赶快领取吧！"
        _content_leader = '尊敬的玩家，您是尊贵的势力首领，在本次合服中补偿之外，额外对您进行补偿，敬请领取，以示鼓励。'
        _ntime = g.C.getNowTime()
        _dataArr=[]

        # 之前没有发过
        if self.mdb1.count('email', {"title": _title, 'ctime': {'$gt': _chkTime},'sid':NEWSEVERIDX[0]}) == 0:
            _dataArr.append({
                "etype":1,
                "title":_title,
                "content":_content,
                "ctime":_ntime,
                "passtime":_ntime + 15*24*3600,
                "uid":'SYSTEM',
                "needlv":25,
                "sid":NEWSEVERIDX[0],
                'getprize':0,
                'isread':0,
                'plist':[],
                "prize":_sendPrize
            })
        if self.mdb1.count('email', {"title": _title, 'ctime': {'$gt': _chkTime},'sid':_sendServer[0]}) == 0:
            _dataArr.append({
                "etype":1,
                "title":_title,
                "content":_content,
                "ctime":_ntime,
                "passtime":_ntime + 15*24*3600,
                "uid":'SYSTEM',
                "needlv":25,
                "sid":_sendServer[0],
                'getprize':0,
                'isread':0,
                'plist':[],
                "prize":_slLeaderPrize
            })
        if _dataArr:
            self.mdb1.insert('email',_dataArr)
        print w("结束全区合区补偿")


    # 重置竞技场积分
    def hq_resetArenaJifen(self):
        print w("开始重置竞技场积分")
        self.mdb1.update('zypkjjc',{},{'jifen':1000})
        self.mdb1.update('championtrial',{},{'jifen':1000})
        print w("结束重置竞技场积分")


#主进程
def main ():
    hequ = HeQu(SVR1DB)
    hequ.startTime = time.time()
    #清理死号用户
    hequ.hq_clearDeadUser()
    #设置重名玩家
    hequ.hq_chkUserName()
    # 重置竞技场积分
    hequ.hq_resetArenaJifen()
    #设置重名势力
    hequ.hq_chkShiLiName()
    #清理部分表数据
    hequ.hq_clearTableData()
    # 处理风暴要塞数据
    hequ.hq_clearStormData()
    #删除Gamefig，新建公告
    hequ.hq_reGongGao()
    #删除王者雕像
    hequ.hq_delKingStatue()
    #删除playattr信息
    hequ.hq_delPlayAttr()
    # 删除循环活动
    hequ.hq_deleteHuodong()
    #2017-3-8 清理重复活动和hdid小于10000的活动
    hequ.hd_chkHongDong()
    #还原合并前删除的索引
    hequ.hq_reMarkIndex()

    #发放全服奖励
    hequ.hq_sendFullServerPrize()
    hequ.endTime = time.time()
    print "success!!!!!!!!!!!!!!!!"
    print "runtime==========",  hequ.endTime- hequ.startTime
    setStatus()
    
#删除索引
def delIndex():
    hequ = HeQu(SVR1DB)
    hequ.hq_dropIndex()

import sys

if 'clearIndex' == sys.argv[1]:
    # 合并前删除影响合并的索引-执行完后还原索引
    delIndex()
else:
    try:
        main()
    except:
        import traceback
        _trace = traceback.format_exc()
        print _trace
        print "error!!!!!!"
        main()