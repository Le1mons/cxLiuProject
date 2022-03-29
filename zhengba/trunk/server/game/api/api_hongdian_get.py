# !/usr/bin/python
# coding:utf-8
'''
红点 - 获取所有红点
'''
import sys

if __name__ == "__main__":
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [1 拉取所有红点:int，(可选参数:[红点key])]
    :return:
    ::

        {"d": {
            "email 邮件":0,
            "wjzz 五军之战":0,
            "yjkg 遗迹考古":0,
            "title 爵位":{aims目标奖励, libao爵位礼包, prize奖励, up},
            "chat 聊天红点": 0,
            "trial 试炼活动": 0,
            "jiban 羁绊": 0,
            "jthl 积天豪礼": 0,
            "ladder 王者天梯": 0,
            "qwcj 趣味成就": 0,
            "return 王者归来": 0,
            "pet 神宠": {crystal 水晶,fhs 孵化室, prize 奖励},
            "jrkh 节日狂欢": 0,
            "dengjiprize 等级基金": 0,
            "glyph 雕纹": 0,
            "yueka_xiao 小月卡":0,
            "yueka_da 大月卡":0,
            "sign 每日签到":0,
            "herojitan 英雄祭坛":0,
            "gonghui 公会":{apply 申请，box 宝箱，competing 争锋，donate 捐献，fuben 副本，treasure 好友探宝},
            "guajitime 探险挂机":0,
            "tanxian 探险领奖":0,
            "shizijun 十字军":0,
            "succtask 成就任务":0,
            "dailytask 日常任务":0,
            "mrsl 每日试炼":0,
            "friend": {yinji 好友印记, apply 好友申请},
            "dianjin 点金":0,
            "huodong":[可以显示红点的活动的hdid],
            "worship 排行膜拜":0,
            "artifact 神器":0,
            "crosszbjifen":{jifen 积分赛红点, zb 争霸赛红点},
            "destiny 天命奖励":0,
            "herorecruit 英雄招募":0,
            "xuyuanchi 许愿池":0,
            "crosswz 王者荣耀":0,
            "kingstatue 王者雕像":0,
            "storm 风暴战场":0,
            "xstask 悬赏任务":0,
            "kfkh 开服狂欢":{},
            "shouchonghaoli 首充豪礼":{},
            "chongzhiandlibao":{"meiribx 每日宝箱": 0, "meirisd 每日商店": 0},
            "flag 战旗":[],
            "monthfund 月基金":0,
            "watcher 守望者秘境":{'target':目标奖励,'trader':商人},
            "fashita":{'fashita 巨龙之路':0,'devil 魔王':0},
            }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    iscache = 0
    hdlist = []
    if len(data) == 1:
        #是否获取缓存
        iscache = int(data[0])
    if len(data) == 2:
        #活动标识，未空数组取全部红点，或取指定红点
        hdlist = list(data[1])
        iscache = int(data[0])

    # 如果小于五级
    gud = g.getGud(uid)
    if gud['lv'] <= 5:
        _keyList = ['email','yueka_xiao','yueka_da','sign','dengjiprize','jitianfanli','leijichongzhi',
                    'herojitan','zhouchanghuodong','gonghui','guajitime','tanxian','shizijun',
                    'succtask','dailytask','mrsl','treature','friend','dianjin','huodong','worship',
                    'artifact', 'hecheng','crosszbjifen','meirishouchong','destiny','xuyuanchi','herorecruit',
                    'xszm','crosswz','teamcopy','kingstatue','storm','xstask','qwcj','lifetimecard']
        _rData = {i:0 for i in _keyList}
        _rData.update({'kfkh':{},'shouchonghaoli':{},'chongzhiandlibao':{"meiribx": 0, "meirisd": 0},'flag':[],'jrkh':[],'title':{'up':0,'prize':0},
                       'monthfund':{'170':{},'180':{}},'watcher':{'target':0,'trader':0},'fashita':{'fashita':0,'devil':0},
                       'return':{'login':0,'return':0,'daily':0,'recharge':0},'pet':{'prize':0,'fhs':0,'crystal':0},'wangzhezhaomu':[]})

        if hdlist:
            _rData = {i:_rData.get(i, 0) for i in hdlist}
            _res["d"] = _rData
    else:
        _rData = g.m.hongdianfun.getAllHongdian(uid,hdlist,iscache)
    _res["d"] = _rData
    return _res


if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    print doproc(g.debugConn, [1,["heropreheat"]])