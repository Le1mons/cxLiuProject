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
        # 跨服邮件
        "crossemail": {
            "indexs": (
                {"keys": (("uid", 1),), "option": {}},
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
            except:
                import traceback
                print traceback.format_exc()

            print "[%s] crateIndex:%s,result:%s" % (k, _index, _res)

    print "Config MongoDB Success ... "


if __name__ == "__main__":
    starup()
