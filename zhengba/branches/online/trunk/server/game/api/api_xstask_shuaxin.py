# coding: utf-8
# !/usr/bin/python
# coding: utf-8
'''
悬赏任务——刷新
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")

import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _beforeList = g.m.xstaskfun.getMyTaskList(uid)
    _noJiequList = [i for i in _beforeList if i['isjiequ']==1 and i['finish']==0]
    # 如果总任务超过了20条
    if len(_noJiequList) >= 20:
        _res['s'] = -1
        _res['errmsg'] = g.L('xstask_shuaxin_res_-1')
        return _res

    _con = g.GC['xstaskcom']
    # 免费次数
    _freeNum = g.m.xstaskfun.getCanRefNum(uid)
    # 需要扣除的物品信息或钻石
    _trueNeed = []
    _color = []
    # 判断流程使用先后顺序，1判断免费次数，2刷新券，3钻石
    if _freeNum <= 0:
        # 无免费次数，先判断刷新券
        _needItem = _con['needitem']
        _chkRes = g.chkDelNeed(uid, _needItem)
        _trueNeed = _needItem
        if not _chkRes['res']:
            # 无刷新券，判断钻石
            _need = _con['needrmbmoney']
            _chkRes = g.chkDelNeed(uid, _need)
            _trueNeed = _need
            if not _chkRes['res']:
                if _chkRes['a'] == 'attr':
                    _res['s'] = -100
                    _res['attr'] = _chkRes['t']
                else:
                    _res["s"] = -104
                    _res[_chkRes['a']] = _chkRes['t']
                return _res

    # 扣除消耗或免费次数
    if not _trueNeed:
        # 扣除免费次数
        g.m.xstaskfun.setRefreshNum(uid)
        _freeNum -= 1
    else:
        # 记录已经刷新的次数
        _rmbRefNum = g.m.xstaskfun.setCostRfNum(uid)
        # 根据钻石刷新次数处理特权逻辑
        # 冒险者礼包 并且是第一次刷新卷或者钻石刷新
        if g.m.chongzhihdfun.isTeQuan(uid, 2) and _rmbRefNum == 1:
            _color.append('3')
        # 英雄礼包 并且是第3次刷新卷或者钻石刷新
        if g.m.chongzhihdfun.isTeQuan(uid, 3) and _rmbRefNum == 3:
            _color.append('4')
        _sendData = g.delNeed(uid, _trueNeed, logdata={'act': 'xstask_shuaxin'})
        g.sendChangeInfo(conn, _sendData)

    _taskList = g.m.xstaskfun.createTask(uid, _color)
    _heroList = list()
    for i in _taskList:
        i['_id'] = str(i['_id'])
        if 'herolist' in i:
            _heroList += i['herolist']

    # 开服狂欢活动
    # if g.m.kfkhfun.checkIsOpen():
    #     g.mdb.update('kfkhdata', {'uid': uid, 'htype': 18, 'day': 4}, {'$inc': {'nval': 1}})
    g.event.emit('kfkh',uid,18,4)

    _res['d'] = {'task': _taskList, 'freenum': _freeNum, 'herolist': _heroList}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2])