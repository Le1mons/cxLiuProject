#!/usr/bin/python
#coding:utf-8
import sys
if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight

'''
争霸赛战斗接口
'''

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1,"d":{}}
    uid = conn.uid
    
    # 检查玩家是否满足开启要求
    if not g.m.crosszbfun.ifOpen(uid):
        _res['s'] = -1
        _res['errmsg'] = g.L("unopencrosszb")
        return _res

    if g.m.crosszbfun.getZBStatus() != 1:
        _res['s'] = -2
        _res['errmsg'] = g.L("notzbfighttime")
        return _res

    #挑战对手uid
    _touid = str(data[0])
    _fightData = data[1]
    #2016-12-19 增加上传数据
    g.m.crosszbfun.uploadUserDataToCross(uid)
    _con = g.m.crosszbfun.getCon()
    if uid == _touid:
        #无法挑战自己
        _res["s"] = -4
        _res["errmsg"]=g.L('crosszb_zbfight_-4')
        return _res
    
    _cd = g.m.crosszbfun.getZBFightCD(uid)
    _nt = g.C.NOW()
    if _cd !=None and _cd > _nt:
        #战斗CD中
        _res["s"] = -8
        _res["errmsg"]=g.L('crosszb_zbfight_-8')
        return _res

    _rivalInfo = g.crossDB.find1('jjcdefhero',{'uid': _touid})
    if not _rivalInfo:
        #挑战玩家信息有误
        _res["s"] = -5
        _res["errmsg"]=g.L('crosszb_zbfight_-5')
        return _res

    _pkData = g.m.crosszbfun.getZBFightData(uid)
    _pkUid = ''
    _pkRank = 0
    _myChkRank = 0
    for d in _pkData:
        if d['uid'] == _touid:
            _pkUid = d['uid']
            _pkRank = d['rank']
            continue
        if d['uid'] == uid:
            _myChkRank = d['rank']

    if _pkUid == '' or _pkRank == 0 or _myChkRank == 0:
        # 挑战玩家信息有误
        _res["s"] = -3
        _res["errmsg"] = g.L('crosszb_zbfight_-5')
        return _res

    _myRank = g.m.crosszbfun.getMyZBRank(uid)
    _toRank = g.m.crosszbfun.getMyZBRank(_pkUid)
    if _pkRank != _toRank or _myChkRank != _myRank:
        # 挑战玩家排名已发生变化
        g.m.crosszbfun.refZBFightData(uid)
        _res["s"] = -6
        _res["errmsg"] = g.L('crosszb_zbfight_-6')
        return _res

    _pkNum = g.m.crosszbfun.getCanZBPkNum(uid)
    if _pkNum == 0:
        #无挑战次数
        _res["s"] = -7
        _res["errmsg"]=g.L('crosszb_zbfight_-7')
        return _res

    # 检查战斗参数
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData)
    if _chkFightData['chkres'] < 1:
        _res['s'] = _chkFightData['chkres']
        _res['errmsg'] = g.L(_chkFightData['errmsg'])
        return _res
    #扣除次数
    g.m.crosszbfun.setZBPKNum(uid)
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 0, sqid=_fightData.get('sqid'))
    f = ZBFight('pvp')
    _fightRes = f.initFightByData(_userFightData + _rivalInfo['fightdata']).start()
    _fightRes['headdata'] = [_chkFightData['headdata'], _rivalInfo['headdata']]
    _winside = _fightRes['winside']
    _flogId = g.m.crosszbfun.addFightLog({'flog': _fightRes})
    _resData = {}
    _resData['fightres'] = _fightRes
    _logData = {}
    gud = g.getGud(uid)
    _logData['iswin'] = _fightRes['winside']
    _logData['uid'] = _pkUid
    _logData['pkuid'] = uid
    _logData['pkname'] = gud['name']
    _logData['ext_servername'] = g.m.crosscomfun.getSNameBySid(gud['sid'])
    _logData['flogid'] = _flogId
    if _winside == 0:
        _prize = list(_con['zhengba']['zbpkprize']['win'])
        #更换排名
        if _myRank > _toRank:
            _logData['rank'] = _myRank
            _logData['flogid'] = g.m.crosszbfun.addFightLog({'flog':_fightRes})
            _myData = {'rank':_toRank}
            _toData = {'rank':_myRank}
            g.m.crosszbfun.setZhengBaData(uid,_myData)
            g.m.crosszbfun.setZhengBaData(_pkUid,_toData)
            if _toRank <= 20:
                #排名在20名之内记录王者风范记录
                _ud = g.m.crosszbfun.getCrossUserData(uid)
                _tud = g.m.crosszbfun.getCrossUserData(_pkUid)
                _step = g.m.crosszbfun.getZhengBaStep(uid)
                _top20Log = {}
                _top20Log['uid'] = uid
                _top20Log['headdata'] = _ud['headdata']
                _top20Log['rank'] = _myRank
                _top20Log['zhanli'] = _ud['maxzhanli']
                _top20Log['touid'] = _pkUid
                _top20Log['torank'] = _toRank
                _top20Log['tozhanli'] = _tud['maxzhanli']
                _top20Log['toheaddata'] = _tud['headdata']
                _top20Log['dkey'] = g.C.getWeekNumByTime(g.C.NOW())
                _top20Log['flogid'] = _logData['flogid']
                _top20Log['step'] = _step
                g.m.crosszbfun.addCrossZbLog(_top20Log)
    else:
        _prize = list(_con['zhengba']['zbpkprize']['lose'])
        _logData['iswin'] = 1
        #设置CD
        _cd = g.m.crosszbfun.setZBfightCD(uid)

    _logData['prize'] = _prize
    _sendData = g.getPrizeRes(uid, _prize,{'act':'crosszb_zbfight','prize':_prize})
    g.sendChangeInfo(conn, _sendData)
    g.m.crosszbfun.setZBFightLog(_logData)

    if '_id' in _logData:
        _logData['_id'] = str(_logData['_id'])

    _resData['prize'] = _prize
    _res['d'] = _resData
    return _res

if __name__ == "__main__":
    uid = g.buid("lsq13")
    # a = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, ["0_5aec54eb625aee6374e25e0c",{"1":"8b973bfae138231da27d1f44"}])
    # for i in g.crossDB.find('crosszb_jifen'):
    #     uid = i['uid']
    #     if not g.getGud(uid):
    #         g.crossDB.delete('crosszb_zb',{'uid':uid})
    #     else:
    #         g.m.crosszbfun.uploadUserDataToCross(uid)
    #         g.crossDB.update('crosszb_jifen',{'uid':uid}, {'sid': g.getGud(uid)['sid']})