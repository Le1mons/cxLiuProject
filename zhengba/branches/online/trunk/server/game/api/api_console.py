#coding:utf-8
#!/usr/bin/python

'''
    内部测试用接口

    Happy Hacking

    Programmmed by gch
'''

if __name__ == '__main__':
    import sys
    import os
    print os.getcwd()
    sys.path.append('..')
    sys.path.append('game')

import g,os,sys
import config
conf = config.CONFIG

helpstr = {
    'help':'查看使用说明',
    'delyzxy':'删除远征西域数据',
    'delmsmq':'删除民生民情任务数据',
    'deltask':'删除任务数据',
    'deljdzd':'删除经典战斗任务数据',
    'lsj/bus/gt/dc':'修改推图进度',
    'whosyourdaddy/wyd':'这下我可以更潇洒了。',
    'showmethemoney/smtm':'钱财乃身外之物。',
    'lv/vip/yinbi/liangcao/rmbmoney/jingtie...':'直接修改玩家属性',
    'win':'[魔法门]直接提升第一个佣兵到牛逼状态,方便打赢战斗'
}

helpstr2 = {
    '直接修改玩家属性:等级(lv)/VIP(vip)/...':"bingo('lv',50)",
    '想要直接跳到某个城市?老司机给你带路':"bingo('lsj',55)",
    '敌人太强肿么办?':"bingo('wyd')",
    '没金币了/没粮草了/没元宝了':"bingo('smtm')",
    '[魔法门]想赢得战斗怎么办': "bingo('win')试试吧"
}

def proc(conn,data):
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

