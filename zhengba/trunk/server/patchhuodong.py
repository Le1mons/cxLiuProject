#!/usr/bin/env pythonn
# coding:utf-8

import sys

sys.path.append('./game')
import g

'''
刷新玩家的图鉴激活状态
'''


# 更新活动
hdids = [4600]

# 创建活动
# _nt = g.getOpenTime()
_nt = g.C.NOW()
_hdCon = g.GC["huodong"]
_hdData = []
for ele in _hdCon:
    if ele['hdid'] not in hdids:
        continue
    _tmpData = {}
    _tmpData.update(ele)
    # 绝对时间戳
    if _tmpData["ttype"] == 0:
        # 永久活动
        if _tmpData["stime"] == -1:
            _tmpData["stime"] = 0
            _tmpData["etime"] = 0
            _tmpData["rtime"] = 0
            _tmpData["showtime"] = "永久"
        else:
            _tmpData["stime"] = g.C.ZERO(_tmpData["stime"] * 24 * 3600 + _nt)
            _tmpData["etime"] = g.C.ZERO(_tmpData["etime"] * 24 * 3600 + _nt) + 24 * 3600 - 1
            _tmpData["rtime"] = g.C.ZERO(_tmpData["rtime"] * 24 * 3600 + _nt) + 24 * 3600 - 1
            _st = g.C.getDate(_tmpData["stime"], "%m月%d日00:00")
            _et = g.C.getDate(_tmpData["rtime"], "%m月%d日23:59")
            _tmpData["showtime"] = _st + "-" + _et
            if str(_tmpData["htype"]) == '1010':
                # 如果是双倍活动
                _tmpData["data"] = {}
                _hd_dbprize = g.GC["hd_doubleprize"]
                for k, v in _hd_dbprize['hddata'].items():
                    _tmpData["data"][k] = {'opendate': []}
                    for d in v['openday']:
                        _openDate = g.C.DATE(_nt + d * 24 * 3600)
                        _tmpData["data"][k]['opendate'].append(_openDate)
    # 相对注册时间
    elif _tmpData["ttype"] == 1:
        pass
    # 相对开区时间
    elif _tmpData["ttype"] == 2:
        pass
    # 指定时间
    elif _tmpData["ttype"] == 3:
        # _tmpData["stime"] = g.C.ZERO(_nt)
        _st = g.C.getDate(_tmpData["stime"], "%m月%d日00:00")
        _et = g.C.getDate(_tmpData["rtime"], "%m月%d日23:59")
        _tmpData["showtime"] = _st + "-" + _et

    _hdData.append(_tmpData)

g.mdb.insert('hdinfo',_hdData)
print 'end...............'
