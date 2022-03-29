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

    if not _taskList:
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
    uid = g.buid("fcy1")
    g.debugConn.uid = uid
    data = [2]
    print doproc(g.debugConn, data=data)