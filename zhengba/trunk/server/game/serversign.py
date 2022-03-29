#!/usr/bin/python
#coding:utf-8
'''
统计进程
'''
from __future__ import unicode_literals

import sys,os,socket,time,random

import threading
sys.path.append('..')
sys.path.append('api/')
sys.path.append(os.getcwd())
from twisted.python import log

ENV = os.environ

#============================
import g,config,traceback,urllib2,urllib,json,time
g.config = config.CONFIG


def warning(data):
    try:
        url = "https://oapi.dingtalk.com/robot/send?access_token=dcdd4808ff56918cdf5468fed79015a8ba4c43b91c100882a753df1e8bd3ce7b"
        header = {
            "Content-Type": "application/json",
            "Charset": "UTF-8"
        }
        _title = '部落战魂s'+ str(g.getSvrIndex()) +'异常'
        '''
        data = {
            "msgtype": "markdown",
            "markdown": {
                "title":_title,
                "text":str(data)
            }
        }'''
        _data = {
             "msgtype": "markdown",
             "markdown": {
                 "title":_title,
                 "text": data
             },
            "at": {
                "atMobiles": [], 
                "isAtAll": False
            }
         }
        
        sendData = json.dumps(_data)
        sendData = sendData.encode("utf-8")
        
        req = urllib2.Request(url=url, data=sendData, headers=header)
        res_data = urllib2.urlopen(req)
        return res_data.read()
    except:
        pass

def getHttpContent(url,reqdata={}):
    try:
        data_urlencode = urllib.urlencode(reqdata)
        req = urllib2.Request(url=url,data=data_urlencode)
        res_data = urllib2.urlopen(req)
        res = res_data.read()
        return res
    except:
        return None

def now():
    return time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))

#异常数据监控
class DataMonitor():
    def __init__(self):
        pass

    def start(self):
        #self.check()
        g.tw.reactor.callLater( random.randint(60*60,60*60*2) ,self.check)
    
    def check(self):
        try:
            blankTids = getHttpContent('http://gametools.legu.cc/notmonitor.txt')
            
            conf = g.GC['dataMonitor']
            desp = ''

            for j in conf:
                fields=j['keys'].split(',')
               
                where = j['where']
                for _k,_v in where.items():
                    _nk = _k.replace('{{DAY}}',g.C.DATE())
                    if _nk!=_k:
                        where[_nk] = _v
                        del where[_k]
                
                _rss = list(g.mdb.find(j['table'],j['where'],fields=fields))
                rss = []
                
                #过滤所有不再提示的记录
                for rs in _rss:
                    if blankTids.find(str(rs['_id']))==-1:
                        rss.append(rs)

                if len(rss)>0:
                    '''
                    desp += '#####检测时间：'+ str(now()) + "\n-------------\n\n"
                    desp += '###'+ j['desc'] + "\n-------------\n\n"
                    
                    #表格头
                    keys = rss[0].keys()
                    _idIndex = keys.index("_id")
                    keys.insert(0,'操作')

                    title = '|'+ '|'.join(keys) +'|' + "\n"
                    desp += title
                    
                    #表格分割线
                    lines = ['-----']*len(keys)
                    desp += '|'+ '|'.join(lines) +'|' + "\n"
                    '''
                    
                    #表格数据
                    for rs in rss:
                        desp += "```\n"
                        desp += j['desc'] + "\n"
                        for __k,__v in rs.items():
                            if __k!="_id":
                                desp += str(__k) + "："+ str(__v) + "\n"
                        desp += "```\n\n"

                        desp += ('[不再提示上一条警告](http://gametools.legu.cc/?app=api&act=notmonitor&key='+ str(rs['_id']) +')'+"\n\n")
                        

                    desp += "\n\n"
                    #desp += ( '###'+ j['desc'] + "\n\n" + str(json.dumps(rss,ensure_ascii=False)) + "\n\n")
            
            if desp:
                desp = '**部落战魂s'+ str(g.getSvrIndex()) +'异常'+"**\n\n" + desp
                warning(desp)
                
        except:
            pass
        
        g.tw.reactor.callLater( random.randint(60*60,60*60*2) ,self.check)


class XlogSend():
    def __init__(self):
        pass

    def start(self):
        # self.check()
        g.tw.reactor.callLater(60, self.call)

    def call(self):
        g.toup.send()
        g.tw.reactor.callLater(60, self.call)


class baichuanSend():
    def __init__(self):
        pass

    def start(self):
        # self.check()
        g.tw.reactor.callLater(60, self.call)

    def call(self):
        g.m.baichuanapifun.send()
        g.tw.reactor.callLater(60, self.call)


#启动服务器
if __name__=='__main__':
    sche = DataMonitor()
    sche.start()
    g.m.chatlogfun.uploadLog()

    # 上报xlog
    xlog = XlogSend()
    xlog.start()

    _owner = g.getOwner()
    _con = g.GC["support"]["baichuan"]
    if _owner in _con:
        bc = baichuanSend()
        bc.start()

    g.tw.reactor.run()
