#!/usr/bin/python
# coding:utf-8

# 战斗类

import sys

if __name__ == "__main__":
    sys.path.append("..")
    sys.path.append("game")
    sys.path.append("game/fight")
import g, ZBFight

left = [
    {"hid": "22086", "djlv": 14, "lv": 300, "hp": 800000},
]
# 左边阵型
# 左边装别
_leftEquip = {'1': '1056', '2': '2056', '3': '3056', '4': '4056'}
# 左右两边科技buff
_leftKJ = 1
_leftFM = 1
_leftRH = 1
_rightKJ = 1
_rightFM = 1
_rightRH = 1

#
_kjBuff = {

}

# 右边边阵型
right = [
    {"hid": "15036", "djlv": 14, "lv": 300, "hp": 10000000000000000, "controlpro": 1000, "miankongpro": 1000},
]
# 右边装备
_rightEquip = {'1': '1056', '2': '2056', '3': '3056', '4': '4056'}

if __name__ == '__main__':
    def getEquipBuff(_equipData):
        _buffList = []
        # 套装信息，记录套装id对应的数量
        _tzData = {}
        for pos, eid in _equipData.items():
            _tmpCon = g.GC['equip'][eid]
            _buffList.append(_tmpCon['buff'])
            # 统计套装信息
            if _tmpCon['tzid'] != '':
                if _tmpCon['tzid'] in _tzData:
                    _tzData[_tmpCon['tzid']] += 1
                else:
                    _tzData[_tmpCon['tzid']] = 1

        if _tzData > 0:
            # 如果有套装信息
            for tzid, num in _tzData.items():
                _tmpCon = g.GC['equiptz'][str(tzid)]
                _loopNum = num + 1
                for i in xrange(1, _loopNum):
                    _ckNum = str(i)
                    if _ckNum not in _tmpCon['buff']:
                        continue

                    _buffList.append(_tmpCon['buff'][_ckNum])

        _buff = _buffList
        return _buff


    def getMeltsoulBuff(hid):
        _con = g.GC['meltsoul']
        if hid not in _con:
            return []
        _con = _con[hid]
        _res = []
        _maxLv = max(_con, key=lambda x: int(x))
        _res.append(_con[_maxLv]['upperlimit'])
        _res.append(_con[_maxLv]['extrabuff'])
        return _res


    _data = {x: 100 for x in ('1', '2', '3', '4')}
    allLogs = []


    def _log(self, *msg):
        for m in msg:
            allLogs.append(str(m))


    roles = []
    for idx, role in enumerate(left):
        if role == None: continue

        if 'hid' in role:
            _eqBuff = getEquipBuff(_leftEquip)
            role['herobuff'] = {'equip': _eqBuff}
            role['weardata'] = _leftEquip
            if _leftRH:
                role['extbuff'] = {'meltsoul': getMeltsoulBuff(role['hid'])}
            role['commonbuff'] = {}
            if _leftKJ:
                role['commonbuff'].update({'keji':_kjBuff})
            if _leftFM:
                role['commonbuff'].update({'enchant': g.m.equipfun.getEnchantBuff('11', _data)})

            info = g.m.fightfun.test_fmtData(str(role['hid']), int(role['djlv']), 0, idx + 1, data=role)
        if 'sqid' in role:
            info = g.GC['shenqiskill'][str(role['sqid'])][str(role['djlv'])]
            info['side'] = 0
            info['djlv'] = role['djlv']

        roles.append(info)

    for idx, role in enumerate(right):
        if role == None: continue
        if 'hid' in role:
            _eqBuff = getEquipBuff(_rightEquip)
            role['herobuff'] = {'equip': _eqBuff}
            role['weardata'] = _rightEquip
            role['commonbuff'] = {}
            if _rightRH:
                role['extbuff'] = {'meltsoul': getMeltsoulBuff(role['hid'])}
            if _rightKJ:
                role['commonbuff'].update({'keji': _kjBuff})
            if _rightFM:
                role['commonbuff'].update({'enchant': g.m.equipfun.getEnchantBuff('11', _data)})
            info = g.m.fightfun.test_fmtData(str(role['hid']), int(role['djlv']), 1, idx + 1, data=role)
        if 'sqid' in role:
            info = g.GC['shenqiskill'][str(role['sqid'])][str(role['djlv'])]
            info['side'] = 1
            info['djlv'] = role['djlv']
        roles.append(info)

    f = ZBFight.ZBFight('pve')
    f.debug = True
    f.log = _log

    print 'roles', roles

    a = f.initFightByData(g.C.dcopy(roles)).start()
    print u'第0场胜利方是', u'左方' if a['winside'] == 0 else u'右方'
    js = 'G.frame.fight.demo(' + g.json(a) + ');'

    f = open('__js.json', 'w')  # 若是'wb'就表示写二进制文件
    f.write(g.json(a))
    f.close()

    f = open('fightlog.txt', 'w')  # 若是'wb'就表示写二进制文件
    f.write("\r\n\r\n".join(allLogs))
    f.close()

    _res = {'0': 0, '1': 0}
    for i in xrange(100):
        _start = g.C.NOW()
        f = ZBFight.ZBFight('pve')
        f.debug = True
        f.log = _log
        a = f.initFightByData(g.C.dcopy(roles)).start()
        print a["dpsbyside"]
        if a['winside'] == 0:
            _res['0'] += 1
        else:
            _res['1'] += 1
        _end = g.C.NOW()
        print u'模拟战斗完成{0}次，耗时{1}秒*********'.format(i + 1, _end - _start)
        print u'此次胜利方是', u'左方' if a['winside'] == 0 else u'右方'

    print u'左边胜利{0}次,右边胜利{1}次'.format(_res['0'], _res['1'])


