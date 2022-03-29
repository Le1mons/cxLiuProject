# coding:utf-8
'''
签到 - 领取每日签到奖励
'''
if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [领取类型:str('1','2','3'), 奖励索引:int]
    :return:
    ::

        {'d': {'prize':[]
                'alreadyget': 已经领了多少个,
                'remainnum': 可以领取多少个
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}

    uid = conn.uid
    gud = g.getGud(uid)


    #获取已经领取次数
    _valInfo = g.m.signdenglufun.getRecSignNum(uid)
    # 获取登陆次数
    _loginNum = g.m.signdenglufun.getLoginNum(uid)
    _val = _valInfo["v"]
    _k = str(_valInfo["k"])
    # _edInfo = g.user.getAttr(uid, {"ctype": g.L("playattr_ctype_sign_everydayinfo")}, keys='_id,k,rd,v,lasttime')
    _nt = g.C.NOW()
    # 获取领取的信息
    if _loginNum >= 0:
        # 今天领完普通 充值 或者已领取
        if _loginNum == _val:
            _data = g.getAttrByDate(uid,{'ctype': 'login_gift'},keys='_id,lasttime,v,num')
            # 今天没有充值 或者已领取
            if not _data or _data[0].get('v') or _data[0]['num'] < 6:
                _res["s"] = -3
                _res["errmsg"] = g.L("signmrqd_res_-3")
                return _res
            g.setAttr(uid, {'ctype': 'login_gift'}, {'v': 1})

        # 判断是否达到可领取条件
        elif _loginNum <= _val:
            _res["s"] = -2
            _res["errmsg"] = g.L("signmrqd_res_-2")
            return _res
        else:
            g.m.signdenglufun.setResSignNum(uid)

    #获取实际配置
    _rdCon = g.GC["qiandao"][_k][_val] if _loginNum != _val else g.GC["qiandao"][_k][_val-1]
    _prize = {}
    if "type" in _rdCon:
        _heroInfo = g.getAttrOne(uid, {"ctype": "qiandao_prize"}, keys="_id,prize")
        _prize.update(_heroInfo["prize"][0])
    else:
        _prize.update(_rdCon["prize"])
    _changeInfo = g.getPrizeRes(uid, [_prize], "signmrqd")
    _already = _val + 1
    canGet = _loginNum - _already
    _r = g.sendChangeInfo(conn, _changeInfo)

    _res["d"] = {"alreadyget":_already,"remainnum":canGet,"prize":_prize}
    return _res



if __name__ == "__main__":
    uid = g.buid('lsq111')
    g.debugConn.uid = uid
    print proc(g.debugConn, [])



