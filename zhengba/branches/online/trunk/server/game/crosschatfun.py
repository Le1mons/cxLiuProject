#!/usr/bin/python
#coding:utf-8
'''
聊天处理方法
'''
import g

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
                        g.m.chatfun.sendMsg(_tmp['msg'],_tmp['mtype'],data=_tmp['fdata'],**_tmp['extarg'])
                except:
                    g.weblog.error('crosschat.py dolist error',qs['q'][k])
                    
        except:
            g.weblog.error('chat.py dolist error')


chatRoom = ChatRoom()
queueFun = QueueFun()