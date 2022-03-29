#!/usr/bin/python
#coding:utf-8

'''
答题事件模块
'''
import g

# 获取答题事件
def getTopicData(uid, generate=False, lv=None):
    _res = g.mdb.find1('topic', {'uid': uid}, fields=['_id','topic','jindu','ctime']) or {}
    _con = g.GC['event']
    _nt = g.C.NOW()

    if not _res or generate:
        generate = True
    else:
        # 过了两个小时
        for i in _con['time']:
            if _res['ctime'] < g.C.ZERO(_nt) + i and _nt > g.C.ZERO(_nt) + i:
                generate = True
                break
        else:
            if _res['ctime'] > g.C.ZERO(_nt) + _con['time'][-1] and _nt < g.C.ZERO(_nt) + _con['time'][0]:
                generate = True

    if generate:
        _res['topic'] = generateTopic(uid, _res.get('topic', []),_res.get('jindu',0), lv)

    return _res

# 生成题目数据
def generateTopic(uid, topic,jindu, lv):
    _con = g.GC['event']
    _lv = g.getGud(uid)['lv'] if not lv else lv

    # 如果今天没有随机出剑圣
    if not g.getAttrByDate(uid,{'ctype': 'event_jugg'}) and jindu < 10 and _lv >= 10 and '2' not in topic:
        topic.append('2')
        g.setAttr(uid, {'ctype': 'event_jugg'}, {'v': 1})

    _ture = g.C.RAND(50, 100)
    _rand = []
    for i, item in _con['event'].items():
        # 此地点没有随机成功
        if i in topic or _lv < item['lv'] or len(topic) >= 3 or i == '2':
            continue

        _rand.append(i)

    if _ture and _rand:
        topic.append(g.C.RANDLIST(_rand)[0])
    g.mdb.update('topic', {'uid': uid}, {'topic': topic, 'ctime': g.C.NOW()}, upsert=True)

    return topic

if __name__ == '__main__':
    getTopicData(g.buid('diyibo_6390465'), True)