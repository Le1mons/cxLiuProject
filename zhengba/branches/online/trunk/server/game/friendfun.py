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
    _friends , _shield, _apply = [], [], []
    if _data:
        _friends = _data.get('friend', [])
        _shield = _data.get('shield', [])
        _apply = _data.get('apply', [])

    if not _data or 'tuijian' not in _data or isref:

        gud = g.getGud(uid)
        _lv = gud['lv']

        _tuijianNum = g.GC['friend']['base']['tuijiannum']
        _resList = []
        _black = [uid] + _friends + _shield + _apply
        for i in xrange(2):
            _w = {"$gte": _lv - 10}
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
def getApplyList(uid):
    _data = g.mdb.find1('friend',{'uid': uid})
    if not _data or 'apply' not in _data:
        _res = []
    else:
        _res = _data['apply']
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

g.event.on('addfriend', onAddFriend)

if __name__ == '__main__':
    uid = g.buid("1")