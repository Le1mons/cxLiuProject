#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("./game")

import g

'''
公会 - 领取宝箱奖励
'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _tid = data[0]
    gud = g.getGud(uid)
    _ghid = gud['ghid']
    if _ghid == '':
        _res["s"]=-1
        _res["errmsg"]=g.L('gonghui_golbal_nogonghui')
        return _res

    # 锁机制
    if g.mc.get('box_' + str(_tid)):
        _res["s"]=-6
        _res["errmsg"]=g.L('gonghui_recboxprize_-6')
        return _res

    _data = g.mdb.find1('gonghuibox',{'ghid':_ghid,'_id':g.mdb.toObjectId(_tid)})
    # 数据不存在
    if not _data:
        _res["s"]=-2
        _res["errmsg"]=g.L('global_argserr')
        return _res

    _con = g.GC['gonghui']['base']
    _cd = _con['boxcd']
    _nt = g.C.NOW()
    # 奖励已过期
    if _data['ctime'] + _cd < _nt:
        _res["s"]=-4
        _res["errmsg"]=g.L('gonghui_recboxprize_-4')
        return _res

    _reclist = map(lambda x:x['uid'], _data['reclist'])
    # 奖励已领取
    if uid in _reclist:
        _res["s"]=-5
        _res["errmsg"]=g.L('gonghui_recboxprize_-5')
        return _res

    _boxrecnum = _con['boxrecnum']
    # 奖励已领取完
    if len(_reclist) >= _boxrecnum:
        _res["s"]=-3
        _res["errmsg"]=g.L('gonghui_recboxprize_-3')
        return _res

    g.mc.set('box_' + str(_tid), 1, 3)
    g.mdb.update('gonghuibox',{'ghid':_ghid,'_id':g.mdb.toObjectId(_tid)},{'$push':{'reclist':{'uid':uid,'time':_nt}}})
    # _data = g.mdb.find1('gonghuibox',{'ghid':_ghid,'_id':g.mdb.toObjectId(_tid)})
    _myIndex = len(_reclist)
    # # 奖励已领取完
    # if _myIndex >= _boxrecnum:
    #     g.mdb.update('gonghuibox', {'ghid': _ghid, '_id': g.mdb.toObjectId(_tid)}, {'$pull': {'reclist':{'uid':uid,'time':_nt}}})
    #     _res["s"]=-3
    #     _res["errmsg"]=g.L('gonghui_recboxprize_-3')
    #     return _res

    _prize = [_data['prizelist'][_myIndex]]
    _sendData = g.getPrizeRes(uid, _prize, {'act':'gonghui_recboxprize','prize':_prize})
    g.sendChangeInfo(conn, _sendData)
    _res['d'] = {'prize': _prize}
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsq111')
    print doproc(g.debugConn, ['5be70c27e1382341b83a3863'])