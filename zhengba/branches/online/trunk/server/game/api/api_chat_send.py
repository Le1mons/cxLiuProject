#!/usr/bin/python
# coding:utf-8

if __name__ == '__main__':
    import sys

    sys.path.append('..')
    sys.path.append('game')

import g

'''
聊天 - 发送聊天消息
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}

    uid = conn.uid
    isRepeat = False
    notSendMessage = False
    if data[4] == "notSendMessage": notSendMessage = True  # 检查是否屏蔽消息
    # 发送内容
    content = data[0]
    # 聊天信息
    mtype = int(data[1])
    # 检查重复信息
    # if data[2] == 'repeat': isRepeat = True

    _showType = data[3]
    # 是否隐藏vip字段
    _hideVip = 0
    if len(data) >= 7:
        _hideVip = int(data[6])

    # 长度不能为空
    if len(content) == 0:
        _res["s"] = -1
        _res["errmsg"] = g.L("chat_send_res_-1")
        return (_res)

    # 玩家只允许发送综合、公会、招募信息（只能会长发送）, 进行脏话处理
    if mtype not in (2, 3, 1, 4) or len(content) > 30 or (not g.checkWord(content)):
        _res["s"] = -2
        _res["errmsg"] = g.L("chat_send_res_-2")
        return (_res)

    # 去掉特殊字符
    content = g.C.FilterChat(str(content))
    gud = g.getGud(uid)
    _nt = g.C.NOW()
    _extArg = {}
    

    _blList = g.m.dball.getBlackList(uid,where={"ctype":{"$in":[1,2]}},keys="_id,uid,etime,ctype")
    if len(_blList)>0:
        #有封禁记录,查看类型
        _blInfo = filter(lambda x:("etime" in x and _nt < x["etime"] and x["etime"]>0) or "etime" not in x,_blList)
        _typeArr = map(lambda x:x["ctype"],_blInfo)
        #假禁言,只发送给自己
        if 1 in _typeArr:
            _extArg["senduid"] = uid
            _extArg["black"] = "1"
        
        #真禁言,无法发言
        if 2 in _typeArr:
            _res["s"]=-6
            _res["errmsg"] = g.L("chatsend_res_-6")
            return (_res)

    # 检查头像框 聊天框是否过期
    g.m.userfun.chkBorderExpire(uid)
    
    _fdata = {"uid": gud["uid"],
              "name": gud["name"],
              "lv": gud["lv"],
              "vip": gud.get("vip",0),
              "ctime": _nt,
              "head": gud["head"],
              "sendType":0,
              "sid": gud["sid"],
              "headborder": gud["headborder"],
              "chatborder": gud["chatborder"],
              "hidevip": _hideVip,
              'svrname':g.m.crosscomfun.getSNameBySid(gud["sid"])
              }

    # 判断是否为分享小兵链接
    if data[5] != "":
        _tid = data[5]
        _fdata["sendData"] = {}
        _keys = "_id,hid,lv,zhanli"
        _sendData = g.m.herofun.getHeroInfo(uid, _tid, _keys)

        if _sendData != None:
            _fdata["sendData"].update(_sendData)
            _fdata["sendData"].update({"uid": uid, "tid": _tid})
            _fdata["sendType"] = 1
        else:
            del _fdata["sendData"]

    # 综合聊天
    # 1为发送招募信息 2综合、3公会聊天，4 跨服聊天

    # 发送世界信息
    if mtype == 2:
        if gud["lv"] < 20 or notSendMessage:
            _res["s"] = -1
            _res["errmsg"] = g.L("chat_noMore20.OrNotSendMessage")
            return _res
        
        _extArg["senduid"] = uid
        
        if checkRepeat(content):
            _extArg['onlySendToSelf'] = True
        
        g.m.chatfun.sendMsg(content, 2, data=_fdata, **_extArg)
        
    # 公会聊天
    elif mtype == 3:
        # 没有公会,无法发送
        if notSendMessage:
            _res["s"] = -1
            _res["errmsg"] = g.L("chat_noMore20.OrNotSendMessage")
            return _res

        if len(gud["ghid"]) == 0:
            _res["s"] = -3
            _res["errmsg"] = g.L("chat_global_nogonghui")
            return (_res)

        # 聊天
        if "uid" not in _extArg:
            _uList = g.mdb.find('gonghuiuser', {"ghid": gud["ghid"]}, fields=['_id', 'uid'])
            _uids = map(lambda x: x["uid"], _uList)
            _extArg["uid"] = _uids

        _fdata['type'] = 'user'
        _fdata["ghid"] = gud["ghid"]
        g.m.chatfun.sendMsg(content, 3, data=_fdata, **_extArg)

    elif mtype == 1:
        # 公会会长才能发送招募信息
        if notSendMessage:
            _res["s"] = -1
            _res["errmsg"] = g.L("chat_noMore20.OrNotSendMessage")
            return _res

        if len(gud["ghid"]) == 0 or str(gud['ghpower']) not in ('0','1'):
            _res["s"] = -3
            _res["errmsg"] = g.L("chat_nothuizhangError_-5")
            return _res

        _num = g.getPlayAttrDataNum(uid,'gonghui_zhaomu')
        # 一天只允许发送五次招募信息
        if _num >= 5:
            _res["s"] = -4
            _res["errmsg"] = g.L("chat_send_res_-4")
            return _res
        g.setPlayAttrDataNum(uid,'gonghui_zhaomu')

        _ghid = gud["ghid"]
        _fdata["ghid"] = _ghid
        g.m.chatfun.sendMsg(content, 1, data=_fdata)
    # 跨服聊天
    elif mtype == 4:
        if g.chatBlackWordReg.findall(content) or checkRepeat(content):
            _extArg["senduid"] = uid
            _extArg['onlySendToSelf'] = True
            g.m.chatfun.sendMsg(content, 4, data=_fdata, **_extArg)
        else:
            _fdata.update({'m': content})
            del _fdata['lv']
            g.m.crosschatfun.chatRoom.addCrossChat({'msg':content,'mtype':mtype,'fdata':_fdata,'extarg':{}})

    # 没有被黑的聊天，加到日志内
    if 'black' not in _extArg and _showType == "":
        g.m.chatlogfun.saveLog(gud, content, mtype)
    # 记录发送时间
    conn.sess.set(g.C.STR("msgtime_{1}", mtype), _nt)
    return _res

#检查最近的N句话是否重复
def checkRepeat(content):
    cachekey = "_lastChatContent"
    cache = g.mc.get(cachekey)
    if not cache:cache = []
    import difflib
    _repeat = False
    for _cont in cache:
        seq = difflib.SequenceMatcher(None, _cont , content)
        ratio = seq.ratio()
        
        if len(content) > 24:
            if ratio > 0.85:
                _repeat = True
                break
        else:
            if ratio >= 1:
                _repeat = True
                break                
        
    if not _repeat:
        cache.append(content)
        g.mc.set(cachekey, cache[-10: ])    
    
    return _repeat

if __name__ == '__main__':
    uid = g.buid("666")

    g.debugConn.uid = uid
    print doproc(g.debugConn,["奥斯卡接电话阿什顿",2,"","","",""])
    # print ifCrossOwner()
    # _fdata = {"uid": '46464646',
    #           "name": '刘思秋沙雕',
    #           "lv": 54,
    #           "vip": 1,
    #           "ctime": 0,
    #           "head":'12035',
    #           "sendType":0,
    #           "sid": '1',
    #           'svrname':'沙雕1服'
    #           }
    # g.m.crosschatfun.chatRoom.addCrossChat({'msg': '刘思秋是个沙雕', 'mtype': 4, 'fdata': _fdata, 'extarg': {}})
