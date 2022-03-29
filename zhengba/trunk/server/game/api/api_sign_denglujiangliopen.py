# coding:utf-8
'''
登陆奖励：打开登陆奖励界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [领取类型:str('1','2','3'), 奖励索引:int]
    :return:
    ::

        {'d': {'wtype':'第几套奖励',
                'alreadyget': 已经领了多少个,
                'remainnum': 可以领取多少个
                'data': [奖励]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":"1"}
    uid = conn.uid


    #获取已经领取次数
    _valInfo = g.m.signdenglufun.getRecSignNum(uid)
    #获取登陆次数
    _loginNum = g.m.signdenglufun.getLoginNum(uid)
    #剩余可领次数:
    remainnum = _loginNum - _valInfo["v"]
    _k = str(_valInfo["k"])
    #当领取第一套配置时
    if _k == '1':
        _peizhiInfo = g.GC["qiandao"][_k]
        _isget = 0
        _nt = g.C.NOW()

        _res["d"] = {"wtype": _valInfo["k"], "alreadyget": _valInfo["v"],"remainnum":remainnum,"data":_peizhiInfo}

    #当领取第二套配置时
    if _k == '2':
        _peizhiInfo = g.GC["qiandao"][_k]
        _gid  = g.GC["qiandao"]["diaoluozu"]
        _reshero = g.m.diaoluofun.getGroupPrizeNum(_gid)
        _heroInfo = g.getAttrOne(uid,{"ctype":"qiandao_prize"},keys="_id,prize")

        _tmpprize = []
        # 拿出配置中的特殊值，并将奖励设置进去
        for item in _peizhiInfo:
            item = dict(item.copy())
            if "type" in item:
                item['prize'] = _heroInfo['prize'][0]
            _tmpprize.append(item)

        _res["d"] = {"wtype": _valInfo["k"], "alreadyget": _valInfo["v"], "remainnum": remainnum, "data": _tmpprize}

    _data = g.getAttrByDate(uid,{'ctype': 'login_gift'},keys='_id,v,lasttime')
    _res["d"]['chongzhi'] = _data if _data and 'v' in _data[0] else []
    return _res









if __name__ == "__main__":
    g.debugConn.uid = '0_5aea81d0625aee4a04a0146d'
    print proc(g.debugConn, [])




