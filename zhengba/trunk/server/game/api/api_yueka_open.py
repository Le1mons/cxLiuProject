# coding:utf-8
'''
月卡 -- 打开界面
'''



if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'isjh': 是否激活,'nt':激活时间,'act':今天能否领取},
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # key = str(data[0])
    _resData = {}
    for key in ["da", "xiao"]:
        act = 1
        #获取月卡信息
        yuekaInfo = g.m.yuekafun.getYueKaInfo(uid,key)

        # 最后一天 是否领取
        con = g.m.yuekafun.getCon(key)
        ykzt = yuekaInfo['nt']
        nt = g.C.NOW()
        day = con['day']
        ykendtime = ykzt + 3600* 24 * day

        #判断是否领取：
        zt = g.C.ZERO(nt)
        if (zt < yuekaInfo['lqtime'] < zt + 3600*24):
            act = 0



        # 时间到了清除数据
        if nt > ykendtime and yuekaInfo['isjh'] == 1:
            yuekaInfo['nt'] = ykzt
            yuekaInfo['rmbmoney'] = 0
            yuekaInfo['lqnum'] = con['day']
            yuekaInfo['lqtime'] = 0
            yuekaInfo['isjh'] = 0
            ctype = 'yueka_' + key
            g.setAttrByCtype(uid, ctype, yuekaInfo, default={}, bydate=False, valCall='update')


        yuekaInfo["act"] = act
        _resData[key] = yuekaInfo
    _resData["lifetimecard"] = g.getPlayAttrDataNum(uid, 'lifetimecard_prize')
    _res["d"] = _resData
    return _res

if __name__ == "__main__":
    uid = g.buid("xuzhao")
    # g.debugConn.uid = "0_5aea81d0625aee4a04a0146d"
    g.debugConn.uid = uid
    print doproc(g.debugConn,['da'])






