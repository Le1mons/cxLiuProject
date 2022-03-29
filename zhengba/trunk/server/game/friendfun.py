#!/usr/bin/python
#coding:utf-8

'''
好友管理模块
'''
import g

# 获取体力数量
def getTiliNum(uid, getcd=0, isset=0):
    _key = 'friend_tili'
    _where = {'ctype': _key}
    _con = g.GC['friend']['base']
    _maxNum = getMaxTiliNum()
    _cdSize = _con['tilicd']
    _data = g.getAttrOne(uid, _where)
    if not _data:
        # 初始数据
        _num = _maxNum
        _freeTime = 0
    else:
        # 当前数据，且计算cd增加数量
        _num = _data['v']
        _freeTime = _data['freetime']
        _nt = g.C.NOW()
        if _freeTime == 0:  _freeTime = _nt
        if _num < _maxNum:
            _defTime = _nt - _freeTime
            if _defTime >= _cdSize:
                _tmp = divmod(_defTime, _cdSize)
                _addNum = _tmp[0]
                _num = _num+ _addNum if _num+_addNum<_maxNum else _maxNum
                _freeTime += _addNum * _cdSize

    # 写入数据
    if isset:
        g.setAttr(uid, _where, {'v': _num, 'freetime': _freeTime})

    _res = _num
    if getcd:
        # 修正数据
        if _num >= _maxNum:
            _freeTime = 0
        else:
            _freeTime += _cdSize
        # 需要cd的返回格式
        _res = {'freetime': _freeTime, 'num': _num}

    return _res

# 体力变化
def setTiliNum(uid, addnum, ischk=0):
    _data = getTiliNum(uid, 1, 1)
    _num = _data['num']
    _cd = _data['freetime']
    _cdSize = g.GC['friend']['base']['tilicd']
    _maxLDNum = getMaxTiliNum()
    _resNum = _num + addnum
    if ischk and (_resNum < 0 or (_num >= _maxLDNum and addnum <= 0)):
        # 不可为负数
        return

    _res = {'num': _resNum, 'freetime': _cd}
    if _resNum >= _maxLDNum:  _res['freetime'] = 0
    _setData = {}
    _setData['v'] = _resNum
    if _cd == 0 and _resNum < _maxLDNum:
        _nt = g.C.NOW()
        _setData['freetime'] = _nt
        _res['freetime'] = _nt + _cdSize

    _key = 'friend_tili'
    g.setAttr(uid, {'ctype': _key}, _setData)
    return _res

# 获取最大体力数量
def getMaxTiliNum():
    _num = g.GC['friend']['base']['tilimaxnum']
    return _num

# 获取好友列表
def getFriendList(uid):
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data or 'friend' not in _data:
        _res = []
    else:
        _res = _data['friend']
    return _res


# 屏蔽列表
def getShieldList(uid):
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data or 'shield' not in _data:
        _res = []
    else:
        _res = _data['shield']
    return _res

# 推荐列表
def getTuijianList(uid, isref=False):
    _data = g.mdb.find1('friend',{'uid': uid})
    _friends , _shield, _apply, _tuijian = [], [], [], []
    if _data:
        _friends = _data.get('friend', [])
        _shield = _data.get('shield', [])
        _apply = _data.get('apply', [])
        _tuijian = _data.get('tuijian', [])
    _isapply = g.getAttrByCtype(uid, 'friend_isapply', default=[])

    if not _data or 'tuijian' not in _data or isref:
        # 优先从上面列表推送10个玩家给当前玩家申请好友；
        # 若数量不足10个，则随机5级以上玩家；若任然不足，则有多个玩家随机多少个玩家推送
        _tuijianNum = g.GC['friend']['base']['tuijiannum']
        _w = {"$gte": g.getGud(uid)['lv'] - 10}
        _resList = []
        _black = [uid] + _friends + _shield + _apply + _tuijian + _isapply
        _users = g.m.devilfun.GATTR.getOne({'ctype': 'friends','uid':'SYSTEM'}) or {'v': []}
        _resList += map(lambda x:x['uid'], g.mdb.find('userinfo',{'uid':{'$in':list(set(_users['v'])-set(_black))},'lv':_w},fields=['_id','uid'],limit=_tuijianNum))

        if len(_resList) < _tuijianNum:
            for i in xrange(2):
                # 第一次不足10个的话
                if i == 1: _w = {"$gte": 5}
                _temp = g.mdb.find('userinfo', {'lv': _w, "uid": {"$nin": _black}})
                _userList = g.C.RANDLIST(_temp, _tuijianNum - len(_resList))
                _resList += map(lambda x:x['uid'], _userList)
                _black += _resList
                if len(_resList) >= _tuijianNum:
                    break

        # 添加到数据库
        g.mdb.update('friend',{'uid':uid},{'tuijian':_resList},upsert=True)

    else:
        _resList = _data['tuijian']
    return _resList

