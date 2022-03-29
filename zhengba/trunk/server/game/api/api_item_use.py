# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
物品——使用物品
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data:
    :return:
    ::

        {'s':1
         'd':{'prize'合成之后的物品:[{"a":"item","t":"4065", "n":1}]}
        }
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 物品的id
    _item_id = str(data[0])
    # 要合成的数量
    _num = 1
    if len(data) >= 2:
        _num = int(data[1])
        # 数量是负数
        if _num <= 0:
            _res['s'] = -5
            _res['errmsg'] = g.L('item_use_res_-5')
            return _res

    _idx = 0
    # 自选宝箱参数
    if len(data) >= 3:
        _idx = abs(int(data[2]))

    # 标签自选参数
    _tab = 0
    if len(data) >= 4:
        _tab = abs(int(data[3]))

    _item_info = g.m.itemfun.getItemInfo(uid, _item_id)
    if not _item_info:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_itemerr')
        return _res

    # 数量不足
    if _num > _item_info['num']:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_itemless')
        return _res
    
    gud = g.gud.get(uid)
    _user_lv = gud['lv']
    _item_lv = g.m.itemfun.getItemCon(_item_id).get('uselv')
    if not _item_lv: _item_lv = 0
    # 玩家等级不够
    if _user_lv < int(_item_lv):
        _res['s'] = -4
        _res['errmsg'] = g.L('item_use_res_-4')
        return _res

    _usetype = _item_info['usetype']
    # 判断物品是否是消耗类物品
    if _usetype == '2':
        _res['s'] = -2
        _res['errmsg'] = g.L('item_use_res_-2')
        return _res

    
    #合成类道具，加锁防止快速操作
    _lockKey = "_itemuse_lock_"+ str(uid)+ "_"+ str(_item_id)
    if _usetype in ['3','4','12']:
        if g.mc.get(_lockKey):
            _res['s'] = -1
            return _res
        g.mc.set(_lockKey,1,1) #至少锁定1s
    
    _rData = g.m.itemfun.useItem(uid, _item_id, _num, iteminfo=_item_info, args=_idx, tab=_tab)
    
    if _usetype in ['3','4','12']:
        g.mc.delete(_lockKey)
        
    # 返回错误值
    if _rData["s"] != 1:
        return _rData

    _sendData = _rData['d']['rinfo']
    g.sendChangeInfo(conn, _sendData)
    del _rData["d"]["rinfo"]
    _res["d"] = {'prize':_rData["d"]['p']}
    gameVer = g.getGameVer()
    if gameVer == "debug":
        _res["d"]["change"] = _sendData

    return (_res)

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.getPrizeRes(uid, [{'a':'item','t':'1027','n':1}])
    g.debugConn.uid = uid
    print doproc(g.debugConn, ["14065",1])
