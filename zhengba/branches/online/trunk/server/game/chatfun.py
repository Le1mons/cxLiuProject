#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g

'''
聊天功能 - 包含势力聊天,系统消息,世界消息
'''

'''
#发送消息 
mtype 
    1为招募聊天 
    2为世界消息 
    3为公会聊天 
#uid 支持多uid同时发送,不填则默认全服消息
ispmd:是否发送跑马灯
'''
def sendMsg(content,mtype,uid=None,data=None,ifcheck=1,voice=None,senduid=None,chksid=None,ispmd=None,onlySendToSelf=False):
    if ifcheck:
        content = filterMsg(content) #.encode('utf8')

    _sendMsg = {"t":mtype,"m":content}
    if ispmd:
        _sendMsg['pmd'] = 1

    if data!=None:
        _sendMsg.update(data)

    if voice:
        _sendMsg.update({'voice':voice})

    _isAddCache = 1
    #2017-10-9 增加假禁言逻辑
    if onlySendToSelf:
        _isAddCache = 0
        uid = senduid

    if  senduid != None and len(g.chatBlackWordReg.findall(content))>0:
        _isAddCache = 0
        uid = senduid

    if uid==None:
        g.m.mymq.sendAPI('all','newchat',_sendMsg)
    else:
        g.m.mymq.sendAPI(uid,'newchat',_sendMsg)

    if _isAddCache: cacheChatMessage(_sendMsg)
    return _sendMsg

#消息过滤
def filterMsg(content):
    _newCont = g.reg.findall(content)
    for ele in _newCont:
        content = content.replace(ele,"*")
    return content

#发送系统消息
def getCon():
    _con = g.GC['message']
    return _con

#发送跑马灯消息
def sendPMD(uid,mtype,*marg):
    _con = g.GC['pmd']
    if mtype not in _con:
        return

    _msg = g.C.STR(_con[mtype],*marg)
    sendMsg(_msg,2,ifcheck=0,ispmd=1)

#检查是否有新离线私信消息
def _chkNewPrivateMsg(uid,logintime):
    _retVal = []
    _where = {
        '$or':
            [
                {'uid':uid},
                {'touid':uid}
            ],
        'lasttime':{'$gt':logintime}
    }
    _r = g.mdb.find('chat',_where)
    if _r:
        for ele in _r:
                _uidlist = [ele['uid'],ele['touid']]
                _uidlist.remove(uid)
                _retVal.append(_uidlist[0])

    return _retVal

#检查是否有新离线私信消息
def chkNewPrivateMsg(uid,logintime):
    _retVal = []
    _where = {
        '$or':
            [
                {'uid':uid},
                {'touid':uid}
            ],
        'lasttime':{'$gt':logintime}
    }
    _r = g.mdb.find('chat',_where)
    if _r:
        for ele in _r:
                for _msg in ele['data']:
                    if 'ctime' in _msg and _msg['touid'] == uid and _msg['ctime'] > logintime:
                        _retVal.append(_msg['uid'])
                        break
    return _retVal

#发送私信
def sendPrivateMsg(uid,touid,data):
    #TODO
    #超过20条数据，要清除掉之前的消息
    _utc = g.C.TTL()
    _nt = g.C.NOW()
    if 'ctime' not in data: data['ctime'] = _nt
    _where = {
        '$or':
            [
                {'uid':uid,'touid':touid},
                {'touid':uid,'uid':touid}
            ]
    }
    _data ={
        '$set':{'ttltime':_utc,'lasttime':_nt},
        '$push':{'data':{'$each':[data],'$slice':-20}}
    }
    _r = g.mdb.find('chat',_where)

    if _r:
        g.mdb.update('chat',_where,_data)

    else:
        _newdata = {
            'uid':uid,
            'touid':touid,
            'ttltime':_utc,
            'lasttime':_nt,
            'data':[data]
        }
        g.mdb.insert('chat',_newdata)
    # _r = g.mdb.update('chat',_where,_data,upsert=True)
    return _r

#获取私聊开关
def getChatSettings(uid):
    _status = {
        'worldvoiceswitch':'1',
        'shilivoiceswitch':'0',
        'privatechatswitch':'1'
    }
    _r = g.getAttr(uid,{'ctype':'chat_settings1'})
    if _r:
        _status = _r[0]['v']

    return _status

