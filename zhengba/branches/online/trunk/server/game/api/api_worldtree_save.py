#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
世界树--置换确认
'''
def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄tid
    tid = data[0]
    _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
    # 英雄信息不存在
    if not _heroInfo:
        _res['s'] = -103
        _res['errmsg'] = g.L('global_heroerr')
        return _res

    _swapHero = g.m.worldtreefun.getSwapHero(uid)
    hid = _swapHero['hid']

    g.mdb.delete('hero',{'_id':g.mdb.toObjectId(tid),'uid':uid})
    g.delAttr(uid, {'ctype': 'worldtree_swap'})
    g.m.dball.writeLog(uid, 'worldtree_save', {'prize': hid})

    data = {
        'dengjielv':_heroInfo['dengjielv'],
        'dengjie':_heroInfo['dengjielv'],
        'lv': _heroInfo['lv'],
        'weardata':_heroInfo.get('weardata') if _heroInfo.get('weardata') else {},
    }
    # if g.GC['hero'][hid]['star'] > 4:
    #     _data = _heroInfo.get('extbuff', {}).get('meltsoul', [])
    #     _temp = {
    #         'extbuff': {'meltsoul': g.m.herofun.getMSbuff(hid, _data, _heroInfo.get('meltsoul',1))},
    #         'meltsoul': _heroInfo.get('meltsoul', 1),
    #     }
    #     data.update(_temp)

    _newHero = g.m.herofun.addHero(uid, hid, data=data)
    g.m.userfun.setMaxZhanli(uid,_newHero['maxzhanli'])
    _newHeroTid = _newHero['tid']
    _sendData = {tid:{'num':0}, _newHeroTid:_newHero['herodata']}
    g.sendChangeInfo(conn, {'hero': _sendData})

    #检测头像信息
    g.event.emit("adduserhead",uid,[str(hid)])
    g.event.emit("hero_tongu", uid, hid)
    _res['d'] = {'hero': {_newHeroTid:_newHero['herodata']}}
    # 更换融魂消耗
    _msPrize = g.getAttrByCtype(uid, 'meltsoul_cost', bydate=False, default=[], k=tid)
    if _msPrize:
        g.mdb.delete('playattr', {'uid': uid, 'ctype': 'meltsoul_cost', 'k': tid})
        _sendData = g.getPrizeRes(uid, _msPrize, {'act':"worldtree_save",'p':_msPrize,'add':hid,'del':_heroInfo['hid']})
        g.sendChangeInfo(conn, _sendData)
        _res['d']['prize'] = _msPrize
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5b07b65bc0911a308c01f02c'])