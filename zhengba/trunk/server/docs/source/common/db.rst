===================================
数据库介绍
===================================




userinfo
========================
0 女 1 男


物品表 itemlist
===============================

保持玩家的拥有的所有物品，包括背包、仓库和穿在身上的装备


ptype 物品所在位置

1 beibao 道具背包           1 材料 2消耗品

3 beibao equip  装备背包    3 装备

4 jiyin 基因背包            4 基因

5 已经装备的装备

6 已经装备的基因


::

    {
        "_id" : ObjectId("5c0f5528c64a9434d46e3de5"),
        "uid" : "0_5c06783cc64a9439d0190ba5",
        "qhbuff" : {                                    # 强化随机的buff
            "atk" : NumberInt(65),
            "def" : NumberInt(14)
        },
        "buff" : {                                      # 基础buff
            "def" : NumberInt(16)
        },
        "zhanli" : NumberInt(135),                      # 装备战力
        "pinzhi" : NumberInt(4),                        # 品质
        "ptype" : NumberInt(1),                         # 位置 1背包 3 装备到玩家
        "whid" : '1',                                   # 装备英雄id hero.json
        "ctime" : NumberInt(1544508712),
        "iid" : "10004",
        "num" : NumberInt(1),
        "type" : NumberInt(3),
        "stype" : NumberInt(1),
    }


hero
=============================

玩家角色信息

::

    {
        "_id" : ObjectId("5c0e2122e138234d723a89a6"),
        "uid" : "0_5c0e2122e138234d723a899f",
        "iscz" : NumberInt(0),
        "lv" : NumberInt(1),
        "hid" : "1",
        "jielv" : NumberInt(1),
        "name" : "123",
        "skills" : {                            # 激活技能
            "0":1,
            "1":2,
            "2":3
        },
        "buff":{                                # 角色所有的buff
            "atk":10
        },
        "basebuff":{},                          # 基础buff
        "jiebuff":{},                           # 阶级的buff
        "tfbuff":{},                            # 天赋buff
        "jhtf":[1,2,3]                          # 激活的天赋
        "zhanli":100                            # 角色战力

    }













