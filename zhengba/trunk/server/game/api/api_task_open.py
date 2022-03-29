#!/usr/bin/python
# coding: utf-8
'''
成就任务——开启界面
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str("1", "2")]
    :return:
    ::

        {"d":{"tasklist": [{'taskid':任务id,'type':任务类型,'pval':目标值,'nval':当前值}]}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 任务的类型
    _type = int(data[0])
    # 如果是成就任务
    if _type == 1:
        # 不满等级要求
        if not g.chkOpenCond(uid, 'succtask'):
            _res['s'] = -1
            _res['errmsg'] = g.L('task_open_res_-1')
            return _res

        _taskList = g.m.taskfun.getUserTaskList(uid,{'type':_type},fields=['_id'])
    # 日常任务
    else:
        _taskList = g.m.taskfun.getDailyTask(uid,fields=['_id'])
        # 寻龙探宝加上额外奖励
        _jrkh = g.m.huodongfun.getHDinfoByHtype(49)
        # 夏日庆典加上额外奖励
        _jrkh2 = g.m.huodongfun.getHDinfoByHtype(75, "etime")
        _nt = g.C.NOW()
        for i in _taskList:
            if _jrkh and 'hdid' in _jrkh and  i['taskid'] in _jrkh['data']['taskprize']:
                i['prize'] += _jrkh['data']['taskprize'][i['taskid']]
            if _jrkh2 and 'hdid' in _jrkh2 and i['taskid'] == '1' and _nt < _jrkh2["rtime"]:
                i['prize'] += list(g.GC["xiariqingdian"]["taskprize"])

    if not _taskList and _type == 1:
        _taskList = []
        _con = g.GC['pre_task'][str(_type)]
        _nt = g.C.NOW()
        _ele = {'isreceive': 0, 'uid': uid, 'lasttime': _nt, 'ctime': _nt}
        for k, v in _con.items():
            # 如果是起步任务
            if not v['pretask']:
                _temp = _ele.copy()
                # _nval = g.m.taskfun.getTaskInitVal(uid, v)
                _nval = 0
                _temp.update({'taskid': v['id'], 'prize': v['prize'], 'pval': v['pval'],
                              'type': v['type'], 'stype': v['stype'],'nval':_nval})
                _taskList.append(_temp)

        g.mdb.insert('task',_taskList)
        for i in _taskList:
            i.pop('_id')

    _res['d'] = {'tasklist': _taskList}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    data = [2]
    print doproc(g.debugConn, data=data)