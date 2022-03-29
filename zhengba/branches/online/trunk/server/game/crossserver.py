#!/usr/bin/python
#coding:utf-8

'''
#跨服功能文件
'''

crossConf = {
    #本地调试
    "debug":{
        "mc":["10.0.0.7:11208"],
        "db":{
            "host":"10.0.0.7",
            "port":27017,
            "poolsize":10,
            "dbname":"crosszhengba",
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    #本地终极预览
    "dev":{
        "mc":["127.0.0.1:11769"],
        "db":{
            "host":"127.0.0.1",
            "port":27017,
            "poolsize":10,
            "dbname":"zhengba_s1",
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    #本地终极预览
    "debug07":{
        "mc":["10.0.0.7:11206"],
        "db":{
            "host":"10.0.0.7",
            "port":27017,
            "poolsize":10,
            "dbname":"crosszhengba2", 
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    "default":{
        "mc":["172.24.241.6:11212"],
        "db":{
            "host":"172.24.241.6",
            "port":27017,
            "poolsize":10,
            "dbname":"zhengba_cross2", 
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    "anfeng":{
        "mc":["172.24.241.6:11213"],
        "db":{
            "host":"172.24.241.6",
            "port":27017,
            "poolsize":10,
            "dbname":"zhengba_cross3", 
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    "qudao1":{
        "mc":["172.24.241.5:11214"],
        "db":{
            "host":"172.24.241.5",
            "port":27017,
            "poolsize":10,
            "dbname":"zhengba_cross4", 
            "dbuser":"root",
            "dbpwd":"iamciniao",
            "authdb":"admin"
        }
    },
    "xianfeng": {
        "mc": [
            "172.24.240.235:11212"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross5",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "muzhi": {
        "mc": [
            "172.24.240.235:11213"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross6",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "shouyouhui": {
        "mc": [
            "172.24.240.235:4803"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross7",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "yinghe": {
        "mc": [
            "172.24.240.235:11214"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross8",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "blother": {
        "mc": [
            "39.104.52.29:11216"
        ],
        "db": {
            "host": "39.104.52.29",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross9",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "tianxiangbl": {
        "mc": [
            "172.24.240.235:11215"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross11",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "youdongbl": {
        "mc": [
            "172.24.240.251:11212"
        ],
        "db": {
            "host": "172.24.240.251",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross12",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "playbl": {
        "mc": [
            "172.24.240.250:11212"
        ],
        "db": {
            "host": "172.24.240.250",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_s2020",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "wufanbl": {
        "mc": [
            "172.24.240.251:11213"
        ],
        "db": {
            "host": "172.24.240.251",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross14",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "xipubl": {
        "mc": [
            "172.24.240.250:11213"
        ],
        "db": {
            "host": "172.24.240.250",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross15",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "xiongmaowbl": {
        "mc": [
            "172.24.240.250:11214"
        ],
        "db": {
            "host": "172.24.240.250",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross16",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "henhwbl": {
        "mc": [
            "172.24.240.251:11214"
        ],
        "db": {
            "host": "172.24.240.251",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross17",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "changwan": {
        "mc": [
            "172.24.240.251:11215"
        ],
        "db": {
            "host": "172.24.240.251",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross18",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "kaiying": {
        "mc": [
            "172.24.241.5:11213"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross19",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "preopen": {
        "mc": [
            "172.24.241.5:11210"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross21",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "tianxiangbl2": {
        "mc": [
            "172.24.240.251:11216"
        ],
        "db": {
            "host": "172.24.240.251",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross22",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    }
}

import g
import config
import lib.memcache
from lib.mcqueue import *

#为g中增加跨服数据库和memcache
def init ():
    ver = config.CONFIG['CROSSVER']
    g.crossMC = None
    g.crossQueue = None
    g.crossServerQueue = None
    
    if ver in crossConf:
        #全局数据库
        g.crossDBConf = crossConf[ver]['db']
        #老区降低进程池数量
        if g.chkOpenDay(30):
            crossConf[ver]['db']['poolsize'] = 2
        
        g.crossDB = g.m.dbmongo.MongoDB(crossConf[ver]['db'])
        #全局缓存
        g.crossMC = lib.memcache.memcache.Client(crossConf[ver]["mc"],dead_retry=10)
        if len(g.crossMC.get_stats())==0:
            print '!!!!cross memcached error',crossConf[ver]["mc"]
        #MC队列
        
        _preName = 'cross_'+ver
        #如果不是跨服的话，取owner的第1个作为preName，使得哪怕处于同一个cossserver，也能把聊天按owner跨服
        if config.CONFIG['VER']!='cross' and 'OWNER' in config.CONFIG and len(config.CONFIG['OWNER'])>0:
            _first = (config.CONFIG['OWNER']).split(',')
            _first = _first[0]
            _preName = 'cross_owner_'+_first
            #按owner切分后，会导致game进程取不到corssserver进程里发的信息，需要特殊处理
            print 'crossServerQueue=','cross_'+ver
            g.crossServerQueue = MemcacheQueue(g.crossMC,'cross_'+ver)
        
        print 'crossMQPreName=',_preName
        g.crossQueue = MemcacheQueue(g.crossMC,_preName)
        
    else:
        print 'cross server init error',ver,'not in config'


if __name__=="__main__":
    pass