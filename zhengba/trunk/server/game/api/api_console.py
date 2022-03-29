# coding:utf-8
# !/usr/bin/python

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

import g, os, sys
import config

conf = config.CONFIG

helpstr = {
    'help': '查看使用说明',
    'delyzxy': '删除远征西域数据',
    'delmsmq': '删除民生民情任务数据',
    'deltask': '删除任务数据',
    'deljdzd': '删除经典战斗任务数据',
    'lsj/bus/gt/dc': '修改推图进度',
    'whosyourdaddy/wyd': '这下我可以更潇洒了。',
    'showmethemoney/smtm': '钱财乃身外之物。',
    'lv/vip/yinbi/liangcao/rmbmoney/jingtie...': '直接修改玩家属性',
    'win': '[魔法门]直接提升第一个佣兵到牛逼状态,方便打赢战斗'
}

helpstr2 = {
    '直接修改玩家属性:等级(lv)/VIP(vip)/...': "bingo('lv',50)",
    '想要直接跳到某个城市?老司机给你带路': "bingo('lsj',55)",
    '敌人太强肿么办?': "bingo('wyd')",
    '没金币了/没粮草了/没元宝了': "bingo('smtm')",
    '[魔法门]想赢得战斗怎么办': "bingo('win')试试吧"
}


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


