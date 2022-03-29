#!/usr/bin/python
# coding:utf-8
'''
区服的配置文件

@author：刺鸟
@email：4041990@qq.com
'''
import sys
import os
sys.path.append('..')
sys.path.append(os.getcwd())
sys.path.append(os.getcwd() + '/game')

import bindarea

portplus = 5104

AREA = {
    0: {
        "title": "内部测试",
        "port": [7288 + portplus]
    }
}

CONFIG = dict(
    port2sid=bindarea.port2SidDict(AREA),
    sid2Name=bindarea.sid2NameDict(AREA),
    ALLSVRINDEX=AREA.keys(),

    socketSvr=6287 + portplus,  # socket长链服务器
    gameSvr=bindarea.mixGamePort(AREA),  # web逻辑服务器端口
    mainSvr=5002 + portplus,  # 主控服务器端口
    dispatchSvr=8002 + portplus,  # 调度服务器端口
    SVRINDEX=bindarea.getFirstSid(AREA),
    servername=bindarea.getFirstSName(AREA),
    # fightSvr=6101 + portplus,  # 战斗服务器

    DBCONFIG={
        "host": "10.0.0.7",
        "port": 27017,
        "poolsize": 10,
        "dbname": "zhengba_s0",
        "dbuser": "root",
        "dbpwd": "iamciniao",
        "authdb": "admin"
    },
    MEMCACHE=['10.0.0.7:11208'],
    APIKEY='uutown123456',
    OPENTIME="2019-01-08 10:00:00",  # 开区时间
    VER="debug",  # 游戏版本
    OWNER="blyinghe",  # 渠道
    CROSSVER="debug"  # 跨服配置版本
)

'''
SERVERCONFIG = {
    "tishen":1
}
'''

if __name__ == '__main__':
    print CONFIG