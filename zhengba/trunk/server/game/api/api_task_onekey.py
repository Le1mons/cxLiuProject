#!/usr/bin/python
# coding: utf-8
'''
成就任务——一键领取日常奖励
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: []
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
    _tasks = g.mdb.find('task', {'uid': uid, 'type': 2,'stype':{'$ne':1}}, fields=['nval','pval','taskid','isreceive'])
    # 寻龙探宝加上额外奖励
    _jrkh = g.m.huodongfun.getHDinfoByHtype(49)
    _prize, _ids, _con = [], [], g.GC['task']
    for i in _tasks:
        if i['nval'] >= i['pval'] and i['isreceive'] == 0:
            _prize += _con[i['taskid']]['prize']
            _ids.append(i['_id'])
            if _jrkh and 'hdid' in _jrkh and i['taskid'] in _jrkh['data']['taskprize']:
                _prize += _jrkh['data']['taskprize'][i['taskid']]

    # 没有可领取的任务
    if not _prize:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res


    g.mdb.update('task', {'uid': uid, '_id': {'$in': _ids}},{'isreceive': 1})
    _nval = g.mdb.count('task',{'type':2,'isreceive': 1,'uid':uid,'stype':{'$ne':1}})
    g.mdb.update('task', {'uid': uid, 'stype': 1},{'nval': _nval})
    # 神器任务
    g.event.emit('artifact', uid, 'richangtask', val=len(_ids))
    # 团队任务 完成日常任务
    g.m.teamtaskfun.setTeamTaskVal(uid, '2', len(_ids))
    # 战旗任务
    g.event.emit("FlagTask", uid, ['203'], val=len(_ids))

    _prize = g.fmtPrizeList(_prize)
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'task_onekey'})
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2,'6'])