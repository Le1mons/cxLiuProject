#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

ITEMID = '2086'

'''
工会—攻城略地-势力转盘日志
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'str'>	说明:
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "prize": [
                            {
                                "a": "attr", 
                                "t": "rmbmoney", 
                                "n": 5
                            }
                        ]
                    }
                }
            }
        ]
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def _checkCond(uid, data):
    _chkData = {}
    _chkData["s"] = 1

    _baseNum = 1

    _num = abs(int(data[0]))
    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-2')
        return _chkData

    _con = g.GC["gonghuisiege"]
    # 判断消耗是否满足
    _item = g.mdb.find1('itemlist',{'uid':uid,'itemid':ITEMID},fields=['_id','num']) or {'num':0}

    _num = min(_item['num'], _num)
    # 消耗不足
    if _num <= 0:
        _chkData["s"] = -104
        _chkData['item'] = ITEMID
        return _chkData

    _chkData["need"] = [{'a':'item','t':ITEMID,'n':_num}]
    _chkData["num"] = _num
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData
    _need = _chkData["need"]
    # 玩家数据
    _zhuanPanInfo = list(g.GC["gonghuisiege"]["zhuanpan"])
    # 消耗物品
    _delData = g.delNeed(uid, _need, logdata={'act': 'zhuanpan'})
    g.sendChangeInfo(conn,_delData)

    gud = g.getGud(uid)
    _nt = g.C.NOW()
    _prize = []
    _idx = []
    dkey = g.m.gonghuisiegefun.getWeekKey()
    _logList = g.m.gonghuisiegefun.getZhuanPanLog(uid)
    _ghid = gud["ghid"]
    for i in xrange(_chkData['num']):
        # 获取本次随机到的奖励
        _randomInfo = g.C.getRandArrNum(_zhuanPanInfo, 1)[0]
        _prize += _randomInfo["prize"]
        _logList.append({"uid":uid, "name": gud["name"], "prize": _randomInfo["prize"], "time": _nt, "idx":_randomInfo["idx"]})
        _idx.append(_randomInfo["idx"])

    g.m.gonghuisiegefun.GHATTR.setAttr(_ghid, {'ctype': 'siege_zhuanpanlog'}, {"v": _logList, "k": dkey})

    _prize = g.fmtPrizeList(_prize)
    # 获取奖励
    _sendData = g.getPrizeRes(uid, _prize, {'act': 'gonghuisiege_zhuanpan'})
    # 推送前端
    g.sendChangeInfo(conn, _sendData)

    _resData["prize"] = _prize
    _resData["idx"] = _idx
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    g.getPrizeRes(g.buid('xuzhao'), [{'a':'item','t':'2086','n':7}])
    print g.debugConn.uid
    _data = ['10']
    print doproc(g.debugConn,_data)