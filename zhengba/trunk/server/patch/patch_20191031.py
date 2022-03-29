#!/usr/bin/env python
# coding:utf-8

import sys, os

sys.path.append('game')

import g

'''
    激活玩家首充奖励
'''
print 'activation shouchong start ...'
a = {
    "0": [{"a": "item", "t": "2026", "n": 0}, {"a": "attr", "t": "useexp", "n": 0}],
    "1": [{"a": "item", "t": "2026", "n": 10}, {"a": "attr", "t": "useexp", "n": 245000}],
    "2": [{"a": "item", "t": "2026", "n": 20}, {"a": "attr", "t": "useexp", "n": 290000}],
    "3": [{"a": "item", "t": "2026", "n": 33}, {"a": "attr", "t": "useexp", "n": 335000}],
    "4": [{"a": "item", "t": "2026", "n": 48}, {"a": "attr", "t": "useexp", "n": 380000}],
    "5": [{"a": "item", "t": "2026", "n": 65}, {"a": "attr", "t": "useexp", "n": 425000}],
    "6": [{"a": "item", "t": "2026", "n": 84}, {"a": "attr", "t": "useexp", "n": 470000}],
    "7": [{"a": "item", "t": "2026", "n": 105}, {"a": "attr", "t": "useexp", "n": 515000}],
    "8": [{"a": "item", "t": "2026", "n": 128}, {"a": "attr", "t": "useexp", "n": 560000}],
    "9": [{"a": "item", "t": "2026", "n": 153}, {"a": "attr", "t": "useexp", "n": 605000}],
    "10": [{"a": "item", "t": "2026", "n": 180}, {"a": "attr", "t": "useexp", "n": 650000}],
    "11": [{"a": "item", "t": "2026", "n": 209}, {"a": "attr", "t": "useexp", "n": 695000}],
    "12": [{"a": "item", "t": "2026", "n": 224}, {"a": "attr", "t": "useexp", "n": 740000}],
    "13": [{"a": "item", "t": "2026", "n": 239}, {"a": "attr", "t": "useexp", "n": 785000}],
    "14": [{"a": "item", "t": "2026", "n": 255}, {"a": "attr", "t": "useexp", "n": 830000}],
    "15": [{"a": "item", "t": "2026", "n": 271}, {"a": "attr", "t": "useexp", "n": 875000}],
    "16": [{"a": "item", "t": "2026", "n": 288}, {"a": "attr", "t": "useexp", "n": 920000}],
    "17": [{"a": "item", "t": "2026", "n": 305}, {"a": "attr", "t": "useexp", "n": 965000}],
    "18": [{"a": "item", "t": "2026", "n": 322}, {"a": "attr", "t": "useexp", "n": 1010000}],
    "19": [{"a": "item", "t": "2026", "n": 340}, {"a": "attr", "t": "useexp", "n": 1055000}],
    "20": [{"a": "item", "t": "2026", "n": 358}, {"a": "attr", "t": "useexp", "n": 1100000}],
    "21": [{"a": "item", "t": "2026", "n": 377}, {"a": "attr", "t": "useexp", "n": 1145000}],
    "22": [{"a": "item", "t": "2026", "n": 396}, {"a": "attr", "t": "useexp", "n": 1190000}],
    "23": [{"a": "item", "t": "2026", "n": 415}, {"a": "attr", "t": "useexp", "n": 1235000}],
    "24": [{"a": "item", "t": "2026", "n": 435}, {"a": "attr", "t": "useexp", "n": 1280000}],
    "25": [{"a": "item", "t": "2026", "n": 455}, {"a": "attr", "t": "useexp", "n": 1325000}],
    "26": [{"a": "item", "t": "2026", "n": 476}, {"a": "attr", "t": "useexp", "n": 1370000}],
    "27": [{"a": "item", "t": "2026", "n": 497}, {"a": "attr", "t": "useexp", "n": 1415000}],
    "28": [{"a": "item", "t": "2026", "n": 518}, {"a": "attr", "t": "useexp", "n": 1460000}],
    "29": [{"a": "item", "t": "2026", "n": 540}, {"a": "attr", "t": "useexp", "n": 1505000}],
    "30": [{"a": "item", "t": "2026", "n": 562}, {"a": "attr", "t": "useexp", "n": 1550000}],
    "31": [{"a": "item", "t": "2026", "n": 585}, {"a": "attr", "t": "useexp", "n": 1595000}],
    "32": [{"a": "item", "t": "2026", "n": 608}, {"a": "attr", "t": "useexp", "n": 1640000}],
    "33": [{"a": "item", "t": "2026", "n": 631}, {"a": "attr", "t": "useexp", "n": 1685000}],
    "34": [{"a": "item", "t": "2026", "n": 655}, {"a": "attr", "t": "useexp", "n": 1730000}],
    "35": [{"a": "item", "t": "2026", "n": 679}, {"a": "attr", "t": "useexp", "n": 1775000}],
    "36": [{"a": "item", "t": "2026", "n": 704}, {"a": "attr", "t": "useexp", "n": 1820000}],
    "37": [{"a": "item", "t": "2026", "n": 729}, {"a": "attr", "t": "useexp", "n": 1865000}],
    "38": [{"a": "item", "t": "2026", "n": 754}, {"a": "attr", "t": "useexp", "n": 1910000}],
    "39": [{"a": "item", "t": "2026", "n": 780}, {"a": "attr", "t": "useexp", "n": 1955000}],
    "40": [{"a": "item", "t": "2026", "n": 806}, {"a": "attr", "t": "useexp", "n": 2000000}],
    "41": [{"a": "item", "t": "2026", "n": 833}, {"a": "attr", "t": "useexp", "n": 2100000}],
    "42": [{"a": "item", "t": "2026", "n": 860}, {"a": "attr", "t": "useexp", "n": 2200000}],
    "43": [{"a": "item", "t": "2026", "n": 887}, {"a": "attr", "t": "useexp", "n": 2300000}],
    "44": [{"a": "item", "t": "2026", "n": 915}, {"a": "attr", "t": "useexp", "n": 2400000}],
    "45": [{"a": "item", "t": "2026", "n": 943}, {"a": "attr", "t": "useexp", "n": 2500000}],
    "46": [{"a": "item", "t": "2026", "n": 972}, {"a": "attr", "t": "useexp", "n": 2600000}],
    "47": [{"a": "item", "t": "2026", "n": 1001}, {"a": "attr", "t": "useexp", "n": 2700000}],
    "48": [{"a": "item", "t": "2026", "n": 1030}, {"a": "attr", "t": "useexp", "n": 2800000}],
    "49": [{"a": "item", "t": "2026", "n": 1060}, {"a": "attr", "t": "useexp", "n": 2900000}],
    "50": [{"a": "item", "t": "2026", "n": 1090}, {"a": "attr", "t": "useexp", "n": 3000000}],
    "51": [{"a": "item", "t": "2026", "n": 1121}, {"a": "attr", "t": "useexp", "n": 3100000}],
    "52": [{"a": "item", "t": "2026", "n": 1152}, {"a": "attr", "t": "useexp", "n": 3200000}],
    "53": [{"a": "item", "t": "2026", "n": 1183}, {"a": "attr", "t": "useexp", "n": 3300000}],
    "54": [{"a": "item", "t": "2026", "n": 1215}, {"a": "attr", "t": "useexp", "n": 3400000}],
    "55": [{"a": "item", "t": "2026", "n": 1247}, {"a": "attr", "t": "useexp", "n": 3500000}],
    "56": [{"a": "item", "t": "2026", "n": 1280}, {"a": "attr", "t": "useexp", "n": 3600000}],
    "57": [{"a": "item", "t": "2026", "n": 1313}, {"a": "attr", "t": "useexp", "n": 3700000}],
    "58": [{"a": "item", "t": "2026", "n": 1346}, {"a": "attr", "t": "useexp", "n": 3800000}],
    "59": [{"a": "item", "t": "2026", "n": 1380}, {"a": "attr", "t": "useexp", "n": 3900000}],
    "60": [{"a": "item", "t": "2026", "n": 1414}, {"a": "attr", "t": "useexp", "n": 4000000}],
    "61": [{"a": "item", "t": "2026", "n": 1449}, {"a": "attr", "t": "useexp", "n": 4150000}],
    "62": [{"a": "item", "t": "2026", "n": 1484}, {"a": "attr", "t": "useexp", "n": 4300000}],
    "63": [{"a": "item", "t": "2026", "n": 1519}, {"a": "attr", "t": "useexp", "n": 4450000}],
    "64": [{"a": "item", "t": "2026", "n": 1555}, {"a": "attr", "t": "useexp", "n": 4600000}],
    "65": [{"a": "item", "t": "2026", "n": 1591}, {"a": "attr", "t": "useexp", "n": 4750000}],
    "66": [{"a": "item", "t": "2026", "n": 1628}, {"a": "attr", "t": "useexp", "n": 4900000}],
    "67": [{"a": "item", "t": "2026", "n": 1665}, {"a": "attr", "t": "useexp", "n": 5050000}],
    "68": [{"a": "item", "t": "2026", "n": 1702}, {"a": "attr", "t": "useexp", "n": 5200000}],
    "69": [{"a": "item", "t": "2026", "n": 1740}, {"a": "attr", "t": "useexp", "n": 5350000}],
    "70": [{"a": "item", "t": "2026", "n": 1778}, {"a": "attr", "t": "useexp", "n": 5500000}],
    "71": [{"a": "item", "t": "2026", "n": 1817}, {"a": "attr", "t": "useexp", "n": 5650000}],
    "72": [{"a": "item", "t": "2026", "n": 1856}, {"a": "attr", "t": "useexp", "n": 5800000}],
    "73": [{"a": "item", "t": "2026", "n": 1895}, {"a": "attr", "t": "useexp", "n": 5950000}],
    "74": [{"a": "item", "t": "2026", "n": 1935}, {"a": "attr", "t": "useexp", "n": 6100000}],
    "75": [{"a": "item", "t": "2026", "n": 1975}, {"a": "attr", "t": "useexp", "n": 6250000}],
    "76": [{"a": "item", "t": "2026", "n": 2016}, {"a": "attr", "t": "useexp", "n": 6400000}],
    "77": [{"a": "item", "t": "2026", "n": 2057}, {"a": "attr", "t": "useexp", "n": 6550000}],
    "78": [{"a": "item", "t": "2026", "n": 2098}, {"a": "attr", "t": "useexp", "n": 6700000}],
    "79": [{"a": "item", "t": "2026", "n": 2140}, {"a": "attr", "t": "useexp", "n": 6850000}],
    "80": [{"a": "item", "t": "2026", "n": 2182}, {"a": "attr", "t": "useexp", "n": 7000000}],
    "81": [{"a": "item", "t": "2026", "n": 2225}, {"a": "attr", "t": "useexp", "n": 7200000}],
    "82": [{"a": "item", "t": "2026", "n": 2268}, {"a": "attr", "t": "useexp", "n": 7400000}],
    "83": [{"a": "item", "t": "2026", "n": 2311}, {"a": "attr", "t": "useexp", "n": 7600000}],
    "84": [{"a": "item", "t": "2026", "n": 2355}, {"a": "attr", "t": "useexp", "n": 7800000}],
    "85": [{"a": "item", "t": "2026", "n": 2399}, {"a": "attr", "t": "useexp", "n": 8000000}],
    "86": [{"a": "item", "t": "2026", "n": 2444}, {"a": "attr", "t": "useexp", "n": 8200000}],
    "87": [{"a": "item", "t": "2026", "n": 2489}, {"a": "attr", "t": "useexp", "n": 8400000}],
    "88": [{"a": "item", "t": "2026", "n": 2534}, {"a": "attr", "t": "useexp", "n": 8600000}],
    "89": [{"a": "item", "t": "2026", "n": 2580}, {"a": "attr", "t": "useexp", "n": 8800000}],
    "90": [{"a": "item", "t": "2026", "n": 2626}, {"a": "attr", "t": "useexp", "n": 9000000}],
    "91": [{"a": "item", "t": "2026", "n": 2673}, {"a": "attr", "t": "useexp", "n": 9200000}],
    "92": [{"a": "item", "t": "2026", "n": 2720}, {"a": "attr", "t": "useexp", "n": 9400000}],
    "93": [{"a": "item", "t": "2026", "n": 2767}, {"a": "attr", "t": "useexp", "n": 9600000}],
    "94": [{"a": "item", "t": "2026", "n": 2815}, {"a": "attr", "t": "useexp", "n": 9800000}],
    "95": [{"a": "item", "t": "2026", "n": 2863}, {"a": "attr", "t": "useexp", "n": 10000000}],
    "96": [{"a": "item", "t": "2026", "n": 2912}, {"a": "attr", "t": "useexp", "n": 10200000}],
    "97": [{"a": "item", "t": "2026", "n": 2961}, {"a": "attr", "t": "useexp", "n": 10400000}],
    "98": [{"a": "item", "t": "2026", "n": 3010}, {"a": "attr", "t": "useexp", "n": 10600000}],
    "99": [{"a": "item", "t": "2026", "n": 3060}, {"a": "attr", "t": "useexp", "n": 10800000}],
    "100": [{"a": "item", "t": "2026", "n": 3110}, {"a": "attr", "t": "useexp", "n": 11000000}]
}

