# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
悬赏任务——领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务tid:str, [接取任务的英雄tid:str]]
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
    # 任务的tid
    tid = data[0]
    # 是否加速
    _isJiasu = data[1]
    _taskInfo = g.m.xstaskfun.getTaskInfo(uid, tid)
    # 任务不存在
    if not _taskInfo:
        _res['s'] = -2
        _res['errmsg'] = g.L('xstask_lingqu_res_-2')
        return _res

    # 必须先接取任务
    if not _taskInfo['isjiequ']:
        _res['s'] = -3
        _res['errmsg'] = g.L('xstask_lingqu_res_-3')
        return _res

    _sendData = {}
    _nt = g.C.NOW()
    _ftime = _taskInfo.get('ftime')
    # 还处于cd时间内
    if _ftime and _nt < _ftime:
        # 如果不需要加速
        if not _isJiasu:
            _res['s'] = -1
            _res['errmsg'] = g.L('xstask_lingqu_res_-1')
            return _res

        _jiasuCon = g.GC['xstaskcom']['jiasuneed']
        _cdTime = (_ftime - _nt) / 3600.0
        _need = []

        for i in _jiasuCon:
            _timeCon = i.split('_')
            # 如果在其中一起时间区间内
            if int(_timeCon[0]) <= _cdTime and int(_timeCon[1]) > _cdTime:
                _need = _jiasuCon[i]
                break

        _chk = g.chkDelNeed(uid, _need)

        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _delData = g.delNeed(uid, _need, issend=False, logdata={'act': 'xstask_lingqu'})
        _sendData.update(_delData)

    # 删除任务
    _w = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    g.mdb.delete('xstask', _w)

    _prize = _taskInfo['prize']
    _prizeData = g.getPrizeRes(uid, _prize, act={'act':'xstask_lingqu','prize':_prize,'jiasu':_isJiasu})

    for i in _prizeData:
        if i in _sendData:
            _sendData[i].update(_prizeData[i])
        elif _prizeData[i]:
            _sendData[i] = _prizeData[i]

    # 十字军活动
    if g.m.huodongfun.chkZCHDopen('xstask'):
        g.m.huodongfun.setZCHDval(uid,'xstask')

    g.sendChangeInfo(conn, _sendData)
    # 监听悬赏任务完成
    g.event.emit('dailytask', uid, 7)
    # 监听悬赏任务成就
    _color = int(_taskInfo['color'])
    g.event.emit("Xstask", uid, _color)
    # g.m.taskfun.chkTaskHDisSend(uid)
    # 神器任务
    g.event.emit('artifact', uid, 'xuanshang')

    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "110")

    # 英雄人气冲榜
    g.event.emit('herohottask', uid, '3')
    # 龙舟活动监听
    g.event.emit('longzhou', uid, "3")

    # 圣诞活动
    g.event.emit('shengdan', uid, {'task': ['5001', '5002', '5003', '5004']})
    if _color >= 4:
        g.event.emit('shengdan', uid, {'liwu': ['5']})

    # 开服狂欢活动
    if _color >= 1:
        g.event.emit('kfkh',uid,17,4,cond=_color)

    # 新年任务
    if _color >= g.GC['newyear_task']['data']['4']['cond'][0]:
        g.event.emit('newyear_task', uid, '4')

    # 战旗任务
    _id = ['302']
    if _color >= 4:
        _id.append('201')
        _id.append('303')
    g.event.emit("FlagTask", uid, _id)
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '1')

    _res['d'] = _prize
    return _res


if __name__ == '__main__':
    uid = g.buid("15")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5b28b463e138232ccd62a170", 1])
    g.mdb.update('xstask', {'color': {'$exists': 0}}, {'color': 1})
