#!/usr/bin/python
# coding:utf-8
'''
首冲-领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [领取类型:str('1','2','3'), 奖励索引:int]
    :return:
    ::

        {'d': {'prize':[]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    #领取类型
    _recType = str(data[0])
    #领取下标
    _recIdx = int(data[1])
    _data = g.m.shouchongfun.getShouChongData(uid)
    if _recType not in _data:
        #领取参数有误
        _res['s'] = -1
        _res['errmsg'] = g.L('shouchong_recprize_res_-1')
        return _res

    _recIdx = len(_data[_recType]['rec'])
    if _recIdx in _data[_recType]['rec']:
        #奖励已领取
        _res['s'] = -2
        _res['errmsg'] = g.L('shouchong_recprize_res_-2')
        return _res
    
    if len(_data[_recType]['chkrectime']) == 0:
        #奖励未激活
        _res['s'] = -3
        _res['errmsg'] = g.L('shouchong_recprize_res_-3')
        return _res
    
    _nt = g.C.NOW()
    if _recIdx < 0 or _recIdx >= len(g.GC['shouchong'][_recType]['prize']):
        #领取参数有误
        _res['s'] = -1
        _res['errmsg'] = g.L('shouchong_recprize_res_-1')
        return _res
    
    if _nt < _data[_recType]['chkrectime'][_recIdx]:
        #未到领取时间
        _res['s'] = -4
        _res['errmsg'] = g.L('shouchong_recprize_res_-4')
        return _res

    #设置领取信息
    _key = g.C.STR("v.{1}.rec",_recType)
    g.m.shouchongfun.setShouChongData(uid,{'$push':{_key:_recIdx}})
    _prize = list(g.GC['shouchong'][_recType]['prize'][_recIdx])
    #特殊处理第二天的第三档奖励
    if _recType == '2' and _recIdx == 2:
        _zeroTime = g.C.ZERO(_nt)
        #显示出第三天的奖励
        _chkNum = int(g.GC['shouchong'][_recType]['paynum'])
        _allPayNum = g.m.payfun.getAllPayYuan(uid)
        _setData = {'show':1,'rec':_data['3']['rec'],'chkrectime':[]}
        if _allPayNum >= _chkNum:
            #累计充值超过第三档
            _timeArr = [_zeroTime,_zeroTime+24*3600,_zeroTime+48*3600]
            _setData['chkrectime'] = _timeArr
            
        #设置隐藏奖励信息
        g.m.shouchongfun.setShouChongData(uid,{'v.3':_setData})

    _changeInfo = g.getPrizeRes(uid, _prize, {'act': "shouchong_recprize",'rectype':_recType,'recidx':_recIdx})
    g.sendChangeInfo(conn, _changeInfo)
    _res['d'] = {'prize':_prize}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[3, 0])