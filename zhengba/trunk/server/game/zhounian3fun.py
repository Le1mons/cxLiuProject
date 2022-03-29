#!/usr/bin/python
# coding:utf-8

'''
七夕节
'''
import g


htype=77
# 获取配置
def getCon():
    res = g.GC['zhounian3']
    return res


# 获取数据
def getData(uid, hdid, keys=None, hdinfo=None):


    # 默认读取的key
    dfeilds = []
    if keys:
        dfeilds += keys.split(',')

    if not hdinfo:
        hdinfo = g.m.huodongfun.getHDinfoByHtype(77, "etime")

    _myData = g.mdb.find1('hddata', {'uid': uid, 'hdid': hdid}, fields={'_id': 0, 'hdid': 0, 'uid': 0})
    _set = {}
    _con = getCon()
    # 没有数据
    _nt = g.C.NOW()
    _zt = g.C.ZERO(_nt)
    _dkey = g.C.DATE(_zt)
    if not _myData:
        _set = _myData = {
            'task': {'data':{"1":1},'rec':[]},     # 任务数据
            'date': g.C.DATE(),                 # 每日刷新标识
            'duihuan':{},                        # 兑换
            'libao1':{},                        # 礼包购买次数
            'libao2': {},                       # 每日不重置礼包购买次数
            "jifenprize":[],                    # 积分领奖
            "zhouka":{"buy": 0, "rec": [], "getidx": 0},     # 周卡信息
            "lottery":{"gezi": generate("1"), "rec": {}, "target": -1, "layer":"1", "extrec":[], "targetrec":0, "targetrnum":{}},  # 获取当前的奖池信息
            "guankarec": {"win": [], "boxrec": [],"fightnum":0},# 赢得关卡和领取的宝箱
            "lasttime": _nt,                    # 设置时间
            "val":0,                            # 积分
        }
    # 任务跨天重置
    if _myData.get('date') != _dkey:
        # # 补发奖励邮件
        _prize = []
        for taskid, info in _con['task'].items():
            if taskid not in _myData["task"]["rec"] and _myData["task"]["data"].get(taskid, 0) >= info["pval"]:
                _prize += info["prize"]
                _myData['val'] += info['addjifen']

        # 如果有奖励就发送邮件
        if _prize:
            _set["val"] = _myData['val']
            _title = _con["todayemail"]["title"]
            _content = _con["todayemail"]["content"]
            g.m.emailfun.sendEmails(uid, 1, _title, _content, prize=_prize)

        _set['task'] = _myData['task'] = {'data':{"1":1},'rec':[]}
        _set['date'] = _myData['date'] = _dkey

        _set["libao1"] = _myData['libao1'] = {}
        # 重置每天的战斗次数
        _myData['guankarec']["fightnum"] = 0
        _set["guankarec"] = _myData['guankarec']
        # 周卡领奖
        if _myData['zhouka']["buy"] and _con["zhouka"]["getnum"] > _myData['zhouka']["getidx"] + 1:
            _stime = hdinfo["stime"]
            _day = g.C.getTimeDiff(_nt, _stime)
            _prize = []
            for i in xrange(_day):
                if i not in _myData["zhouka"]["rec"]:
                    _myData["zhouka"]["rec"].append(i)
                    _prize.extend(list(_con["zhouka"]["arr"][i]))
            if _prize:
                _prize = g.mergePrize(_prize)
                _title = _con["email"]["title"]
                _content = _con["email"]["content"]
                g.m.emailfun.sendEmails(uid, 1, _title, _content, prize=_prize)

            _myData['zhouka']["getidx"] = _day
            _set["zhouka"] = _myData['zhouka']
    _stime = hdinfo["stime"]
    _day = g.C.getTimeDiff(_nt, _stime)
    if _day >= len(_con["zhouka"]["arr"]):
        _day = len(_con["zhouka"]["arr"]) - 1
    _myData['zhouka']["getidx"] = _day

    if _set:
        g.mdb.update('hddata', {'uid': uid, 'hdid': hdid}, _set, upsert=True)
    _res = {}
    if dfeilds:
        for key in dfeilds:
            _res[key] = _myData.get(key, {})
    else:
        _res = _myData


    return _res


