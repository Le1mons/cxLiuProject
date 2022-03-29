#!/usr/bin/python
# coding:utf-8

'''
邮件相关方法
'''
import g


# 获得所有邮件列表
# etype 1为系统邮件 2为工会邮件 3为私人邮件(取消)

#获取邮件
def getEmailList(uid, keys='',where=None, siliao=0,**kwargs):
    # 获得关于我的或者全服邮件(SYSTEM)
    _nt = g.C.NOW()
    if not siliao:
        _where = {"uid": {"$in": [uid, "SYSTEM"]}, 'passtime': {'$gte': _nt}}
    else:
        _where = {"$or": [{"uid": uid}, {"senduid": uid}], 'passtime': {'$gte': _nt}, 'etype': 3}
    gud = g.getGud(uid)
    # 有势力还要带上势力邮件
    # if len(gud["slid"]) > 0:
    #     _where["$or"].append({"slid": gud["slid"]})

    if where != None:
        _where.update(where)

    _options = {}
    if keys != '':
        _options = {"fields": {}}
        if not isinstance(keys, dict):
            _tmplist = keys.split(",")
            for ele in _tmplist: _options["fields"][ele] = 1
        else:
            _options["fields"].update(keys)
    else:
        _options = {"fields": {"ttltime": 0}}

    _options.update(kwargs)
    _emailList = g.mdb.find("email", _where, **_options)
    _emailList = filterSysEmailList(uid, _emailList)[0:50]
    return (_emailList)


# 获得所有邮件单独信息
def getEmailInfo(eid, keys='', where=None):
    _options = {}
    if keys != '':
        _options["fields"] = keys.split(",")

    _w = {"_id": g.mdb.toObjectId(eid)}
    if where != None:
        _w.update(where)

    _emailInfo = g.mdb.find1("email", _w, **_options)
    return (_emailInfo)


# 设置邮件信息
def setEmailInfo(eid, data, where=None):
    _w = {"_id": g.mdb.toObjectId(eid)}
    if where != None:
        _w.update(where)

    _r = g.mdb.update("email", _w, data)
    return (_r)


# 发送邮件
# 全服邮件 uid 请传SYSTEM
def sendEmail(uid, etype, title, content, prize=None, data=None):
    _data = {}
    # 接收人(SYSTEM 时接收人为全服人员)
    _data["uid"] = uid
    # 邮件标题
    _data["title"] = title
    # 邮件内容
    _data["content"] = content
    # 邮件是否已阅读
    _nt = g.C.NOW()
    _data["isread"] = 0
    _data['ctime'] = _nt  # g.C.NOW()
    _data['etype'] = etype
    _data['ttltime'] = g.C.TTL()
    # _data['']

    if 'passtime' not in _data: _data['passtime'] = _nt + 15 * 24 * 3600  # 邮件默认15天过期时间
    if prize != None:
        _tmpPrize = []
        if isinstance(prize, dict):
            _tmpPrize.append(prize)
        else:
            _tmpPrize = prize

        _data["prize"] = _tmpPrize
        # 未领取奖励
        _data["getprize"] = 0

    if data != None:
        _data.update(data)

    _eid = g.mdb.insert("email", _data)
    return (_eid)


# 依据uid列表批量发送邮件
def sendEmails(uidlist, etype, title, content, prize=None, data=None):
    if not isinstance(uidlist, list):
        uidlist = [uidlist]
    _emailList = []
    for uid in uidlist:
        _data = {}
        # 接收人(SYSTEM 时接收人为全服人员)
        _data["uid"] = uid
        # 邮件标题
        _data["title"] = title
        # 邮件内容
        _data["content"] = content
        # 邮件是否已阅读
        _nt = g.C.NOW()
        _data["isread"] = 0
        _data['ctime'] = _nt  # g.C.NOW()
        _data['etype'] = etype
        _data['ttltime'] = g.C.TTL()
        if 'passtime' not in _data: _data['passtime'] = _nt + 15 * 24 * 3600  # 邮件默认15天过期时间

        if prize != None:
            _tmpPrize = []
            if isinstance(prize, dict):
                _tmpPrize.append(prize)
            else:
                _tmpPrize = prize

            _data["prize"] = _tmpPrize
            # 未领取奖励
            _data["getprize"] = 0
        if data != None:
            _data.update(data)
        _emailList.append(_data)
    # 发送邮件
    _eid = g.mdb.insert("email", _emailList)
    return _eid


