#!/usr/bin/python
#coding:utf-8

import g
import socketmana

mqserver=None
mqclient=None
timerclient=None
MQDict = {} #储存mqKey -> protocol映射表

#处理调度服务器逻辑
def createMQServer():
    global mqserver
    mqserver = g.m.mq.MQServer()
    mqserver.bind(int(g.conf['dispatchSvr']))
    mqserver.onReceive = MQServerFunction
def MQServerFunction (protocol,msg):
    global timerclient
    data = g.m.myjson.loads(msg)
    
    if data['act']=='setMQKey':
        #给protocol设置标识
        MQDict[ data['v'] ] = protocol
    
    if data['act'] == 'S2C':
        #给指定protocol标识发送数据
        #{"act":"S2C","MK":mqKey,"api":api,"data":data}
        if not data['MK'] in MQDict:
            print data['MK'],' not in MQDict'
            return 
        
        protocol = MQDict[ data['MK'] ]
        protocol.send(g.m.myjson.write(data))
    
    if data['act']=="TU":
        #发送消息给指定玩家
        for uid in data['U']:
            conn = socketmana.data.get(uid)
            if conn!=None: conn.send(data['M'])

    elif data['act']=="TA":
        #发送消息给所有玩家
        all = socketmana.data.getAll()
        for uid,conn in all.items():
            conn.send(data['M'])
    
    elif data['act']=="STS":
        #定时器的初始化消息
        timerclient = protocol
    
    elif data['act']=="ST" or data['act']=="RA" or data['act']=="CT":
        #设置定时器
        timerclient.send(msg)

def createMQClient(mqKey=None):
    global mqclient
    mqclient = g.m.mq.MQClient()
    #设置唯一标识
    if mqKey!=None:
        def _setMQKey():
            mqclient.send(g.m.myjson.write({"act":"setMQKey","v":mqKey}))
        mqclient.event.on('onStart',_setMQKey)
        
    mqclient.connect(int(g.conf['dispatchSvr']))
    return mqclient

def sendAPI(to,api,data=''):
    _msg = g.m.socketpack.s2c(data,api)
    if to=='all':
        return sendToAll(_msg)

    elif to=='system':
        return sendToSystem(_msg)
    
    else:
        return sendToUid(to,_msg)

def sendToUid (uids,msg):
    if uids==None:return
    global mqclient
    if type(uids)!=type([]):
        uids = [uids]
    data = {"act":"TU","U":uids,"M":msg}
    if mqclient!=None:mqclient.send(g.m.myjson.write(data))
    return data

def sendToAll(msg):
    global mqclient
    data = {"act":"TA","M":msg}
    if mqclient!=None:mqclient.send(g.m.myjson.write(data))

#发送系统消息
def sendToSystem(msg):
    global mqclient
    data = {'act':'TA','M':msg,'t':1}
    if mqclient!=None: mqclient.send(g.m.myjson.write(data))

def sendToMQ(mqKey,api,data=None):
    global mqclient
    #send2client
    data = {"act":"S2C","MK":mqKey,"api":api,"data":data}
    if mqclient!=None:
        return mqclient.send(g.m.myjson.write(data))    
    else:
        return False
#设置定时
def setTimer (s,fun,*arg,**karg):
    global mqclient
    data = {"act":"ST","S":s,"F":fun,'A':arg,"K":karg}
    if mqclient!=None:mqclient.send(g.m.myjson.write(data))

#设置定时
def runat (s,fun,*arg,**karg):
    global mqclient
    data = {"act":"RA","S":s,"F":fun,'A':arg,"K":karg}
    if mqclient!=None:mqclient.send(g.m.myjson.write(data))

def clearTimer (tid):
    global mqclient
    data = {"act":"CT","ID":tid}
    if mqclient!=None:mqclient.send(g.m.myjson.write(data))

#定时进程连接成功后告知mqServer
def setTimerClient ():
    global mqclient
    data = {"act":"STS"}
    mqclient.send(g.m.myjson.write(data))
    g.event.emit("timerInit")

if __name__=='__main__':

    pass
