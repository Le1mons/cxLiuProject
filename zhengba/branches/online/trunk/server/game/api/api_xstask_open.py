# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
悬赏任务——开启
'''

import sys

if __name__ == "__main__":
    sys.path.append("game")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _taskList = g.m.xstaskfun.getMyTaskList(uid)
    if not _taskList:
        _isfirst = g.m.xstaskfun.isFirst(uid)
        # 如果是第一次打开界面
        if _isfirst:
            _taskList = g.m.xstaskfun.createTask(uid)

    _data = g.mdb.find('xstask',{'uid':uid,'herolist':{'$exists':1}})
    _heroList = []
    for i in _data:
        _heroList += i['herolist']

    for i in _taskList:
        i['_id'] = str(i['_id'])

    # 特权礼包
    _adventureLB = 1 if g.m.chongzhihdfun.isTeQuan(uid, 2) else 0
    _heroLB = 1 if g.m.chongzhihdfun.isTeQuan(uid, 3) else 0

    _freeNum = g.m.xstaskfun.getCanRefNum(uid)

    # 处在悬赏任务中
    _addition = 0
    if g.m.huodongfun.chkZCHDopen('xstask'):
        _info = g.mdb.find1('hdinfo', {'htype': 14, 'etime': {'$gte': g.C.NOW()},'data.mark':'xstask', 'stime':{'$lte': g.C.NOW()}})
        # 赏金奇兵活动存在
        if _info:
            _addition = _info['data']['addition']

    _res['d'] = {'task': _taskList,'freenum': _freeNum,'herolist':_heroList,'adventure':_adventureLB,'hero':_heroLB,'iszchd':_addition}
    return _res


if __name__ == '__main__':
    uid = g.buid("ui")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b150947c0911a25b024150c'])
    '0_5aea81d0625aee4a04a0146d'