# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
开服狂欢——开启界面
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
    _chkRes = g.m.kfkhfun.checkIsOpen(uid)
    #活动已结束
    if not _chkRes:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_hdnoopen')
        return _res

    #默认获取今天数据
    _oday = g.m.kfkhfun.getKfkhDay(uid)
    _sday = _oday

    #有参数则为该参数
    if len(data)==1:
        _sday = int(data[0])

    #获取开服狂欢数据
    _kfkhData = g.m.kfkhfun.getKfkhData(uid,where={"day":_sday},fields=['_id'])
    #没有数据则生成
    if not _kfkhData:
        _kfkhData = g.m.kfkhfun.genrateDayInfo(uid,_sday)
    
    if _sday == _oday:
        g.m.kfkhfun.setKfkhData(uid, {'htype': 1, 'day': _oday},{'nval':1})
    
    # 未来的天数，不统计和计算
    if _sday > _oday:
        for ele in _kfkhData:
            ele["nval"] = 0
            continue

            # _hdid = ele["hdid"]
            # _con = _kfkhCon[str(_sday)][str(_hdid)]
            # _htype = _con["htype"]
            # if _htype in (1,3):
            #     _nVal = g.m.kfkhfun.getCondVal(uid, _sday, _hdid)
            #     # 替换该值
            #     if _nVal > ele["nval"] and ele["nval"] < ele["pval"]:
            #         g.m.kfkhfun.setKfkhData(uid, {"day": _sday, "hdid": _hdid}, {"nval": _nVal})
            #     ele["nval"] = _nVal
            
    # 开服狂欢
    _finishPro = g.m.kfkhfun.getFinishNum(uid)
    # 已领取奖励
    _recPrize = g.m.kfkhfun.getFinishProPrize(uid)
    _res["d"] = {"data": _kfkhData, "oday": _oday, "sday": _sday, 'finipro': _finishPro,
                 'recprize': _recPrize}  # oday=开区天数 sday=显示第x天
    return _res

if __name__ == '__main__':
    uid = g.buid("666")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[3])
