# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——推荐好友
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

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

def proc(conn, data):
    """

    :param conn:
    :param data: [是否刷新:bool]
    :return:
    ::

        {'d':{"userlist":[{'headdata':{},'zhanli':玩家战力, 'guildname':公会名}]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 是否刷新
    _isref = int(data[0])
    _tuijianList = getTuijianList(uid, _isref)
    _resList = []
    for i in _tuijianList:
        _fmtDict = {}
        _fmtDict['headdata'] = g.m.userfun.getShowHead(i)
        _fmtDict['zhanli'] = g.m.zypkjjcfun.getDefendHeroZhanli(i)
        _ghData = g.m.gonghuifun.getGongHuiByUid(i)
        _fmtDict['guildname'] = _ghData['name'] if _ghData else ''
        _resList.append(_fmtDict)

    _res['d'] = {'userlist': _resList}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('jingqi_1905271749538791')
    print doproc(g.debugConn, data=[1])