#设置私聊开关
def setChatSettings(uid,switch):
    _r = g.setAttr(uid,{'ctype':'chat_settings1'},{'v':switch})
    return _r

#检查是否是语音消息
def chkIfVoice(uid,data):
    _retval = False
    _content = data[0]
    mtype = int(data[1])
    if mtype in (2,3):
        if len(data)==3:
            _retval = True
    else:
        if len(data)==4:
            _retval = True

    return _retval

# 设置聊天搜索好友的CD
def setSearchCD(uid):
    _nt = g.C.NOW()
    _r = g.setAttr(uid,{'ctype':'chat_search_cd'},{'v':_nt+600})
    return _r

# 获取聊天搜索CD
def getSearchCD(uid):
    _retval = 0
    _r = g.getAttr(uid,{'ctype':'chat_search_cd'})
    if _r:
        _retval = int(_r[0]['v'])

    return _retval

# 检查聊天CD是否过期
def chkSearchCD(uid):
    _retval = True
    _nt = g.C.NOW()
    _cdtime = getSearchCD(uid)
    if _cdtime == 0:
        return _retval

    if _nt < _cdtime:
        _retval = False

    return _retval

# 对世界频道的消息缓存100条和工会的消息缓存20条,招聘信息缓存10条
def cacheChatMessage(message):
    mtype = int(message['t'])
    cachekey = 'king_chat_{0}'.format(mtype)
    # 世界聊天
    if mtype == 2:
        cache_length = 100
        cache = g.mc.get(cachekey)
        if not cache:
            cache = []

        cache.append(message)
        g.mc.set(cachekey, cache[-cache_length: ])

    elif mtype == 3:
        cache_length = 100
        if 'ghid' not in message: return -1
        ghid = message['ghid']
        cachekey = cachekey + '_' + str(ghid)  #"king_chat_3_" + gud["ghid"]   king_chat_3_5b30ff08625aeebb340efbee
        cache = g.mc.get(cachekey)
        if not cache:
            cache = []

        cache.append(message)
        g.mc.set(cachekey, cache[-cache_length: ])

    #如果发送的是招聘信息，则缓存10条信息
    elif mtype == 1:
        cache_length = 100
        cache = g.mc.get(cachekey)
        if not cache:
            cache = []

        cache.append(message)
        g.mc.set(cachekey, cache[-cache_length:])
    #如果发送的是跨服信息，则缓存100条信息
    elif mtype == 4:
        cache_length = 100
        cache = g.mc.get(cachekey)
        if not cache:
            cache = []

        cache.append(message)
        g.mc.set(cachekey, cache[-cache_length:])



# 获取聊天缓存队列
def getChatList(uid):
    _retVal = []
    uid = str(uid)
    _mtypeList = [1, 2, 3, 4]
    gud = g.getGud(uid)
    # 公会聊天队列
    if len(gud["ghid"]) > 0:
        _mtypeList.append("king_chat_3_" + gud["ghid"])
    _tidList = []
    for mtype in _mtypeList:
        if len(str(mtype)) > 1:
            _chatQueue = g.mc.get(str(mtype))
            if _chatQueue != None:
                _retVal += _chatQueue

        _queueKey = "king_chat_" + str(mtype)
        _chatQueue = g.mc.get(_queueKey)
        if not _chatQueue:
            # if mtype == 4:
            #     _chatQueue = g.m.crosschatfun.chatRoom.getQueue()
            # else:
            #     _chatQueue = g.mdb.find('chatlog',{'t': mtype},sort=[['ctime',-1]],limit=100)
            # # 数据库也没有聊天记录
            # if not _chatQueue:
            #     continue
            # for i in _chatQueue:
            #     _tidList += [i['_id']]
            #     del i['_id']
            # g.mc.set(_queueKey, _chatQueue)
            _chatQueue = []
        _retVal += _chatQueue

    return _retVal

if __name__=='__main__':
    # print filterMsg("毛泽东撒傲视打算但是")
    # print g.chatBlackWordReg.findall('cfdsfs')
    # uid = g.buid('gch').
    print getChatList('0_5aec54eb625aeef374e25e16')