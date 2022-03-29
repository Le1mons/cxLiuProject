#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g
import huodong
'''
获取客户端动态按钮
'''
def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    
    if len(data)==0:
        _type = 1
    else:
        _type = data[0]
        
    _func = {
        # 首充
        'shouchong':g.m.shouchongfun.isOpen,
        # 开服狂欢 ok
        "kaifukuanghuan":g.m.kfkhfun.getKfkh,
        # 在线奖励
        "onlineprize":g.m.onlineprizefun.getOnlineOver,
        # 限时礼包
        'xianshilibao':g.m.libaofun.getLibaoData,
        # 判断月基金活动是否开启
        'yuejijin':huodong.monthfund.getMonthFundInfo,
        # 次日登陆送礼
        'ciridenglu':g.m.signdenglufun.getCRDLisOpen,
        # 超级基金
        'chaojijijin':g.m.monthfund.getFundShow
    }
    _resData = {}
    # 如果是1  就全部都要
    if _type != 1:
        for key in _type:
            if key == 'herocoming':
                # 英雄降临
                _hdData = g.m.huodongfun.getHDDATAbyHtype(uid, 18)
                _resData['herocoming'] = _hdData['val'] if _hdData else []
            elif key == 'meirishouchong':
                _resData['meirishouchong'] = g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive')
            elif key == 'xianshi_zhaomu':
                _resData[key] = g.m.xszmfun.isOpen()
            else:
                _resData[key] = _func[key](uid)
    else:
        _resData['shouchong'] = _func['shouchong'](uid)
        _resData['kaifukuanghuan'] = _func['kaifukuanghuan'](uid)
        _resData['onlineprize'] = _func['onlineprize'](uid)

        _statue = g.m.crosswzfun.getKingStatueInfo()
        _resData['kingstatue'] = _statue['name'] if _statue.get('uid') else ''

        # 第一次进游戏会拉所有的  故在此判断登陆次数   增加登陆次数
        # _cacheKey = "_signdenglufun_from_getayncbtn_"+ str(uid)
        # if g.mc.get(_cacheKey) != g.C.DATE():
        #     g.mc.set(_cacheKey,g.C.DATE(),300)
        #     g.m.signdenglufun.getLoginNum(uid)

        #//正常外网运营的区，极低可能性没有活动，如果都没有活动了，玩家打开一个空界面也没啥影响，客户端常态显示 限时活动 的按钮
        # 限时活动
        #_resData['xianshihuodong'] = g.m.huodongfun.getOpenList(isid=1)
        _resData['meirishouchong'] = g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive')
        _resData['xianshilibao'] = _func['xianshilibao'](uid)
        _resData['yuejijin'] = _func['yuejijin'](uid)
        _resData['ciridenglu'] = _func['ciridenglu'](uid)
        _hdData = g.m.huodongfun.getHDDATAbyHtype(uid, 18)
        _resData['herocoming'] = _hdData['val'] if _hdData else []
        _resData['chaojijijin'] = _func['chaojijijin'](uid)
        _resData['xianshi_zhaomu'] = g.m.xszmfun.isOpen()

    _res['d'] = _resData


    return _res



if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[])