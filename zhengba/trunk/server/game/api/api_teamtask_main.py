#!/usr/bin/python
#coding:utf-8
'''
公会 - 团队任务主界面
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [阵容:dict]
    :return:
    ::

        {'d': {
                'v':{},
                'fightnum':战斗次数
                "rank":[{'name':玩家名字,'dps':伤害}],
                'supply':补给值,
                'task':{'任务id':当前值}
                }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        #无工会信息
        _res['s'] = -1
        _res['errmsg'] = g.L('gonghui_golbal_nogonghui')
        return _res

    _fbid = g.m.gonghuifun.getMaxGongHuiFuBen(_ghid)
    if int(_fbid) <= 60:
        # 必须打通关60关副本
        _res['s'] = -2
        _res['errmsg'] = g.L('gonghui_golbal_fberr')
        return _res

    _rData = {}
    _data = g.mdb.find1('gonghuiattr', {'ghid': _ghid, 'ctype': 'teamtask_leader'}, sort=[['k', -1]], fields=['_id','pos2hp','maxhp','uid2dps','ispass','v'])
    _rData['v'] = _data['v'] if _data else 1

    # 已经开启了boss数据 并且最后的一个没有打通
    if _data and 'ispass' not in _data:
        _rData = _data
        _rData['fightnum'] = g.m.teamtaskfun.getFightNum(uid)
        _rData['rank'] = []
        for i in _rData.get('uid2dps',{}):
            _rData['rank'].append({'name': g.getGud(i)['name'], 'dps': _rData['uid2dps'][i]})
        if _rData.get('uid2dps'):
            del _rData['uid2dps']

        _rData['rank'].sort(key=lambda x:x['dps'], reverse=True)

    # 显示任务的数据
    _data = g.mdb.find1('gonghuiattr', {'ghid': _ghid, 'ctype': 'teamtask_taskinfo'},fields=['_id','v']) or {'v':{}}
    # 补给值
    _contri = g.mdb.find1('gonghuiattr', {'ghid':_ghid, 'ctype':'teamtask_supply'}, fields=['_id','v']) or {'v': 0}
    _rData['task'] = _data.pop('v')
    _rData['supply'] = _contri['v']

    _res['d'] = _rData
    return _res

    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('4')
    print g.debugConn.uid
    _data = ['5b30ff08625aeebb340efbee','0_5aec54eb625aee6374e25dfe']
    print doproc(g.debugConn,_data)