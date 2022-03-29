#!/usr/bin/python
# coding: utf-8
'''
成就任务——领取
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 任务类型
    _type = str(data[0])
    # 任务的id
    _taskId = data[1]
    _taskInfo = g.m.taskfun.getUserTaskInfo(uid, _taskId)
    # 任务为完成
    if _taskInfo and _taskInfo['pval'] > _taskInfo['nval']:
        _res['s'] = -1
        _res['errmsg'] = g.L('task_lingqu_res_-1')
        return _res

    # 任务已领取
    if _taskInfo and _taskInfo['isreceive'] == 1:
        _res['s'] = -4
        _res['errmsg'] = g.L('task_lingqu_res_-4')
        return _res

    # 任务不存在
    if not _taskInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('task_lingqu_res_-1')
        return _res

    _con = g.m.taskfun.getTaskConByType(_type,_taskId)
    _follow = _con['followtask']
    # 如果存在后续任务  删除有后续的成就任务
    if _follow and _type != '2':
        _nval = _taskInfo['nval']
        g.m.taskfun.setTaskInfo(uid, _type, [_follow], data={'nval': _nval})
        g.mdb.delete('task',{'uid':uid,'taskid':_taskId})
    else:
        g.mdb.update('task', {'uid': uid, 'taskid': _taskId},{'isreceive': 1})

    _con = g.m.taskfun.getTaskConByType(_type, _taskId)
    _prize = list(_con['prize'])

    # 监听日常完成次数
    if _type == '2':
        _nval = g.mdb.count('task',{'type':2,'isreceive': 1,'uid':uid,'stype':{'$ne':1}})
        # if _nval >= 10:
        #     # 通知前端显示红点
        #     g.m.mymq.sendAPI(uid, "task_redpoint", '1')
        g.mdb.update('task', {'uid': uid, 'stype': 1},{'nval': _nval})
        # 神器任务
        g.event.emit('artifact', uid, 'richangtask')
        # 团队任务 完成日常任务
        g.m.teamtaskfun.setTeamTaskVal(uid, '2')
    else:
        # 增加成就点
        _prize.append({'a':'attr','t':'success','n':10})

    _sendData = g.getPrizeRes(uid, _prize, act={'act':'task_receive','prize':_prize})
    g.sendChangeInfo(conn, _sendData)
    _prize = [i for i in _prize if i['t'] != 'success']
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("jingqi_1809191817135030")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2,'4'])
    # _nval = g.mdb.count('task', {'type': 2, 'isreceive': 1, 'uid': uid, 'taskid': {'$ne': '1'}})