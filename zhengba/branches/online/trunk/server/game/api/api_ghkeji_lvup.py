#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 公会科技升级
'''


def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    #职业
    _job = str(data[0])
    #科技技能id
    _kjid = str(data[1])
    _con = g.GC['gonghui']['base']
    if _job not in _con['keji']:
          #参数信息有误
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    #科技配置
    _kjCon = _con['keji'][_job]['skill']
    if _kjid not in _kjCon:
          #参数信息有误
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    #对应职业的科技信息
    _kjData = g.m.ghkejifun.getKjData(uid,_job)
    #对应职业的下标
    # _idx = _kjCon.index(_kjid)
    # if _idx > 0:
    #     #检测前置条件
    #     _chkKJId = str(_kjCon[_idx - 1])
    #     if _chkKJId not in _kjData or _kjData[_chkKJId] < 10:
    #         #未满足前置条件
    #         _res['s'] = -2
    #         _res['errmsg'] = g.L('ghkeji_lvup_res_-2')
    #         return _res
        
    _nextLv = 1
    if _kjid in _kjData: _nextLv = _kjData[_kjid] + 1
    _maxLv = _con['skill'][_kjid]['maxlv']
    if _nextLv > _maxLv:
        #等级已达上限
        _res['s'] = -3
        _res['errmsg'] = g.L('ghkeji_lvup_res_-3')
        return _res
    
    _needCon = list(_con['skill'][_kjid]['need'])
    _need = []
    # 当前等级的消耗
    lv = _nextLv - 1
    for d in _needCon:
        _tmp = d
        _tmp['n'] = eval(_tmp['n'])
        _need.append(_tmp)
        
    _chk = g.chkDelNeed(uid, _need)
    # 消耗不足
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res
    
    _sendData = {}
    _sendData = g.delNeed(uid, _need,logdata={'act': 'ghkeji_lvup','need':_need,'kjid':_kjid,'lv':_nextLv})
    _key = g.C.STR('v.{1}',_kjid)
    #设置技能等级
    g.m.ghkejifun.setKjData(uid,_job,{_key:_nextLv})
    g.sendChangeInfo(conn, _sendData)
    #重置属性
    g.m.ghkejifun.reSetBuff(uid,_job)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid,{'job':int(_job),'lv': {'$gt': 1}})
    if _heroData != None:
        g.sendChangeInfo(conn, {'hero':_heroData})
        
    return _res
    
if __name__ == '__main__':
    g.debugConn.uid = g.buid('nk999')
    # print g.debugConn.uid
    # _data = ['1','2']
    # print doproc(g.debugConn,_data)
    print g.mdb.delete('artifact',{})