# 根据等级和伤害获取积分
def getJifen(dps, lv):
    if lv >= 40:
        k = 1000
    elif lv >= 60:
        k = 750
    elif lv >= 90:
        k = 560
    elif lv >= 120 or lv >= 130 or lv >= 140:
        k = 300
    elif lv >= 160:
        k = 220
    elif lv >= 250:
        k = 160
    else:
        k = 120
    return int(dps) / lv

# 获取可以接受的印记列表
def getCanReceiveYinji(uid):
    _ctype = 'friend_canreceive'
    _yinjiInfo = g.getAttrOne(uid,{'ctype': _ctype})
    if not _yinjiInfo:
        _res = []
    else:
        _res = list(set(_yinjiInfo.get('v',[])))

    # 加上跨服的
    _crossRes = g.m.crosscomfun.CATTR().getAttrOne(uid, {'ctype': 'friend_canreceive'})
    if _crossRes:
        _res += _crossRes.get('v', [])
        g.setAttr(uid, {'ctype': _ctype},{'$push':{'v':{'$each':_crossRes.get('v', [])}}})
        g.crossDB.delete('crossplayattr', {'uid': uid, 'ctype': 'friend_canreceive'})

    return _res

# 获取每天的赠送列表
def getGiftAndAccept(uid):
    _res = {'gift':[],'accept':[]}
    _giftInfo = g.getAttrByDate(uid, {'ctype': 'friend_yinji'})
    if _giftInfo:
        _res['gift'] = _giftInfo[0].get('giftlist',[])
        _res['accept'] = _giftInfo[0].get('v',[])

    return _res

# 获取申请列表
def getApplyList(uid, cross=True):
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data or 'apply' not in _data:
        _res = []
    else:
        _res = _data['apply']

    # 加上跨服的
    if cross:
        _crossApply = g.crossDB.find1('cross_friend',{'uid':uid},fields=['_id','apply'])
        if _crossApply:
            _res += _crossApply['apply']

    return _res

# 获取玩家boss数据
def getBossData(uid):
    _data = g.mdb.find1('friend', {'uid': uid})
    _res = None
    if _data and 'treasure' in _data and 'boss' in _data['treasure']:
        _res = _data['treasure']['boss']
    return _res



#发送每周奖励的事件
def timer_sendWeekPrize():
    #获取积分排行
    _nt = g.C.NOW() - 24*60*60
    _dKey = g.C.getWeekNumByTime(_nt)
    _allUser = g.mdb.find('playattr',{'ctype':'friend_jifen','k':_dKey},sort=[['v',-1]],fields=['_id','uid'])
    #循环发奖
    _con = g.GC['friend']['base']['email']
    _title = _con['title']
    _emailList = []
    for idx,i in enumerate(_allUser):
        _uid,_rank = i['uid'], idx + 1
        _prize = getPrizeByRank(_rank)
        _content = g.C.STR(_con['content'], _rank)
        _emailList.append({_uid: _prize})
        g.m.emailfun.sendEmail(_uid,1,_title,_content,_prize)
    return _emailList

# 根据排名获取奖励
def getPrizeByRank(rank):
    _con = g.GC['friend']['base']['weekprize']['prize']
    if rank >= _con[-1][0][-1]: return _con[-1][1]
    for i in _con:
        _min,_max = i[0]
        if _min <= rank <= _max:
            return i[-1]

