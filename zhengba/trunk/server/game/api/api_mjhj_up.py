#!/usr/bin/python
# coding:utf-8

'''
名将绘卷 - 提升
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g



def proc(conn, data):
    """

    :param conn: 
    :param 参数1: 必须参数	类型: <type 'int'>	说明:
    :param 参数2: 必须参数	类型: <type 'list'>	说明:
    :return:
    ::

        [
            {
                "herochange": {
                    "5f4a2e7a9dc6d67f1d0a7b6a": {
                        "color": 5, 
                        "resizhongzu3": 0, 
                        "resizhongzu1": 0, 
                        "gedangpro": 0, 
                        "undpspro": 120, 
                        "resizhongzu4": 0, 
                        "resizhongzu5": 0, 
                        "gedangdrop": 0, 
                        "commonbuff": {
                            "chenghao": {}, 
                            "mjcstitle": {
                                "ehp": 9720, 
                                "resizhongzu5pro": 80, 
                                "resizhongzu2pro": 40, 
                                "killzhongzu3pro": 30, 
                                "eatk": 1960, 
                                "killzhongzu4pro": 50
                            }, 
                            "mjhj": {}, 
                            "pifu": {
                                "hppro": 20, 
                                "atkpro": 10
                            }, 
                            "keji": {}
                        }, 
                        "killzhongzu4pro": 50, 
                        "speed": 736, 
                        "dpspro": 0, 
                        "jianshangpro": 0, 
                        "skilldpsdrop": 0, 
                        "ehp": 9720, 
                        "jingzhunpro": 0, 
                        "pojiapro": 0, 
                        "name": "曹操", 
                        "lv": 121, 
                        "resizhongzu2": 0, 
                        "resizhongzu1pro": 0, 
                        "starhppro": 1000, 
                        "baojidrop": 0, 
                        "equip": {
                            "1": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "3": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "2": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "4": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }
                        }, 
                        "hp": 340195, 
                        "undotdpspro": 0, 
                        "resizhongzu4pro": 0, 
                        "jingzhundrop": 0, 
                        "hid": "21056", 
                        "pinglunid": "2105", 
                        "ctime": 1598697082, 
                        "killzhongzu1": 0, 
                        "killzhongzu3": 0, 
                        "killzhongzu2": 0, 
                        "killzhongzu5": 0, 
                        "killzhongzu4": 0, 
                        "unbaojipro": 0, 
                        "undpsdrop": 0, 
                        "edef": 0, 
                        "herobuff": {
                            "bdskillbuff": {
                                "hppro": 550, 
                                "defpro": 450, 
                                "undpspro": 120, 
                                "atkpro": 250
                            }
                        }, 
                        "zhanli": 64994, 
                        "kjzhanli": 0, 
                        "pvpdpspro": 0, 
                        "pojiadrop": 0, 
                        "atkpro": 1000, 
                        "def": 1189, 
                        "hpdrop": 0, 
                        "zhongzu": 2, 
                        "resizhongzu3pro": 0, 
                        "miankongpro": 0, 
                        "speeddrop": 0, 
                        "zizhi": "23", 
                        "speedpro": 1000, 
                        "miankongdrop": 0, 
                        "bwzhanli": 0, 
                        "defpro": 1000, 
                        "defdrop": 0, 
                        "hppro": 1000, 
                        "undercurepro": 0, 
                        "pvpundpspro": 0, 
                        "staratkpro": 1000, 
                        "dpsdrop": 0, 
                        "killzhongzu5pro": 0, 
                        "tid": "5f4a2e7a9dc6d67f1d0a7b6a", 
                        "skilldpspro": 0, 
                        "baoshangpro": 0, 
                        "islock": 0, 
                        "star": 10, 
                        "atkdrop": 0, 
                        "espeed": 0, 
                        "lasttime": 1598697082, 
                        "baojipro": 0, 
                        "resizhongzu5pro": 80, 
                        "atk": 12086, 
                        "killzhongzu2pro": 0, 
                        "resizhongzu2pro": 40, 
                        "killzhongzu3pro": 30, 
                        "eatk": 1960, 
                        "awake": 1, 
                        "baoshangdrop": 0, 
                        "killzhongzu1pro": 0, 
                        "curepro": 0
                    }, 
                    "5f4c72f90ae9fe0c78c47f49": {
                        "color": 5, 
                        "resizhongzu3": 0, 
                        "resizhongzu1": 0, 
                        "gedangpro": 400, 
                        "undpspro": 0, 
                        "resizhongzu4": 0, 
                        "resizhongzu5": 0, 
                        "gedangdrop": 0, 
                        "commonbuff": {
                            "chenghao": {}, 
                            "mjcstitle": {
                                "ehp": 9720, 
                                "resizhongzu5pro": 80, 
                                "resizhongzu2pro": 40, 
                                "killzhongzu3pro": 30, 
                                "eatk": 1960, 
                                "killzhongzu4pro": 50
                            }, 
                            "mjhj": {}, 
                            "pifu": {
                                "hppro": 20, 
                                "atkpro": 10
                            }, 
                            "keji": {}
                        }, 
                        "killzhongzu4pro": 50, 
                        "speed": 1039, 
                        "dpspro": 0, 
                        "jianshangpro": 0, 
                        "skilldpsdrop": 0, 
                        "ehp": 9720, 
                        "jingzhunpro": 0, 
                        "pojiapro": 0, 
                        "name": "张春华", 
                        "lv": 200, 
                        "resizhongzu2": 0, 
                        "resizhongzu1pro": 0, 
                        "starhppro": 1000, 
                        "baojidrop": 0, 
                        "equip": {
                            "1": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "3": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "2": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "4": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }
                        }, 
                        "hp": 434202, 
                        "undotdpspro": 0, 
                        "resizhongzu4pro": 0, 
                        "jingzhundrop": 0, 
                        "hid": "25076", 
                        "pinglunid": "2507", 
                        "ctime": 1598845689, 
                        "killzhongzu1": 0, 
                        "killzhongzu3": 0, 
                        "killzhongzu2": 0, 
                        "killzhongzu5": 0, 
                        "killzhongzu4": 0, 
                        "unbaojipro": 0, 
                        "undpsdrop": 0, 
                        "edef": 0, 
                        "herobuff": {
                            "bdskillbuff": {
                                "gedangpro": 400, 
                                "speed": 60, 
                                "hppro": 600
                            }, 
                            "pifu": {}
                        }, 
                        "zhanli": 88487, 
                        "kjzhanli": 155, 
                        "pvpdpspro": 0, 
                        "pojiadrop": 0, 
                        "atkpro": 1000, 
                        "def": 1317, 
                        "hpdrop": 0, 
                        "zhongzu": 2, 
                        "resizhongzu3pro": 0, 
                        "miankongpro": 0, 
                        "speeddrop": 0, 
                        "zizhi": "23", 
                        "speedpro": 1000, 
                        "miankongdrop": 0, 
                        "bwzhanli": 0, 
                        "defpro": 1000, 
                        "defdrop": 0, 
                        "hppro": 1000, 
                        "undercurepro": 0, 
                        "pvpundpspro": 0, 
                        "staratkpro": 1000, 
                        "dpsdrop": 0, 
                        "killzhongzu5pro": 0, 
                        "tid": "5f4c72f90ae9fe0c78c47f49", 
                        "skilldpspro": 0, 
                        "baoshangpro": 0, 
                        "islock": 0, 
                        "star": 10, 
                        "atkdrop": 0, 
                        "espeed": 0, 
                        "lasttime": 1598845689, 
                        "shipinlock": 1, 
                        "baojipro": 0, 
                        "resizhongzu5pro": 80, 
                        "atk": 19004, 
                        "killzhongzu2pro": 0, 
                        "resizhongzu2pro": 40, 
                        "killzhongzu3pro": 30, 
                        "eatk": 1960, 
                        "awake": 1, 
                        "baoshangdrop": 0, 
                        "killzhongzu1pro": 0, 
                        "curepro": 0
                    }, 
                    "5f4c72f90ae9fe0c78c47f4a": {
                        "color": 5, 
                        "resizhongzu3": 0, 
                        "resizhongzu1": 0, 
                        "gedangpro": 400, 
                        "undpspro": 0, 
                        "resizhongzu4": 0, 
                        "resizhongzu5": 0, 
                        "gedangdrop": 0, 
                        "commonbuff": {
                            "chenghao": {}, 
                            "mjcstitle": {
                                "ehp": 9720, 
                                "resizhongzu5pro": 80, 
                                "resizhongzu2pro": 40, 
                                "killzhongzu3pro": 30, 
                                "eatk": 1960, 
                                "killzhongzu4pro": 50
                            }, 
                            "mjhj": {}, 
                            "pifu": {
                                "hppro": 20, 
                                "atkpro": 10
                            }, 
                            "keji": {}
                        }, 
                        "killzhongzu4pro": 50, 
                        "speed": 751, 
                        "dpspro": 0, 
                        "jianshangpro": 0, 
                        "skilldpsdrop": 0, 
                        "ehp": 9720, 
                        "jingzhunpro": 0, 
                        "pojiapro": 0, 
                        "name": "张春华", 
                        "lv": 110, 
                        "resizhongzu2": 0, 
                        "resizhongzu1pro": 0, 
                        "starhppro": 1000, 
                        "baojidrop": 0, 
                        "equip": {
                            "1": {
                                "lv": 0, 
                                "star": 0, 
                                "dj": 0
                            }, 
                            "3": {
                                "lv": 0, 
                                "star": 0, 
                                "dj": 0
                            }, 
                            "2": {
                                "lv": 0, 
                                "star": 0, 
                                "dj": 0
                            }, 
                            "4": {
                                "lv": 0, 
                                "star": 0, 
                                "dj": 0
                            }
                        }, 
                        "hp": 251433, 
                        "undotdpspro": 0, 
                        "resizhongzu4pro": 0, 
                        "jingzhundrop": 0, 
                        "awake": 1, 
                        "pinglunid": "2507", 
                        "ctime": 1598845689, 
                        "killzhongzu1": 0, 
                        "killzhongzu3": 0, 
                        "killzhongzu2": 0, 
                        "killzhongzu5": 0, 
                        "killzhongzu4": 0, 
                        "unbaojipro": 0, 
                        "undpsdrop": 0, 
                        "edef": 0, 
                        "herobuff": {
                            "bdskillbuff": {
                                "speed": 60, 
                                "gedangpro": 400, 
                                "hppro": 600
                            }
                        }, 
                        "zhanli": 52249, 
                        "kjzhanli": 155, 
                        "pvpdpspro": 0, 
                        "pojiadrop": 0, 
                        "atkpro": 1000, 
                        "def": 750, 
                        "hpdrop": 0, 
                        "zhongzu": 2, 
                        "resizhongzu3pro": 0, 
                        "miankongpro": 0, 
                        "speeddrop": 0, 
                        "zizhi": "23", 
                        "speedpro": 1000, 
                        "miankongdrop": 0, 
                        "bwzhanli": 0, 
                        "defpro": 1000, 
                        "defdrop": 0, 
                        "hppro": 1000, 
                        "undercurepro": 0, 
                        "pvpundpspro": 0, 
                        "staratkpro": 1000, 
                        "dpsdrop": 0, 
                        "killzhongzu5pro": 0, 
                        "tid": "5f4c72f90ae9fe0c78c47f4a", 
                        "skilldpspro": 0, 
                        "baoshangpro": 0, 
                        "islock": 0, 
                        "star": 10, 
                        "atkdrop": 0, 
                        "espeed": 0, 
                        "lasttime": 1598845689, 
                        "baojipro": 0, 
                        "resizhongzu5pro": 80, 
                        "atk": 11666, 
                        "killzhongzu2pro": 0, 
                        "resizhongzu2pro": 40, 
                        "killzhongzu3pro": 30, 
                        "eatk": 1960, 
                        "hid": "25076", 
                        "baoshangdrop": 0, 
                        "killzhongzu1pro": 0, 
                        "curepro": 0
                    }, 
                    "5f4a2e789dc6d67f1d0a7962": {
                        "color": 5, 
                        "resizhongzu3": 0, 
                        "resizhongzu1": 0, 
                        "gedangpro": 400, 
                        "undpspro": 0, 
                        "resizhongzu4": 0, 
                        "resizhongzu5": 0, 
                        "gedangdrop": 0, 
                        "commonbuff": {
                            "chenghao": {}, 
                            "mjcstitle": {
                                "ehp": 9720, 
                                "resizhongzu5pro": 80, 
                                "resizhongzu2pro": 40, 
                                "killzhongzu3pro": 30, 
                                "eatk": 1960, 
                                "killzhongzu4pro": 50
                            }, 
                            "mjhj": {}, 
                            "pifu": {
                                "hppro": 20, 
                                "atkpro": 10
                            }, 
                            "keji": {}
                        }, 
                        "killzhongzu4pro": 50, 
                        "speed": 751, 
                        "dpspro": 0, 
                        "jianshangpro": 0, 
                        "skilldpsdrop": 0, 
                        "ehp": 9720, 
                        "jingzhunpro": 0, 
                        "pojiapro": 0, 
                        "name": "张春华", 
                        "lv": 110, 
                        "resizhongzu2": 0, 
                        "resizhongzu1pro": 0, 
                        "starhppro": 1000, 
                        "baojidrop": 0, 
                        "equip": {
                            "1": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "3": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "2": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "4": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }
                        }, 
                        "hp": 251433, 
                        "undotdpspro": 0, 
                        "resizhongzu4pro": 0, 
                        "jingzhundrop": 0, 
                        "awake": 1, 
                        "pinglunid": "2507", 
                        "ctime": 1598697080, 
                        "killzhongzu1": 0, 
                        "killzhongzu3": 0, 
                        "killzhongzu2": 0, 
                        "killzhongzu5": 0, 
                        "killzhongzu4": 0, 
                        "unbaojipro": 0, 
                        "undpsdrop": 0, 
                        "edef": 0, 
                        "herobuff": {
                            "bdskillbuff": {
                                "speed": 60, 
                                "gedangpro": 400, 
                                "hppro": 600
                            }
                        }, 
                        "zhanli": 52249, 
                        "kjzhanli": 155, 
                        "pvpdpspro": 0, 
                        "pojiadrop": 0, 
                        "atkpro": 1000, 
                        "def": 750, 
                        "hpdrop": 0, 
                        "zhongzu": 2, 
                        "resizhongzu3pro": 0, 
                        "miankongpro": 0, 
                        "speeddrop": 0, 
                        "zizhi": "23", 
                        "speedpro": 1000, 
                        "miankongdrop": 0, 
                        "bwzhanli": 0, 
                        "defpro": 1000, 
                        "defdrop": 0, 
                        "hppro": 1000, 
                        "undercurepro": 0, 
                        "pvpundpspro": 0, 
                        "staratkpro": 1000, 
                        "dpsdrop": 0, 
                        "killzhongzu5pro": 0, 
                        "tid": "5f4a2e789dc6d67f1d0a7962", 
                        "skilldpspro": 0, 
                        "baoshangpro": 0, 
                        "islock": 0, 
                        "star": 10, 
                        "atkdrop": 0, 
                        "espeed": 0, 
                        "lasttime": 1598697080, 
                        "baojipro": 0, 
                        "resizhongzu5pro": 80, 
                        "atk": 11666, 
                        "killzhongzu2pro": 0, 
                        "resizhongzu2pro": 40, 
                        "killzhongzu3pro": 30, 
                        "eatk": 1960, 
                        "hid": "25076", 
                        "baoshangdrop": 0, 
                        "killzhongzu1pro": 0, 
                        "curepro": 0
                    }, 
                    "5f4a2e799dc6d67f1d0a79ad": {
                        "color": 5, 
                        "resizhongzu3": 0, 
                        "resizhongzu1": 0, 
                        "gedangpro": 0, 
                        "undpspro": 0, 
                        "resizhongzu4": 0, 
                        "resizhongzu5": 0, 
                        "gedangdrop": 0, 
                        "commonbuff": {
                            "chenghao": {}, 
                            "mjcstitle": {
                                "ehp": 9720, 
                                "resizhongzu5pro": 80, 
                                "resizhongzu2pro": 40, 
                                "killzhongzu3pro": 30, 
                                "eatk": 1960, 
                                "killzhongzu4pro": 50
                            }, 
                            "mjhj": {}, 
                            "pifu": {
                                "hppro": 20, 
                                "atkpro": 10
                            }, 
                            "keji": {}
                        }, 
                        "killzhongzu4pro": 50, 
                        "speed": 218, 
                        "dpspro": 0, 
                        "jianshangpro": 0, 
                        "skilldpsdrop": 0, 
                        "ehp": 9720, 
                        "jingzhunpro": 0, 
                        "pojiapro": 0, 
                        "name": "荀攸", 
                        "lv": 3, 
                        "resizhongzu2": 0, 
                        "resizhongzu1pro": 0, 
                        "starhppro": 1000, 
                        "baojidrop": 0, 
                        "equip": {
                            "1": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "3": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "2": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }, 
                            "4": {
                                "lv": 0, 
                                "dj": 0, 
                                "star": 0
                            }
                        }, 
                        "hp": 12043, 
                        "undotdpspro": 0, 
                        "resizhongzu4pro": 0, 
                        "jingzhundrop": 0, 
                        "awake": 1, 
                        "pinglunid": "2506", 
                        "ctime": 1598697081, 
                        "killzhongzu1": 0, 
                        "killzhongzu3": 0, 
                        "killzhongzu2": 0, 
                        "killzhongzu5": 0, 
                        "killzhongzu4": 0, 
                        "unbaojipro": 0, 
                        "undpsdrop": 0, 
                        "edef": 0, 
                        "dpsdrop": 0, 
                        "zhanli": 3947, 
                        "kjzhanli": 155, 
                        "pvpdpspro": 0, 
                        "pojiadrop": 0, 
                        "atkpro": 1000, 
                        "def": 80, 
                        "hpdrop": 0, 
                        "zhongzu": 2, 
                        "resizhongzu3pro": 0, 
                        "miankongpro": 0, 
                        "speeddrop": 0, 
                        "zizhi": "23", 
                        "speedpro": 1000, 
                        "miankongdrop": 0, 
                        "bwzhanli": 0, 
                        "defpro": 1000, 
                        "defdrop": 0, 
                        "hppro": 1000, 
                        "undercurepro": 0, 
                        "pvpundpspro": 0, 
                        "staratkpro": 1000, 
                        "killzhongzu5pro": 0, 
                        "tid": "5f4a2e799dc6d67f1d0a79ad", 
                        "skilldpspro": 0, 
                        "baoshangpro": 0, 
                        "islock": 0, 
                        "star": 0, 
                        "atkdrop": 0, 
                        "espeed": 0, 
                        "lasttime": 1598697081, 
                        "baojipro": 0, 
                        "resizhongzu5pro": 80, 
                        "atk": 2155, 
                        "killzhongzu2pro": 0, 
                        "resizhongzu2pro": 40, 
                        "killzhongzu3pro": 30, 
                        "eatk": 1960, 
                        "hid": "25066", 
                        "baoshangdrop": 0, 
                        "killzhongzu1pro": 0, 
                        "curepro": 0
                    }
                }
            }, 
            {
                "": {
                    "s": 1, 
                    "d": {
                        "info": {
                            "2507": {
                                "lv": 1, 
                                "getnum": 0
                            }
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

    _plid = str(data[0])

    _delTid = []


    # 获取当前名将绘卷数据
    _mjhjData = g.m.mjhjfun.getMjhjList(uid)
    _info = _mjhjData.get(_plid, {"getnum": 0, "lv": 0})

    _upCon = g.GC["mjhj"]["upinfo"][_info["lv"]]


    # if _upCon["cond"]:
    #     for k, v in _upCon["cond"].items():
    #         if k == "heronum":

    # 判断条件是否满足
    if _upCon["getnum"] > _info["getnum"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_valerr')
        return _chkData

    # 如果需要消耗英雄
    if _upCon["mainnum"] > 0:
        _heroTidList = [g.mdb.toObjectId(i) for i in _delTid]
        # 判断消耗是否满足
        if len(_delTid) != _upCon["mainnum"]:
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_valerr')
            return _chkData

        _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _heroTidList}, "color":{"$gte": 4}},
                                              keys='shipin,equip,hid,lv,star,zhanli,jiban,gem,wuhun,giftinfo,longhun,pifu,baoshijinglian')


        # 有一个英雄不存在就返回
        if len(_delTid) != len(_heroList):
            _chkData['s'] = -1
            _chkData['errmsg'] = g.L('global_valerr')
            return _chkData

        # 判断消耗是否同一个英雄
        _con = g.GC["hero"]
        for hero in _heroList:
            _color = _con[hero["hid"]]["color"]
            if _con[hero["hid"]]["pinglunid"] != _plid or _color < 4:
                _chkData['s'] = -1
                _chkData['errmsg'] = g.L('global_valerr')
                return _chkData


        _defHero = g.m.zypkjjcfun.getDefendHero(uid)
        _defHero.pop('pet', None)
        _jjcHero = _defHero.values()
        # 竞技场不能上阵
        if set(_delTid) & set(_jjcHero):
            _chkData['s'] = -2
            _chkData['errmsg'] = g.L('hero_fenjie_res_-2')
            return _chkData

        _chkData["herotidlist"] = _heroTidList
        _chkData["herolist"] = _heroList


    # 判断消耗
    if _upCon["need"]:
        _chk = g.chkDelNeed(uid, _upCon["need"])
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _chkData['s'] = -100
                _chkData['attr'] = _chk['t']
            else:
                _chkData["s"] = -104
                _chkData[_chk['a']] = _chk['t']
            return _chkData

    _chkData["mjhjdata"] = _mjhjData
    _chkData["info"] = _info
    _chkData["plid"] = _plid
    _chkData["deltid"] = _delTid

    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    _mjhjData = _chkData["mjhjdata"]
    _info = _chkData["info"]
    _plid = _chkData["plid"]
    _delTid = _chkData["deltid"]

    # 扣除消耗
    _upCon = g.GC["mjhj"]["upinfo"][_info["lv"]]

    _resData = {}
    if _delTid and _upCon["mainnum"] > 0:
        _heroList = _chkData["herolist"]
        _heroTidList = _chkData["herotidlist"]

        # 删除需要分解的英雄
        g.mdb.delete('hero', {'uid': uid, '_id': {'$in': _heroTidList}})

        g.event.emit("chkdelhero_skin", uid, _heroList)
        # 检查是否有羁绊buff
        g.m.jibanfun.chkJiBanHero(uid, _delTid, conn, herodata=_heroList)

        _prize_list = g.m.herofun.getFenjiePrize(uid, _heroList, isfenjie=False)

        # 通过穿戴信息修改数据库
        _Send = {'shipin': {}, 'equip': {}}
        for sp in _prize_list['shipin']:
            _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
            _Send['shipin'].update(_data)

        for equip in _prize_list['equip']:
            _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
            _Send['equip'].update(_data)

        _sendData = g.getPrizeRes(uid, _prize_list["prize"], act={'act': 'mjhj_upstar', 'prize': _prize_list["prize"],
                                                       'delete': map(lambda x: x['hid'], _heroList)})
        g.sendChangeInfo(conn, _sendData)
        # 推送装备change
        g.sendChangeInfo(conn, _Send)


        # 检测删除英雄是否有皮肤
        g.event.emit("chkdelhero_skin", uid, _heroList)
        _resHero = {i:{'num':0} for i in _delTid}
        _Send["hero"] = {}
        _Send['hero'].update(_resHero)
        g.sendChangeInfo(conn, _Send)

        _resData["prize"] = _prize_list["prize"]

    # 判断是否有消耗
    if _upCon["need"]:
        # 消耗物品
        _delData = g.delNeed(uid, _upCon["need"], logdata={'act': 'mjhj_up', 'plid': _plid})
        # 推送前端
        g.sendChangeInfo(conn, _delData)

    _setData = _mjhjData.get(_plid, {"getnum": 0, "lv": 0})
    _setData["lv"] += 1
    _mjhjData[_plid] = _setData

    _ctype = "mjhj_list"
    # 设置次数
    g.setAttr(uid, {"ctype": _ctype}, {"v.{0}".format(_plid): _setData})

    _buff = g.m.mjhjfun.getBuff(uid)
    g.m.userfun.setCommonBuff(uid, {'buff.mjhj': _buff})
    _heroChange = g.m.herofun.reSetAllHeroBuff(uid, where={"lv": {"$gt": 1}})
    # 推送前端
    g.sendChangeInfo(conn, {"hero": _heroChange})

    _resData["info"] = _mjhjData
    _res["d"] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid("z3")
    g.debugConn.uid = uid
    _data = [3105, []]
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=_data)
