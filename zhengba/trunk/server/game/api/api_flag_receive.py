#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 领取任务
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [任务id:str]
    :return:
    ::

        {'d':{prize:[],加上战旗信息参考open界面}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 任务id
    _id = str(data[0])
    _task = g.mdb.find1('flagtask', {'uid': uid,'id':_id}, fields=['_id','nval','type','finish','id'])
    # 没有信息
    if not _task:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    if _id == '101':
        _task['nval'] = 1
    # 任务没达标
    if _task['nval'] < g.GC['flag']['base']['task'][_task['type']][_task['id']]['pval']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_valerr')
        return _res

    # 奖励已领取
    if _task['finish']:
        _res['s'] = -3
        _res['errmsg'] = g.L('global_algetprize')
        return _res

    g.mdb.update('flagtask',{'uid': uid,'id':_task['id']},{'finish':1,'lasttime':g.C.NOW()})
    # 战旗信息
    _flag = g.mdb.find1('flag',{'uid':uid},fields=['_id','lv','endtime','prize','exp','reclist','addtime'])
    # 没有就根据建号时间 或者 功能上新生成
    if not _flag:
        _ctime = g.C.ZERO(max(1560096000, g.getGud(uid)['ctime']))
        _flag = g.m.flagfun.updateFlagData(uid, _ctime)

    g.m.flagfun.addFlagExp(_flag, g.GC['flag']['base']['task'][_task['type']][_task['id']]['prize'][0]['n'])
    g.mdb.update('flag',{"uid":uid},{'exp':_flag['exp'],'lv':_flag['lv'],'lasttime':g.C.NOW()})

    _flag['prize'] = g.GC['flag']['base']['task'][_task['type']][_task['id']]['prize']
    _res['d'] = _flag
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['101'])