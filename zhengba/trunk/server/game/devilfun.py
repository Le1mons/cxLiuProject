#!/usr/bin/python
#coding:utf-8

'''
神殿魔王模块
'''
import g

# gameattr属性表
GATTR = g.BASEDB(g.mdb, 'playattr', 'gameattr')

# 获取剩余挑战次数
def getFightNum(uid):
    """
    每天10点重置 次数不足3 12:00 14:00 16:00 18:00 20:00 各恢复一次挑战次数

    :param uid:
    :return: int
    """
    _con = g.GC['shendianmowang']['base']
    _maxNum = _con['maxnum']
    _nt = g.C.NOW()
    # 已经打过神殿魔王的次数
    _info = GATTR.getAttrOne(uid, {'ctype':'templedevil_usednum'},fields=['_id','v','lasttime'])
    # 是今天的
    if _info and g.C.DATE(_info['lasttime']) == g.C.DATE(g.C.NOW()):
        _supply = list(_con['fightnum_supply'])

        # 还剩的次数
        _res = _maxNum - _info['v']

        _addNum = 0

        # 如果小于最大次数就可以补给
        if _res < _maxNum:
            for t in _supply:
                # 在恢复时间内
                if _info['lasttime'] < t + g.C.ZERO(_nt) < _nt:
                    if _res >= _maxNum:
                        break

                    _res += 1
                    _addNum += 1

        # _sTime = _supply.pop(0)
        # while _res < _maxNum and _supply:
        #     if _info['lasttime'] <= _sTime + g.C.ZERO(_nt) <= _nt:
        #         _res += 1
        #         _addNum += 1
        #     _sTime = _supply.pop(0)
        if _res < 0:
            _addNum = abs(_res)
            _res = 0

        if _addNum:
            # 补给后设置当前时间 减少用过的挑战次数
            GATTR.setAttr(uid, {'ctype': 'templedevil_usednum'}, {'$inc': {'v': -_addNum}})
    else:
        GATTR.setAttr(uid, {'ctype': 'templedevil_usednum'}, {'v': 0})
        _res = _maxNum
    return _res

# 获取boss数据
def getBossData():
    _res = g.mc.get('temple_devil')
    if not _res:
        _res = {}
        _boss = GATTR.getAttrOne("SYSTEM", {'ctype': 'temple_devil'},keys='_id,lasttime,v')
        _con = g.GC['shendianmowang']['base']
        if not _boss:
            # 没有就从第一个开始轮回
            _res['name'] = 'mowang1'
        elif g.C.ZERO(_boss['lasttime']) != g.C.ZERO(g.C.NOW()):
            _idx = int(_boss['v']['name'][-1:])
            _res['name'] = g.C.STR('mowang{1}', _idx + 1 if _idx < 3 else 1)
        else:
            return _boss['v']

        _res['job'] = g.C.RANDLIST(_con['jobbuff'])[0]['beidong']
        _res['zhongzu'] = g.C.RANDLIST(_con['zhongzubuff'])[0]['beidong']
        GATTR.setAttr('SYSTEM', {'ctype': 'temple_devil'}, {'v': _res})

        g.mc.set('temple_devil', _res, 600)
    return _res

# 每天22点发送邮件和额外幸运奖励
def timer_senddayprize():
    # 获取积分排行
    _allUser = g.mdb.find('gameattr',{'ctype':'temple_devil_dps','lasttime':{'$gte':g.C.ZERO(g.C.NOW())}},fields=['_id','uid','v'],sort=[['v', -1]])
    if not _allUser:
        return []

    # 循环发奖
    _emailList, _insert = [], []
    _con = g.GC['shendianmowang']['base']
    _title = _con['email']['rank']['title']

    _prizeCon = tuple(g.GC['shendianmowang']['base']['prize']['rank'])
    _rank = 1
    for idx,i in enumerate(_allUser[:200]):
        _prize = getPrizeByRank(_rank, _prizeCon)
        _content = g.C.STR(_con['email']['rank']['content1'], i['v'],_rank)
        _emailList.append({i['uid']: _prize})
        # g.m.emailfun.sendEmails([i['uid']], 1, _title, _content, _prize)
        _rank += 1
        _insert.append(g.m.emailfun.fmtEmail(title=_title,
                                             uid=i['uid'],
                                             content=_content,
                                             prize=_prize))

    # 幸运奖
    _luckyNum = g.C.RANDINT(0, _rank - 2)
    # g.m.emailfun.sendEmails([_allUser[_luckyNum]['uid']], 1, _con['email']['lucky']['title'], _con['email']['lucky']['content'], _con['prize']['lucky'][1])
    _insert += [g.m.emailfun.fmtEmail(uid=_allUser[_luckyNum]['uid'],title=_con['email']['lucky']['title'],content=_con['email']['lucky']['content'],prize=_con['prize']['lucky'][1])]
    _emailList.append({'lucky': _allUser[_luckyNum]['uid']})

    _qwcj = g.mdb.find1('gameconfig', {'ctype': 'qwcj'}) or {'v': {}}
    # 趣味成就
    g.mdb.update('qwcj', {'uid': _allUser[_luckyNum]['uid']}, {'$push': {'data.11': _qwcj['v'].get('mw',0)}}, upsert=True)

    # 吊车尾奖励   200名以后的
    _uidList = map(lambda x:x['uid'], _allUser[200:])
    if _uidList:
        g.m.emailfun.sendEmails(_uidList, 1, _title, g.C.STR(_con['email']['rank']['content2'], '200+'), getPrizeByRank(201,_prizeCon))
        _insert += [g.m.emailfun.fmtEmail(
            uid=uid, prize=getPrizeByRank(201,_prizeCon), title=_title,
            content=g.C.STR(_con['email']['rank']['content2'], '200+')) for uid in _uidList]
        _emailList.append({'after200': _uidList})

    if _insert:
        # 添加邮件
        g.mdb.insert('email', _insert)

    # 记录次数  趣味成就使用
    _qwcj = g.mdb.update('gameconfig', {'ctype': 'qwcj'}, {'$inc': {'v.mw': 1}}, upsert=True)
    return _emailList

# 根据排名获取奖励
def getPrizeByRank(rank, con=None):
    if con:
        _con = con
    else:
        _con = g.GC['shendianmowang']['base']['prize']['rank']
    for i in _con:
        _min, _max = i[0]
        if _min <= rank <= _max:
            return i[1]

# 增加最高dps的录像
def addMaxDpsRecording(uid, fightres):
    _data = GATTR.getAttrByDate(uid, {'ctype': 'temple_devil_recording'})
    # 今天没有打过 或者 dps 比历史高
    if not _data or fightres['dpsbyside'][0] > _data[0]['v']['dpsbyside'][0]:
        GATTR.setAttr(uid, {'ctype': 'temple_devil_recording'}, {'v': fightres})



if __name__ == '__main__':
    uid = g.buid('xuzhao')
    g.m.devilfun.GATTR.setPlayAttrDataNum(uid, 'templedevil_usednum')
    a = getFightNum(uid)
    print a