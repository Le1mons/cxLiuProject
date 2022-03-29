#!/usr/bin/python
# coding:utf-8
'''
人物 - 领取兑换码
'''
if __name__ == '__main__':
    import sys

    sys.path.append('..')

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [卡号:str]
    :return:
    ::

        {'d': [奖励]
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # [UID,CARDNUM,NT,MD5KEY,PRIZE](base64)
    cdata = str(data[0])
    _strLen = len(cdata)
    # 领取信息格式有误
    if _strLen < 3:
        _res["s"] = -2
        _res["errmsg"] = g.L("usergetcard_res_-2")
        return _res

    _doNum = int(_strLen * 0.5)
    _doStr = cdata[0:_doNum]
    _args = g.m.kbase64.KBase64().decodeSting(_doStr[::-1] + cdata[_doNum:])
    # 领取信息格式有误
    if _args[1] == False:
        _res["s"] = -2
        _res["errmsg"] = g.L("usergetcard_res_-2")
        return _res

    _args = g.m.myjson.read(_args[0])
    chkuid = str(_args[0])
    cardnum = str(_args[1])
    nt = str(_args[2])
    md5Key = str(_args[3])
    prize = str(_args[4])
    _chkMD5Key = g.C.md5(chkuid + cardnum + nt + prize + g.config['APIKEY'])
    # 领取信息格式有误
    if md5Key != _chkMD5Key:
        _res["s"] = -2
        _res["errmsg"] = g.L("usergetcard_res_-2")
        return _res

    # 领取信息格式有误
    if uid != chkuid:
        _res["s"] = -2
        _res["errmsg"] = g.L("usergetcard_res_-2")
        return _res

    _prize = g.m.myjson.read(prize)

    # 获取是否已使用卡
    _cardInfo = g.m.dball.getCardInfo(uid, cardnum)
    # 已使用该卡
    if len(_cardInfo) > 0:
        _res["s"] = -1
        _res["errmsg"] = g.L('usergetcard_res_-1')
        return _res

    if cardnum.startswith('xlh'):
        if g.getGud(uid).get('xlh', 0):
            _res["s"] = -10
            _res["errmsg"] = g.L('global_algetprize')
            return _res

        g.m.userfun.updateUserInfo(uid, {'xlh': 1})
    # elif cardnum.startswith('gzh'):
    #     g.m.userfun.updateUserInfo(uid, {'gzh': 1})

    _r = g.m.dball.addUseCard(uid, cardnum)
    # 兑换成功
    _prizeMap = g.getPrizeRes(uid, _prize, "getcard")
    _r = g.sendChangeInfo(conn, _prizeMap)
    _nPrize = g.mergePrize(_prize, uid=uid)
    _res["d"] = _nPrize
    return _res


if __name__ == "__main__":
    g.debugConn.uid = "0_5b603d06e1382342fdc47c33"
    proc(g.debugConn, [
        '3IWY4EmZ0gjM4EmZyIjZiwCO4MDO2kzMzUTMsIiayRHc4ombqNjIsIyMzM2N0MGZmJDNzIDOzETZ2ADZzAjNiVzXwIyWZWY2ZjIxOTg5ZTQzNzhkMjciLCJbe1wiYVwiOlwiYXR0clwiLFwidFwiOlwicm1ibW9uZXlcIixcIm5cIjoxMH1dIl0=='])
