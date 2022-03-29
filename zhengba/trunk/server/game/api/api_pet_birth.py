#!/usr/bin/python
# coding:utf-8
'''
宠物 - 诞生
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g, math


def proc(conn, data):
    """

    :param conn:
    :param data: [孵化室id:str]
    :return:
    ::

        {"d": {'crystal':水晶数据, 'prize': []}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    # 孵化室id
    _id = str(data[0])
    if _id not in ('1', '2', '3', '4', '5', '6','7','8','9'):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData


    _pet = g.mdb.find1('crystal',{'uid': uid, 'petridish.{}'.format(_id): {'$exists': 1}}, fields=['_id','petridish'])
    # 数据不存在
    if not _pet or _id not in _pet.get('petridish',{}):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _petridish = _pet.get("petridish", {})
    _nt = g.C.NOW()
    _need = []
    # 需要加速
    _chkPos = []
    if _pet['petridish'][_id]['time'] > _nt:

        # 只能加速时间最小的
        if _id in ["1", "2", "3"]:
            _chkList = ["1", "2", "3"]
        elif _id in ["4", "5", "6"]:
            _chkList = ["4", "5", "6"]
        else:
            _chkList = ["7", "8", "9"]

        _chkDict = {k : v for k, v in _petridish.items() if k in _chkList}
        _chkPos = sorted(_chkDict.items(), key=lambda x: int(x[1]["time"]))
        if _id != _chkPos[0][0]:
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData

        _modulus = math.ceil((_pet['petridish'][_id]['time'] - _nt) / float(_con['speedup']['time']))
        _need = [{'a':i['a'], 't':i['t'], 'n':i['n'] * _modulus} for i in _con['speedup']['need']]
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _chkData['s'] = -100
                _chkData['attr'] = _chk['t']
            else:
                _chkData["s"] = -104
                _chkData[_chk['a']] = _chk['t']
            return _chkData

    _chkData['need'] = _need
    _chkData['data'] = _pet
    _chkData['con'] = _con
    _chkData["chkpos"] = _chkPos
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 孵化室id
    _id = str(data[0])

    _send = {}
    if _chkData['need']:
        _sendData = g.delNeed(uid, _chkData['need'], 0, logdata={'act': 'pet_birth'})
        g.mergeDict(_send, _sendData)
        if _id in ["1", "2", "3"]:
            _chkList = ["1", "2", "3"]
        elif _id in ["4", "5", "6"]:
            _chkList = ["4", "5", "6"]
        else:
            _chkList = ["7", "8", "9"]

        _setData = {}
        _nt = g.C.NOW()
        _petridish = _chkData['data'].get("petridish", {})

        _chkDict = {k: v for k, v in _petridish.items() if k in _chkList}
        _chkPos = _chkData["chkpos"]

        # for id, info in _petridish.items():
        #     if id not in _chkList or id == _id:
        #         continue
        #     _setData['petridish.{}'.format(id)] = {"time":_nt + _chkData['con']['cd'] * (len(_setData) + 1), "id":info["id"]}

        _num = 1
        for arr in _chkPos:
            if arr[0] == _id:
                continue
            _chkData['data']['petridish'][arr[0]] = {"time":_nt + _chkData['con']['cd'] * _num, "id":arr[1]["id"]}
            _num += 1



    _id = str(data[0])
    _prize = g.m.diaoluofun.getGroupPrize(_chkData['con']['egg'][_chkData['data']['petridish'][_id]['id']]['dlz'])
    _prize += _chkData['con']['egg'][_chkData['data']['petridish'][_id]['id']]['prize']
    _pSend = g.getPrizeRes(uid, _prize, {'act':"pet_birth",'id':_chkData['data']['petridish'][_id]['id']})
    g.mergeDict(_send, _pSend)
    g.sendChangeInfo(conn, _send)

    del _chkData['data']['petridish'][_id]
    g.mdb.update('crystal', {'uid': uid}, {'petridish': _chkData["data"]["petridish"]})

    _res['d'] = {'crystal': _chkData['data'], 'prize': _prize}
    return _res

if __name__ == '__main__':
    uid = g.buid(1)
    g.debugConn.uid = uid
    _petridish = {"1":{"time":1}, "2":{"time":2}}
    _chkPos = sorted(_petridish.items(), key=lambda x: int(x[1]["time"]))
    print _chkPos