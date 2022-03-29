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
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"

        }
    },
    #本地终极预览

        "dev": {
            "mc": [
                "192.168.1.56:11222"
            ],
            "db": {
                "host": "192.168.1.56",
                "port": 27017,
                "poolsize": 10,
                "dbname": "zhengba_crosserverdev",
                "dbuser": "root",
                "dbpwd": "iamciniao",
                "authdb": "admin"
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
    "default": {
        "mc": [
            "172.24.241.6:11212"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross2",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "xiongmaowbl": {
        "mc": [
            "172.24.241.5:11220"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross16",
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
    "duokemeng": {
        "mc": [
            "172.24.241.5:11295"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crossdkm",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "jiuxing": {
        "mc": [
            "172.24.241.5:11216"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrossjiuxing",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "jundao": {
        "mc": [
            "172.24.241.5:11217"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrossjundao",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "qianyoubl": {
        "mc": [
            "172.24.241.5:11218"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosserverqianyoubl",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
"aofios": {
        "mc": [
            "172.24.241.6:11222"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosserveraofios",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "anfeng": {
        "mc": [
            "172.24.241.6:11213"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross3",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "xipubl": {
        "mc": [
            "172.24.241.6:11219"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross15",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "changwan": {
        "mc": [
            "172.24.241.6:11235"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross18",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "c17playbl": {
        "mc": [
            "172.24.241.6:11214"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scross17playbl",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "caohua": {
        "mc": [
            "172.24.241.6:11215"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrosscaohua",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "dianzhi": {
        "mc": [
            "172.24.241.6:11216"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosserverdianzhi",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "newcw": {
        "mc": [
            "172.24.241.6:11217"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservernewcw",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "shouren": {
        "mc": [
            "172.24.241.6:11218"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservershouren",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
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
            "172.24.240.235:11216"
        ],
        "db": {
            "host": "172.24.240.235",
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
            "172.24.240.235:11241"
        ],
        "db": {
            "host": "172.24.240.235",
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
            "172.24.240.235:11218"
        ],
        "db": {
            "host": "172.24.240.235",
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
            "172.24.240.235:11233"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross14",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "henhwbl": {
        "mc": [
            "172.24.240.235:11234"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross17",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "tianxiangbl2": {
        "mc": [
            "172.24.240.235:11236"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross22",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "wanhai": {
        "mc": [
            "172.24.240.235:11220"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_cross_waihai",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "maoer": {
        "mc": [
            "172.24.240.235:11219"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrossmaoer",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "longxun": {
        "mc": [
            "172.24.240.235:11217"
        ],
        "db": {
            "host": "172.24.240.235",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrosslongxun",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "changxiang": {
        "mc": [
            "172.24.241.5:11320"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "crosserverchangxiang",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "qilin": {
        "mc": [
            "172.24.241.6:11412"
        ],
        "db": {
            "host": "172.24.241.6",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosserverqilin",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "fzzbjq": {
        "mc": [
            "172.24.241.5:11221"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_scrossfzzbjq",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },

    "gmswzios": {
        "mc": [
            "172.24.240.231:11212"
        ],
        "db": {
            "host": "172.24.240.231",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservergmswzios",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "gmhdtt": {
        "mc": [
            "172.24.241.5:11222"
        ],
        "db": {
            "host": "172.24.241.5",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservergmhdtt",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "miquwan": {
        "mc": [
            "172.24.241.19:11212"
        ],
        "db": {
            "host": "172.24.241.19",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservermiquwan",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "miquwan2": {
        "mc": [
            "172.16.0.10:11212"
        ],
        "db": {
            "host": "172.16.0.10",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservermiquwan2",
            "dbuser": "root",
            "dbpwd": "iamciniao",
            "authdb": "admin"
        }
    },
    "miquwansdk": {
        "mc": [
            "172.24.241.10:11212"
        ],
        "db": {
            "host": "172.24.241.10",
            "port": 27017,
            "poolsize": 10,
            "dbname": "zhengba_crosservermiquwansdk",
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
        elif config.CONFIG['VER'] == 'cross':
            g.crossMC.flush_all()

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
        
        #跨服区服分组id
        _crossGroupId = g.m.crosswzfun.getUGID()
        _preName = g.C.STR('cross_{1}_{2}',ver,_crossGroupId)
        print 'crossMQPreName========',_preName
        g.crossQueue = MemcacheQueue(g.crossMC,_preName)
        # 公平竞技场通知队列
        g.crossGpjjcQueue = MemcacheQueue(g.crossMC, 'gpjjcqueue')
        g.crossGpjjcQueue.MAX = 1000
        
    else:
        print 'cross server init error',ver,'not in config'


if __name__=="__main__":
    pass