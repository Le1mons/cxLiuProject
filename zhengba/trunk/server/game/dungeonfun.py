#!/usr/bin/python
#coding:utf-8

'''
神殿地牢模块
'''
import g

# 获取可以使用的战斗次数
def getFightNum(uid):
    _max = g.GC['dungeoncom']['base']['actnum']
    return _max - g.getPlayAttrDataNum(uid, 'dungeon_usednum')

# 添加今日战斗次数
def setFightNum(uid):
    g.setPlayAttrDataNum(uid, 'dungeon_usednum')

# 获取神殿地牢红点
def getDungeonHD(uid):
    _nt = g.C.NOW()
    _timeCon = g.GC['timestamp']
    # 等级不足
    if g.getOpenTime() < _timeCon['dungeon'] and not g.chkOpenCond(uid, 'dungeon'):
        return 0
    elif g.getOpenTime() >= _timeCon['dungeon'] and g.getOpenDay() < 15:
        return 0

    _data = g.mdb.find1('dungeon', {'uid': uid}, fields=['_id', 'layer', 'recdict']) or {}
    _con = g.GC['dungeoncom']['base']['aimsprize']
    # 如果有没有领取的奖励
    for i in ('1', '2', '3'):
        for idx, item in enumerate(_con[i]):
            if _data.get('recdict', {}).get(i, 0) - 1 < idx and _data.get('layer', {}).get(i, 0) >= item[0]:
                return 2

    # 有挑战次数 并且没打完 且今日没有打开过
    if (not _data or sum(map(lambda x:_data.get('layer',{}).get(x,0), _data))) != len(g.GC['dungeon']) and getFightNum(uid) > 0:
        if g.getPlayAttrDataNum(uid, 'dungeon_open') == 0:
            return 1

    return 0

# 添加录像
def addRecording(uid, road, fightres, step, zhanli):
    _allLog = g.mdb.find('dungeonlog',{'road':road,'step':step},fields=['zhanli'],sort=[['zhanli',-1]])
    if not _allLog or len(_allLog) < 3:
        g.mdb.insert('dungeonlog', {'uid':uid,'fightres':fightres,'road':road,'step':step,'ctime':g.C.NOW(),'zhanli':zhanli})
    else:
        for i in _allLog:
            if i['zhanli'] > zhanli:
                g.mdb.update('dungeonlog',{'_id':i['_id']},{'uid':uid,'fightres':fightres,'road':road,'step':step,'ctime':g.C.NOW(),'zhanli':zhanli})
                break
    return

if __name__ == '__main__':
    print addRecording('1', 1, {}, 1, 80)