#!/usr/bin/python
# coding:utf-8

'''
创建MongoDB 数据结构
主要用于创建集合和索引
'''
import pymongo
import config


def starup():
    DBCONFIG = config.CONFIG["DBCONFIG"]

    # 创建的集合配置
    _collections = {
        # 集合名
        "apiCount": {
            "indexs": (
                {"keys": (("api", 1),), "option": {}},
            )
        },
        # 武魂
        "wuhun": {
            "indexs": (
                {"keys": (("uid", 1), ("id", 1)), "option": {}},
            )
        },
        # 答题事件
        "topic": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 遗迹考古
        "yjkg": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 展览馆
        "exhibition": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 文物
        "wenwu": {
            "indexs": (
                {"keys": (("uid", 1),("wid", 1)), "option": {"unique": True}},
            )
        },
        # 封禁列表
        "blacklist": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1),), "option": {"unique": True}},
            )
        },
        # 神殿迷宫
        "maze": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 神宠水晶
        "pet": {
            "indexs": (
                {"keys": (("uid", 1),("pid", 1)), "option": {}},
            )
        },
        # 神宠水晶和孵化室
        "crystal": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 神殿迷宫英雄数据
        "mazehero": {
            "indexs": (
                {"keys": (("uid", 1),("tid", 1)), "option": {"unique": True}},
            )
        },
        # 皮肤
        "skin": {
            "indexs": (
                {"keys": (("uid", 1), ("id", 1)), "option": {}},
            )
        },
        # 装备附魔表
        "enchant": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 征讨令
        "zhengtao": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 部落战旗
        "flag": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 部落战旗任务
        "flagtask": {
            "indexs": (
                {"keys": (("uid", 1),("type", 1),("id", 1)), "option": {"unique": True}},
            )
        },
        # 试炼活动
        "trial": {
            "indexs": (
                {"keys": (("uid", 1),("type", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 60 * 24 * 3600}},
            )
        },
        # 开服狂欢
        "kfkhdata": {
            "indexs": (
                {"keys": (("uid", 1), ("day", 1), ("hdid", 1),), "option": {"unique": True}},
                {"keys": (("uid", 1), ("hdid", 1)), "option": {}},
                {"keys": (("uid", 1), ("htype", 1)), "option": {}},
            )
        },
        # 属性表
        "buff": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1),), "option": {"unique": True}},
            )
        },
        # 聊天黑名单
        "chat_blacklist": {
            "indexs": (
                {"keys": (("uid", 1), ), "option": {"unique": True}},
            )
        },
        # 神殿地牢
        "dungeon": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("layer", 1),), "option": {}},
            )
        },
        # 趣味成就
        "qwcj": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 五军之战对手
        "wjzz_rival": {
            "indexs": (
                {"keys": (("myuid", 1),("faction", 1),("key", 1)), "option": {"unique": True}},
            )
        },
        # 神殿地牢录像
        "dungeonlog": {
            "indexs": (
                {"keys": (("zhanli", -1),), "option": {}},
                {"keys": (("road", 1),("step", 1),), "option": {}},
            )
        },
        # 风暴战场
        "storm": {
            "indexs": (
                {"keys": (("uid", 1),("area", 1),("number", 1)), "option": {"unique": True}},
                {"keys": (("area", 1),("number", 1)), "option": {}},
                {"keys": (("over", 1),("etime", 1)), "option": {}},
            )
        },
        # 风暴战场日志
        "stormlog": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("rival", 1),), "option": {}},
                {"keys": (("ctime", -1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        # 雕纹
        "glyph": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        # 神器表
        "artifact": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
            )
        },
        # 系统消息跑马灯
        "gmmessage": {
            "indexs": (
                {"keys": (("stime", 1),), "option": {}},
                {"keys": (("etime", 1),), "option": {}},
            )
        },
        # 装备列表
        "equiplist": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("type", 1),), "option": {}},
                {"keys": (("eid", 1),), "option": {}},
                {"keys": (("eid", 1),("uid", 1)), "option": {"unique": True}},
            )
        },
        # 饰品列表
        "shipin": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("spid", 1),), "option": {}},
            )
        },
        # 成就任务
        "task": {
            "indexs": (
                {"keys": (("uid", 1),("taskid", 1)), "option": {"unique": True}},
                {"keys": (("type", 1),), "option": {}},
                {"keys": (("stype", 1),), "option": {}},
            )
        },
        # 好友
        "friend": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        "userinfo": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("name", 1),), "option": {"unique": True}},
                {"keys": (("sid", 1), ("binduid", 1),), "option": {"unique": True}},
                {"keys": (("maxmapid", -1),), "option": {}},
                {"keys": (("maxzhanli", 1),), "option": {}},
            )
        },
        "gameconfig": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("ctype", 1), ("k", 1)), "option": {"unique": True}},
            )
        },
        "gamelog": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        "crosszbjifen": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
                {"keys": (("uid", 1),("dkey", 1)), "option": {"unique": True}},
                {"keys": (("dkey", 1),("jifen", -1)), "option": {}},
            )
        },
        "itemlist": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引,没有就为空kv )
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("itemid", 1),), "option": {}},
                {"keys": (("itemid", 1),("uid", 1)), "option": {"unique": True}},
            )
        },
        "hero": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("hid", 1),), "option": {}},
            )
        },
        # 竞技场
        "zypkjjclog": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("enemyuid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}}
            )
        },
        "playattr": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1), ("k", 1)), "option": {"unique": True}},
                {"keys": (("ctype", 1),), "option": {}},
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        # 队伍阵型
        "formation": {
            "indexs": (
                {"keys": (("uid", 1), ("ftype", 1)), "option": {}},
            )
        },
        # 悬赏任务
        "xstask": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        # 杂货铺
        "zahuopu": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1)), "option": {"unique": True}},
            )
        },
        # 私聊信息表
        "privatechat": {
            "indexs": (
                {"keys": (("uidlist", 1), ("uid", 1)), "option": {}},
            )
        },
        # 邮件
        "email": {
            "indexs": (
                {"keys": (("uid", 1), ("etype", 1)), "option": {}},
                {"keys": (("senduid", 1), ), "option": {}},
                {"keys": (("uid", 1), ), "option": {}},
                {"keys": (("etype", 1), ), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}}
            )
        },
        # 统计表,统计所有杂乱的东西
        "stat": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1),), "option": {"unique": True}},
                {"keys": (("ctype", 1),), "option": {}},
            )
        },
        # 自由竞技场
        "zypkjjc": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("jifen", 1),), "option": {}},
            )
        },
        # 竞技场
        "pkdata": {
            "indexs": (
                {"keys": (("uid", 1), ("rank", 1),), "option": {"unique": True}},
            )
        },
        "rankprize": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
                {"keys": (("ctype", 1),), "option": {}},
            )
        },
        # 兑换码使用数据
        "cardlog": {
            "indexs": (
                {"keys": (("uid", 1), ("cardnum", 1),), "option": {"unique": True}},
            )
        },
        # 功能表
        "gameattr": {
            "indexs": (
                {"keys": (("uid", 1),("ctype", 1),("k", 1)), "option": {"unique": True}},
                {"keys": (("ctype", 1),), "option": {}},
            )
        },
        # 充值数据
        "paylist": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1)), "option": {}},
                {"keys": (("ctime", 1),), "option": {}},
                {"keys": (("orderid", 1),), "option": {"unique": True}},
            )
        },
        # 活动信息
        "hdinfo": {
            "indexs": (
                {"keys": (("hdid", 1),), "option": {}},
                {"keys": (("htype", 1),), "option": {}},
            )
        },
        # 活动数据
        "hddata": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("hdid", 1),), "option": {}},
                {"keys": (("val", -1),), "option": {}},
                {"keys": (("uid", 1),("hdid", 1),), "option": {"unique": True}},
            )
        },
        # 商店
        "shops": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("shopid", 1),), "option": {}},
            )
        },
        # 大法师塔
        "fashita": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("layernum", 1),), "option": {}},
            )
        },
        # 大法师塔日志
        "fashitalog": {
            "indexs": (
                {"keys": (("layernum", 1),), "option": {}},
            )
        },
        # 许愿池中奖日志
        "xyclog": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 冠军试练录像日志
        "ctlog": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("enemyuid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        "chatlog": {
            "indexs": (
                {"keys": (("uped", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 冠军试练数据
        "championtrial": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("jifen", 1),), "option": {}},
            )
        },
        # 公会
        "gonghui": {
            "indexs": (
                {"keys": (("uid", 1), ("name", 1)), "option": {"unique": True}},
                {"keys": (("mzuid", 1),), "option": {}},
                {"keys": (("lv", -1),), "option": {}},
            )
        },
        # 公会属性表
        "gonghuiattr": {
            "indexs": (
                {"keys": (("ghid", 1), ("ctype", 1), ("k", 1)), "option": {"unique": True}},
                {"keys": (("ctype", 1),), "option": {}},
            )
        },
        # 公会宝箱表
        "gonghuibox": {
            "indexs": (
                {"keys": (("ghid", 1),), "option": {}},
            )
        },
        # 英雄统御信息
        "tongyu": {
            "indexs": (
                {"keys": (("uid", 1), ("tyid", 1)), "option": {"unique": True}},
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        # 守望者秘境
        "watcher": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("layer", 1),), "option": {}},
                {"keys": (("toplayer", -1), ("zhanli", -1), ), "option": {}},
            )
        },
        # 公会用户
        "gonghuiuser": {
            "indexs": (
                {"keys": (("uid", 1), ("ghid", 1)), "option": {"unique": True}},
                {"keys": (("ghid", 1),), "option": {}},
            )
        },
        # 公会申请
        "gonghuiapply": {
            "indexs": (
                {"keys": (("uid", 1), ("ghid", 1)), "option": {"unique": True}},
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 公会日志
        "gonghuilog": {
            "indexs": (
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("ctype", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 公会成员添加的经验记录
        "gonghuiexp": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 红包表
        "hongbao": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("isover", 1),), "option": {}},
                {"keys": (("ctime", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 5 * 24 * 3600}},
            )
        },
        # 统一战斗数据表
        "fightlog":{
            "indexs": (
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}},
            )
        },
        # 统一战斗数据表
        "ladder_log": {
            "indexs": (
                {"keys": (("uid", 1), ), "option": {}},
                {"keys": (("ctime", -1), ), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}},
            )
        },
        # 羁绊
        "jiban": {
            "indexs": (
                {"keys": (("uid", 1), ("jid", 1)), "option": {"unique": True}},

            )
        },
        # 聊天
        "chat": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("touid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        "chat_video": {
            "indexs": (
                {"keys": (("uuid", 1),), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 1800}},

            )
        },
        "lianhunta": {
            "indexs": (
                {"keys": (("uid", 1), ("key", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 40 * 24 * 3600}},
            )
        },
        # 打点日志150天过期
        'xlog': {
            "indexs": (
                {"keys": (("create_date", -1),), "option": {"expireAfterSeconds": 150 * 24 * 3600}},
            )
        },
        'shilianzhita': {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        'syzc': {
            "indexs": (
                {"keys": (("uid", 1), ), "option": {"unique": True}},
            )
        },
         'syzc_fightlog': {
            "indexs": (
                {"keys": (("uid", 1), ("week", 1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 10 * 24 * 3600}},
            )
        },
    }

    client = pymongo.MongoClient(host=DBCONFIG["host"], port=DBCONFIG["port"])
    # 开启认证
    if "dbuser" in DBCONFIG and "dbpwd" in DBCONFIG:
        client.get_database(DBCONFIG["authdb"]).authenticate(DBCONFIG["dbuser"], DBCONFIG["dbpwd"])

    db = client.get_database(DBCONFIG["dbname"])
    for k, v in _collections.items():
        # 获取集合
        _collection = db.get_collection(k)
        # 获取索引集合
        _indexs = v["indexs"]
        for ele in _indexs:
            # 待创建的索引
            _index = ele["keys"]
            # 创建选项
            _options = ele["option"]
            try:
                _res = _collection.create_index(_index, **_options)
                print "[%s] crateIndex:%s,result:%s" % (k, _index, _res)
            except:
                import traceback
                print traceback.format_exc()


    print "Config MongoDB SUCCESS ... "


if __name__ == "__main__":
    starup()
