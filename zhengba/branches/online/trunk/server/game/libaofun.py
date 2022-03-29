#! /usr/bin/python
# -*- coding:utf-8 -*-
import g


"""
等级礼包 养成礼包
"""
# 监听礼包充值事件
def onChongzhiSuccess(uid,act,money,orderid,payCon):
    # 养成礼包
    if act.startswith('djlb'):
        _ctype = 'libao_dengji_' + act
        _type = 'dengjilibao'
    elif act.startswith('yclb'):
        _ctype = 'libao_yangcheng_'+ act
        _type = 'yangchenglibao'
    else:
        return
        
    _con = g.GC['chongzhihd'][_type]
    _info = g.getAttrOne(uid, {'ctype': _ctype})
    # 数据不存在
    if not _info:
        return

    _buyNum = _info['buynum']
    # 购买次数小于0
    # if _buyNum < 1:
    #     return

    # _rtime = _info['rtime']
    # _nt = g.C.NOW()
    # 超过了时间
    # if _nt > _rtime:
    #     return

    _buyNum -= 1
    if _buyNum <= -1:
        g.mdb.delete('playattr', {'_id':_info['_id'],'uid':uid})
    else:
        g.setAttr(uid, {'_id':_info['_id']}, {'$inc': {'buynum': -1}})

    _prize = _con[str(_info['v'])]['prize']
    _sendData = g.getPrizeRes(uid, _prize, act={'act':'libaofun','prize':_prize})
    g.sendUidChangeInfo(uid, _sendData)
    return

# 监听升级礼包事件
def onLvupLibao(uid,_lv,*args,**kwargs):
    _hdid = 900
    _conHD = g.GC['chongzhihd']['dengjilibao']
    if str(_lv) not in _conHD:
        return

    _con = _conHD[str(_lv)]
    _ctype = 'libao_dengji_' + _con['chkkey']
    _info = g.getAttrOne(uid,{'ctype':_ctype})
    _nt = g.C.NOW()
    if not _info or _info['rtime'] < _nt or _info['buynum'] <= 0:
        _buyNum = _con['buynum']
        _rtime = _con['cd'] + _nt
        _setData = {'v':_lv,'rtime':_rtime,'hdid':_hdid,'buynum':_buyNum}
        g.setAttr(uid,{'ctype': _ctype},_setData)
        g.m.mymq.sendAPI(uid, "gift_package", '1')


# 监听养成礼包获取hero事件
def onYangCheng(uid,star):
    _temp = {
        5:'30',
        6:'68',
        7:'128',
        8:'198',
        9:'328',
        10:'448',
        11:'648',
        12:'648_12',
        13:'648_13',
    }
    if star not in _temp:
        return

    _ctype = 'libao_yangcheng_yclb' + _temp[star]
    _info = g.getAttr(uid,{'ctype': _ctype})
    _nt = g.C.NOW()
    if not _info or _info[0]['rtime'] < _nt or _info[0]['buynum'] <= 0:
        _hdid = 1400
        _con = g.GC['chongzhihd']['yangchenglibao'][str(star)]
        _rtime = _nt + _con['cd']
        _buyNum = _con['buynum']
        _setData = {'v': star, 'rtime':  _rtime, 'buynum': _buyNum,'hdid':_hdid}
        g.setAttr(uid, {'ctype': _ctype}, _setData)
        g.m.mymq.sendAPI(uid, "gift_package", {'star': star})
        


# 获取养成礼包数据
def getYangChengData(uid,**kwargs):
    _res = []
    _nt = g.C.NOW()
    # 获取五星激活礼包和六星的
    _info = g.getAttr(uid,{'ctype':{'$regex':'libao_yangcheng_yclb'}})
        # 还没有结束就添加
    if not _info:
        return _res
    _hdInfo = dict(g.GC['chongzhihd']['yangchenglibao'])
    for ele in _info:
        # 还没有结束就添加
        if ele['rtime'] > _nt and ele['buynum'] > 0:
            _val = ele['v']
            _hdInfo[str(_val)]['rtime'] = ele['rtime']
            _hdInfo[str(_val)]['buynum'] = ele['buynum']
            _res.append(_hdInfo[str(_val)])
        else:
            g.mdb.delete('playattr', {'_id': ele['_id'],'uid':uid})

    return _res

# 获取等级礼包
def getLvLibaoData(uid,**kwargs):
    _res = []
    _nt = g.C.NOW()
    # 获取等级礼包
    _info = g.getAttr(uid,{'ctype':{'$regex': 'libao_dengji_djlb'}},**kwargs)
    if not _info:
        return _res

    _hdInfo = dict(g.GC['chongzhihd']['dengjilibao'])
    for ele in _info:
        # 还没有结束就添加
        if ele['rtime'] > _nt and ele['buynum'] > 0:
            _val = ele['v']
            _hdInfo[str(_val)]['rtime'] = ele['rtime']
            _hdInfo[str(_val)]['buynum'] = ele['buynum']
            _res.append(_hdInfo[str(_val)])
        else:
            g.mdb.delete('playattr', {'_id': ele['_id'],'uid':uid})

    return _res

# 获取两个礼包的数据
def getLibaoData(uid):
    _ycLibao = getYangChengData(uid)
    _djLibao = getLvLibaoData(uid)
    return _ycLibao + _djLibao
    

g.event.on("chongzhi", onChongzhiSuccess)
g.event.on("dengjilibao", onLvupLibao)
g.event.on("yangcheng", onYangCheng)

if __name__ == '__main__':
    # print getLvLibaoData('0_5aec54eb625aee6374e25dfe')
    uid = g.buid('lsq13')