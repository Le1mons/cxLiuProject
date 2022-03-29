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
    """

    :param conn:
    :param data: [任务类型:str('1','2'), 任务id:str]
    :return:
    ::

        {"d":{"prize": []}
        's': 1}

    """
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
        # 战旗任务
        _id = ['203']
        _wzType = "103"
        # 日常的终极任务
        if _taskId == '1':
            _id.append('104')
            # 节日狂欢
            g.event.emit('jierikuanghuan', uid, '8')
            # # 推送爵位红点
            # _hd = g.m.titlefun.getHongDian(uid)
            g.m.mymq.sendAPI(uid, 'title_redpoint', "1")
            _wzType = '112'
            # # 周年庆
            # g.event.emit('ANNIVERSARY', uid, '4')
            # # 中秋节
            # g.event.emit('MID_AUTUMN', uid, '4')
            # # 中秋节2
            # g.event.emit('midautumn2', uid, '2')
            # # 双11
            # g.event.emit('DOUBLE_11', uid, '2')
            # 英雄人气冲榜
            g.event.emit('herohottask', uid, '2')
            # # 植树节活动
            # g.event.emit('planttreeshd', uid, '4')
            # # 扭蛋活动监听
            # g.event.emit('niandanhd', uid, "2")
            # # 51活动
            # g.event.emit("labour", uid, "3")
            # 龙舟活动监听
            g.event.emit('longzhou', uid, "2")
            g.event.emit('qixihd', uid, "2")
            g.event.emit('zhounian3', uid, "2")


            g.event.emit('yuanxiao3', uid, "1")
            # 圣诞活动
            g.event.emit('shengdan', uid, {'task': ['1001']})

            g.m.huodongfun.event(uid, 'heropreheat', "2")
            g.event.emit('herotheme', uid, "2")
            # 夏日庆典加上额外奖励
            _jrkh = g.m.huodongfun.getHDinfoByHtype(75, "etime")
            if _jrkh and 'hdid' in _jrkh and g.C.NOW() < _jrkh["rtime"]:
                _prize += list(g.GC["xiariqingdian"]["taskprize"])

        # 王者招募任务监听
        g.event.emit("wzzmtask", uid, _wzType)

        # 节日狂欢加上额外奖励
        _jrkh = g.m.jierikuanghuan_44.getHDinfoByHtype(44)
        if _jrkh and 'hdid' in _jrkh and _taskInfo['stype'] == 1:
            _prize += _jrkh['data']['taskprize']

        # 钓鱼活动加上额外奖励
        _jrkh = g.m.huodongfun.getHDinfoByHtype(45)
        if _jrkh and 'hdid' in _jrkh and _taskInfo['stype'] == 1:
            _prize += _jrkh['data']['taskprize']

        # 寻龙探宝加上额外奖励
        _jrkh = g.m.huodongfun.getHDinfoByHtype(49)
        if _jrkh and 'hdid' in _jrkh and _taskId in _jrkh['data']['taskprize']:
            _prize += _jrkh['data']['taskprize'][_taskId]


        g.event.emit("FlagTask", uid, _id)
    else:
        # 增加成就点
        _prize.append({'a':'attr','t':'success','n':10})


    _sendData = g.getPrizeRes(uid, _prize, act={'act':'task_receive','prize':_prize})
    g.sendChangeInfo(conn, _sendData)
    _prize = [i for i in _prize if i['t'] != 'success']
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("jingqi_1810191604379038")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2,'6'])
    # _nval = g.mdb.count('task', {'type': 2, 'isreceive': 1, 'uid': uid, 'taskid': {'$ne': '1'}})