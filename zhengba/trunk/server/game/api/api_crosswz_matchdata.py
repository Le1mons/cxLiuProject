#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者 - 钻石赛/王者赛比赛数据获取接口
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str('zuanshi', 'wangzhe'), 第一个参数是zuanshi需要第二个参数:groupid->int]
    :return:
    ::

        {'d': {'userlist':[{uid:玩家uid, headdata:{}, deep: (7-2进1 6-4进2 5-8进4。。。以此类推)}],
                'timelist': 每阶段的开始时间和结束时间,
                'nexttime':下一阶段开始的时间,
                }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s' : 1}
    uid = conn.uid
    gud = g.getGud(uid)
    mtype = str(data[0])
    if mtype == 'zuanshi':
        _groupid = int(data[1])

    # 本周活动未开启
    groupList = g.m.crosswzfun.isWangZheOpen()
    if not groupList:
        _res['s'] = -6
        _res['errmsg'] = g.L('crosswz_common_notopen')
        return _res

    # 获取自己组别
    ugid = g.m.crosswzfun.getUgid(uid)

    # 是否已开赛
    _status = g.m.crosswzfun.getWangZheStatus()
    if _status < 5:
        _res['s'] = -1
        _res['errmsg'] = g.L('crosswz_zssopen_-1')
        return _res

    _dkey = g.m.crosswzfun.getDKey()
    # 钻石赛deep值最多到4, 存的deep值最多到3
    _where = {"dkey": _dkey}
    if mtype == 'zuanshi':
        _where.update({"groupid": _groupid})
        _sort=[['groupid',1],['orderid', 1]]
    else:
        _where.update({'deep':{'$in':[4,5,6,7,8]}})
        _sort=[['random',1]]

    if ugid == 3:
        _where['$or'] = [{'ugid': {'$exists': 0}}, {'ugid': ugid}]
    else:
        _where['ugid'] = ugid
    _r = g.crossDB.find('wzfight', _where, sort=_sort, fields=['_id','uid','groupid','orderid','matchlog','deep'])
    if not _r:
        _res['s'] = -2
        _res['errmsg'] = g.L('crosswz_zssopen_-2')
        return _res

    _userlist = []
    _rawlog = {}
    _uuidlist = []
    _winlog = []
    _fightorder = []
    uidList = [t['uid'] for t in _r]
    _allUsrInfo = g.m.crosswzfun.getUserData({'$in': uidList}, ['info', 'uid'])
    uidToInfo = {t['uid']: t['info']['headdata'] for t in _allUsrInfo}
    for _user in _r:
        _userData = uidToInfo[_user['uid']]
        # 玩家信息
        _usertmp = {'uid': _user['uid']}
        _usertmp.update(_userData)
        _usertmp['deep'] = _user['deep']
        _usertmp['uid'] = _user['uid']
        _userlist.append(_usertmp)

    # 理论上每阶段的开始时间和结束时间
    _timelist = g.m.crosswzfun.getZSSNextMatchStartTime(mtype, iftimelist=True)
    _nextTime = g.m.crosswzfun.getZSSNextMatchStartTime(mtype)
    _res['d'] = {
        'userlist': _userlist,
        'timelist': _timelist,
        'nexttime': _nextTime
    }
    '''
    _retData = {
        'userlist':[
            {
                'uid': '1234',
                'deep':0,
                'orderid':1
            },
              {
                'uid': '1234',
                'deep':0,
                'orderid': 2
                
            }
        ], # 钻石赛玩家列表
        'winlog':[
            
                [
                    {'showtime':'','fid':'','winuid':''},
                    {'showtime':'','fid':'','winuid':''},
                    {'showtime':'','fid':'','winuid':''}
                ],
                [],
                [],
                []
        ], # 战斗记录
        'fightorder':[
            {'winuser':uid,'fightuser':[uid1,uid2]}
        ]
    }
    '''
    
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    _r = doproc(g.debugConn,["zuanshi",5])
    print _r
    if 'errmsg' in _r: print _r['errmsg']
    print len(_r['d']['fightorder'])
    print len(_r['d']['userlist'])
    print len(_r['d']['winlog'])
