#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
工会—攻城略地-刷新
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
                "attrchange": {
                    "rmbmoney": 100000999943045
                }
            }, 
            {
                "": {
                    "s": 1, 
                    "d": {
                        "freerefnum": 7,  今天的刷新次数
                        "challengeinfo": [  新的挑战列表
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "4106a114", 
                                            "4106a124", 
                                            "4106a211", 
                                            "4106a221", 
                                            "4106a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "4106a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1156, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "4106a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 164615, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
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
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "6302a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1107, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "6302a314", 
                                            "6302a324"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 195130, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3107a114", 
                                            "3107a211", 
                                            "3107a221", 
                                            "3107a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3107a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1150, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3107a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 136878, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "2303a114", 
                                            "2303a124", 
                                            "2303a211", 
                                            "2303a221", 
                                            "2303a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "2303a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1104, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "2303a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 189583, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "3403a111", 
                                            "3403a121", 
                                            "3403a131", 
                                            "3403a114", 
                                            "3403a214", 
                                            "3403a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "3403a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1168, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "3403a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 227500, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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
                                        "unbaojipro": 0, 
                                        "maxnuqi": 100, 
                                        "skill": [
                                            "1108a111", 
                                            "1108a121", 
                                            "1108a214", 
                                            "1108a224", 
                                            "1108a314"
                                        ], 
                                        "curepro": 0, 
                                        "defpro": 1000, 
                                        "shenqidpspro": 0, 
                                        "enlargepro": 1, 
                                        "xpskill": "1108a012", 
                                        "jianshangpro": 0, 
                                        "speed": 1153, 
                                        "pojiapro": 0, 
                                        "pvpundpspro": 0, 
                                        "lv": 322, 
                                        "zhongdudpsdrop": 0, 
                                        "zhongdudpspro": 0, 
                                        "dpspro": 0, 
                                        "hppro": 1000, 
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
                                        "bd3skill": [
                                            "1108a314"
                                        ], 
                                        "jingzhunpro": 0, 
                                        "baojipro": 0, 
                                        "atk": 168316, 
                                        "speedpro": 1000, 
                                        "atkpro": 1000, 
                                        "skilldpspro": 0, 
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

    _con = g.GC['gonghuisiege']
    # 等级不足
    if g.getOpenDay() < _con['openday']:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData

    # # 判断是否在活动持续时间段内
    # if not g.m.gonghuisiegefun.chkOpen():
    #     _chkData['s'] = -1
    #     _chkData['errmsg'] = g.L('global_noopen')
    #     return _chkData

    gud = g.getGud(uid)
    # 判断是否有工会
    if not gud["ghid"]:
        _chkData['s'] = -2
        _chkData['errmsg'] = g.L('gonghuisiege_open_res_-2')
        return _chkData
    _con = g.GC["gonghuisiege"]

    # 判断是否有免费次数
    # 设置刷新次数
    _refNum = g.m.gonghuisiegefun.getFreeRefNum(uid)
    if _refNum >= _con["freenum"]:
        _need = _con["refneed"]
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _chkData['s'] = -100
                _chkData['attr'] = _chk['t']
            else:
                _chkData["s"] = -104
                _chkData[_chk['a']] = _chk['t']
            return _chkData

        _chkData["need"] = _need
    _chkData["refnum"] = _refNum
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

    _ciytid = str(data[0])
    if "need" in _chkData:
        # 玩家数据
        _sendData = g.delNeed(uid, _chkData["need"], logdata={'act': 'gonghuisiege_refresh'})
        g.sendChangeInfo(conn, _sendData)
    # 刷新pk数据
    _enemyList = g.m.gonghuisiegefun.refPkUser(uid, _ciytid)
    g.m.gonghuisiegefun.setPkUserList(uid, _ciytid, {"v": _enemyList, "passlist": []})
    # 设置刷新次数
    g.m.gonghuisiegefun.setFreeRefNum(uid, _chkData["refnum"])
    _resData["challengeinfo"] = {"pklist": _enemyList, "passlist": []}
    # 免费刷新次数
    _freenum = g.GC["gonghuisiege"]["freenum"]
    _fightNum = g.m.gonghuisiegefun.getFreeRefNum(uid)
    _resData["freerefnum"] = _freenum if _chkData["refnum"] + 1 > _freenum else _chkData["refnum"] + 1
    _res["d"] = _resData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)