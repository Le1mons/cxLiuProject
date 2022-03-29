#!/usr/bin/python
#coding:utf-8
'''
聊天处理方法
'''
import g,json

#聊天房间对象
class ChatRoom:
    def __init__ (self):
        self.user2msg = {}
        
    #公共信息队列
    @g.runAtFirstGame
    def getQueue (self):
        '''
        取出未处理的队列数据，并逐一处理
        '''
        try:
            _crossQueue=[]
            if g.crossQueue !=None:
                _crossQueue = g.crossQueue.out()
                queueFun.dolist(_crossQueue)
        except:
            g.weblog.error('chatRoom getQueue error')

        g.tw.reactor.callLater(2,self.getQueue)

    #跨服聊天信息
    def addCrossChat (self,msarr):
        try:
            if(g.crossQueue!=None and msarr!=None):
                g.crossQueue.put(msarr)
        except:
            g.weblog.error('chatRoom addCrossChat error')

#队列处理逻辑
class QueueFun:
    def __init__ (self):
        pass

    #世界频道信息发送
    def dolist (self,qs):
        #开始处理队列逻辑
        if len(qs['k'])==0 : return
        res=[]
        try:
            for k in qs['k']:
                try:
                    if k in qs['q']:
                        _tmp = g.m.minjson.read(qs['q'][k])
                        # if 'chksid' in _tmp['extarg']:
                        #     #部分区域服务器跨服信息
                        #     if str(g.svridx) in _tmp['extarg']['chksid']:
                        #         g.m.chatfun.sendMsg(_tmp['msg'],_tmp['mtype'],data=_tmp['fdata'],**_tmp['extarg'])
                        # else:
                        g.m.chatfun.sendMsg(_tmp['msg'],_tmp['mtype'],data=_tmp['fdata'], cross=1, **_tmp['extarg'])
                except:
                    g.weblog.error('crosschat.py dolist error',qs['q'][k])
                    
        except:
            g.weblog.error('chat.py dolist error')


# 公平竞技场跨服事件推送
class gpjjcQueue:
    def __init__(self):
        self.gpid = None

    # 公共信息队列
    def getQueue(self):
        if self.gpid == None:
            self.gpid = g.getHostSid()

        '''
        取出未处理的队列数据，并逐一处理
        '''
        try:
            _crossQueue = []
            if g.crossGpjjcQueue != None:
                _crossQueue = g.crossGpjjcQueue.out()
            # print '_crossQueue',_crossQueue

            if len(_crossQueue) > 0:
                # print '_crossQueue==========',_crossQueue
                for k in _crossQueue['k']:
                    try:
                        if k in _crossQueue['q']:
                            _tmp = g.m.minjson.read(_crossQueue['q'][k])
                            if 'tosid' in _tmp and _tmp['tosid'] == self.gpid:
                                # print 'ddddddddddddd==========',_crossQueue['q'][k]
                                # 事件名
                                _eventName = _tmp['eventname']
                                g.m.gongpingjjcfun.doEvent(_eventName, _tmp)
                                # g.m.mymq.sendAPI('all','_slqueue_',_crossQueue['q'][k])
                    except:
                        g.weblog.error('crosschat.py dolist error', _crossQueue['q'][k])

        except:
            g.weblog.error('GpjjcQueue getQueue error')
        # g.tw.reactor.callLater(1,self.getQueue)

    # 跨服聊天信息
    # msg是要推出去的数据，必须是 {} 型
    def put(self, msg):
        try:
            if (g.crossGpjjcQueue != None):
                v = json.dumps(msg)
                g.crossGpjjcQueue.put(json.dumps(msg))
        except:
            g.weblog.error('chatRoom addCrossChat error')




chatRoom = ChatRoom()
queueFun = QueueFun()
gpjjcQueue = gpjjcQueue()