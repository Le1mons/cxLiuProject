#!/usr/bin/python
# coding:utf-8
'''
世界树--置换
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [英雄tid:str]
    :return:
    ::

        {'d':{
            'hero': {新英雄tid: {英雄数据}},
            'prize': []
        }
        's': 1}

    """
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

    _swapHero = g.getAttrOne(uid, {'ctype': 'worldtree_swap'},keys='_id,hid,star,tid')
    if not _swapHero or ('star' in _swapHero and _swapHero['star'] != str(_heroInfo['star'])):
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res
    # 判断是否是之前的英雄
    if "tid" in _swapHero and _swapHero["tid"] != tid:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res



    hid = _swapHero['hid']
    # 种族不同
    if _heroInfo['zhongzu'] != g.GC['pre_hero'][hid]['zhongzu']:
        _res['s'] = -2
        _res['errmsg'] = g.L('global_argserr')
        return _res

    #检测删除英雄是否有皮肤
    g.event.emit("chkdelhero_skin",uid,[_heroInfo])
    g.mdb.delete('hero',{'_id':g.mdb.toObjectId(tid),'uid':uid})
    g.delAttr(uid, {'ctype': 'worldtree_swap'})
    g.m.dball.writeLog(uid, 'worldtree_save', {'prize': hid,'star':_heroInfo['star']})

    data = {
        'dengjielv':_heroInfo['dengjielv'],
        'dengjie':_heroInfo['dengjielv'],
        'lv': _heroInfo['lv'],
        'weardata':_heroInfo.get('weardata') if _heroInfo.get('weardata') else {},
        "baoshijinglian": _heroInfo.get("baoshijinglian", 0)
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

    g.event.emit('herotheme_star', uid, hid, val=5)

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
    # 检查是否有羁绊buff
    g.m.jibanfun.chkJiBanHero(uid, [tid], conn, herodata=[_heroInfo])
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['5dfc640ff42a7f1142bcbfd8'])