#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者 - 主界面信息
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")
    
import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'isbm':是否报名,
                'status': 当前状态,
                'ifformat':报名阶段告知是否设置防守阵容,
                'ugid': 处于那一组,
                'isyz': 是否押注了,
                'ldpknum': 乱斗挑战次数,
                'isjjzs': 是否晋级钻石,
                'matchtime': 下次钻石匹配的时间,
                'iszdbm': 是否自动报名
                }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

    
# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 获取传送过来的数据
    uid = conn.uid
    # 获取本地玩家数据
    gud = g.getGud(uid)
    # 验证报名条件
    con = g.GC['crosswz']
    # 时间限制 2019.6.5之后开的区并且小于22天
    if g.getOpenDay() < 24:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 24 - g.getOpenDay())
        return _res

    if gud['lv'] < con['bmneed']['lv']:
        # 等级不足
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_baoming_-2', 24 - g.getOpenDay() if g.getOpenDay() < 24 else 0)
        return _res

    _dkey = g.m.crosswzfun.getDKey()
    _resData = g.m.crosswzfun.getWangZheStatus(0, g.m.crosswzfun.getUgid(uid))
    _own = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _dkey},fields=['ugid','_id'])
    _resData['isbm'] = bool(_own is not None)
    if (not _resData['isbm']) and _resData['status'] == 1:
        # 报名阶段告知是否设置防守阵容
        _resData['ifformat'] = 0
        if g.crossDB.count('wzbaoming', {'uid': uid}) > 1:
            _resData['ifformat'] = 1

    if not _own:
        # 本周分组
        # 获取一个虚假的分组
        groupList = g.m.crosswzfun.getFalseGroup()
        openDay = g.m.crosswzfun.getDOpenDay(uid=uid)
        # _resData['ugid'] = groupList[g.m.crosswzfun.getGroupIdx(openDay)]
    else:
        _resData['ugid'] = _own['ugid']

    if _resData['status'] == 6:
        _resData['isyz'] = 0
        if g.m.crosswzfun.getMyGuessName(uid):
            #是否押注
            _resData['isyz'] = 1

    if _resData['status'] == 3:
        #大乱斗挑战次数
        _resData['ldpknum'] = g.m.crosswzfun.getRemainDldNum(uid)

    if _resData['status'] > 4:
        #是否晋级
        _udata = g.crossDB.find1('wzfight',{'uid':uid, 'dkey': _dkey})
        if _udata:
            _resData['isjjzs'] = 1

    _resData['matchtime'] = g.m.crosswzfun.getZSSNextMatchStartTime(ifmain=True)
    _resData['iszdbm'] = int(g.m.crosswzfun.getAutoBMStatus(uid))
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('jingqi_2007102056388644')
    print doproc(g.debugConn,[1])