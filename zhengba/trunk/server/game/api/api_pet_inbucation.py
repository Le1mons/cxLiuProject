#!/usr/bin/python
# coding:utf-8
'''
宠物 - 孵化
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [哪个蛋:str, 孵化室id:str]
    :return:
    ::

        {"d": {'task':{任务id: 当前值}, 'receive': [以领取奖励的任务id]}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}
    # 蛋的id
    _itemId = str(data[0])
    # 是否特权孵化室
    _id = str(data[1])
    _con = g.GC['petcom']['base']
    # 开区时间不足30天
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('pet_open_-1', _con['openday'] - g.getOpenDay())
        return _chkData

    # 参数不对
    if _id not in ('1', '2', '3', '4', '5', '6', '7', '8', '9'):
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 该物品不能孵化
    if _itemId not in _con['egg']:
        _chkData['s'] = -5
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    _pet = g.mdb.find1('crystal', {'uid': uid},fields=['_id']) or {}
    # 这个孵化室已经有人了
    if _id in _pet.get('petridish', {}):
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('pet_inbucation_-2')
        return _chkData

    _nt = g.C.NOW()
    # 没有特权
    if int(_id) > 3 and _pet.get('pay', 0) < _nt:
        _chkData['s'] = -4
        _chkData['errmsg'] = g.L('global_argserr')
        return _chkData

    # 孵化室满了
    if _id  in ["1", "2", "3"]:
        # 普通孵化室
        if _id in _pet.get('petridish', {}):
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData
    # 特权孵化室
    else:
        # 没有过期
        if _id in _pet.get('petridish', {}) or _pet.get('pay', 0) < _nt:
            _chkData['s'] = -3
            _chkData['errmsg'] = g.L('global_argserr')
            return _chkData
    # if len(_pet.get('petridish', {})) + 1 > _con['petridish'][1 if _pet.get('pay',0)>_nt else 0]:
    #     _chkData['s'] = -3
    #     _chkData['errmsg'] = g.L('global_argserr')
    #     return _chkData

    _need = [{'a': 'item', 't': _itemId, 'n': 1}]
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
    _chkData['con'] = _con
    _chkData["pet"] = _pet
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # 是否特权孵化室
    _id = str(data[1])

    _pet = _chkData["pet"]

    _delData = g.delNeed(uid, _chkData['need'], 0)
    g.sendChangeInfo(conn, _delData)
    _setData = {}
    _nt = g.C.NOW()
    _stime = _nt

    if _id in ["1", "2", "3"]:
        _chkList = ["1", "2", "3"]
    elif _id in ["4", "5", "6"]:
        _chkList = ["4", "5", "6"]
    else:
        _chkList = ["7", "8", "9"]
    _petridish = _pet.get("petridish", {})

    for id , info in _petridish.items():
        if id not in _chkList:
            continue
        if info["time"] >= _nt and info["time"] >= _stime:
            _stime = info["time"]

    _time = _stime + _chkData['con']['cd']

    _setData['petridish.{}'.format(data[1])] = {"time": _time, "id": str(data[0])}

    g.mdb.update('crystal', {'uid': uid}, _setData, upsert=True)
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[2056, 1])