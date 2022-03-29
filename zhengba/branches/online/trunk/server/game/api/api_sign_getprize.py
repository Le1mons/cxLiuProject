# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/6/15:10
'''
if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g

'''
签到 - 领取每日签到奖励
'''


def proc(conn, data):
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
        # 判断是否达到可领取条件
        if _loginNum <= _val:
            _res["s"] = -2
            _res["errmsg"] = g.L("signmrqd_res_-2")
            return _res
    #获取实际配置
    _rdCon = g.GC["qiandao"][_k][_val]
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
    _r = g.m.signdenglufun.setResSignNum(uid)

    _res["d"] = {"alreadyget":_already,"remainnum":canGet,"prize":_prize}
    return _res



if __name__ == "__main__":
    uid = g.buid('lsq111')
    g.debugConn.uid = uid
    print proc(g.debugConn, [])



