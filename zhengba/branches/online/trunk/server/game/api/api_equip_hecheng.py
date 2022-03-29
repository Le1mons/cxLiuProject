#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
装备 - 合成装备
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 装备的id
    eid = data[0]
    # 要合成的数量
    _num = int(data[1])

    # 合成数量不能小于1
    if _num <= 0:
        _res['s'] = -2
        _res['errmsg'] = g.L('equip_hecheng_res_-2')
        return _res

    _equipCon = g.m.equipfun.getEquipCon(eid)
    # 装备不存在
    if not _equipCon:
        _res['s'] = -1
        _res['errmsg'] = g.L('equip_hecheng_res_-1')
        return _res
    
    _need = _equipCon['need']
    _need = [{'a':i['a'],'t':i['t'],'n':i['n']*_num} for i in _need]
        
    _chkRes = g.chkDelNeed(uid, _need)

    # 合成材料不足
    if not _chkRes['res']:
        if _chkRes['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chkRes['t']
        else:
            _res["s"] = -104
            _res[_chkRes['a']] = _chkRes['t']
        return _res

    _delData = g.delNeed(uid, _need,logdata={'act': 'equip_hecheng','get':eid,'num':_num})
    _sendData = g.m.equipfun.addEquip(uid, eid, _num)
    if 'equip' in _delData: _delData['equip'].update(_sendData)
    else: _delData['equip'] = _sendData
    g.sendChangeInfo(conn, _delData)
    #监听装备获得成就
    # g.m.taskfun.chkTaskHDisSend(uid)
    g.event.emit("GetEquip",uid,eid,val=_num)
    g.event.emit("dailytask",uid,8,_num)
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["1012","1"])