# 监听添加好友事件
def onAddFriend(uid):
    g.m.mymq.sendAPI(uid, "addfriend", '1')

# 获得击杀boss的奖励
def getBossPrize(lv, con, elite=0):
    _prize, _killPrize = [], []
    _con = con['elite'] if elite else con['common']
    for i in _con:
        _min, _max = i.split('_')
        if int(_min) <= lv <= int(_max):
            _prize = _con[i]['prize']
            _killPrize = _con[i]['killprize']
            break

    return _prize, _killPrize

# 判断好友数量
def chkFriendNum(uid):
    _num = len(getFriendList(uid))
    g.mdb.update('userinfo', {'uid':uid}, {'friendnum': _num})
    g.m.devilfun.GATTR.setAttr("SYSTEM", {'ctype': 'friends'}, {'$addToSet': {'v': uid}})

# 获取跨服headdata
def getCrossHead(uid):
    _head = g.m.userfun.getShowHead(uid)
    _defHero = g.m.zypkjjcfun.getDefendHero(uid)
    _sq = _defHero.pop('sqid', None)
    # 如果有宠物
    _pets = []
    if 'pet' in _defHero:
        _pets += g.m.petfun.gtPetFight(uid,0, _defHero.pop('pet'))

    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': map(g.mdb.toObjectId, _defHero.values())}})
    _heros = []
    for i in _heroList:
        for pos in _defHero:
            if str(i['_id']) == _defHero[pos]:
                del i['_id']
                i['pos'] = pos
                _heros.append(i)
                break
    if _sq:
        _heros.append({'sqid': _sq})
    _heros += _pets
    _gud = g.getGud(uid)
    _head.update({'defhero': [_heros],'svrname':g.m.crosscomfun.getSNameBySid(_gud["sid"]),'zhanli':_gud['maxzhanli']})
    return _head

# 上传自己的登录时间 并且检测自己的好友最后时间
def uploadLoginTime(uid,upload=False):
    # 今天没有上传过
    if not upload and g.getAttrByDate(uid, {'ctype':'friend_uploadlogintime'}):
        return
    defhero = g.m.crosscomfun.getCrosschatCache(uid)
    _head = g.m.userfun.getShowHead(uid)
    _head['zhanli'] = _head.pop('maxzhanli', 0)
    _head['defhero'] = [defhero]
    _head['svrname'] = g.m.crosscomfun.getSNameBySid(g.getSvrIndex())
    _set = {'logintime': g.C.NOW(), 'ttltime': g.C.TTL(), 'head':_head}
    _set['sid'] = g.getSvrIndex()
    g.crossDB.update('cross_friend',{'uid': uid}, _set,upsert=True)
    g.setAttr(uid, {'ctype': 'friend_uploadlogintime'}, {'v': 1})

# 获取随机的探宝信息
def getTreasureData(uid):
    _con = g.GC['friend']['base']
    _res = list(_con['treasure'])
    _data = g.getAttrByCtype(uid, 'treasure_random', bydate=False, default=[])
    # 前三次不管
    if len(_data) <= 3:
        return _res

    _data = _data[-3:]
    # 最近三次有三次
    if _data.count(1) == 3:
        _isBoss = 0
        _isNotBoss = 100
    # 最近三次有2次
    elif _data.count(1) == 2:
        _isBoss = 15
        _isNotBoss = 85
    # 最近三次有1次
    elif _data.count(1) == 1:
        _isBoss = 40
        _isNotBoss = 60
    else:
        _isBoss = 100
        _isNotBoss = 0

    for i in _res:
        if i['isboss']:
            i['p'] = _isBoss
        else:
            i['p'] = _isNotBoss

    return _res






g.event.on('addfriend', onAddFriend)

if __name__ == '__main__':
    for i in g.crossDB.find('wzbaoming',{'dkey':'2020-42'},fields=['uid']):
        g.crossDB.update('wzbaoming', {'_id':i['_id']},{'sid': int(i['uid'].split('_')[0])})