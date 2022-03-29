#!/usr/bin/python
# coding:utf-8
'''
公会争锋 - 打开界面
'''


import sys
sys.path.append("..")
sys.path.append("game")

import g,bindarea,config



def proc(conn, data):
    """

    :param conn:
    :param data: [阵容:dict, 对手信息:{'uid':对手uid, 'ghid':对手公会id}]
    :return:
    ::

        {"d":{
            'season': 赛季,
            'round': 回合数,
            'segmentdata': {'segment':段位,’rank‘:排名,'jifen':积分,'isjoin':是否加入了}
            'status':状态
            3 匹配失败:
                'guildnum': 公会数量,
                'segmentdata':和上面一样  还多了一个 topsegment 公会最高段位
            1  未报名：
                ’guildnum‘： 公会数量,
            2 已报名  没有打过的 0到6点  报名没有匹配的  星期天 匹配了0点到6点:
                'guildnum': 公会数量
            6 轮空:
                'pre_seg': 之前的段位
            5 开战时间:
                'guild': {'公会id':{'player':{
                                        'atk_num': 攻击次数,
                                        'life_num': 生命数量,
                                        'fightdata':[{英雄数据}],
                                        'headdata':{},
                                        'lose_jifen':我打赢他获得的积分,
                                        },
                                    'rank': 排行,
                                    'guildinfo':{'chairman':会长名字,'flag':旗帜,'svrname':区服名,'name':公会名,''}
                                    'segment': 段位,
                                    'group': 小组,
                                    'alljifen': 总积分
                                    'zhanli': 总战力
                                    'jifen': 当轮积分,
                                    'rival_ghid': 对手公会id
                                    'division': 赛区
            4 结算期:
                'advance': 1 晋级 0 保级 -1 降级
                }}
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
    gud = g.getGud(uid)
    if g.getOpenDay() < 8:
        _res['s'] = -1
        _res['errmsg'] = g.L('competing_open_-1')
        return _res

    _res['d'] = g.m.competingfun.getCompetingData(gud['ghid'])
    # 红点
    g.setAttr(uid, {'ctype': 'ghcompeting_openonce'}, {"v": 1})

    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['1','djlv'])