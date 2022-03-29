#!/usr/bin/python
# coding:utf-8

'''
创建MongoDB 数据结构
主要用于创建集合和索引
'''
import pymongo
import sys

sys.path.append('game')
import g


def starup():
    DBCONFIG = g.crossDBConf
    # 创建的集合配置
    _collections = {
        # 集合名
        "userdata": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("sid", 1),), "option": {}},
                {"keys": (("zhanli", 1),), "option": {}},
            )
        },
        # 工会-攻城略地
        "gonghui_siege": {
            "indexs": (
                {"keys": (("dkey", 1), ("uid", 1), ("groupid", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}}
            )
        },
        # 统一战斗数据表
        "ladder_log": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 2 * 24 * 3600}},
            )
        },
        # 工会-攻城略地
        "gonghui_siege_rank": {
            "indexs": (
                {"keys": (("dkey", 1), ("ghid", 1), ("cityid", 1), ("groupid", 1)), "option": {"unique": True}},
                {"keys": (("dkey", 1), ("cityid", 1), ("groupid", 1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}}
            )
        },
        # 工会-攻城略地-战斗日志
        "gonghui_siege_fightlog": {
            "indexs": (
                {"keys": (("dkey", 1), ("ghid", 1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}}
            )
        },
        # 区服信息
        "servergroup": {
            "indexs": (
                {"keys": (("serverid", 1),), "option": {"unique": True}},
            )
        },
        # 跨服天梯
        "ladder": {
            "indexs": (
                {"keys": (("key", 1), ("uid", 1)), "option": {"unique": True}},
                {"keys": (("star", -1),), "option": {}},
                {"keys": (("division", 1),), "option": {}},
                {"keys": (("maxzhanli", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        # 跨服公共配置
        "crossconfig": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                {"keys": (("ctype", 1), ("k", 1),), "option": {"unique": True}},
            )
        },
        # 统一战斗数据表
        "fightlog":{
                      "indexs": (
                          {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}},
                      )
                  },
        #巅峰王者报名表
        "wzbaoming":{
            #索引信息
            "indexs":(
                #索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                { "keys":(("uid",1),("dkey",1)),"option":{"unique":True}},
                { "keys":(("dkey",1),),"option":{}},
                { "keys":(("openday",1),),"option":{}},
                { "keys":(("sid",1),),"option":{}},
                { "keys":(("jifen",-1),),"option":{}},
                { "keys":(("zhanli",-1),),"option":{}},
                {"keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600}},
            )
            },
        #巅峰王者用户战斗数据表
        "wzuserdata":{
            #索引信息
            "indexs":(
                #索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                { "keys":(("uid",1),("dkey",1),),"option":{"unique":True }},
                { "keys":(("sid",1),),"option":{}},
                { "keys":(("zhanli",1),),"option":{}},
                {"keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600}},
            )
            },
        #巅峰王者进阶赛段数据表
        "wzfight":{
            #索引信息
            "indexs":(
                #索引列表,支持复合索引,option 为选项(TTL索引,唯一索引)
                { "keys":(("uid",1),("dkey",1),("groupid",1),("orderid",1)),"option":{"unique":True}},
                { "keys":(("dkey",1),),"option":{}},
                { "keys":(("groupid",1),),"option":{}},
                { "keys":(("orderid",1),),"option":{}},
                { "keys":(("ugid",1),),"option":{}},
                {"keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600}},
            )
            },
        # 巅峰王者竞赛数据
        "wzguessdata":{
            # 索引信息
            "indexs":(
                { "keys":(("uid",1),("dkey",1),),"option":{}},
                { "keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600}},
            )
        },
         # 巅峰王者历届4强
        "wzquarterwinner":{
            # 索引信息
            "indexs":(
                { "keys":(("uid",1),("dkey",1),("round",1),),"option":{}},
            )
        },
        # 好友数据
        "cross_friend": {
            # 索引信息
            "indexs": (
                {"keys": (("uid", 1), ), "option": {"unique": True}},
                {"keys": (("logintime", 1), ("sid", 1)), "option": {}},
                {"keys": (("head.zhanli", 1), ), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 20 * 24 * 3600}},
            )
        },
        # 巅峰王者竞赛记录
        "wzguesslog":{
            # 索引信息
            "indexs":(
                { "keys":(("uid",1),("dkey",1),),"option":{}},
                { "keys":(("ttltime",1),),"option":{"expireAfterSeconds":30*24*3600}},
            )
        },
        # 区服信息
        "serverdata": {
            "indexs": (
                {"keys": (("serverid", 1),), "option": {"unique": True}},
            )
        },
        # 计时器列表
        "timerlist": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引,没有就为空kv )
                {"keys": (("timeout", 1),), "option": {}},
            )
        },
        # 玩家属性表
        "crossplayattr": {
            "indexs": (
                {"keys": (("uid", 1), ("ctype", 1), ("k", 1)), "option": {"unique": True}},
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("ctype", 1),), "option": {}},
            )
        },
        # 公会争锋报名
        "competing_signup": {
            "indexs": (
                {"keys": (("season", 1),), "option": {"unique": True}},
            )
        },
        # 公会争锋历史王者信息
        "competing_toplog": {
            "indexs": (
                {"keys": (("ghid", 1),("season", 1)), "option": {"unique": True}},
            )
        },
        # 公会争锋赛区
        "competing_main": {
            "indexs": (
                {"keys": (("season", 1),), "option": {}},
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        # 公会争锋玩家战斗数据
        "competing_userdata": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("season", 1),), "option": {}},
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 公会争锋公会战斗数据
        "competing_fightdata": {
            "indexs": (
                {"keys": (("ghid", 1),), "option": {}},
                {"keys": (("rival_ghid", 1),), "option": {}},
                {"keys": (("ctime", -1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 五军之战报名表
        "wjzz_signup": {
            "indexs": (
                {"keys": (("key", 1),("uid", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 10 * 24 * 3600}},
            )
        },
        # 五军之战预备役
        "wjzz_reserve": {
            "indexs": (
                {"keys": (("key", 1), ("uid", 1), ("team", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}},
            )
        },
        # 五军之战防守阵容
        "wjzz_defend": {
            "indexs": (
                {"keys": (("key", 1),("uid", 1),("team", 1)), "option": {"unique": True}},
                {"keys": (("faction", 1),("group", 1),("dead", 1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 10 * 24 * 3600}},
            )
        },
        # 五军之战主数据
        "wjzz_data": {
            "indexs": (
                {"keys": (("key", 1),("uid", 1),("group", 1)), "option": {}},
                {"keys": (("num", -1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 10 * 24 * 3600}},
            )
        },
        # 五军之战水晶数据
        "wjzz_crystal": {
            "indexs": (
                {"keys": (("key", 1),('group',1),('faction',1)), "option": {"unique": True}},
                {"keys": (("live", -1),), "option": {}},
                {"keys": (("integral", -1),("sumlive", -1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 10 * 24 * 3600}},
            )
        },
        # 五军之战战斗日志
        "wjzz_log": {
            "indexs": (
                {"keys": (("key", 1),("from", 1),("to", 1)), "option": {}},
                {"keys": (("ctime", -1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 7 * 24 * 3600}},
            )
        },
        # 跨服邮件
        "crossemail": {
            "indexs": (
                {"keys": (("sid", 1),), "option": {}},
                {"keys": (("ifpull", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 3 * 24 * 3600}},
            )
        },
        # 竞技场
        "jjcdefhero": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引,没有就为空kv )
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("sid", 1),), "option": {}},
                {"keys": (("maxzhanli", 1),), "option": {}},
                {"keys": (("zhanli", 1),), "option": {}},
                {"keys": (("headdata.lv", 1),), "option": {}},
            )
        },
        # 王者风范
        "crosszbtoplog": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引,没有就为空kv )
                {"keys": (("deky", 1),), "option": {}},
                {"keys": (("step", 1),), "option": {}},
            )
        },
        # 英雄评论
        "hero_comment": {
            # 索引信息
            "indexs": (
                # 索引列表,支持复合索引,option 为选项(TTL索引,唯一索引,没有就为空kv )
                {"keys": (("hid", 1),), "option": {}},
            )
        },
        #跨服争霸积分赛
        "crosszb_jifen":{
            #索引信息
            "indexs":(
                { "keys":(("uid",1),("dkey",1)),"option":{"unique":True}},
                { "keys":(("dkey",1),),"option":{}},
                { "keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600 }}
            )
        },
        #跨服争霸争霸赛
        "crosszb_zb":{
            #索引信息
            "indexs":(
                { "keys":(("uid",1),("dkey",1)),"option":{"unique":True}},
                { "keys":(("step",1),),"option":{}},
                { "keys":(("ttltime",1),),"option":{"expireAfterSeconds":15*24*3600 }}
            )
        },
        # 跨服探险地图
        "tanxian": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {"unique": True}},
                {"keys": (("mapid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 30 * 24 * 3600}}
            )
        },
        # 跨服争霸战斗日志
        "crosszb_zblog": {
            # 索引信息
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("dkey", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}}
            )
        },
        # 跨服聊天日志
        "chatlog": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
            )
        },
        # 活动数据
        "cross_hddata": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("hdid", 1),), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},
            )
        },
        # 区服信息
        "servergroup": {
            "indexs": (
                {"keys": (("serverid", 1),), "option": {"unique": True}},
            )
        },
        # 公平竞技场赛季积分排名表
        "gpjjc_rank": {
            "indexs": (
                {"keys": (("uid", 1), ("season", 1)), "option": {"unique": True}},
                {"keys": (("season", 1),), "option": {}},
                {"keys": (("jifen", -1), ("lasttime", 1)), "option": {}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 60 * 24 * 3600}},

            )
        },
        "gpjjc_pipei": {
            "indexs": (
                {"keys": (("uid", 1), ("season", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 8 * 24 * 3600}},

            )
        },
        "herohot": {
            "indexs": (
                {"keys": (("hdid", 1), ("plid", 1), ("state", 1)), "option": {"unique": True}},
                {"keys": (("num", -1), ("lasttime", 1), ), "option": {}}
            )
        },
        "herohot_user": {
            "indexs": (
                {"keys": (("uid", 1), ("hdid", 1)), "option": {"unique": True}},
            )
        },
        "hero": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
                {"keys": (("hid", 1),), "option": {}},
            )
        },
        "chat_video": {
            "indexs": (
                {"keys": (("uuid", 1),), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 1800}},

            )
        },
        "longzhou_user": {
            "indexs": (
                {"keys": (("uid", 1), ("hdid", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},

            )
        },
        "wujinzhita": {
            "indexs": (
                {"keys": (("uid", 1), ("week", 1)), "option": {"unique": True}},
                {"keys": (("ttltime", 1),), "option": {"expireAfterSeconds": 15 * 24 * 3600}},

            )
        },
        # 活动信息
        "hdinfo": {
            "indexs": (
                {"keys": (("hdid", 1),), "option": {}},
                {"keys": (("htype", 1),), "option": {}},
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
        print '_indexs',k,_indexs
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



    print "Config MongoDB Success ... "


if __name__ == "__main__":
    starup()
