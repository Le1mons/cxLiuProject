# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
答题事件——答题
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d":{'topic': ['事件id'], 'jindu': 剑圣的进行次数}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 哪个区域
    _topic = str(data[0])
    # 哪个答案
    _option = str(data[1])

    _con = g.GC['event']
    # 答案不对
    if _option not in _con['event'][_topic]['option']:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _topicData = g.mdb.find1('topic', {'uid': uid}, fields=['_id','topic','jindu'])
    # 数据不存在
    if not _topicData or _topic not in _topicData['topic']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('event_answer_-1')
        return _chkData

    if _topic in _con['special']:
        # 今天已经领取了
        if g.getAttrByDate(uid, {'ctype': 'event_answer'}):
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('event_answer_-1')
            return _chkData

        # 进度领取完了
        if _topicData.get('jindu', 0) >= 10:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('event_answer_-1')
            return _chkData

    _prize = []
    if _con['option'][_option]['dlz']:
        _prize += g.m.diaoluofun.getGroupPrize(_con['option'][_option]['dlz'])
    if _con['option'][_option]['prize']:
        _prize += _con['option'][_option]['prize']

    _chkData['con'] = _con
    _chkData['data'] = _topicData
    _chkData['topic'] = _topic
    _chkData['option'] = _option
    _chkData['prize'] = _prize
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 哪个区域
    _topic = _chkData['topic']
    # 哪个答案
    _option = _chkData['option']
    _topicData = _chkData['data']
    _con = _chkData['con']
    _prize = _chkData['prize']

    # 普通问题
    if _topic in _con['special']:
        # 增加进度
        g.mdb.update('topic', {'uid': uid}, {'$inc': {'jindu': 1}})
        g.setAttr(uid, {'ctype': 'event_answer'},{'v':1})
        # 第10次要删除
        if _topicData.get('jindu', 0) >= 9:
            g.mdb.update('topic', {'uid': uid}, {'$pull': {'topic': _topic}})
    else:
        _topicData['topic'].remove(_topic)
        g.mdb.update('topic', {'uid': uid}, {'$pull': {'topic': _topic}})
    if _prize:
        _send = g.getPrizeRes(uid, _prize, {'act':'event_answer','option':_option,'topic':_topic})
        g.sendChangeInfo(conn, _send)

    _res['d'] = {'prize': _prize,'topic': _topicData['topic']}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq0")
    g.debugConn.uid = uid
    print doproc(g.debugConn,['2', '2001'])