# 获取英雄属性
def makeHeroBuff(herodata):
    _hid = str(herodata["hid"])
    _heroCon = g.m.herofun.getPreHeroCon(_hid)


    _heroData = dict(_heroCon)
    _heroData['hid'] = _hid
    # 显示星级
    _heroData['star'] = herodata['star']
    # 显示等阶
    _heroData['dengjie'] = 10
    # dengjielv用于升阶和升星读取配置使用
    _heroData['dengjielv'] = herodata['star']
    _heroData['lv'] = herodata["lv"]
    # _heroData["baoshi"] = herodata["baoshi"]
    # _heroData["shipin"] = herodata["shipin"]
    _heroData["skin"] = herodata.get("skin", {})


    # 成长id
    _growid = str(_heroCon['growid'])
    # 基础属性值
    _lv = _heroData['lv']
    _dengjielv = _heroData['dengjielv']

    _growCon = g.GC['herogrow'][_growid]
    _tmpBuff = dict(g.GC['table']['herobuff'])

    if _dengjielv > 6:
        # 升级配置

        _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]

        _tmpBuff['xpskill'] = _djBuffCon['xpskill']
        _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
        _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
        _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']
    else:
        # 进阶配置
        _djBuffCon = g.GC.herocom['herojinjieup'][str(_dengjielv)]
        _tmpBuff['xpskill'] = _heroData['xpskill']
        _tmpBuff['bd1skill'] = _heroData['bd1skill']
        _tmpBuff['bd2skill'] = _heroData['bd2skill']
        _tmpBuff['bd3skill'] = _heroData['bd3skill']
    # # 升级配置
    # _djBuffCon = g.GC.herostarup[_hid][str(_dengjielv)]
    # _tmpBuff['xpskill'] = _djBuffCon['xpskill']
    # _tmpBuff['bd1skill'] = _djBuffCon['bd1skill']
    # _tmpBuff['bd2skill'] = _djBuffCon['bd2skill']
    # _tmpBuff['bd3skill'] = _djBuffCon['bd3skill']

    # 雕纹提供的star属性
    _starBuff = {}
    for i in ('staratkpro', 'starhppro'):
        _starBuff[i] = _djBuffCon.get(i, 0) + 1000
        _tmpBuff[i] = _heroData.get(i, 0) + 1000


    # 基础属性
    _baseAtk = (_growCon['atk'] + (_lv - 1) * _growCon['atk_grow']) * _djBuffCon['atkpro'] * (
                _starBuff['staratkpro'] * 0.001)
    _baseDef = (_growCon['def'] + (_lv - 1) * _growCon['def_grow']) * _djBuffCon['defpro']
    _baseHp = (_growCon['hp'] + (_lv - 1) * _growCon['hp_grow']) * _djBuffCon['hppro'] * (
                _starBuff['starhppro'] * 0.001)
    _baseSpeed = (_growCon['speed'] + (_lv - 1) * _growCon['speed_grow']) * _djBuffCon['speedpro']
    _tmpBuff['atk'] = _baseAtk
    _tmpBuff['def'] = _baseDef
    _tmpBuff['hp'] = _baseHp
    _tmpBuff['speed'] = _baseSpeed


    # # 装备属性
    _itemVal = {'atk': 0, 'def': 0, 'hp': 0, 'atkpro': 0, 'defpro': 0, 'hppro': 0}
    # _con = g.GC["pro_gpjjc_jobequip"][str(_heroData["job"])]
    # tzid = ""
    # for i in _con:
    #     _equipBuff = i["buff"]
    #     for bk,bv in _equipBuff.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #     _equipBuff = i["jobbuff"]
    #     for bk, bv in _equipBuff.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #     tzid = i["tzid"]
    #
    # _equipBuff = {}
    # # 如果有套装信息
    # _tmpCon = g.m.equipfun.getEquipTzCon(tzid)
    # for i in _tmpCon["buff"].values():
    #     for bk, bv in i.items():
    #         _itemVal[bk] = _itemVal.get(bk, 0) + bv
    #
    # for bk, bv in _equipBuff.items():
    #     _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

    _extBuff = herodata["buff"]
    for bk, bv in _extBuff.items():
        _tmpBuff[bk] = _tmpBuff.get(bk, 0) + bv

    # 乘法加成取整
    for mkey in g.GC['herocom']['multiplykey']:
        _tmpBuff[mkey] = int(_tmpBuff[mkey])

    _tmpBuff['atk'] = int(_tmpBuff['atk'] * (_tmpBuff['atkpro'] * 0.001))
    _tmpBuff['def'] = int(_tmpBuff['def'] * (_tmpBuff['defpro'] * 0.001))
    _tmpBuff['hp'] = int(_tmpBuff['hp'] * (_tmpBuff['hppro'] * 0.001))
    _tmpBuff['speed'] = int(_tmpBuff['speed'] * (_tmpBuff['speedpro'] * 0.001))



    # 战力计算
    # 基础攻击：英雄成长表配置的攻击（herogrow）
    # 攻击成长：英雄成长表配置的成长值（herogrow）
    # 攻击阶位加成：等阶或星级的加成（herocom或herostarup）
    # A1：（（基础攻击+（lv-1）*攻击成长）*攻击阶位加成+装备固定攻击）*装备攻击百分比
    _A1 = (_baseAtk + _itemVal['atk']) * _itemVal['atkpro'] * 0.001 + _extBuff.get('atk', 0)
    # B1：（基础防御+（lv-1）*防御成长）*防御阶位加成
    _B1 = _baseDef + _extBuff.get('def', 0)
    # C1：（（基础生命+（lv-1）*生命成长）*生命阶位加成+装备固定生命）*装备生命百分比/6
    _C1 = ((_baseHp + _itemVal['hp']) * _itemVal['hppro'] * 0.001) / 6 + _extBuff.get('hp', 0) / 6


    # 战力 = A1 + B1 + C1 + 其他
    _zhanli = int(_A1 + _B1 + _C1)
    _tmpBuff['zhanli'] = _zhanli
    _heroData.update(_tmpBuff)
    return _heroData


