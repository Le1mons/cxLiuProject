# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
十字军远征 ——— 领取奖励
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 领取奖励的索引
    _idx = int(data[0])
    _data = g.getAttrByDate(uid, {'ctype': 'shizijun_data'})
    if not _data:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _prizeList = _data[0].get('prizelist',[])
    # 如果已领取
    if _prizeList and _idx in _prizeList:
        _res['s'] = -1
        _res['errmsg'] = g.L('shizijun_getprize_res_-1')
        return _res

    _con = g.GC['shizijun']['base']
    _boxCon = _con['boxprize'][_idx]
    _num = _boxCon[0]

    _passList = _data[0].get('passlist',[])
    # 还没通关
    if _num - 1 not in _passList:
        _res['s'] = -2
        _res['errmsg'] = g.L('shizijun_getprize_res_-2')
        return _res

    _prize = _boxCon[1]
    # 处在活动中就加成奖励
    _addition = 1
    if g.m.huodongfun.chkZCHDopen('shizijun'):
        _info = g.mdb.find1('hdinfo', {'htype': 14, 'etime': {'$gte': g.C.NOW()},'data.mark': 'shizijun'})
        # 远征统帅活动存在
        if _info:
            _addition = _info['data']['addition']*0.01
            g.event.emit('zchd_redpoint', uid)

    _prize = [{'a':i['a'],'t':i['t'],'n':int(i['n']*_addition)} for i in _prize]
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'shizijun_getprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)

    _prizeList.append(_idx)
    g.setAttr(uid,{'ctype':'shizijun_data'},{'prizelist':_prizeList})

    # 2018-11-20 获取道具奖励
    _arr = [{'id':i,'p':_con['supply'][i]['p']} for i in _con['supply']]
    _supply = g.C.RANDARR(_arr, sum(map(lambda x:x['p'], _arr)))
    g.setAttr(uid,{'ctype':'shizijun_supply'},{'$inc': {g.C.STR('v.{1}',_supply['id']): 1}})

    _return = {i:[{'a':'item','t':'crusader{}'.format(i)}] for i in ('1','2','3')}

    _res['d'] = {'prize': _prize + _return[_supply['id']]}
    return _res

if __name__ == '__main__':
    uid = g.buid("lsq333")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, [0])
    print a