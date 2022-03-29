#!/usr/bin/python
# coding:utf-8

'''
聊天 - 发送聊天消息
'''

if __name__ == '__main__':
    import sys

    sys.path.append('..')
    sys.path.append('game')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [消息体, 消息类型(1为系统消息 2为世界消息 3为公会消息 4为跨服消 5为5军之战， 6为同省，7为私聊),'','','','',是否隐藏vip,省,市]  data[0]:消息体 data[1]:消息类型   data[1]==4需要传私聊对象uid
    :param key:
    :return:
    ::

        {"s":1}
    """
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

    _province = ""
    _city = ""
    # 同省聊天的的参数
    if len(data) >= 9:
        # 省
        _province = str(data[7])
        # 市
        _city = str(data[8])

    _questionsInfo = {}
    # 发送syzc的问答数据
    if len(data) >= 10:
        _questionsInfo = data[9]


    # 长度不能为空
    if len(content) == 0:
        _res["s"] = -1
        _res["errmsg"] = g.L("chat_send_res_-1")
        return (_res)

    content = content.replace('<', '')

    # 玩家只允许发送综合、公会、招募信息（只能会长发送）, 进行脏话处理
    if (mtype not in (2, 3, 1, 4, 5, 6, 7) or len(content) > 30) and not _questionsInfo:
        _res["s"] = -2
        _res["errmsg"] = g.L("chat_send_res_-2")
        return (_res)

    gud = g.getGud(uid)
    # 一分钟一次
    if g.C.NOW() <= gud.get('lastSendMsgTime', 0) + 10:
        _res["s"] = -10
        _res["errmsg"] = g.L("chat_send_-10")
        return _res

    # 去掉特殊字符
    content = g.C.FilterChat(str(content))
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

    # 检查过期
    _r = g.m.chenghaofun.chkChengHaoTime(uid)
    if _r: g.sendChangeInfo(conn, _r)
    gud = g.getGud(uid)
    
    _fdata = {"uid": gud["uid"],
              "name": gud["name"],
              'chenghao':gud['chenghao'],
              "lv": gud["lv"],
              "vip": gud.get("vip",0),
              "ctime": _nt,
              "head": gud["head"],
              "wzyj": gud["wzyj"],
              "sendType":0,
              "sid": gud["sid"],
              "headborder": gud["headborder"],
              "chatborder": gud["chatborder"],
              "hidevip": _hideVip,
              'svrname':g.m.crosscomfun.getSNameBySid(gud["sid"])
              }
    if _questionsInfo:
        _fdata["syzc"] = _questionsInfo

    # 猫耳平台
    if g.chkOwnerIs('maoerbl'):
        isOk, rmsg = g.m.maoerfun.maoErPostChat(uid=uid, mtype=mtype, content=content)
        # 验证失败 不能发送
        if not isOk:
            _res["s"] = -20
            _res["errmsg"] = g.L('chat_maoer_api')
            return _res
        else:
            content = rmsg


    # 判断是否为分享小兵链接
    if data[5]:
        _fdata["sendData"] = {}
        if data[5]['type'] == 'hero':
            _tid = data[5]['tid']
            _keys = '_id' if mtype == 4 else "_id,hid,lv,zhanli"
            _sendData = g.m.herofun.getHeroInfo(uid, _tid, _keys)
        else:
            _tid = data[5]['tid']
            _sendData = g.mdb.find1('pet',{'uid':uid,'_id':g.mdb.toObjectId(_tid)},fields=['_id','pid','lv'])
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

        # 一分钟一次
        if gud['vip'] < 3 and ((g.C.NOW() <= gud.get('lastSendMsgTime',0) + 60 and gud['lv']<50) or g.C.NOW() <= gud.get('lastSendMsgTime',0) + 10):
            _res["s"] = -10
            _res["errmsg"] = g.L("chat_send_-10")
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
        if g.getOpenDay() < 7 or gud['lv'] < 30:
            _res["s"] = -5
            _res["errmsg"] = g.L("chat_send_-5")
            return _res

        # 如果中了变羊术  并且随机成功
        _data = g.crossDB.find1('crossplayattr', {'uid': uid, 'ctype': 'cross_guinsoo'}, fields=['_id', 'v', 'num'])
        if _data and _data['v'] > g.C.NOW():
            # _fdata['name'] = g.L('guinsoo')
            _fdata['head'] = g.GC['userinfo']['sheepid']
            _fdata['isyang'] = 1
            if g.C.RAND(100, 20):
                g.event.emit('quweichengjiu', uid, '8', val=_data.get('num', 0))
                content = g.L('sheep')

        #检测更新跨服信息
        _crossServerGroupId = g.m.crosswzfun.getUGID()
        g.chkCrossServer(_crossServerGroupId)
        if g.chatBlackWordReg.findall(content) or checkRepeat(content):
            _extArg["senduid"] = uid
            _extArg['onlySendToSelf'] = True
            g.m.chatfun.sendMsg(content, 4, data=_fdata, **_extArg)
        else:
            _fdata.update({'m': content})
            del _fdata['lv']
            g.m.crosschatfun.chatRoom.addCrossChat({'msg':content,'mtype':mtype,'fdata':_fdata,'extarg':{}})

    # 五军聊天
    elif mtype == 5:
        _con = g.GC['five_army']['base']
        # 非挑战阶段
        if not _con['time']['not_signup'][0] <= _nt - g.C.getWeekFirstDay(_nt) <= _con['time']['not_signup'][1]:
            _res["s"] = -6
            _res["errmsg"] = g.L("chat_send_res_-6")
            return _res

        # 等级不足
        if not g.chkOpenCond(uid, 'wjzz'):
            _res['s'] = -3
            _res['errmsg'] = g.L('global_argserr')
            return _res

        # 没有报名了
        if not g.m.wjzzfun.chkUserIsSignUp(uid):
            _res['s'] = -4
            _res['errmsg'] = g.L('qxzl_signup_-2')
            return _res

        _own = g.m.wjzzfun.getUserData(uid)
        _fdata['key'] = _own['group']

        _fdata.update({'m': content})
        del _fdata['lv']
        g.m.crosschatfun.chatRoom.addCrossChat({'msg':content,'mtype':mtype,'fdata':_fdata,'extarg':{}})

    # 同省聊天
    elif mtype == 6:
        #检测更新跨服信息
        _crossServerGroupId = g.m.crosswzfun.getUGID()
        g.chkCrossServer(_crossServerGroupId)
        if g.chatBlackWordReg.findall(content) or checkRepeat(content):
            _extArg["senduid"] = uid
            _extArg['onlySendToSelf'] = True
            g.m.chatfun.sendMsg(content, mtype, data=_fdata, **_extArg)
        else:
            _fdata.update({'m': content})
            _fdata.update({"province": _province, "city": _city})
            # 缓存到跨服
            g.crossMC.set('crosscache_{}'.format(uid), g.m.crosscomfun.getCrosschatCache(uid), 3600 * 2)
            del _fdata['lv']
            g.m.crosschatfun.chatRoom.addCrossChat({'msg': content, 'mtype': mtype, 'fdata': _fdata, 'extarg': {}})

        # 私聊
    elif mtype == 7:
        _touid = str(data[2])
        # 私聊过滤黑名单
        # 判断是否被屏蔽
        listShieldFriend = g.m.friendfun.getShieldList(uid)
        if _touid in listShieldFriend:
            _res["s"] = -10
            _res["errmsg"] = g.L("friends_black_res_-1")
            return _res

        _toListShieldFriend = []
        # 如果是本服的
        if g.m.crosscomfun.chkIsThisService(_touid):
            _r = g.mdb.find1('userinfo', {'uid': _touid})
            # 获取对面玩家的屏蔽列表
            _toListShieldFriend = g.m.friendfun.getShieldList(_touid)
        else:
            _r = g.crossDB.find1('jjcdefhero', {'uid': _touid})
            _friendList = g.crossDB.find1('cross_friend', {'uid': _touid},fields=['_id','shield'])
            if _friendList:
                _toListShieldFriend = _friendList.get("shield", [])
        if not _r:
            _res['s'] = -4
            _res['errmsg'] = g.L('chatsend_res_-4')
            return _res

        if uid in _toListShieldFriend:
            _res["s"] = -10
            _res["errmsg"] = g.L("friends_black_res_-2")
            return _res


        # 参数错误无法发送
        if uid == _touid:
            _res["s"] = -5
            _res["errmsg"] = g.L("chatsend_res_-5")
            return (_res)

        _fdata.update({"touid": _touid, "myuid": uid})
        _arg = {}
        _arg["senduid"] = _touid
        if len(_extArg) > 0: _arg.update(_extArg)

        if g.chatBlackWordReg.findall(content) or checkRepeat(content):
            _extArg["senduid"] = uid
            _extArg['onlySendToSelf'] = True

        _sendMsg = g.m.chatfun.sendMsg(content, 7, data=_fdata, **_arg)
        # 如果是本服的
        if not g.m.crosscomfun.chkIsThisService(_touid):
            g.m.crosschatfun.chatRoom.addCrossChat({'msg': content, 'mtype': mtype, 'fdata': _fdata, 'extarg': {}})
        if not _extArg or (_extArg and _extArg.get('black', "0") != '1' and _sendMsg):
            g.m.chatfun.sendPrivateMsg(uid, _touid, _sendMsg)

        # 记录接收玩家接收队列
        _setData = {"t": mtype, "m": content}
        _setData.update(_fdata)

    try:
        # 加入百川检查
        g.m.baichuanapifun.addTask("msg", content)
    except:
        print "chat_send"



    # 没有被黑的聊天，加到日志内
    if 'black' not in _extArg and _showType == "":
        g.m.chatlogfun.saveLog(gud, content, mtype)
    # 记录发送时间
    conn.sess.set(g.C.STR("msgtime_{1}", mtype), _nt)

    gud['lastSendMsgTime'] = g.C.NOW()
    g.m.gud.setGud(uid, gud)
    return _res

def getContinuityRepeat(s1, s2):
    #一句话里面的"连续3个字"，与上面两条聊天里面的"连续3个字"重复，就发不出去。
    list_s1 = []
    list_s2 = []
    _checkNum = 9
    for i in xrange(len(s1)-_checkNum+1):
        list_s1.append(s1[i:i+_checkNum])
    for i in xrange(len(s2)-_checkNum+1):
        list_s2.append(s2[i:i+_checkNum])    
    
    repeat = set(list_s1) & set(list_s2)
    return len(repeat)

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
        
        #if getContinuityRepeat(_cont, content) > 0:
        #    _repeat = True
        #    break            
        
    if not _repeat:
        cache.append(content)
        g.mc.set(cachekey, cache[-10: ])    
    
    return _repeat

if __name__ == '__main__':
    uid = g.buid("lyf")

    g.debugConn.uid = uid
    print doproc(g.debugConn,["哈哈哈",4,"","","","",5,"哈哈","哈哈"])
    print g.getOpenDay()
