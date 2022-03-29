# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
悬赏任务——接取任务
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

        {'d': {'task': {任务tid: {'ftime': 任务结束时间}}},
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
    # 接取任务的几个英雄tid
    _tidList = data[1]
    # 防止点击过快
    if g.mc.get('xstask_jiequ_{}'.format(uid)):
        _res['s'] = -20
        _res['errmsg'] = g.L('xstask_jiequ_-20')
        return _res
    g.mc.set('xstask_jiequ_{}'.format(uid), 1, 1)

    _heroList = g.m.herofun.getMyHeroList(uid,where={'_id':{'$in':map(g.mdb.toObjectId,_tidList)}})
    # 查出的数据和参数的数量不一样
    if len(_tidList) != len(_heroList):
        _res['s'] = -1
        _res['errmsg'] = g.L('xstask_jiequ_res_-1')
        return _res

    _taskInfo = g.m.xstaskfun.getTaskInfo(uid, tid)
    # 任务不存在
    if not _taskInfo:
        _res['s'] = -2
        _res['errmsg'] = g.L('xstask_jiequ_res_-2')
        return _res

    # 任务已接取
    if _taskInfo['isjiequ'] == 1:
        _res['s'] = -5
        _res['errmsg'] = g.L('xstask_jiequ_res_-5')
        return _res

    _taskId = _taskInfo['taskid']
    _con = g.GC['xstask'][_taskId]

    _need = _con['need']
    _addition = 1
    # 处在悬赏任务中
    if g.m.huodongfun.chkZCHDopen('xstask'):
        _info = g.mdb.find1('hdinfo', {'htype': 14, 'etime': {'$gte': g.C.NOW()},'data.mark':'xstask', 'stime':{'$lte': g.C.NOW()}})
        # 赏金奇兵活动存在
        if _info:
            _addition = _info['data']['addition']*0.01
            g.event.emit('zchd_redpoint', uid)

    _need = [{"a":i['a'],'t':i['t'],'n':int(i['n']*_addition)} for i in _need]
    _chkRes = g.chkDelNeed(uid, _need)
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chkRes['t']
        else:
            _res["s"] = -104
            _res[_chkRes['a']] = _chkRes['t']
        return _res

    _cond = _taskInfo['cond']
    for k,v in _cond.items():
        # 如果是星级条件
        if k == 'star':
            _starList = [i['star'] for i in _heroList if i['star'] >= v]
            # 没有一个是超过要求星级的
            if not _starList:
                _res['s'] = -3
                _res['errmsg'] = g.L('xstask_jiequ_res_-3')
                return _res

        elif k == 'zhongzu':
            _zhongzuList = [i['zhongzu'] for i in _heroList]
            _setList = set(_zhongzuList)&set(v)
            if  _setList^set(v):
                _res['s'] = -4
                _res['errmsg'] = g.L('xstask_jiequ_res_-4')
                return _res

    _sendData = g.delNeed(uid, _need, logdata={'act': 'xstask_jiequ'})
    g.sendChangeInfo(conn, _sendData)

    _w = {'uid':uid, '_id': g.mdb.toObjectId(tid)}
    #_taskCon = g.m.xstaskfun.getXstaskCon(_taskId)
    _dotime = _con['dotime']
    # 结束时间  未来时间戳
    _ftime = _dotime + g.C.NOW()
    _data = {'isjiequ':1, 'ftime': _ftime, 'herolist': _tidList}
    g.mdb.update('xstask', _w, _data)

    _res['d'] = {'task': {tid: {'ftime': _ftime}}}
    return _res



if __name__ == '__main__':
    uid = g.buid("8")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["5b2da991c0911a1f786e0b24",["5b2c5aedc0911a3074cf21a6","5b2b58d8c0911a1728ff8189","5b2b58d8c0911a1728ff8189"]]
)
