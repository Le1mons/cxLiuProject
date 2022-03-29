#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 公会科技重置
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
    _data = g.getAttrOne(uid,{'ctype':'keji_data','k':_job})
    if _data == None:
        #没有升级过，无需重置
            _res["s"] = -2
            _res["errmsg"] = g.L("ghkeji_clear_res_-2")
            return _res
        
    _reSetData = g.m.gonghuifun.getResetNum(uid)
    if _job in _reSetData:
        _need = list(g.GC['gonghui']['base']['kejiresetneed'])
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
    
        #扣除奖励
        _sendData = g.delNeed(uid, _need,logdata={'act': 'ghkeji_clear'})
        g.sendChangeInfo(conn, _sendData)
    
    #记录重置次数
    g.m.gonghuifun.setResetNum(uid,_job)
    #获取返还的材料
    _prize = g.m.ghkejifun.getPrizeByJobKeJi(uid,_job)
    #删除科技信息
    g.m.ghkejifun.clearKeJi(uid,_job)
    _prizeRes = g.getPrizeRes(uid,_prize,{'act':'ghkeji_clear'})
    _r = g.sendChangeInfo(conn,_prizeRes)
    _resData = {'prize':_prize}
    #重置属性
    g.m.ghkejifun.reSetBuff(uid,_job)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid,{'job':int(_job),'lv': {'$gt': 1}})
    if _heroData != None:
        g.sendChangeInfo(conn, {'hero':_heroData})
    g.event.emit('JJCzhanli', uid)

    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('xuzhao')
    print g.debugConn.uid
    _data = ['1']
    print doproc(g.debugConn,_data)