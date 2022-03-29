# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
悬赏任务——一键领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'prize': []},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 等级不足
    if not g.chkOpenCond(uid, 'xstask'):
        _res['s'] = -1
        _res['errmsg'] = g.L('xstask_open_res_-1')
        return _res

    _tasks = g.mdb.find('xstask',{'uid':uid,'ftime':{'$lte':g.C.NOW()}},fields=['taskid'])
    # 任务不存在
    if not _tasks:
        _res['s'] = -2
        _res['errmsg'] = g.L('xstask_lingqu_res_-2')
        return _res

    # 删除任务
    g.mdb.delete('xstask', {'uid': uid, '_id': {'$in': map(lambda x:x['_id'], _tasks)}})

    # 战旗任务
    _id = ['302']
    _prize = []
    _con = g.GC['xstask']
    for i in _tasks:
        _prize += _con[i['taskid']]['prize']
        # 监听悬赏任务成就
        _color = int(_con[i['taskid']]['color'])
        g.event.emit("Xstask", uid, _color)

        # 开服狂欢活动
        if _color >= 1:
            g.event.emit('kfkh', uid, 17, 4, cond=_color)
        if _color >= 4 and len(_id) == 1:
            _id.append('201')
            _id.append('303')
        # 圣诞活动
        g.event.emit('shengdan', uid, {'task': ['5001', '5002', '5003', '5004']})
        if _color >= 4:
            g.event.emit('shengdan', uid, {'liwu': ['5']})

        # 新年任务
        if _color >= g.GC['newyear_task']['data']['4']['cond'][0]:
            g.event.emit('newyear_task', uid, '4')

    _prize = g.fmtPrizeList(_prize)
    _prizeData = g.getPrizeRes(uid, _prize, act={'act':'xstask_yjlingqu','id':map(lambda x:x['taskid'], _tasks)})

    _val = len(_tasks)
    # 十字军活动
    if g.m.huodongfun.chkZCHDopen('xstask'):
        g.m.huodongfun.setZCHDval(uid,'xstask',val=_val)

    g.sendChangeInfo(conn, _prizeData)
    # 监听悬赏任务完成
    g.event.emit('dailytask', uid, 7, val=_val)

    # 神器任务
    g.event.emit('artifact', uid, 'xuanshang', val=_val)
    # 通知三国狂欢
    g.m.huodongfun.event(uid, 'sanguokuanghuan', "task", "101", _val)
    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "110", _val)
    # 战旗任务
    g.event.emit("FlagTask", uid, _id, val=_val)
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '1', val=_val)

    # 英雄人气冲榜
    g.event.emit('herohottask', uid, '3',val=_val)
    # 龙舟活动监听
    g.event.emit('longzhou', uid, "3",val=_val)
    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    uid = g.buid("lcx4")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5ceb8abf9dc6d65c9ceb3f60", 1])