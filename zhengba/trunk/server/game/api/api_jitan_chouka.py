#!/usr/bin/python
# coding:utf-8
'''
祭坛——抽卡
'''

import sys

sys.path.append('..')

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [祭坛的编号:str]
    :return:
    ::

        {"d": {"prize": [], 'jifen': 积分}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 祭坛的编号
    _type = str(data[0])
    _jitanCon = g.GC['jitan']
    # 非普通，高级，友情类祭坛
    if _type not in _jitanCon or _type == '7':
        _res['s'] = -1
        _res['errmsg'] = g.L('jitan_chouka_res_-1')
        return _res

    _num = _jitanCon[_type]['number']
    _geziNum = g.m.userfun.getGeziNum(uid)
    _heroNum = g.mdb.count('hero',{'uid':uid})
    # 英雄数量超过了格子数量
    if _heroNum + _num > _geziNum['maxnum']:
        _res['s'] = -2
        _res['errmsg'] = g.L('jitan_chouka_res_-2')
        return _res

    # 如果是先祖10連  2010是否足够
    if _type == '4':
        _need = list(_jitanCon[_type]['need'])
        _item = g.mdb.find1('itemlist',{'uid':uid,'itemid':_need[0]['t']},fields=['_id','num']) or {'num':0}
        if _item['num'] < 10:
            if _item['num'] > 0:
                _need[0]['n'] = _item['num']
                _need.append({'a':'attr','t':'rmbmoney','n':(10-_item['num']) * 200})
            else:
                _need = _jitanCon[_type]['rmbmoney']

        _chk = g.chkDelNeed(uid, _need)
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _delData = g.delNeed(uid, _need,0,logdata={'act': 'jitan_chouka'})
        g.sendChangeInfo(conn, _delData)

    # 不免费
    elif g.m.jitanfun.getFreeNumByType(uid, _type) < 1:
        _need = _jitanCon[_type]['need']
        _rmbmoney = _jitanCon[_type]['rmbmoney']
        # 是否可消耗钻石
        _isrmbmoney = _jitanCon[_type]['isrmbmoney']
        _chk = g.chkDelNeed(uid, _need)

        # 印记不足但是允许使用钻石
        if not _chk['res'] and _isrmbmoney:
            _chk = g.chkDelNeed(uid, _rmbmoney)
            _need = _rmbmoney
            # 钻石也不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _delData = g.delNeed(uid, _need,logdata={'act': 'jitan_chouka'})
        g.sendChangeInfo(conn, _delData)
    else:
        g.m.jitanfun.setFreeNum(uid,_type)

    _prize = g.m.jitanfun.getRandPrize(uid, _type)
    _sendData = g.getPrizeRes(uid, _prize, {'act':'jitan_chouka','type':_type})

    # 跑马灯  高级祭坛 非首抽
    if _type in ('3', '4') and g.getAttrByCtype(uid,'jitan_counttype',bydate=False,default={}).get('1', 0):
        _heroCon = g.GC['pre_hero']
        for i in _prize:
            _hid = i['t']
            _star = _heroCon[_hid]['star']
            # 存在就说明非首抽
            if _star >= 5:
                gud = g.getGud(uid)
                g.m.chatfun.sendPMD(uid, 'zhaohuanjitan', *[gud['name'], _star, _heroCon[_hid]['name']])

    g.sendChangeInfo(conn, _sendData)

    # 新年任务
    if _type in ('3', '4'):
        g.event.emit('newyear_task', uid, '2', _num)
        # 团队任务
        g.m.teamtaskfun.setTeamTaskVal(uid, '3', _num)
        # 节日狂欢
        g.event.emit('jierikuanghuan', uid, '3', _num)
        # 王者招募任务监听
        g.event.emit("wzzmtask", uid, "102", _num)
        # 圣诞活动
        g.event.emit('shengdan', uid, {'task': ['4001', '4002', '4003', '4004']}, _num)
    if _type == '4':
        # 周年庆
        g.event.emit('ANNIVERSARY', uid, '5')
    # 圣诞活动
    if _type in ('1', '2', '3', '4', '5', '6'):
        g.event.emit('shengdan', uid, {'liwu': ['4']}, _num, _type)

    #     g.event.emit('dailytask', uid, 2, _num)
    # elif _type in ('3','4'):
    #     # 监听普通和高级祭坛抽卡
    #     g.event.emit('dailytask', uid, 3, _num)
    # g.m.taskfun.chkTaskHDisSend(uid)
    _res['d'] = {'prize': _prize,'jifen':_jitanCon[_type]['jifen']}

    gameVer = g.getGameVer()
    if gameVer == "debug":
        _res["d"]["hero"] = _sendData["hero"]


    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['4'])