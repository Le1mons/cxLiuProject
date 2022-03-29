#!/usr/bin/python
# coding:utf-8
'''
部落战旗 - 任务界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [任务类型:str('1', '2', '3')]
    :return:
    ::

        {'d':[{'nval':任务当前值, 'id':任务id, 'finish':是否已领取, 'type':'任务类型'}]
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 任务类型
    _ttype = str(data[0])
    if _ttype not in ('1', '2', '3'):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _tasks = g.m.flagfun.getAllTask(uid, _ttype)
    # 争霸赛任务处理
    # if _ttype == '3':
    #     for i in _tasks:
    #         if i['id'] == '304':
    #             if g.m.flagfun.chkTaskNval(uid):
    #                 i['nval'] += 1
    #                 g.mdb.update('flagtask',{'uid':uid,'id':'304'},{'nval':i['nval'],'lasttime':g.C.NOW()})
    #             break

    _res['d'] = _tasks
    return _res

if __name__ == '__main__':
    uid = g.buid("jingqi_1809032054531557")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[3])