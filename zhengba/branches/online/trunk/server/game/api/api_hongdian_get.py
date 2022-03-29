# !/usr/bin/python
# coding:utf-8
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
红点 - 获取所有红点
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    iscache = 0
    hdlist = []
    if len(data) == 1:
        #是否获取缓存
        iscache = int(data[0])
    if len(data) == 2:
        #活动标识，未空数组取全部红点，或取指定红点
        hdlist = list(data[1])
        iscache = int(data[0])

    # 如果小于五级
    gud = g.getGud(uid)
    if gud['lv'] <= 5:
        _keyList = ['email','yueka_xiao','yueka_da','sign','dengjiprize','jitianfanli','leijichongzhi',
                    'herojitan','zhouchanghuodong','gonghui','guajitime','tanxian','shizijun',
                    'succtask','dailytask','mrsl','treature','friend','dianjin','huodong','worship',
                    'artifact', 'hecheng','crosszbjifen','meirishouchong','destiny','xuyuanchi','herorecruit',
                    'xszm','crosswz','teamcopy','kingstatue']
        _rData = {i:0 for i in _keyList}
        _rData.update({'kfkh':{},'shouchonghaoli':{},'chongzhiandlibao':{"meiribx": 0, "meirisd": 0},
                       'monthfund':{'170':{},'180':{}},'watcher':{'target':0,'trader':0},'fashita':{'fashita':0,'devil':0}})

        if hdlist:
            _rData = {i:_rData[i] for i in hdlist}
            _res["d"] = _rData
    else:
        _rData = g.m.hongdianfun.getAllHongdian(uid,hdlist,iscache)
    _res["d"] = _rData
    return _res


if __name__ == "__main__":
    uid = g.buid('666')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [])