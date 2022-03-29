#!/usr/bin/python
# coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")
    
import g

#巅峰王者主界面信息
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

    
# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    # 获取传送过来的数据
    uid = conn.uid
    _resData = g.m.crosswzfun.getWangZheStatus(0)
    _resData['isbm'] = g.m.crosswzfun.isUserBaoming(uid)
    if (not _resData['isbm']) and _resData['status'] == 1:
        # 报名阶段告知是否设置防守阵容
        _resData['ifformat'] = 0
        if g.crossDB.count('wzbaoming', {'uid': uid}) > 1:
            _resData['ifformat'] = 1

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
        _dkey = g.m.crosswzfun.getDKey()
        _udata = g.crossDB.find1('wzfight',{'uid':uid, 'dkey': _dkey})
        if _udata:
            _resData['isjjzs'] = 1

    _resData['matchtime'] = g.m.crosswzfun.getZSSNextMatchStartTime(ifmain=True)
    _resData['iszdbm'] = int(g.m.crosswzfun.getAutoBMStatus(uid))
    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('wqew12334')
    print doproc(g.debugConn,[1])