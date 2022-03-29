# coding:utf-8

import sys
sys.path.append('..')
import g

'''
在线奖励好礼：在线奖励界面
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":"1"}
    uid = conn.uid
    _resData = {}
    _resData['num'] = g.m.onlineprizefun.getRecPrizeNum(uid)
    _resData['cd'] = g.m.onlineprizefun.getCD(uid)
    #从配置中获取奖励内容并调整格式
    _con =  g.m.onlineprizefun.getCon()
    _conRes = [list(item['prize']) for item in _con]
    resFinally = [i[0] for i in _conRes]
    _res['d'] = _resData
    _res['d']["prize"] = resFinally
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao2')
    g.debugConn.uid = uid
    _nt = g.C.NOW()
    print doproc(g.debugConn, [])