def doproc(conn, data):
    _res = {"s": 1}
    # 只能在内网使用
    if conf['VER'] != "debug":
        return _res

    if not hasattr(conn, "uid"):
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
        _heroChange = {}
        for i in xrange(_num):
            _rData = g.m.herofun.addHero(uid, _hid)
            g.m.userfun.setMaxZhanli(uid, _rData['maxzhanli'])
            _heroChange[_rData['tid']] = _rData['herodata']
        g.sendChangeInfo(conn, {"hero": _heroChange})
        _res['d'] = _heroChange
        return _res

    elif data[0] == "allhero":
        _res = {}
        for i in g.GC['hero']:
            _rData = g.m.herofun.addHero(uid, i)
            g.m.userfun.setMaxZhanli(uid, _rData['maxzhanli'])
            _res[_rData['tid']] = _rData['herodata']
            g.event.emit("adduserhead", uid, [i])
            g.event.emit("hero_tongu", uid, i)
            # 增加名将绘卷列表
            g.event.emit("addmjhj", uid, i)
        g.sendChangeInfo(conn, {"hero": _res})
        _res['d'] = "add allhero OK."
        return _res


    elif data[0] == "gud":
        _res['d'] = g.getGud(uid)
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
        _prize = [{"a": "item", "t": _itemid, "n": _num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = "new item added."
        return _res

    elif data[0] == "pet":
        # _itemid = str(data[1])
        _itemNameorId = str(data[1])
        _num = int(data[2])
        _prize = [{"a": "pet", "t": _itemNameorId, "n": _num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = _prizeRes
        return _res

    elif data[0] == "equip":
        _itemid = str(data[1])
        if _itemid not in g.GC['equip']:
            _res['s'] = -1
            _res['errmsg'] = g.L("equipid not exist")
            return _res

        _num = int(data[2])
        _prize = [{"a": "equip", "t": _itemid, "n": _num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = _prizeRes["equip"]
        return _res

    elif data[0] == "delitem":
        _itemid = str(data[1])
        g.mdb.delete("itemlist", {"itemid":_itemid, "uid": uid})


    elif data[0] == 'evolution':
        _num = int(data[1])
        _heroList = g.m.herofun.getMyHeroList(uid, sort=[['star', -1], ['zhanli', -1]], limit=_num)
        _tidList = []
        for i in _heroList:
            _tid = i['_id']
            _tidList.append(_tid)
            if i['star'] >= 6:
                # _maxStarLv = getMaxStarLv(i['hid']) if len(data) == 2 else data[1]
                if len(data) == 2:
                    _maxStarLv = getMaxStarLv(i['hid'])
                else:
                    _maxStarLv = data[1]
            else:
                _maxStarLv = i['star']
            # _maxLv = g.m.herofun.getMaxLv(i['hid'], _maxStarLv)
            _maxLv = 270
            g.event.emit("adduserhead", uid, [i['hid'] + '_1'])
            _data = {
                'lv': _maxLv,
                'star': _maxStarLv,
                'dengjielv': _maxStarLv
            }
            g.m.herofun.updateHero(uid, _tid, data=_data)
            g.m.herofun.reSetHeroBuff(uid, _tid)
        _w = {'uid': uid, '_id': {'$in': _tidList}}
        _res['d'] = g.m.herofun.reSetAllHeroBuff(uid, where=_w)
        return _res
    elif data[0] == 'all':
        _con = g.GC[data[1]]
        for i in _con:
            _temp = [{'a': data[1], 't': i, "n": 10}]
            _sendData = g.getPrizeRes(uid, _temp, act={'act': 'debug'})
            g.sendChangeInfo(conn, _sendData)
        _res['d'] = 'add all OJBK'
        return _res
    elif data[0] == 'glyph':
        if len(data) == 1:
            _p = [{'a': 'glyph', 't': str(i), 'n': 1} for i in xrange(1, 18)]
        else:
            _p = [{'a': 'glyph', 't': data[1], 'n': data[2]}]
        _sendData = g.getPrizeRes(uid, _p, act={'act': 'debug'})
        g.sendChangeInfo(conn, _sendData)
        _res['d'] = _sendData
        return _res

    elif data[0] == 'shipin':
        sid = data[1]
        _num = data[2]
        _prize = [{'a': 'shipin', 't': sid, 'n': _num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = 'add shipin OJBK'

    elif data[0] == 'mapid':
        g.mdb.update('userinfo', {'uid': uid}, {'maxmapid': data[1], 'mapid': data[1]})

    # show me the money
    elif len(data) == 2 and data[0] in gud:
        _attr, _value = data[0], data[1]
        needMap = {_attr: _value}
        if _attr == 'nexp':
            _r = g.m.userfun.altExp(uid, _value)
            if 'addnext' in _r:
                del _r['addnexp']

            needMap.update(_r)

        _r = g.m.userfun.updateUserInfo(uid, needMap, {'act': 'console'})
        _r = g.sendChangeInfo(conn, {'attr': needMap})
        _res['d'] = '如你所愿：P'
        return _res
    elif data[0] == 'shenqi':
        g.mdb.update('artifact', {'uid': uid},
                     {'artifact': {str(i): {'lv': 50, 'djlv': 0} for i in xrange(1, 6)}, 'current': 5}, upsert=True)
        gud = g.getGud(uid)
        gud['artifact'] = 5
        g.m.gud.setGud(uid, gud)
        g.mdb.update('userinfo', {'uid': uid}, {'artifact': 5})
        g.sendChangeInfo(conn, {'attr': {'artifact': 5}})
        g.mc.delete('artifact_{}'.format(uid))



    elif data[0] == "wuhun":
        sid = data[1]
        _num = data[2]
        _prize = [{'a': 'wuhun', 't': sid, 'n': _num}]
        _prizeRes = g.getPrizeRes(uid, _prize, {'act': 'debug'})
        _r = g.sendChangeInfo(conn, _prizeRes)
        _res['d'] = _prizeRes


    elif data[0] == 'shanwuping':
        g.mdb.delete('itemlist', {'uid': uid})
        print '*************ok************'

    elif data[0] == 'xing':
        _hero = data[1]
        _num = data[2]
        g.mdb.update('hero', {'uid': uid, 'growid': _hero}, {'dengjielv': _num, 'star': _num})

    elif data[0] == 'bianqiang':
        g.mdb.update('userinfo', {'uid': uid},
                     {'maxmapid': 200, 'mapid': 200, 'lv': 100, 'rmbmoney': 10000000, 'jinbi': 1000000000,
                      'useexp': 100000000, 'vip': 17, 'artifact': 5})
        print 'user ok'

        for j in ('equip', 'shipin', 'item', 'glyph'):
            _con = g.GC[j]
            if j != 'glyph':
                for i in _con:
                    _temp = [{'a': j, 't': i, "n": 10}]
                    _sendData = g.getPrizeRes(uid, _temp, act={'act': 'debug'})
                    g.sendChangeInfo(conn, _sendData)
            else:
                _p = [{'a': 'glyph', 't': str(i), 'n': 2} for i in xrange(1, 16)]
                _sendData = g.getPrizeRes(uid, _p, act={'act': 'debug'})
                g.sendChangeInfo(conn, _sendData)
        print 'item ok'

        for i in g.GC['hero']:
            _rData = g.m.herofun.addHero(uid, i)
            g.m.userfun.setMaxZhanli(uid, _rData['maxzhanli'])
            _heroChange = {}
            _heroChange[_rData['tid']] = _rData['herodata']
            g.event.emit("adduserhead", uid, [i])
            g.event.emit("hero_tongu", uid, i)
            g.sendChangeInfo(conn, {"hero": _heroChange})
            _res["d"] = _heroChange
            return _res
        print 'hero ok'

        g.mdb.update('artifact', {'uid': uid},
                     {'artifact': {str(i): {'lv': 50, 'djlv': 0} for i in xrange(1, 6)}, 'current': 5}, upsert=True)
        gud = g.getGud(uid)
        gud['artifact'] = 5
        g.m.gud.setGud(uid, gud)
        g.sendChangeInfo(conn, {'attr': {'artifact': 5}})
        g.mc.delete('artifact_{}'.format(uid))
        print 'shenqi ok'

        _res['d'] = 'all ok'
        return _res

    elif data[0] == 'wudi':
        g.mdb.update('hero', {'uid': uid}, {'atk': 10000000, 'hp': 100000000000})
        return _res

    elif data[0] == 'allpet':
        _con = g.GC['pet']
        for i in _con:
            _temp = [{'a': 'pet', 't': i, "n": 5}]
            _sendData = g.getPrizeRes(uid, _temp, act={'act': 'debug'})
            g.sendChangeInfo(conn, _sendData)
        _res['d'] = 'add all OJBK'

    elif data[0] == 'wenwu':
        _con = g.GC['wenwuinfo']
        if len(data) == 1:
            for i in _con:
                _temp = [{'a': 'wenwu', 't': i, "n": 30}]
                _sendData = g.getPrizeRes(uid, _temp, act={'act': 'debug'})
                g.sendChangeInfo(conn, _sendData)
        else:
            wwid = str(data[1])
            num = data[2]
            _temp = [{'a': 'wenwu', 't': wwid, 'n': num}]
            _sendData = g.getPrizeRes(uid, _temp,act={'act':'debug'})
        _res['d'] = 'add all OJBK'

    elif data[0] == 'yjexp':
        g.mdb.update('yjkg', {'uid': uid}, {'exp': 10000000})
        return _res

    elif data[0] == 'yjny':
        g.mdb.update('yjkg', {'uid': uid}, {'energe': 10000000})
        return _res

    elif data[0] == 'gpjjc':
        _ranklist = g.crossDB.find("gpjjc_rank", {}, fields=["_id", "uid", "jifen"])
        for user in _ranklist:
            # 获取玩家匹配数据
            _pipeiData = g.m.gongpingjjcfun.getPipeiData(user["uid"], keys="_id,equip,fightdata,shipin,state,ctime")
            if _pipeiData:
                continue
            # 初始化匹配数据
            _pipeiInfo = g.m.gongpingjjcfun.initPipeiData(uid)
            g.m.gongpingjjcfun.starPipei(user["uid"], user["jifen"])


    elif data[0] == 'gpjjcrank':
        # _ranklist = g.crossDB.find("gpjjc_rank", {}, fields=["_id", "uid", "jifen"])
        _users = g.mdb.find("userinfo", {}, fields=["_id", "uid"], limit=100)
        for user in _users:
            _uid = user["uid"]
            _myinfo = g.m.gongpingjjcfun.getData(uid, keys='_id')

    elif data[0] == 'pmd':
        g.m.crosschatfun.chatRoom.addCrossChat({'msg': g.C.STR(g.GC['pmd']['ladder'], "哈哈哈"), 'mtype': 4, 'fdata': {'iszqwz': 1}, 'extarg': {'ispmd': 1}})

    elif data[0] == "syzc":
        _layer = data[1]
        _setData = {}
        _generate = g.m.syzcfun.generateEvent(uid, _layer)
        _setData["layer"] = _layer
        _setData["finishgzid"] = []

        _setData.update(_generate)
        g.m.syzcfun.setData(uid, _setData)

    else:
        _res['s'] = -1

    return _res


# 合并两个结构相同或不同的dict
def mergeDict(dict1, dict2, add=0):
    # 不是dict无法合并
    if not isinstance(dict1, dict) or not isinstance(dict2, dict):
        return
    # {"army":{"1":1,"2":2}}
    # {"army":{"3":3,"1":1},"item":{"4":1}}
    for k, v in dict2.items():
        # 合并不存在的kv
        if k not in dict1:
            dict1[k] = v
        # 合并存在且需要累加的kv
        elif k in dict1 and add == 1:
            dict1[k] += v
        # 存在的kv递归合并
        else:
            mergeDict(dict1[k], v, 1)

    return


def getMaxVip():
    return max([int(x) for x in g.GC['vip'].keys()])


def getMaxLv():
    return max([int(x) for x in g.GC['herocom']['herolvup'].keys()])


def getMaxStarLv(hid):
    return max([int(x) for x in g.GC['herostarup'][hid].keys()])


if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    from pprint import pprint
    _data = ["syzc", 2]
    pprint(doproc(g.debugConn, _data))