def doproc(conn,data):
    _res = {"s":1}
    #只能在内网使用
    if conf['VER'] != "debug":
        return _res

    if not hasattr(conn,"uid"):
        _res['s'] = -102
        return _res

    uid = conn.uid
    gud = g.getGud(uid)
    if not data:
        _res['d'] = helpstr2
        return _res

    elif data[0] == "hero":
        _hid = str(data[1])
        _num = int(data[2])
        _res = {}
        for i in xrange(_num):
            _rData = g.m.herofun.addHero(uid,_hid)
            g.m.userfun.setMaxZhanli(uid, _rData['maxzhanli'])
            _res[_rData['tid']] = _rData['herodata']
        g.sendChangeInfo(conn,{"hero":_res})
        _res['d'] = "add hero."
        return _res

    elif data[0] == "allhero":
        _res = {}
        for i in g.GC['hero']:
            _rData = g.m.herofun.addHero(uid,i)
            g.m.userfun.setMaxZhanli(uid, _rData['maxzhanli'])
            _res[_rData['tid']] = _rData['herodata']
            g.event.emit("adduserhead", uid, [i])
            g.event.emit("hero_tongu", uid, i)
        g.sendChangeInfo(conn,{"hero":_res})
        _res['d'] = "add allhero OK."
        return _res

    elif data[0] == "item":
        # _itemid = str(data[1])
        _itemNameorId = str(data[1])

        _conf = g.GC['item']

        _itemid = ''
        for itemid in _conf:
            if _itemNameorId == _conf[itemid]['name']:
                _itemid = itemid
                break
        if _itemid == '':
            _itemid = _itemNameorId

        if _itemid not in g.GC['item']:
            _res['s'] = -1
            _res['errmsg'] = g.L("itemid not exist")
            return _res

        _num = int(data[2])
        _prize = [{"a":"item","t":_itemid,"n":_num}]
        _prizeRes = g.getPrizeRes(uid,_prize,{'act':'debug'})
        _r = g.sendChangeInfo(conn,_prizeRes)
        _res['d'] = "new item added."
        return _res

    elif data[0] == "equip":
        _itemid = str(data[1])
        if _itemid not in g.GC['equip']:
            _res['s'] = -1
            _res['errmsg'] = g.L("equipid not exist")
            return _res
        
        _num = int(data[2])
        _prize = [{"a":"equip","t":_itemid,"n":_num}]
        _prizeRes = g.getPrizeRes(uid,_prize,{'act':'debug'})
        _r = g.sendChangeInfo(conn,_prizeRes)
        _res['d'] = "new equip added."
        return _res

    elif data[0] == 'evolution':
        _num = int(data[1])
        _heroList = g.m.herofun.getMyHeroList(uid, sort=[['star', -1],['zhanli', -1]], limit=_num)
        _tidList = []
        for i in _heroList:
            _tid = i['_id']
            _tidList.append(_tid)
            if i['star'] >= 6:
                _maxStarLv = getMaxStarLv(i['hid']) if len(data) == 2 else data[1]
            else:
                _maxStarLv = i['star']
            # _maxLv = g.m.herofun.getMaxLv(i['hid'], _maxStarLv)
            _maxLv = 250
            g.event.emit("adduserhead", uid, [i['hid'] + '_1'])
            data = {
                'lv': _maxLv,
                'star':_maxStarLv,
                'dengjielv': _maxStarLv
            }
            g.m.herofun.updateHero(uid, _tid, data=data)
            g.m.herofun.reSetHeroBuff(uid, _tid)
        _w = {'uid':uid, '_id':{'$in': _tidList}}
        _res['d'] = g.m.herofun.reSetAllHeroBuff(uid, where=_w)

        return _res
    elif data[0] == 'all':
        for j in ('equip','shipin'):
            _con = g.GC[j]
            for i in _con:
                _temp = [{'a':j,'t':i,"n":10}]
                _sendData = g.getPrizeRes(uid, _temp, act={'act':'debug'})
                g.sendChangeInfo(conn, _sendData)
        _res['d'] = 'add all OJBK'
        return _res
    elif data[0] == 'glyph':
        if len(data) == 1:
            _p = [{'a': 'glyph', 't': str(i), 'n': 1} for i in xrange(1, 16)]
        else:
            _p = [{'a': 'glyph', 't': data[1], 'n': data[2]}]
        _sendData = g.getPrizeRes(uid, _p, act={'act':'debug'})
        g.sendChangeInfo(conn, _sendData)
        _res['d'] = 'add all OJBK'
        return _res

    elif data[0] == 'shipin':
        sid = data[1]
        _num = data[2]
        _prize = [{'a':'shipin','t':sid,'n':_num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = 'add shipin OJBK'

    #show me the money
    elif len(data) == 2 and data[0] in gud:
        _attr,_value = data[0],data[1]
        needMap = {_attr:_value}
        if _attr == 'nexp':
            _r = g.m.userfun.altExp(uid,_value)
            if 'addnext' in _r:
                del _r['addnexp']

            needMap.update(_r)
            
        _r = g.m.userfun.updateUserInfo(uid,needMap,{'act':'console'})
        _r = g.sendChangeInfo(conn,{'attr':needMap})
        _res['d'] = '如你所愿：P'
        return _res

    else:
        _res['s'] = -1

    return _res


#合并两个结构相同或不同的dict
def mergeDict(dict1,dict2,add=0):
    #不是dict无法合并
    if not isinstance(dict1,dict) or not isinstance(dict2, dict):
        return
    #{"army":{"1":1,"2":2}}
    #{"army":{"3":3,"1":1},"item":{"4":1}}
    for k,v in dict2.items():
        #合并不存在的kv
        if k not in dict1:
            dict1[k] = v
        #合并存在且需要累加的kv
        elif k in dict1 and add == 1:
            dict1[k]+=v
        #存在的kv递归合并
        else:
            mergeDict(dict1[k],v,1)

    return

def getMaxVip():
    return max([int(x) for x in g.GC['vip'].keys()])

def getMaxLv():
    return max([int(x) for x in g.GC['herocom']['herolvup'].keys()])

def getMaxStarLv(hid):
    return max([int(x) for x in g.GC['herostarup'][hid].keys()])

if __name__ == "__main__":
    uid = g.buid("lsq10")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['item',2006,10000])