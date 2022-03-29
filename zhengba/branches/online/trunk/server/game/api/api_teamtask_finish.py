#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 团队任务完成任务
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    # 任务类型
    _type = str(data[0])
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    if int(g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)) <= 60:
        # 必须打通关60关副本
        _res['s'] = -4
        _res['errmsg'] = g.L('gonghui_golbal_fberr')
        return _res

    _con = g.GC['gonghui_teamtask']['base']
    # 官员以上才能提交
    if gud['ghpower'] > _con['taskcond']['power']:
        _res['s'] = -2
        _res['errmsg'] = g.L('teamtask_finish_-2')
        return _res

    _taskInfo = g.m.teamtaskfun.GHATTR.getAttrOne(_ghid, {'ctype':'teamtask_taskinfo'},fields=['_id','v']) or {'v': {}}
    # 任务未完成
    if _taskInfo['v'].get(_type, 0) < _con['task'][_type]['pval']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_valerr')
        return _res

    # 扣除对应的进度
    g.m.teamtaskfun.GHATTR.setAttr(_ghid, {'ctype': 'teamtask_taskinfo'},{'$inc':{'v.{}'.format(_type): -_con['task'][_type]['pval']}})
    # 获得补给值
    g.m.teamtaskfun.GHATTR.setAttr(_ghid, {'ctype':'teamtask_supply'}, {'$inc': {'v': _con['task'][_type]['num']}})

    return _res
        
    
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)