# 更新数据 带上日期
def setData(uid, hdid, data):
    g.m.huodongfun.setHDData(uid, hdid, data)


# 检测是否开启
def checkOpen(*args):
    _res = {'act': False}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")

    if _hd and 'hdid' in _hd:
        _res['act'] = True
        _res['rtime'] = _hd['rtime']
        _res["etime"] = _hd["etime"]
        _res["stime"] = _hd["stime"]
    return _res



# 登陆
def onChkTask(uid, ttype, val=1):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return

    _data = getData(uid, _hd['hdid'])
    _con = getCon()['task'][ttype]

    if _data['task']['data'].get(ttype, 0) + val >= _con['pval'] and ttype not in _data['task']['rec']:
        g.m.mymq.sendAPI(uid, 'qixi_redpoint', '1')

    _set = {'$inc': {'task.data.{}'.format(ttype): val}}
    setData(uid, _hd['hdid'], _set)



# 监听部落战旗购买
def OnChongzhiSuccess(uid, act, money, orderid, payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        return

    _con = getCon()
    if act not in _con["libao1"] and act not in _con["libao2"]:
        return
    _key = "libao1" if act in _con["libao1"] else "libao2"

    _data = getData(uid, _hd['hdid'])
    if _data[_key].get(act, 0) >= _con[_key][act]['buynum']:
        g.success[orderid] = False
        return

    setData(uid, _hd['hdid'], {'$inc': {_key + ".{}".format(act): 1}})
    _send = g.getPrizeRes(uid, _con[_key][act]['prize'], {'act': 'zhounian3_libao'})
    g.sendUidChangeInfo(uid, _send)


# 获取红点
def getHongDian(uid):
    _res = {"zhounian3": 0}
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        return _res

    _con = getCon()
    # 可以领取任务奖励
    _myData = getData(uid, _hd['hdid'])


    _nt = g.C.NOW()
    if _nt < _hd['rtime']:
        for k, v in _myData['task']['data'].items():
            if v >= _con['task'][k]['pval'] and k not in _myData['task']['rec']:
                _res["zhounian3"] = 1
                return _res

        _jifenprize = _con["jifenprize"]
        for idx, info in enumerate(_jifenprize):
            if idx not in _myData["jifenprize"] and _myData["val"] >= info["val"]:
                _res["zhounian3"] = 1
                return _res

    return _res


# 生成格子奖励
def generate(layer):
    _res = []
    _lottery = getCon()["lotteryinfo"]["lottery"]
    useDict = {}
    for gzid in xrange(25):
        _dlz = []
        for idx, v in enumerate(_lottery):
            _useNum = useDict.get(str(idx), 0)
            _lessNum = v["num"] - _useNum
            if _lessNum <= 0:
                continue

            _dlz += [{"p": v["p"], "prize": v["prize"], "idx": idx}]
        _randPrize = g.C.getRandArrNum(_dlz, 1)
        _res.append(_randPrize[0]["prize"])
    return _res

# 周卡监听
def OnZhouKaEvent(uid,act,money,orderid,payCon):
    _hd = g.m.huodongfun.getHDinfoByHtype(htype, ttype="etime")
    # 活动还没开
    _nt = g.C.NOW()
    if not _hd or 'hdid' not in _hd or _nt >= _hd["rtime"]:
        return
    _con = getCon()["zhouka"]
    _proid = _con["proid"]
    # 判断是不是这个活动的
    if _proid != act:
        return
    _data = getData(uid, _hd['hdid'], keys="zhouka")
    # 如果已经购买过
    if _data["zhouka"]["buy"]:
        return
    _nt = g.C.NOW()
    _data["zhouka"]["buy"] = 1
    _stime = _hd["stime"]
    _day = g.C.getTimeDiff(_nt, _stime)
    _data["zhouka"]["getidx"] = _day
    _prize = []
    for i in xrange(_day):
        _data["zhouka"]["rec"].append(i)
        _prize.extend(list(_con["arr"][i]))
    # 邮件发奖
    if _prize:
        _prize = g.mergePrize(_prize)
        _emailCon = getCon()["email"]
        _title = _emailCon["title"]
        _content = _emailCon["content"]
        # _fmtcontent = _content.format(g.C.DATE(_hdinfo["etime"]))
        g.m.emailfun.sendEmails(uid, 1, _title, _content, prize=_prize)


    _setData = {}
    _setData["zhouka"] = _data["zhouka"]
    setData(uid, _hd['hdid'], _setData)
    # 发奖
    _prize = _con["buyprize"]
    _send = g.getPrizeRes(uid, _prize, {'act': 'zhouka_payzhouka', 'prize': _prize})
    g.sendUidChangeInfo(uid, _send)



# 骰子购买
g.event.on('chongzhi', OnChongzhiSuccess)
g.event.on('chongzhi', OnZhouKaEvent)
g.event.on('zhounian3', onChkTask)

if __name__ == '__main__':
    # uid = g.buid("lsq0")
    # g.debugConn.uid = uid
    # print   divmod(15, 8)

    print generate("1")
