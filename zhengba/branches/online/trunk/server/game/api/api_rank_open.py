#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g

'''
排行 - 打开排行榜界面
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    if not hasattr(conn,"uid"):
        _res["s"]=-102
        return (_res)
        
    uid = conn.uid

    '''if not g.chkOpenCond(uid,'paihangbang'):
        _res['s'] = -1
        _res['errmsg'] = g.L("global_not_open")
        return _res'''

    #排行类型
    rid = int(data[0])
    _rank2Map = {
        #获取玩家最大挂机地图排行
        1:g.m.rankfun.getMaxMapidRank,
        # 获取全部玩家爱法师塔排行
        2:g.m.rankfun.getFashitaRank,
        # 获取50个玩家竞技场排行
        3: g.m.rankfun.getArenaRank,
        # 获取玩家冠军试练排行
        4: g.m.rankfun.getChampionTrialRank,
        # 获取玩家好友探宝积分排行
        5: g.m.rankfun.getFriendJifenRank,
        # 获取好友伤害排行
        6: g.m.rankfun.getFriendDpsRank,
        # 获取点金达人排行
        7: g.m.rankfun.getDJDRRank,
        # 获取远征统帅排行
        8: g.m.rankfun.getYZTSRank,
        # 获取赏金奇兵排行
        9: g.m.rankfun.getSJQBRank,
        # 获取公会榜排名
        10:g.m.rankfun.getGuildRank,
        # 获取战力排名
        11: g.m.rankfun.getPowerRank,
        # 获取开服狂欢排行
        12: g.m.rankfun.getKfkhRank,
        # 获取跨服争霸排行
        13: g.m.rankfun.getKFZBRank,
        # 玩家图鉴榜
        14: g.m.rankfun.getAvaterRank,
        # 获取探险先锋排行
        15: g.m.rankfun.getTXXFRank,
        # 获取探险先锋排行
        16: g.m.rankfun.getWatcherRank,
        # 获取成就点排行
        17: g.m.rankfun.getSuccessRank,
        # 获取公会争锋排行
        18: g.m.rankfun.getGuildCompetingRank,
        # 获取公会赛区排行
        19: g.m.rankfun.getGuildCompetingDivisionRank,
        # 获取神殿魔王排行
        20: g.m.rankfun.getTempleDevilRank,
        # 获取团队副本积分排行
        21: g.m.rankfun.getCopyJifenRank,
        # 获取公会团队任务贡献排行
        22: g.m.rankfun.getTeamTaskContriRank,
    }
    
    _rankKeys = _rank2Map.keys()
    if rid not in _rankKeys:
        _res["s"]=-101
        return _res
    
    #获取数据
    if len(data) == 1:
        _list = _rank2Map[rid](1,uid)
        _res["d"] = _list
    else:
        _resData = {}
        for i in data:
            _resData[str(i)] = _rank2Map[i](1,uid)

        # 膜拜逻辑
        _worshipInfo = g.getAttrByDate(uid, {'ctype': 'rank_worship'})
        _worshiped = _worshipInfo[0]['v'] if _worshipInfo else []
        _res["d"] = {'rankinfo': _resData,'worship': _worshiped}

    # _mobai = g.m.rankfun.getMoBaiByRid(uid,rid)
    # _res["d"] = {'list':_list,'mobai':_mobai}
    return _res

if __name__ == "__main__":
    g.debugConn.uid = g.buid('lsq14')
    gud = g.getGud(g.debugConn.uid)
    print doproc(g.debugConn,[1, 2, 3, 10, 11, 14, 17])