# 发送系统邮件
def sendXitongEmail(title, content, uid=None, prize=None, data=None, **kwargs):
    # 不传uid则默认为全服邮件
    if uid == None: uid = "SYSTEM"
    if data:
        kwargs.update(data)
    _eid = sendEmail(uid, 1, title, content, prize, kwargs)
    return (_eid)


# 发送战报邮件
def sendZhanbaoEmail(title, content, uid=None, prize=None):
    # 不传uid则默认为全服邮件
    if uid == None: uid = "SYSTEM"
    _eid = sendEmail(uid, 2, title, content, prize)
    return (_eid)


# 发送私人邮件
# senduid 为发送者的uid
# touid 为接受者uid
def sendGerenEmail(senduid, touid, title, content):
    _eid = sendEmail(touid, 3, title, content, data={"senduid": senduid})
    setSendEmailNum(senduid, 3, num=1)
    return (_eid)


# 发送势力邮件(全体邮件)
def sendShiliEmail(uid, sid, title, content):
    _eid = sendEmail(uid, 4, title, content, data={"slid": sid, 'rlist': [], 'needlv': 0})
    return (_eid)


# 通知新邮件到达
def sendNewEmailMsg(uids, etype):
    # 通知新邮件到达
    for i in uids:
        g.m.mymq.sendAPI(i, "newemail", str(etype))


'''
    检查单个系统邮件是否显示
'''


def filterSysEmailList(uid, emaillist):
    _newEmailList = []
    _nt = g.C.NOW()
    gud = g.getGud(uid)
    for ele in emaillist:
        # if ele['uid']!='SYSTEM':
        #     _newEmailList.append(ele)
        #     continue

        '''
            系统邮件是否显示的条件
        '''
        if ifSysEmailValid(uid, ele):
            _newEmailList.append(ele)

    return _newEmailList


'''
    检查单个系统邮件是否有效
    0 无效
    1 有效
'''


def ifSysEmailValid(uid, email):
    _retVal = 1
    _nt = g.C.NOW()
    gud = g.getGud(uid)
    # 是否达到等级要求
    if "needlv" in email:
        if isinstance(email['needlv'], list) or isinstance(email['needlv'], tuple):
            # print 'here'
            if gud['lv'] < email['needlv'][0] or gud['lv'] > email['needlv'][1]:
                _retVal = 0

        else:
            if gud['lv'] < email['needlv']:
                _retVal = 0

    # 加入区服的判断
    if 'sid' in email and gud['sid'] != email['sid']: _retVal = 0

    # 是否已删除
    if "dlist" in email and uid in email['dlist']: _retVal = 0
    # 是否已过期
    if "passtime" in email and _nt > email['passtime']: _retVal = 0
    # 是否本势力邮件
    if "slid" in email and gud["slid"] != email['slid']: _retVal = 0



    return _retVal


# 上次邮件获取检测时间
def getLastChkTime(uid):
    _value = 0
    _r = g.getAttr(uid, {'ctype': 'last_email_chk_time'})
    if _r:
        _value = int(_r[0]['v'])

    return _value


# 设置邮件检测时间
def setLastChkTime(uid):
    _nt = g.C.NOW()
    _r = g.setAttr(uid, {'ctype': 'last_email_chk_time'}, {'v': _nt})
    return

#获取当天对应种类发送邮件的数量
def getSendEmailNum(uid,etype):
    _ctype = 'email_sendnum'
    _where = {'k':str(etype)}
    return g.getPlayAttrDataNum(uid,_ctype,_where)

#设置当天对应种类发送邮件的数量
def setSendEmailNum(uid,etype,num=1):
    _ctype = 'email_sendnum'
    _where = {'k':str(etype)}
    return g.setPlayAttrDataNum(uid,_ctype,num,_where)


if __name__ == "__main__":
    uid = g.buid('xuzhao')
    # g.m.herofun.addHero(uid,'25075')
    # print getSendEmailNum(uid,1)
    # print g.mdb.find1('shipin',{'num':int(9999999999999999999)})
    '''
    uid = '220_5a2fdc04c806eb7fd6c92981'
    print getEmailList(uid,
                       "uid,etype,ctime,isread,title,content,prize,rlist,plist,getprize,dlist,needlv,passtime,slid",
                       sort=[["ctime", -1]], limit=100)
    '''
    sendXitongEmail('系统邮件','',data={'a':123},passtime=456)