g.mdb.update('buff', {}, {'$unset': {'buff.enchant': 1, 'buff.equipmaster': 1}}, RELEASE=1)
_email = []
_all = g.mdb.find('enchant')
for i in _all:
    if 'data' not in i:
        continue
    _prize = []
    for job, item in i['data'].items():
        for _, lv in item.items():
            for x in xrange(1, lv + 1):
                _prize += a[str(x)]
    _prize = g.fmtPrizeList(_prize)
    _temp = {'title': '装备附魔补偿', 'uid': i['uid'], 'prize': _prize, 'content': ''}
    _emailData = g.m.emailfun.fmtEmail(**_temp)
    _email.append(_emailData)

if _email:
    g.mdb.insert('email', _email)
g.mdb.delete('enchant', RELEASE=1)
g.mdb.delete('shops', {"shopid": {'$in': ["7", "10"]}}, RELEASE=1)

# 增加活动
_day = g.getOpenDay()
_nt = g.C.NOW()
if 1 <= _day <= 14:
    g.mdb.delete('hdinfo', {'hdid': {'$in': [3400, 3500]}}, RELEASE=1)
    hd = [i for i in g.GC['huodong'] if i['hdid'] == 3600][0]
    hd["stime"] = g.C.ZERO(hd["stime"] * 24 * 3600 + g.getOpenTime())
    hd["etime"] = g.C.ZERO(hd["etime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    hd["rtime"] = g.C.ZERO(hd["rtime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    _st = g.C.getDate(hd["stime"], "%m月%d日00:00")
    _et = g.C.getDate(hd["rtime"], "%m月%d日23:59")
    hd["showtime"] = _st + "-" + _et
    g.mdb.insert('hdinfo', hd)

if 1 <= _day <= 7:
    hd = [i for i in g.GC['huodong'] if i['hdid'] == 3400][0]
    hd["stime"] = g.C.ZERO(hd["stime"] * 24 * 3600 + g.getOpenTime())
    hd["etime"] = g.C.ZERO(hd["etime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    hd["rtime"] = g.C.ZERO(hd["rtime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    _st = g.C.getDate(hd["stime"], "%m月%d日00:00")
    _et = g.C.getDate(hd["rtime"], "%m月%d日23:59")
    hd["showtime"] = _st + "-" + _et
    g.mdb.insert('hdinfo', hd)

    hd = [i for i in g.GC['huodong'] if i['hdid'] == 3500][0]
    hd["stime"] = g.C.ZERO(hd["stime"] * 24 * 3600 + g.getOpenTime())
    hd["etime"] = g.C.ZERO(hd["etime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    hd["rtime"] = g.C.ZERO(hd["rtime"] * 24 * 3600 + g.getOpenTime()) + 24 * 3600 - 1
    _st = g.C.getDate(hd["stime"], "%m月%d日00:00")
    _et = g.C.getDate(hd["rtime"], "%m月%d日23:59")
    hd["showtime"] = _st + "-" + _et
    g.mdb.insert('hdinfo', hd)

print 'OK'
