#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-获取指定城市数据
'''

def proc(conn, data, key=None):
    """

    :param conn: 
    :param 参数1:  cityid 必须参数	类型: <type 'str'>	说明:城市id
    :param 参数2: 必须参数	类型: <type 'int'>	说明:
    :return:
    ::

        [
            {
                "": {
                    "s": 1, 
                    "d": {
                        "myinfo": {
                            "winnum": 0, 
                            "uid": "0_5ec48aad9dc6d640cc8ef26b", 
                            "fightnum": 7, 
                            "jifeninfo": {
                                "1": 7
                            }, 
                            "zhanli": 57585, 
                            "alljifen": 7
                        }, 
                        "recoverinfo": {
                            "num": -2, 
                            "recovertime": 1591013090
                        }, 
                        "challengeinfo": {
                            "pklist": [
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 310716, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_8", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "isBack": false, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": true, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "xpskillindex": 6, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 100, 
                                            "hp": 13673706, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "afterXpskillRound": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "dead": false, 
                                            "maxhp": 13673706, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 368315, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_9", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "isBack": false, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": true, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 14612488, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "afterXpskillRound": 7, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "dead": false, 
                                            "maxhp": 14612488, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 258360, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_10", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "isBack": true, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": false, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 14873174, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "afterXpskillRound": 7, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "dead": false, 
                                            "maxhp": 14873174, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 357843, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_11", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "isBack": true, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": false, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 9882099, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "afterXpskillRound": 7, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "dead": false, 
                                            "maxhp": 9882099, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 429413, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_12", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "isBack": true, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": false, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "xpskillindex": 2, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 100, 
                                            "hp": 12640607, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "afterXpskillRound": 3, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "dead": false, 
                                            "maxhp": 12640607, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 700, 
                                            "miankongpro": 280, 
                                            "atk": 317702, 
                                            "atkpro": 1000, 
                                            "ready": true, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "rid": "role_13", 
                                            "shenqidpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "isBack": true, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "isFront": false, 
                                            "zhongdudpspro": 0, 
                                            "dpspro": 0, 
                                            "maxnuqi": 100, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 14121102, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "afterXpskillRound": 7, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "dead": false, 
                                            "maxhp": 14121102, 
                                            "skilldpspro": 0, 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "uid": "NPC", 
                                    "winside": 1, 
                                    "zhanli": 8271339, 
                                    "alljifen": 0, 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }, 
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 164615, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5812156, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "maxhp": 5812156, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 195130, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6211197, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "maxhp": 6211197, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 136878, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6322002, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "maxhp": 6322002, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 189583, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 4200493, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "maxhp": 4200493, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 227500, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5373027, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "maxhp": 5373027, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 168316, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6002327, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "maxhp": 6002327, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "alljifen": 0, 
                                    "zhanli": 8271339, 
                                    "uid": "NPC", 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }, 
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 164615, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5812156, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "maxhp": 5812156, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 195130, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6211197, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "maxhp": 6211197, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 136878, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6322002, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "maxhp": 6322002, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 189583, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 4200493, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "maxhp": 4200493, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 227500, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5373027, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "maxhp": 5373027, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 168316, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6002327, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "maxhp": 6002327, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "alljifen": 0, 
                                    "zhanli": 8271339, 
                                    "uid": "NPC", 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }, 
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 164615, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5812156, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "maxhp": 5812156, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 195130, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6211197, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "maxhp": 6211197, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 136878, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6322002, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "maxhp": 6322002, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 189583, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 4200493, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "maxhp": 4200493, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 227500, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5373027, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "maxhp": 5373027, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 168316, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6002327, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "maxhp": 6002327, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "alljifen": 0, 
                                    "zhanli": 8271339, 
                                    "uid": "NPC", 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }, 
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 164615, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5812156, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "maxhp": 5812156, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 195130, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6211197, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "maxhp": 6211197, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 136878, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6322002, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "maxhp": 6322002, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 189583, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 4200493, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "maxhp": 4200493, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 227500, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5373027, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "maxhp": 5373027, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 168316, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6002327, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "maxhp": 6002327, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "alljifen": 0, 
                                    "zhanli": 8271339, 
                                    "uid": "NPC", 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }, 
                                {
                                    "herolist": [
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 4, 
                                            "zhanli": 1405111, 
                                            "normalskill": "41066002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 164615, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "4106a114", 
                                                "4106a124", 
                                                "4106a211", 
                                                "4106a221", 
                                                "4106a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "4106a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1156, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5812156, 
                                            "undercurepro": 0, 
                                            "pos": 1, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "4106a211", 
                                                "4106a221"
                                            ], 
                                            "hid": "41066", 
                                            "bd1skill": [
                                                "4106a114", 
                                                "4106a124"
                                            ], 
                                            "maxhp": 5812156, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "4106a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 5, 
                                            "zhanli": 1527009, 
                                            "normalskill": "63026002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 195130, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "6302a114", 
                                                "6302a124", 
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241", 
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "6302a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1107, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6211197, 
                                            "undercurepro": 0, 
                                            "pos": 2, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "6302a211", 
                                                "6302a221", 
                                                "6302a231", 
                                                "6302a241"
                                            ], 
                                            "hid": "63026", 
                                            "bd1skill": [
                                                "6302a114", 
                                                "6302a124"
                                            ], 
                                            "maxhp": 6211197, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "6302a314", 
                                                "6302a324"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1433523, 
                                            "normalskill": "31076002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 136878, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3107a114", 
                                                "3107a211", 
                                                "3107a221", 
                                                "3107a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3107a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1150, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6322002, 
                                            "undercurepro": 0, 
                                            "pos": 3, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "3107a211", 
                                                "3107a221"
                                            ], 
                                            "hid": "31076", 
                                            "bd1skill": [
                                                "3107a114"
                                            ], 
                                            "maxhp": 6322002, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3107a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1987
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 2, 
                                            "zhanli": 1128583, 
                                            "normalskill": "23036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 189583, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "2303a114", 
                                                "2303a124", 
                                                "2303a211", 
                                                "2303a221", 
                                                "2303a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "2303a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1104, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 4200493, 
                                            "undercurepro": 0, 
                                            "pos": 4, 
                                            "job": 3, 
                                            "bd2skill": [
                                                "2303a211", 
                                                "2303a221"
                                            ], 
                                            "hid": "23036", 
                                            "bd1skill": [
                                                "2303a114", 
                                                "2303a124"
                                            ], 
                                            "maxhp": 4200493, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "2303a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2086
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 3, 
                                            "zhanli": 1362188, 
                                            "normalskill": "34036002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 227500, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114", 
                                                "3403a214", 
                                                "3403a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "3403a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1168, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 5373027, 
                                            "undercurepro": 0, 
                                            "pos": 5, 
                                            "job": 4, 
                                            "bd2skill": [
                                                "3403a214"
                                            ], 
                                            "hid": "34036", 
                                            "bd1skill": [
                                                "3403a111", 
                                                "3403a121", 
                                                "3403a131", 
                                                "3403a114"
                                            ], 
                                            "maxhp": 5373027, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "3403a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 1887
                                        }, 
                                        {
                                            "unzhongdupro": 0, 
                                            "zhongzu": 1, 
                                            "zhanli": 1414925, 
                                            "normalskill": "11086002", 
                                            "gedangpro": 0, 
                                            "undpspro": 0, 
                                            "miankongpro": 0, 
                                            "atk": 168316, 
                                            "atkpro": 1000, 
                                            "skill": [
                                                "1108a111", 
                                                "1108a121", 
                                                "1108a214", 
                                                "1108a224", 
                                                "1108a314"
                                            ], 
                                            "defpro": 1000, 
                                            "dpspro": 0, 
                                            "xpskill": "1108a012", 
                                            "jianshangpro": 0, 
                                            "speed": 1153, 
                                            "pojiapro": 0, 
                                            "pvpundpspro": 0, 
                                            "lv": 322, 
                                            "zhongdudpsdrop": 0, 
                                            "maxnuqi": 100, 
                                            "shenqidpspro": 0, 
                                            "zhongdudpspro": 0, 
                                            "baoshangpro": 0, 
                                            "side": 1, 
                                            "head": "41066", 
                                            "star": 10, 
                                            "unzhuoshaopro": 0, 
                                            "nuqi": 50, 
                                            "hp": 6002327, 
                                            "undercurepro": 0, 
                                            "pos": 6, 
                                            "job": 1, 
                                            "bd2skill": [
                                                "1108a214", 
                                                "1108a224"
                                            ], 
                                            "hid": "11086", 
                                            "bd1skill": [
                                                "1108a111", 
                                                "1108a121"
                                            ], 
                                            "maxhp": 6002327, 
                                            "skilldpspro": 0, 
                                            "bd3skill": [
                                                "1108a314"
                                            ], 
                                            "jingzhunpro": 0, 
                                            "unbaojipro": 0, 
                                            "baojipro": 0, 
                                            "enlargepro": 1, 
                                            "speedpro": 1000, 
                                            "curepro": 0, 
                                            "hppro": 1000, 
                                            "unliuxuepro": 0, 
                                            "pvpdpspro": 0, 
                                            "undotdpspro": 0, 
                                            "def": 2020
                                        }
                                    ], 
                                    "alljifen": 0, 
                                    "zhanli": 8271339, 
                                    "uid": "NPC", 
                                    "headdata": {
                                        "lv": 322, 
                                        "head": "41066", 
                                        "name": "张飞", 
                                        "ext_servername": "内网"
                                    }
                                }
                            ], 
                            "passlist": [
                                0, 
                                0, 
                                0, 
                                0, 
                                0, 
                                0, 
                                0
                            ]
                        }, 
                        "cityrank": {
                            "myrank": -1, 
                            "myval": 7, 
                            "ranklist": [
                                {
                                    "ghname": "电饭锅", 
                                    "rank": 1, 
                                    "jifen": 7
                                }, 
                                {
                                    "ghname": "电饭锅", 
                                    "rank": 2, 
                                    "jifen": 1
                                }, 
                                {
                                    "ghname": "电饭锅", 
                                    "rank": 3, 
                                    "jifen": 1
                                }, 
                                {
                                    "ghname": "电饭锅", 
                                    "rank": 4, 
                                    "jifen": 1
                                }, 
                                {
                                    "ghname": "电饭锅", 
                                    "rank": 5, 
                                    "jifen": 1
                                }
                            ]
                        }
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
    _cityid = str(data[0])

    # # 等级不足
    # if not g.chkOpenCond(uid, 'gonghuisiege'):
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData
    gud = g.getGud(uid)
    # 判断条件
    _openCond = g.GC["gonghuisiege"]["openCond"]
    _openDay = g.getOpenDay()
    _needLv = _openCond[-1][1]
    for cond in _openCond:
        # 判断是否在这个条件下
        if cond[0][0] <= _openDay < cond[0][1]:
            _needLv = cond[1]

    if gud["lv"] < _needLv:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('gonghuisiege_opencond').format(_needLv)
        return _chkData

    # 判断是否在活动持续时间段内
    if not g.m.gonghuisiegefun.chkOpen():
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData


    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-2')
        return _chkData

    _chkData["cityid"] = _cityid
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
    # 获取城市id
    _cityid = _chkData["cityid"]
    # 玩家数据
    _myinfo = g.m.gonghuisiegefun.getUserData(uid, keys="_id,alljifen,jifeninfo,uid,winnum,zhanli,fightnum", init=1)
    # 获取玩家数据
    _resData["myinfo"] = _myinfo
    # 恢复类道具
    _resData["recoverinfo"] = g.m.gonghuisiegefun.getRevertNum(uid)
    # 获取挑战list
    _resData["challengeinfo"] = g.m.gonghuisiegefun.getPkUserList(uid, _cityid)
    # # 获取城市战力的排行
    _resData["cityrank"] = g.m.gonghuisiegefun.getCityRank(uid, _cityid)
    # 免费刷新次数
    _freenum = g.GC["gonghuisiege"]["freenum"]
    _fightNum = g.m.gonghuisiegefun.getFreeRefNum(uid)


    _resData["freerefnum"] = _freenum if _fightNum > _freenum else _fightNum
    # 奖励显示
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('0')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)
    _openCond = g.GC["gonghuisiege"]["openCond"]
    # _openDay = g.getOpenDay()
    # _needLv = _openCond[-1][1]
    # for cond in _openCond:
    #     # 判断是否在这个条件下
    #     if cond[0][0] <= _openDay < cond[0][1]:
    #         _needLv = cond[1]
    # print _needLv
    _needLv = 10
    print g.L('gonghuisiege_opencond').format(_needLv)