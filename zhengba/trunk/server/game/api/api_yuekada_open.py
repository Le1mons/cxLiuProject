# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/5/11:33
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
    _etime = 0
    uid = conn.uid
    _nt = g.C.NOW()
    _act = 0
    _yuekaInfo = g.m.yuekafun.getDayuekaInfo(uid)
    #获取当前已经累计的钱
    _money = g.getAttrOne(uid, {"ctype": "yueka_chongzhi"}, keys="_id,v")["v"]
    _money = g.GC["xiaoyuka"]["maxmoney"]
    #判断是否激活月卡
    if _yuekaInfo is not None:
        if _yuekaInfo["k"] == 2:
            _act = 1
        _etime = _yuekaInfo["etime"]
        if _nt > _etime:
            _act = 0
    #判断是否已经购买
    _isgot = g.getAttrOne(uid,{"ctype": "Dayueka_getprize"},keys="_id,isgot")
    if _isgot is None:
        _isgot = 0
    else:
        _isgot = 1
    _res["d"] = {"act":_act,"etime":_etime,"money":_money,"isgot":_isgot,"maxnum":_money}
    return _res

if __name__ == "__main__":
    g.debugConn.uid = "0_5aea7b67625aee5548970d49"
    print doproc(g.debugConn,[])






